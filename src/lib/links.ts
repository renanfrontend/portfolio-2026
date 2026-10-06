import type { Locale } from "@/i18n/config";

export type SitePath = "" | "/sobre" | "/projetos" | "/servicos" | "/contato" | "/privacidade";

/** Monta um caminho interno preservando o idioma escolhido. */
export function localePath(locale: Locale, path: string = ""): string {
  return `/${locale}${path}`;
}

export function whatsappHref(number: string, message: string): string {
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

/** Troca o segmento de idioma de um pathname (ex.: /pt-BR/projetos -> /en/projetos). */
export function switchLocalePath(pathname: string, target: Locale): string {
  const segments = pathname.split("/");
  // segments[0] é "" porque o pathname começa com "/".
  segments[1] = target;
  return segments.join("/") || `/${target}`;
}
