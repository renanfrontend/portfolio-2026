import { toE164 } from "@/lib/phone";
import type { PreHireInput } from "./schemas/pre-hire-schema";
import type { LocalizedPackage } from "./types";

/**
 * Pedido de contratação pronto para o fluxo de pagamento (próximo passo).
 * Os valores vêm do arquivo central de pacotes no servidor, nunca do navegador.
 */
export type CheckoutPayload = {
  orderId: string;
  createdAt: string;
  locale: "pt-BR" | "en";
  package: {
    id: string;
    name: string;
    /** Valor em centavos (padrão dos provedores de pagamento). null = sob consulta. */
    amountInCents: number | null;
    currency: "BRL";
    /** "a partir de": o valor final pode ser ajustado na proposta. */
    priceFrom: boolean;
    recurring: "month" | null;
    installments: boolean;
  };
  customer: {
    name: string;
    email: string;
    /** E.164, ex.: +5511987654321. */
    phone: string;
  };
  message: string;
};

/** Número de pedido curto e legível, ex.: RA-MG7K2P-4F9. */
export function createOrderId(now: Date = new Date(), random: () => number = Math.random): string {
  const time = now.getTime().toString(36).toUpperCase().slice(-6);
  const suffix = Math.floor(random() * 36 ** 3)
    .toString(36)
    .toUpperCase()
    .padStart(3, "0");
  return `RA-${time}-${suffix}`;
}

export function buildCheckoutPayload(input: PreHireInput, item: LocalizedPackage, now: Date = new Date(), orderId = createOrderId(now)): CheckoutPayload {
  return {
    orderId,
    createdAt: now.toISOString(),
    locale: input.locale ?? "pt-BR",
    package: {
      id: item.id,
      name: item.name,
      amountInCents: item.price === null ? null : Math.round(item.price * 100),
      currency: "BRL",
      priceFrom: Boolean(item.priceFrom),
      recurring: item.pricePeriod ?? null,
      installments: Boolean(item.installments),
    },
    customer: { name: input.name, email: input.email, phone: toE164(input.whatsapp) },
    message: input.message,
  };
}

/** Chave usada para guardar o pedido no navegador até a etapa de pagamento. */
export const CHECKOUT_STORAGE_KEY = "pre-hire-checkout";
