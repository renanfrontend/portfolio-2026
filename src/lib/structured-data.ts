import { siteConfig } from "@/config/site";
import type { Locale } from "@/i18n/config";
import { absoluteUrl } from "./seo";

/**
 * Dados estruturados (Schema.org) para o Google entender quem é o autor,
 * o que é o site e onde cada página fica. Só informações verdadeiras e públicas.
 */

const personId = () => absoluteUrl("/#renan");
const websiteId = () => absoluteUrl("/#site");

export function personSchema(locale: Locale, jobTitle: string) {
  return {
    "@type": "Person",
    "@id": personId(),
    name: siteConfig.fullName,
    alternateName: siteConfig.name,
    jobTitle,
    url: absoluteUrl(`/${locale}`),
    image: absoluteUrl("/images/profile/renan-github.jpg"),
    email: `mailto:${siteConfig.email}`,
    address: { "@type": "PostalAddress", addressLocality: "São Paulo", addressRegion: "SP", addressCountry: "BR" },
    alumniOf: { "@type": "CollegeOrUniversity", name: "Universidade São Judas Tadeu" },
    knowsAbout: ["React", "Next.js", "TypeScript", "Frontend", "Dashboards", "Acessibilidade", "Inteligência Artificial", "Ciência de Dados"],
    sameAs: [siteConfig.github, siteConfig.linkedin],
  };
}

export function websiteSchema(locale: Locale, description: string) {
  return {
    "@type": "WebSite",
    "@id": websiteId(),
    url: absoluteUrl(""),
    name: siteConfig.name,
    alternateName: siteConfig.fullName,
    description,
    inLanguage: locale,
    publisher: { "@id": personId() },
  };
}

/** Página de perfil (Sobre): o Google pode mostrar o perfil da pessoa nos resultados. */
export function profilePageSchema(locale: Locale, jobTitle: string) {
  return {
    "@type": "ProfilePage",
    url: absoluteUrl(`/${locale}/sobre`),
    inLanguage: locale,
    isPartOf: { "@id": websiteId() },
    mainEntity: personSchema(locale, jobTitle),
  };
}

/** Trilha de navegação (aparece no resultado do Google no lugar da URL). */
export function breadcrumbSchema(items: { name: string; path: string }[]) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function projectSchema(input: {
  locale: Locale;
  slug: string;
  title: string;
  summary: string;
  image?: string;
  technologies: string[];
  repositoryUrl?: string;
  liveUrl?: string;
}) {
  return {
    "@type": "CreativeWork",
    name: input.title,
    description: input.summary,
    url: absoluteUrl(`/${input.locale}/projetos/${input.slug}`),
    inLanguage: input.locale,
    image: input.image ? absoluteUrl(input.image) : undefined,
    keywords: input.technologies.join(", "),
    author: { "@id": personId() },
    sameAs: [input.liveUrl, input.repositoryUrl].filter(Boolean),
  };
}

/** Junta vários blocos em um único JSON-LD com @graph. */
export function jsonLd(...nodes: object[]) {
  return JSON.stringify({ "@context": "https://schema.org", "@graph": nodes });
}
