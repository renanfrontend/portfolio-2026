import "server-only";
import type { ServerEnv } from "./env";

export type EmailMessage = {
  to: string;
  replyTo: string;
  subject: string;
  text: string;
};

export interface EmailAdapter {
  readonly name: string;
  /** Resolve quando o provedor aceita a mensagem; isso não garante a entrega na caixa de entrada. */
  send(message: EmailMessage): Promise<void>;
}

export class EmailProviderError extends Error {
  constructor(readonly status: number) {
    super(`Provedor de e-mail recusou a mensagem (HTTP ${status}).`);
    this.name = "EmailProviderError";
  }
}

/** Adaptador para a API HTTP do Resend (https://resend.com/docs/api-reference/emails/send-email). */
export function createResendAdapter(apiKey: string, from: string, fetchImpl: typeof fetch = fetch): EmailAdapter {
  return {
    name: "resend",
    async send(message) {
      const response = await fetchImpl("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from,
          to: [message.to],
          reply_to: message.replyTo,
          subject: message.subject,
          text: message.text,
        }),
        signal: AbortSignal.timeout(10_000),
      });
      if (!response.ok) throw new EmailProviderError(response.status);
    },
  };
}

/** Adaptador controlado para testes: guarda as mensagens em memória e nunca envia nada. */
export function createTestAdapter(outbox: EmailMessage[] = []): EmailAdapter & { outbox: EmailMessage[] } {
  return {
    name: "test",
    outbox,
    async send(message) {
      outbox.push(message);
    },
  };
}

const testOutbox: EmailMessage[] = [];

/** Retorna o adaptador configurado ou `null` quando a integração não está disponível. */
export function getEmailAdapter(env: ServerEnv): EmailAdapter | null {
  if (env.EMAIL_PROVIDER === "test") return createTestAdapter(testOutbox);
  if (env.EMAIL_PROVIDER === "resend" && env.RESEND_API_KEY && env.CONTACT_FROM_EMAIL) {
    return createResendAdapter(env.RESEND_API_KEY, env.CONTACT_FROM_EMAIL);
  }
  return null;
}
