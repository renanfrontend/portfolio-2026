import "server-only";
import { contentByLocale } from "@/content";
import type { Locale } from "@/i18n/config";
import type { Service } from "../types";

export function getServices(locale: Locale): Service[] {
  return contentByLocale[locale].services;
}

export function getServiceBySlug(locale: Locale, slug: string): Service | undefined {
  return getServices(locale).find((service) => service.slug === slug);
}

export function getServiceSlugs(): string[] {
  return contentByLocale["pt-BR"].services.map((service) => service.slug);
}
