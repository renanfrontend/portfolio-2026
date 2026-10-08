import { servicePackages } from "@/content/packages";
import type { Locale } from "@/i18n/config";
import type { LocalizedPackage, ServicePackage } from "./types";

export function localizePackage(item: ServicePackage, locale: Locale): LocalizedPackage {
  const { copy, ...base } = item;
  return { ...base, ...copy[locale] };
}

export function getPackages(locale: Locale): LocalizedPackage[] {
  return servicePackages.map((item) => localizePackage(item, locale));
}

export function getPackageIds(): string[] {
  return servicePackages.map((item) => item.id);
}

/** Preço em reais, sem centavos quando redondo (ex.: "R$ 1.500"). null indica "sob consulta". */
export function formatPrice(price: number | null, locale: Locale): string | null {
  if (price === null) return null;
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: Number.isInteger(price) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(price);
}

/** Link do botão "Contratar": formulário de contato com o serviço e o pacote pré-selecionados. */
export function hireHref(item: Pick<ServicePackage, "id" | "serviceSlug">, locale: Locale): string {
  const params = new URLSearchParams({ servico: item.serviceSlug, pacote: item.id });
  return `/${locale}/contato?${params.toString()}`;
}
