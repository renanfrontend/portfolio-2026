/** Só os dígitos, sem DDI 55 e no máximo 11 (DDD + número). */
export function phoneDigits(value: string): string {
  let digits = value.replace(/\D/g, "");
  if (digits.length > 11 && digits.startsWith("55")) digits = digits.slice(2);
  return digits.slice(0, 11);
}

/** Máscara brasileira enquanto a pessoa digita: (11) 98765-4321 ou (11) 3456-7890. */
export function formatBrazilPhone(value: string): string {
  const digits = phoneDigits(value);
  if (digits.length === 0) return "";
  if (digits.length <= 2) return `(${digits}`;
  const ddd = digits.slice(0, 2);
  const rest = digits.slice(2);
  if (rest.length <= 4) return `(${ddd}) ${rest}`;
  // Celular tem 9 dígitos; fixo, 8.
  const split = rest.length === 9 ? 5 : 4;
  return `(${ddd}) ${rest.slice(0, split)}-${rest.slice(split)}`;
}

/** Celular brasileiro válido: DDD de 11 a 99 e 9 dígitos começando com 9. Fixo (8 dígitos) também é aceito. */
export function isValidBrazilPhone(value: string): boolean {
  const digits = phoneDigits(value);
  const ddd = Number(digits.slice(0, 2));
  if (ddd < 11 || ddd > 99) return false;
  const rest = digits.slice(2);
  return (rest.length === 9 && rest.startsWith("9")) || (rest.length === 8 && /^[2-5]/.test(rest));
}

/** Formato internacional E.164, usado por provedores de pagamento e WhatsApp: +5511987654321. */
export function toE164(value: string): string {
  return `+55${phoneDigits(value)}`;
}
