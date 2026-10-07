import "server-only";
import { cacheLife } from "next/cache";
import { contentByLocale } from "@/content";
import { highlightOrder, projectsBase } from "@/content/projects-base";
import type { Locale } from "@/i18n/config";
import { fetchShowcaseRepos, repoToProject } from "@/lib/github-showcase";
import { mergeProjects, pickHighlights } from "../ordering";
import type { Project } from "../types";

/** Projetos escritos à mão, com estudo de caso completo. */
function getCuratedProjects(locale: Locale): Project[] {
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

/** Repositórios do GitHub com o tópico de vitrine, revalidados a cada hora. */
async function getGithubProjects(): Promise<Project[]> {
  "use cache";
  cacheLife("hours");
  const repos = await fetchShowcaseRepos();
  return repos.map(repoToProject);
}

/** Todos os projetos: curados + GitHub, com os que estão no ar primeiro. */
export async function getProjects(locale: Locale): Promise<Project[]> {
  return mergeProjects(getCuratedProjects(locale), await getGithubProjects(), highlightOrder);
}

export async function getProjectBySlug(locale: Locale, slug: string): Promise<Project | undefined> {
  return (await getProjects(locale)).find((project) => project.slug === slug);
}

/** Os melhores projetos para a home, na ordem definida em highlightOrder. */
export async function getFeaturedProjects(locale: Locale, limit = 6): Promise<Project[]> {
  return pickHighlights(await getProjects(locale), highlightOrder, limit);
}

export async function getProjectSlugs(): Promise<string[]> {
  return (await getProjects("pt-BR")).map((project) => project.slug);
}
