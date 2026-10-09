import { getWhatsappNumber } from "@/config/contact";
import { defaultLocale } from "@/i18n/config";
import { localePath, whatsappHref } from "@/lib/links";

/** Mensagem pronta do atalho /whatsapp: o contato já chega dizendo que veio do Instagram. */
export const INSTAGRAM_WHATSAPP_MESSAGE = "Olá, Renan! Vim pelo Instagram e quero falar sobre: ";

/** Campanha lida por acquisitionFromUrl: o pedido feito no site fica atribuído à bio do Instagram. */
const INSTAGRAM_BIO_CAMPAIGN = new URLSearchParams({
  utm_source: "instagram",
  utm_medium: "social",
  utm_campaign: "bio",
}).toString();

const shortLinks = {
  /** Link 1 da bio: página inicial com a campanha do Instagram. */
  "/ig": () => `${localePath(defaultLocale)}?${INSTAGRAM_BIO_CAMPAIGN}`,
  /** Link 2 da bio: WhatsApp com mensagem pronta; sem número configurado, cai no formulário de contato. */
  "/whatsapp": () => {
    const number = getWhatsappNumber();
    return number
      ? whatsappHref(number, INSTAGRAM_WHATSAPP_MESSAGE)
      : `${localePath(defaultLocale, "/contato")}?${INSTAGRAM_BIO_CAMPAIGN}`;
  },
} satisfies Record<`/${string}`, () => string>;

export type ShortLinkPath = keyof typeof shortLinks;

function isShortLinkPath(path: string): path is ShortLinkPath {
  return Object.hasOwn(shortLinks, path);
}

/**
 * Atalhos curtos para bios de redes sociais (ex.: renanaugusto.com.br/ig).
 * Aceita barra final e maiúsculas; devolve o destino, ou null quando o caminho não é um atalho.
 */
export function resolveShortLink(pathname: string): string | null {
  const path = pathname.toLowerCase().replace(/\/+$/, "");
  return isShortLinkPath(path) ? shortLinks[path]() : null;
}
