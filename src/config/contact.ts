/** Número profissional de WhatsApp, só dígitos com DDI (ex.: 5511999999999). Vazio oculta o canal. */
export function getWhatsappNumber(): string | null {
  const digits = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "").replace(/\D/g, "");
  return digits.length >= 12 && digits.length <= 15 ? digits : null;
}

export const budgetOptions = ["ate-5k", "5k-15k", "15k-50k", "acima-50k", "a-definir"] as const;

export type BudgetOption = (typeof budgetOptions)[number];

/** Valor do campo de serviço para assuntos que não são um serviço listado (ex.: vagas). */
export const OTHER_SERVICE = "outro";
