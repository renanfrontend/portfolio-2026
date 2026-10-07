import type { Metadata } from "next";
import { siteConfig } from "@/config/site";
import { locales, openGraphLocale, type Locale } from "@/i18n/config";

type ShareImage = { url: string; width: number; height: number; alt: string };

type PageMetadataInput = {
  locale: Locale;
  /** Caminho depois do idioma, ex.: "/projetos". Vazio para a home. */
  path: string;
  title: string;
  description: string;
  /** Quando verdadeiro, o título não recebe o sufixo do template. */
  absoluteTitle?: boolean;
  /** Imagem de compartilhamento; sem ela, usa a imagem padrão do idioma. */
  image?: ShareImage;
  /** "article" para estudos de caso; "profile" para a página Sobre. */
  type?: "website" | "article" | "profile";
};

export function absoluteUrl(path: string): string {
  if (/^https?:\/\//.test(path)) return path;
  return `${siteConfig.url}${path}`;
}

/** Imagem padrão gerada em app/[locale]/opengraph-image.tsx. */
export function defaultShareImage(locale: Locale, alt: string): ShareImage {
  return { url: absoluteUrl(`/${locale}/opengraph-image`), width: 1200, height: 630, alt };
}

export function buildPageMetadata({ locale, path, title, description, absoluteTitle, image, type = "website" }: PageMetadataInput): Metadata {
  const languages: Record<string, string> = Object.fromEntries(
    locales.map((item) => [item, absoluteUrl(`/${item}${path}`)]),
  );
  languages["x-default"] = absoluteUrl(`/pt-BR${path}`);
  // Definir openGraph na página substitui o da imagem automática, então a imagem vai explícita.
  const share = image ? { ...image, url: absoluteUrl(image.url) } : defaultShareImage(locale, title);

  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: {
      canonical: absoluteUrl(`/${locale}${path}`),
      languages,
    },
    openGraph: {
      type,
      siteName: siteConfig.name,
      locale: openGraphLocale[locale],
      alternateLocale: locales.filter((item) => item !== locale).map((item) => openGraphLocale[item]),
      url: absoluteUrl(`/${locale}${path}`),
      title,
      description,
      images: [share],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [share.url],
    },
  };
}

/** Indexação só no ambiente de produção com domínio configurado. */
export function isIndexable(): boolean {
  if (process.env.VERCEL_ENV) return process.env.VERCEL_ENV === "production";
  return Boolean(process.env.NEXT_PUBLIC_SITE_URL);
}
