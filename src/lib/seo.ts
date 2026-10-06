import type { Metadata } from "next";
import { siteConfig } from "@/config/site";
import { locales, openGraphLocale, type Locale } from "@/i18n/config";

type PageMetadataInput = {
  locale: Locale;
  /** Caminho depois do idioma, ex.: "/projetos". Vazio para a home. */
  path: string;
  title: string;
  description: string;
  /** Quando verdadeiro, o título não recebe o sufixo do template. */
  absoluteTitle?: boolean;
};

export function absoluteUrl(path: string): string {
  return `${siteConfig.url}${path}`;
}

export function buildPageMetadata({ locale, path, title, description, absoluteTitle }: PageMetadataInput): Metadata {
  const languages: Record<string, string> = Object.fromEntries(
    locales.map((item) => [item, absoluteUrl(`/${item}${path}`)]),
  );
  languages["x-default"] = absoluteUrl(`/pt-BR${path}`);

  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: {
      canonical: absoluteUrl(`/${locale}${path}`),
      languages,
    },
    openGraph: {
      type: "website",
      siteName: siteConfig.name,
      locale: openGraphLocale[locale],
      url: absoluteUrl(`/${locale}${path}`),
      title,
      description,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

/** Indexação só no ambiente de produção com domínio configurado. */
export function isIndexable(): boolean {
  if (process.env.VERCEL_ENV) return process.env.VERCEL_ENV === "production";
  return Boolean(process.env.NEXT_PUBLIC_SITE_URL);
}
