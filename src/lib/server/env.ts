import "server-only";
import { z } from "zod";

const emptyToUndefined = (value: unknown) => (typeof value === "string" && value.trim() === "" ? undefined : value);

const serverEnvSchema = z.object({
  EMAIL_PROVIDER: z.preprocess(emptyToUndefined, z.enum(["resend", "test"]).optional()),
  RESEND_API_KEY: z.preprocess(emptyToUndefined, z.string().optional()),
  CONTACT_FROM_EMAIL: z.preprocess(emptyToUndefined, z.string().optional()),
  CONTACT_TO_EMAIL: z.preprocess(emptyToUndefined, z.email().optional()),
  UPSTASH_REDIS_REST_URL: z.preprocess(emptyToUndefined, z.url().optional()),
  UPSTASH_REDIS_REST_TOKEN: z.preprocess(emptyToUndefined, z.string().optional()),
  STRIPE_SECRET_KEY: z.preprocess(emptyToUndefined, z.string().regex(/^(sk|rk)_/).optional()),
  STRIPE_WEBHOOK_SECRET: z.preprocess(emptyToUndefined, z.string().startsWith("whsec_").optional()),
  /** Métodos aceitos no Checkout, separados por vírgula. Vazio = card,pix,boleto. */
  STRIPE_PAYMENT_METHODS: z.preprocess(emptyToUndefined, z.string().optional()),
  /** Parcelamento no cartão (Brasil). Precisa estar liberado na conta Stripe. */
  STRIPE_CARD_INSTALLMENTS: z.preprocess(emptyToUndefined, z.enum(["true", "false"]).optional()),
  NEXT_PUBLIC_APP_URL: z.preprocess(emptyToUndefined, z.url().optional()),
});

const DEFAULT_CONTACT_TO = "renan.gabba@gmail.com";

export type ServerEnv = z.infer<typeof serverEnvSchema> & { contactTo: string };

/** Lê as variáveis de servidor a cada chamada. Valores inválidos viram ausentes, sem derrubar o site. */
export function getServerEnv(): ServerEnv {
  const parsed = serverEnvSchema.safeParse(process.env);
  const env = parsed.success ? parsed.data : {};
  if (!parsed.success) {
    console.error("[env] Variáveis de servidor inválidas:", parsed.error.issues.map((issue) => issue.path.join(".")));
  }
  // O formulário entrega direto na caixa pessoal, sem passar pelo encaminhamento do contato@.
  return { ...env, contactTo: env.CONTACT_TO_EMAIL ?? DEFAULT_CONTACT_TO };
}
