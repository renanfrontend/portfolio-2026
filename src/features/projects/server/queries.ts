import "server-only";
import { contentByLocale } from "@/content";
import { projectsBase } from "@/content/projects-base";
import type { Locale } from "@/i18n/config";
import type { Project } from "../types";

export function getProjects(locale: Locale): Project[] {
  const copies = contentByLocale[locale].projects;

  return projectsBase.map((base) => {
    const copy = copies[base.id];
    if (!copy) throw new Error(`Conteúdo ausente para o projeto "${base.id}" em ${locale}.`);

    return {
      ...base,
      title: copy.title,
      summary: copy.summary,
      challenge: copy.challenge,
      solution: copy.solution,
      contribution: copy.contribution,
      outcomes: copy.outcomes,
      cover: base.cover ? { ...base.cover, alt: copy.coverAlt ?? copy.title } : undefined,
      gallery: base.gallery.map((image, index) => ({ ...image, alt: copy.galleryAlt[index] ?? copy.title })),
    };
  });
}

export function getProjectBySlug(locale: Locale, slug: string): Project | undefined {
  return getProjects(locale).find((project) => project.slug === slug);
}

export function getFeaturedProjects(locale: Locale): Project[] {
  return getProjects(locale).filter((project) => project.featured);
}

export function getProjectSlugs(): string[] {
  return projectsBase.map((project) => project.slug);
}
