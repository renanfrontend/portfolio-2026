import { z } from "zod";
import { budgetOptions, OTHER_SERVICE } from "@/config/contact";
import { contactFields, type ContactField, type ContactFieldErrorCode, type ContactFieldErrors } from "../types";

export const CONTACT_LIMITS = {
  name: { min: 2, max: 100 },
  email: { max: 254 },
  company: { max: 120 },
  phone: { max: 30 },
  timeline: { max: 80 },
  message: { min: 20, max: 4000 },
} as const;

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, { error: "tooLong" })
    .optional()
    .transform((value) => (value ? value : undefined));

/**
 * Contrato do formulário de contato, usado no cliente e revalidado no servidor.
 * `serviceSlugs` vem do conteúdo; "outro" cobre vagas e assuntos gerais.
 */
export function createContactSchema(serviceSlugs: readonly string[]) {
  const services = [...serviceSlugs, OTHER_SERVICE];

  return z.object({
    name: z
      .string({ error: "required" })
      .trim()
      .min(CONTACT_LIMITS.name.min, { error: "name" })
      .max(CONTACT_LIMITS.name.max, { error: "name" }),
    email: z
      .string({ error: "required" })
      .trim()
      .max(CONTACT_LIMITS.email.max, { error: "email" })
      .pipe(z.email({ error: "email" })),
    company: optionalText(CONTACT_LIMITS.company.max),
    phone: optionalText(CONTACT_LIMITS.phone.max),
    service: z
      .string({ error: "service" })
      .refine((value) => services.includes(value), { error: "service" }),
    budget: z
      .enum(budgetOptions, { error: "required" })
      .optional()
      .or(z.literal("").transform(() => undefined)),
    timeline: optionalText(CONTACT_LIMITS.timeline.max),
    message: z
      .string({ error: "required" })
      .trim()
      .min(CONTACT_LIMITS.message.min, { error: "message" })
      .max(CONTACT_LIMITS.message.max, { error: "message" }),
    /** Armadilha para robôs: precisa chegar vazio. */
    website: z.string().max(0).optional(),
    /** Idioma da página de onde a mensagem saiu (informativo). */
    locale: z.enum(["pt-BR", "en"]).optional().catch(undefined),
    /** Pacote de /contratar escolhido (informativo; valores desconhecidos são ignorados no e-mail). */
    package: z.string().max(60).optional().catch(undefined),
  });
}

export type ContactInput = z.output<ReturnType<typeof createContactSchema>>;

const knownCodes: ContactFieldErrorCode[] = ["required", "name", "email", "service", "message", "tooLong"];

/** Converte os issues do Zod em um código por campo (o primeiro encontrado). */
export function toFieldErrors(error: z.ZodError): ContactFieldErrors {
  const fieldErrors: ContactFieldErrors = {};
  for (const issue of error.issues) {
    const field = issue.path[0];
    if (typeof field !== "string" || !(contactFields as readonly string[]).includes(field)) continue;
    const key = field as ContactField;
    if (fieldErrors[key]) continue;
    const code = knownCodes.find((item) => item === issue.message) ?? defaultCodeFor(key);
    fieldErrors[key] = code;
  }
  return fieldErrors;
}

function defaultCodeFor(field: ContactField): ContactFieldErrorCode {
  if (field === "name" || field === "email" || field === "service" || field === "message") return field;
  return "tooLong";
}
