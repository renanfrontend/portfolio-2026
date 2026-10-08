import { z } from "zod";
import { acquisitionSchema } from "@/lib/acquisition";
import { isValidBrazilPhone } from "@/lib/phone";

export const PRE_HIRE_LIMITS = {
  name: { min: 5, max: 100 },
  email: { max: 254 },
  message: { min: 10, max: 1500 },
} as const;

/** Códigos de erro por campo; a interface traduz cada um. */
export type PreHireErrorCode = "name" | "email" | "whatsapp" | "message";
export type PreHireField = PreHireErrorCode;
export type PreHireFieldErrors = Partial<Record<PreHireField, PreHireErrorCode>>;

/**
 * Pré-contratação: validado no navegador (antes de avançar) e de novo no servidor.
 * `packageIds` vem do arquivo central de pacotes.
 */
export function createPreHireSchema(packageIds: readonly string[]) {
  return z.object({
    packageId: z.string().refine((value) => packageIds.includes(value)),
    // Nome completo: ao menos nome e sobrenome.
    name: z
      .string()
      .trim()
      .min(PRE_HIRE_LIMITS.name.min, { error: "name" })
      .max(PRE_HIRE_LIMITS.name.max, { error: "name" })
      .refine((value) => value.split(/\s+/).filter((part) => part.length >= 2).length >= 2, { error: "name" }),
    email: z.string().trim().max(PRE_HIRE_LIMITS.email.max, { error: "email" }).pipe(z.email({ error: "email" })),
    whatsapp: z.string().refine(isValidBrazilPhone, { error: "whatsapp" }),
    message: z
      .string()
      .trim()
      .min(PRE_HIRE_LIMITS.message.min, { error: "message" })
      .max(PRE_HIRE_LIMITS.message.max, { error: "message" }),
    locale: z.enum(["pt-BR", "en"]).optional().catch(undefined),
    /** Armadilha para robôs: precisa chegar vazio. */
    website: z.string().max(0).optional(),
    /** Origem da visita (UTM e página de entrada); dados ruins nunca bloqueiam o pedido. */
    acquisition: acquisitionSchema.optional().catch(undefined),
  });
}

export type PreHireInput = z.output<ReturnType<typeof createPreHireSchema>>;

const fields: PreHireField[] = ["name", "email", "whatsapp", "message"];

export function toPreHireErrors(error: z.ZodError): PreHireFieldErrors {
  const result: PreHireFieldErrors = {};
  for (const issue of error.issues) {
    const field = issue.path[0];
    if (typeof field === "string" && (fields as string[]).includes(field) && !result[field as PreHireField]) {
      result[field as PreHireField] = field as PreHireErrorCode;
    }
  }
  return result;
}
