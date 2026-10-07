import "server-only";
import Stripe from "stripe";
import { siteConfig } from "@/config/site";
import type { EmailAdapter } from "@/lib/server/email";
import type { OrderStore } from "./order-store";
import { orderFromSession, type OrderStatus, type PaidOrder } from "./payments";

type Deps = {
  email: EmailAdapter | null;
  store: OrderStore;
  /** Caixa do Renan. */
  to: string;
  /** Link de agendamento do kickoff (Cal.com/Calendly), quando houver. */
  schedulingUrl: string | null;
  whatsappNumber: string | null;
};

export type WebhookResult = { status: number; body: { received: boolean; error?: string } };

/** Eventos do Checkout que mudam o status do pedido. Pix e boleto chegam como "completed" ainda pendentes. */
const STATUS_BY_EVENT: Partial<Record<Stripe.Event.Type, OrderStatus | "fromSession">> = {
  "checkout.session.completed": "fromSession",
  "checkout.session.async_payment_succeeded": "paid",
  "checkout.session.async_payment_failed": "failed",
};

/**
 * Valida a assinatura do Stripe e processa o evento. Responde 2xx só depois de registrar o status
 * e enviar os avisos; em erro temporário responde 500 e o Stripe reenvia o evento mais tarde.
 */
export async function processStripeWebhook(rawBody: string, signature: string | null, secret: string | undefined, deps: Deps): Promise<WebhookResult> {
  if (!secret) return { status: 503, body: { received: false, error: "not_configured" } };
  if (!signature) return { status: 400, body: { received: false, error: "missing_signature" } };

  let event: Stripe.Event;
  try {
    event = Stripe.webhooks.constructEvent(rawBody, signature, secret);
  } catch {
    return { status: 400, body: { received: false, error: "invalid_signature" } };
  }

  try {
    await handleStripeEvent(event, deps);
  } catch (error) {
    console.error("[stripe-webhook] Falha ao processar", event.type, error instanceof Error ? error.message : "erro desconhecido");
    return { status: 500, body: { received: false, error: "processing_failed" } };
  }
  return { status: 200, body: { received: true } };
}

export async function handleStripeEvent(event: Stripe.Event, deps: Deps): Promise<OrderStatus | null> {
  const rule = STATUS_BY_EVENT[event.type];
  if (!rule) return null;

  const order = orderFromSession(event.data.object as Stripe.Checkout.Session);
  if (!order) return null; // Sessão que não nasceu no site (ex.: link de pagamento manual).
  const status = rule === "fromSession" ? order.status : rule;

  // Evento repetido: o pedido já está neste status e os avisos já saíram.
  if ((await deps.store.getStatus(order.orderId)) === status) return status;

  if (deps.email) {
    await deps.email.send(adminMessage(order, status, deps.to));
    if (status === "paid" && order.customer.email) await deps.email.send(customerMessage(order, deps));
  }
  await deps.store.setStatus(order.orderId, status);
  return status;
}

const formatAmount = (order: PaidOrder, locale: "pt-BR" | "en") =>
  new Intl.NumberFormat(locale, { style: "currency", currency: order.currency }).format(order.amountInCents / 100) +
  (order.recurring ? (locale === "en" ? "/month" : "/mês") : "");

const STATUS_LABEL: Record<OrderStatus, string> = {
  paid: "PAGO",
  pending: "aguardando pagamento (Pix ou boleto gerado)",
  failed: "pagamento NÃO concluído",
};

function adminMessage(order: PaidOrder, status: OrderStatus, to: string) {
  return {
    to,
    replyTo: order.customer.email ?? to,
    subject: `[Site] Pedido ${order.orderId} ${status === "paid" ? "PAGO" : status === "pending" ? "aguardando pagamento" : "não pago"}: ${order.packageName}`,
    text: [
      `Pedido: ${order.orderId}`,
      `Status: ${STATUS_LABEL[status]}`,
      `Pacote: ${order.packageName}`,
      `Valor: ${formatAmount(order, "pt-BR")}`,
      "",
      `Nome: ${order.customer.name}`,
      `E-mail: ${order.customer.email ?? "não informado"}`,
      `WhatsApp: ${order.customer.phone}`,
      "",
      `Sessão no Stripe: ${order.sessionId}`,
      status === "paid" ? "Próximo passo: confirmar o kickoff com o cliente." : "",
    ].join("\n"),
  };
}

function customerMessage(order: PaidOrder, deps: Deps) {
  const en = order.locale === "en";
  const firstName = order.customer.name.split(" ")[0] || order.customer.name;
  const whatsapp = deps.whatsappNumber ? `https://wa.me/${deps.whatsappNumber}` : null;
  const lines = en
    ? [
        `Hi ${firstName},`,
        "",
        `Your payment for "${order.packageName}" was confirmed. Thank you!`,
        "",
        `Order: ${order.orderId}`,
        `Amount: ${formatAmount(order, "en")}`,
        "",
        "Next step: let's schedule the technical kickoff meeting.",
        deps.schedulingUrl ? `Pick a time: ${deps.schedulingUrl}` : "I'll reach out within 1 business day to schedule it.",
        whatsapp ? `WhatsApp: ${whatsapp}` : "",
        "",
        "Renan Augusto",
        siteConfig.url,
      ]
    : [
        `Olá, ${firstName}!`,
        "",
        `O pagamento do pacote "${order.packageName}" foi confirmado. Obrigado pela confiança!`,
        "",
        `Pedido: ${order.orderId}`,
        `Valor: ${formatAmount(order, "pt-BR")}`,
        "",
        "Próximo passo: agendar nossa reunião de alinhamento técnico (kickoff).",
        deps.schedulingUrl ? `Escolha um horário: ${deps.schedulingUrl}` : "Entro em contato em até 1 dia útil para agendarmos.",
        whatsapp ? `WhatsApp: ${whatsapp}` : "",
        "",
        "Renan Augusto",
        siteConfig.url,
      ];
  return {
    to: order.customer.email as string,
    replyTo: siteConfig.email,
    subject: en ? `Payment confirmed: order ${order.orderId}` : `Pagamento confirmado: pedido ${order.orderId}`,
    text: lines.filter((line, index, all) => line !== "" || all[index - 1] !== "").join("\n"),
  };
}
