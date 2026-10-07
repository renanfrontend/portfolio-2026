import "server-only";
import { EmailProviderError, type EmailAdapter } from "@/lib/server/email";
import type { RateLimiter } from "@/lib/server/rate-limit";
import { createContactSchema, toFieldErrors, type ContactInput } from "../schemas/contact-schema";
import type { ContactApiResponse } from "../types";

export type SubmitContactDeps = {
  email: EmailAdapter | null;
  limiter: RateLimiter;
  serviceSlugs: readonly string[];
  /** Destinatário das mensagens (configuração exclusiva do servidor). */
  to: string;
  /** Nomes legíveis para o e-mail (ex.: "automacao-ia" -> "Automação com IA"). */
  labels?: {
    services?: Record<string, string>;
    budgets?: Record<string, string>;
  };
};

export type SubmitContactResult = { status: number; body: ContactApiResponse };

/**
 * Fluxo do contato: limite de requisições -> validação -> integração de e-mail.
 * Nunca devolve sucesso sem o provedor ter aceitado a mensagem.
 */
export async function submitContact(
  payload: unknown,
  clientKey: string,
  deps: SubmitContactDeps,
): Promise<SubmitContactResult> {
  let allowed: boolean;
  try {
    ({ allowed } = await deps.limiter.limit(clientKey));
  } catch (error) {
    // Falha do limitador externo não deve liberar envios ilimitados nem expor detalhes.
    console.error("[contact] Limitador indisponível:", error instanceof Error ? error.message : "erro desconhecido");
    return { status: 503, body: { ok: false, error: "unavailable" } };
  }
  if (!allowed) return { status: 429, body: { ok: false, error: "rate_limited" } };

  const parsed = createContactSchema(deps.serviceSlugs).safeParse(payload);
  if (!parsed.success) {
    return { status: 400, body: { ok: false, error: "validation", fieldErrors: toFieldErrors(parsed.error) } };
  }

  if (!deps.email) return { status: 503, body: { ok: false, error: "unavailable" } };

  try {
    await deps.email.send(buildMessage(parsed.data, deps.to, deps.labels));
    return { status: 200, body: { ok: true } };
  } catch (error) {
    if (error instanceof EmailProviderError) {
      console.error(`[contact] ${error.message}`);
      return { status: 503, body: { ok: false, error: "unavailable" } };
    }
    console.error("[contact] Falha inesperada no envio:", error instanceof Error ? error.name : "erro desconhecido");
    return { status: 500, body: { ok: false, error: "server" } };
  }
}

const localeNames: Record<string, string> = { "pt-BR": "Português", en: "Inglês" };

export function buildMessage(input: ContactInput, to: string, labels: SubmitContactDeps["labels"] = {}) {
  const service = labels.services?.[input.service] ?? input.service;
  const budget = input.budget ? (labels.budgets?.[input.budget] ?? input.budget) : undefined;
  const lines = [
    `Nome: ${input.name}`,
    `E-mail: ${input.email}`,
    input.company && `Empresa: ${input.company}`,
    input.phone && `Telefone: ${input.phone}`,
    `Serviço: ${service}`,
    budget && `Orçamento: ${budget}`,
    input.timeline && `Prazo desejado: ${input.timeline}`,
    input.locale && `Idioma da página: ${localeNames[input.locale] ?? input.locale}`,
    "",
    "Mensagem:",
    input.message,
    "",
    "Responda este e-mail para falar diretamente com a pessoa.",
  ].filter((line): line is string => typeof line === "string");

  return {
    to,
    replyTo: input.email,
    subject: `[Site] ${service}: contato de ${input.name}`,
    text: lines.join("\n"),
  };
}
