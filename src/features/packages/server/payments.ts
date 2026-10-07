import "server-only";
import Stripe from "stripe";
import type { ServerEnv } from "@/lib/server/env";
import type { CheckoutPayload } from "../checkout";

/** Situação do pagamento de um pedido. Pix e boleto ficam "pending" até a compensação. */
export type OrderStatus = "paid" | "pending" | "failed";

/** Pedido como o Stripe o devolve, já validado e no formato do site. */
export type PaidOrder = {
  orderId: string;
  sessionId: string;
  status: OrderStatus;
  packageId: string;
  packageName: string;
  amountInCents: number;
  currency: string;
  recurring: boolean;
  locale: "pt-BR" | "en";
  customer: { name: string; email: string | null; phone: string };
};

export type CheckoutUrls = { success: string; cancel: string };

/** Integração de pagamento. O resto do site depende só desta interface (os testes usam uma falsa). */
export interface PaymentGateway {
  readonly name: string;
  createCheckout(checkout: CheckoutPayload, urls: CheckoutUrls): Promise<{ id: string; url: string }>;
  retrieveOrder(sessionId: string): Promise<PaidOrder | null>;
}

type CheckoutOptions = { paymentMethods: string[]; installments: boolean };

const DEFAULT_PAYMENT_METHODS = ["card", "pix", "boleto"];
/** Limite do Stripe por valor de metadata. */
const METADATA_MAX = 500;

const truncate = (value: string, max = METADATA_MAX) => (value.length > max ? `${value.slice(0, max - 1)}…` : value);

/**
 * Parâmetros da sessão do Stripe Checkout. Função pura: o valor vem do pedido montado no servidor.
 * - Suporte mensal vira assinatura (só cartão: Pix e boleto não renovam sozinhos).
 * - Os demais pacotes são cobrança avulsa, com cartão, Pix e boleto.
 */
export function buildCheckoutSessionParams(
  checkout: CheckoutPayload,
  urls: CheckoutUrls,
  options: CheckoutOptions = { paymentMethods: DEFAULT_PAYMENT_METHODS, installments: false },
): Stripe.Checkout.SessionCreateParams {
  const { package: item } = checkout;
  if (item.amountInCents === null) throw new Error(`Pacote ${item.id} sem preço definido não pode ir para o checkout.`);

  const recurring = item.recurring === "month";
  const metadata = {
    order_id: checkout.orderId,
    package_id: item.id,
    package_name: truncate(item.name),
    customer_name: truncate(checkout.customer.name),
    customer_whatsapp: checkout.customer.phone,
    message: truncate(checkout.message),
    locale: checkout.locale,
  };
  const paymentMethods = recurring ? ["card"] : options.paymentMethods;

  return {
    mode: recurring ? "subscription" : "payment",
    locale: checkout.locale === "en" ? "en" : "pt-BR",
    customer_email: checkout.customer.email,
    client_reference_id: checkout.orderId,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "brl",
          unit_amount: item.amountInCents,
          product_data: { name: item.name, metadata: { package_id: item.id } },
          ...(recurring ? { recurring: { interval: "month" as const } } : {}),
        },
      },
    ],
    allowed_payment_method_types: paymentMethods as Stripe.Checkout.SessionCreateParams.AllowedPaymentMethodType[],
    ...(!recurring && options.installments && paymentMethods.includes("card")
      ? { payment_method_options: { card: { installments: { enabled: true } } } }
      : {}),
    // A mesma metadata fica na sessão e no pagamento/assinatura, para aparecer no painel do Stripe.
    metadata,
    ...(recurring ? { subscription_data: { metadata } } : { payment_intent_data: { metadata, description: `${checkout.orderId} · ${item.name}` } }),
    success_url: urls.success,
    cancel_url: urls.cancel,
  };
}

/** Converte a sessão do Stripe no pedido do site. Sessões sem o número de pedido do site são ignoradas. */
export function orderFromSession(session: Stripe.Checkout.Session): PaidOrder | null {
  const metadata = session.metadata ?? {};
  if (!metadata.order_id || !metadata.package_id || session.amount_total === null) return null;
  const status: OrderStatus =
    session.payment_status === "paid" || session.payment_status === "no_payment_required"
      ? "paid"
      : session.status === "expired"
        ? "failed"
        : "pending";
  return {
    orderId: metadata.order_id,
    sessionId: session.id,
    status,
    packageId: metadata.package_id,
    packageName: metadata.package_name ?? metadata.package_id,
    amountInCents: session.amount_total,
    currency: (session.currency ?? "brl").toUpperCase(),
    recurring: session.mode === "subscription",
    locale: metadata.locale === "en" ? "en" : "pt-BR",
    customer: {
      name: metadata.customer_name ?? "",
      email: session.customer_details?.email ?? session.customer_email ?? null,
      phone: metadata.customer_whatsapp ?? "",
    },
  };
}

/** Formato dos ids de sessão do Checkout; evita consultar o Stripe com lixo vindo da URL. */
export const isCheckoutSessionId = (value: string) => /^cs_(test|live)_[A-Za-z0-9]{10,200}$/.test(value);

export function createStripeGateway(secretKey: string, options: CheckoutOptions): PaymentGateway {
  const stripe = new Stripe(secretKey, { maxNetworkRetries: 1, timeout: 15_000 });
  return {
    name: "stripe",
    async createCheckout(checkout, urls) {
      const session = await stripe.checkout.sessions.create(buildCheckoutSessionParams(checkout, urls, options), {
        // Repetir o mesmo pedido não cria duas sessões.
        idempotencyKey: `checkout-${checkout.orderId}`,
      });
      if (!session.url) throw new Error("Stripe não devolveu a URL do checkout.");
      return { id: session.id, url: session.url };
    },
    async retrieveOrder(sessionId) {
      if (!isCheckoutSessionId(sessionId)) return null;
      try {
        return orderFromSession(await stripe.checkout.sessions.retrieve(sessionId));
      } catch (error) {
        if (error instanceof Stripe.errors.StripeInvalidRequestError) return null;
        throw error;
      }
    },
  };
}

/** Gateway configurado ou `null` quando o Stripe não está ligado (o modal cai no WhatsApp). */
export function getPaymentGateway(env: ServerEnv): PaymentGateway | null {
  if (!env.STRIPE_SECRET_KEY) return null;
  const methods = env.STRIPE_PAYMENT_METHODS?.split(",").map((method) => method.trim()).filter(Boolean);
  return createStripeGateway(env.STRIPE_SECRET_KEY, {
    paymentMethods: methods?.length ? methods : DEFAULT_PAYMENT_METHODS,
    installments: env.STRIPE_CARD_INSTALLMENTS === "true",
  });
}

/**
 * Endereço público usado nas URLs de retorno do Stripe. NEXT_PUBLIC_APP_URL tem prioridade;
 * sem ela, usa a origem da própria requisição (útil em desenvolvimento e nas prévias da Vercel).
 */
export function checkoutUrls(appUrl: string, locale: string, orderId: string): CheckoutUrls {
  const base = appUrl.replace(/\/+$/, "");
  return {
    // {CHECKOUT_SESSION_ID} é substituído pelo próprio Stripe.
    success: `${base}/${locale}/contratar/sucesso?session_id={CHECKOUT_SESSION_ID}&order_id=${encodeURIComponent(orderId)}`,
    cancel: `${base}/${locale}/contratar?cancelado=1`,
  };
}
