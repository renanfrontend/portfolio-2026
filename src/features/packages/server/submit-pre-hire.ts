import "server-only";
import { EmailProviderError, type EmailAdapter } from "@/lib/server/email";
import type { RateLimiter } from "@/lib/server/rate-limit";
import { buildCheckoutPayload, type CheckoutPayload } from "../checkout";
import { formatPrice, getPackages } from "../packages";
import { createPreHireSchema, toPreHireErrors, type PreHireFieldErrors } from "../schemas/pre-hire-schema";

export type PreHireResponse =
  | { ok: true; checkout: CheckoutPayload }
  | { ok: false; error: "validation"; fieldErrors: PreHireFieldErrors }
  | { ok: false; error: "rate_limited" | "unavailable" | "server" };

type Deps = { email: EmailAdapter | null; limiter: RateLimiter; to: string; now?: Date };

/**
 * Pré-contratação: limite de requisições -> validação -> pedido com valores do servidor -> aviso por e-mail.
 * Só responde sucesso quando o provedor de e-mail aceitou a mensagem (o pedido não se perde).
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
  if (!deps.email) return { status: 503, body: { ok: false, error: "unavailable" } };

  const checkout = buildCheckoutPayload({ ...parsed.data, locale }, item, deps.now);
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
        "Próximo passo: enviar o link de pagamento ou a proposta para o cliente.",
      ].join("\n"),
    });
  } catch (error) {
    console.error("[pre-hire] Falha no envio:", error instanceof Error ? error.name : "erro desconhecido");
    return error instanceof EmailProviderError
      ? { status: 503, body: { ok: false, error: "unavailable" } }
      : { status: 500, body: { ok: false, error: "server" } };
  }

  return { status: 200, body: { ok: true, checkout } };
}
