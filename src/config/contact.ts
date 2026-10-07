/** WhatsApp profissional confirmado pelo Renan: (11) 96578-1243. */
const DEFAULT_WHATSAPP = "5511965781243";

/** Número de WhatsApp só com dígitos e DDI. NEXT_PUBLIC_WHATSAPP_NUMBER substitui o padrão. */
export function getWhatsappNumber(): string | null {
  const digits = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || DEFAULT_WHATSAPP).replace(/\D/g, "");
  return digits.length >= 12 && digits.length <= 15 ? digits : null;
}

export const budgetOptions = ["ate-5k", "5k-15k", "15k-50k", "acima-50k", "a-definir"] as const;

export type BudgetOption = (typeof budgetOptions)[number];

/** Valor do campo de serviço para assuntos que não são um serviço listado (ex.: vagas). */
export const OTHER_SERVICE = "outro";

/** Formato de exibição: +55 (11) 96578-1243. */
export function formatWhatsapp(number: string): string {
  const match = number.match(/^(\d{2})(\d{2})(\d{4,5})(\d{4})$/);
  return match ? `+${match[1]} (${match[2]}) ${match[3]}-${match[4]}` : `+${number}`;
}
