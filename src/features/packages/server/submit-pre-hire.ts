import "server-only";
import { EmailProviderError, type EmailAdapter } from "@/lib/server/email";
import type { RateLimiter } from "@/lib/server/rate-limit";
import { buildCheckoutPayload, type CheckoutPayload } from "../checkout";
import { formatPrice, getPackages } from "../packages";
import { createPreHireSchema, toPreHireErrors, type PreHireFieldErrors } from "../schemas/pre-hire-schema";
import { checkoutUrls, type PaymentGateway } from "./payments";

export type PreHireResponse =
  /** checkoutUrl: página segura do Stripe. null = sem pagamento online agora (o modal oferece o WhatsApp). */
  | { ok: true; checkout: CheckoutPayload; checkoutUrl: string | null }
  | { ok: false; error: "validation"; fieldErrors: PreHireFieldErrors }
  | { ok: false; error: "rate_limited" | "unavailable" | "server" };

type Deps = {
  email: EmailAdapter | null;
  limiter: RateLimiter;
  to: string;
  /** Stripe ou null quando o pagamento online não está configurado. */
  payments: PaymentGateway | null;
  /** Origem pública para as URLs de retorno do Stripe, ex.: https://www.renanaugusto.com.br */
  appUrl: string;
  now?: Date;
};

/**
 * Pré-contratação: limite de requisições -> validação -> pedido com valores do servidor ->
 * sessão do Stripe Checkout (quando configurado) -> aviso por e-mail ao Renan.
 * Só responde sucesso quando o pedido ficou registrado em algum lugar: no Stripe ou no e-mail.
 */
export async function submitPreHire(payload: unknown, clientKey: string, deps: Deps): Promise<{ status: number; body: PreHireResponse }> {
  try {
    if (!(await deps.limiter.limit(clientKey)).allowed) return { status: 429, body: { ok: false, error: "rate_limited" } };
  } catch {
    return { status: 503, body: { ok: false, error: "unavailable" } };
  }

  // Os textos do pedido seguem o idioma da página; o aviso ao Renan sai em português.
  const locale = (payload as { locale?: string } | null)?.locale === "en" ? "en" : "pt-BR";
  const packages = getPackages(locale);
  const parsed = createPreHireSchema(packages.map((item) => item.id)).safeParse(payload);
  if (!parsed.success) return { status: 400, body: { ok: false, error: "validation", fieldErrors: toPreHireErrors(parsed.error) } };

  const item = packages.find((candidate) => candidate.id === parsed.data.packageId);
  if (!item || item.status === "unavailable") return { status: 400, body: { ok: false, error: "validation", fieldErrors: {} } };
  if (!deps.email && !deps.payments) return { status: 503, body: { ok: false, error: "unavailable" } };

  const checkout = buildCheckoutPayload({ ...parsed.data, locale }, item, deps.now);

  // Pacotes sob consulta ou de conversa (MVP) não têm cobrança direta.
  let checkoutUrl: string | null = null;
  let paymentNote = "Pagamento online: não configurado. Enviar o link de pagamento ou a proposta.";
  if (deps.payments && checkout.package.amountInCents !== null && item.cta !== "whatsapp") {
    try {
      const session = await deps.payments.createCheckout(checkout, checkoutUrls(deps.appUrl, locale, checkout.orderId));
      checkoutUrl = session.url;
      paymentNote = `Pagamento online: cliente enviado ao Stripe Checkout (sessão ${session.id}). O webhook avisa quando o pagamento for confirmado.`;
    } catch (error) {
      console.error("[pre-hire] Falha ao criar o checkout:", error instanceof Error ? error.message : "erro desconhecido");
      paymentNote = "Pagamento online: FALHOU ao abrir o Stripe. O cliente viu a opção de WhatsApp; enviar o link de pagamento manualmente.";
    }
  }
  if (!deps.email) {
    return checkoutUrl
      ? { status: 200, body: { ok: true, checkout, checkoutUrl } }
      : { status: 503, body: { ok: false, error: "unavailable" } };
  }
  const ptName = getPackages("pt-BR").find((candidate) => candidate.id === item.id)?.name ?? item.name;
  const price = formatPrice(item.price, "pt-BR");

  try {
    await deps.email.send({
      to: deps.to,
      replyTo: checkout.customer.email,
      subject: `[Site] Pré-contratação ${checkout.orderId}: ${ptName} (${checkout.customer.name})`,
      text: [
        `Pedido: ${checkout.orderId}`,
        `Pacote: ${ptName}`,
        `Valor: ${price ? `${item.priceFrom ? "a partir de " : ""}${price}${item.pricePeriod === "month" ? "/mês" : ""}` : "sob consulta"}`,
        `Parcelamento no cartão: ${item.installments ? "sim" : "não"}`,
        "",
        `Nome: ${checkout.customer.name}`,
        `E-mail: ${checkout.customer.email}`,
        `WhatsApp: ${checkout.customer.phone}`,
        `Idioma da página: ${locale === "en" ? "Inglês" : "Português"}`,
        "",
        "Sobre o projeto:",
        checkout.message,
        "",
        paymentNote,
      ].join("\n"),
    });
  } catch (error) {
    console.error("[pre-hire] Falha no envio:", error instanceof Error ? error.name : "erro desconhecido");
    // Com o checkout aberto, o pedido já está no Stripe: o cliente segue para o pagamento.
    if (checkoutUrl) return { status: 200, body: { ok: true, checkout, checkoutUrl } };
    return error instanceof EmailProviderError
      ? { status: 503, body: { ok: false, error: "unavailable" } }
      : { status: 500, body: { ok: false, error: "server" } };
  }

  return { status: 200, body: { ok: true, checkout, checkoutUrl } };
}
