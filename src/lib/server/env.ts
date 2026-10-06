import "server-only";
import { z } from "zod";
import { siteConfig } from "@/config/site";

const emptyToUndefined = (value: unknown) => (typeof value === "string" && value.trim() === "" ? undefined : value);

const serverEnvSchema = z.object({
  EMAIL_PROVIDER: z.preprocess(emptyToUndefined, z.enum(["resend", "test"]).optional()),
  RESEND_API_KEY: z.preprocess(emptyToUndefined, z.string().optional()),
  CONTACT_FROM_EMAIL: z.preprocess(emptyToUndefined, z.string().optional()),
  CONTACT_TO_EMAIL: z.preprocess(emptyToUndefined, z.email().optional()),
  UPSTASH_REDIS_REST_URL: z.preprocess(emptyToUndefined, z.url().optional()),
  UPSTASH_REDIS_REST_TOKEN: z.preprocess(emptyToUndefined, z.string().optional()),
});

export type ServerEnv = z.infer<typeof serverEnvSchema> & { contactTo: string };

/** Lê as variáveis de servidor a cada chamada. Valores inválidos viram ausentes, sem derrubar o site. */
export function getServerEnv(): ServerEnv {
  const parsed = serverEnvSchema.safeParse(process.env);
  const env = parsed.success ? parsed.data : {};
  if (!parsed.success) {
    console.error("[env] Variáveis de servidor inválidas:", parsed.error.issues.map((issue) => issue.path.join(".")));
  }
  return { ...env, contactTo: env.CONTACT_TO_EMAIL ?? siteConfig.email };
}
