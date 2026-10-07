import type { MetadataRoute } from "next";
import { getProjectSlugs } from "@/features/projects/server/queries";
import { getServiceSlugs } from "@/features/services/server/queries";
import { locales } from "@/i18n/config";
import { absoluteUrl } from "@/lib/seo";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const paths = [
    "",
    "/sobre",
    "/projetos",
    ...(await getProjectSlugs()).map((slug) => `/projetos/${slug}`),
    "/servicos",
    ...getServiceSlugs().map((slug) => `/servicos/${slug}`),
    "/contato",
    "/privacidade",
  ];

  return paths.flatMap((path) => {
    const languages = Object.fromEntries(locales.map((locale) => [locale, absoluteUrl(`/${locale}${path}`)]));
    return locales.map((locale) => ({ url: absoluteUrl(`/${locale}${path}`), alternates: { languages } }));
  });
}
