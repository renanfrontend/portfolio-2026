import type { Project } from "./types";

const isLive = (project: Project) => project.status === "live" && Boolean(project.liveUrl);

/**
 * Junta curados e importados do GitHub (sem duplicar o mesmo repositório)
 * e ordena: primeiro os que estão no ar, mantendo a ordem curada; depois os demais.
 */
export function mergeProjects(curated: Project[], fromGithub: Project[], order: readonly string[] = []): Project[] {
  const curatedRepos = new Set(curated.map((project) => project.repositoryUrl?.toLowerCase()).filter(Boolean));
  const curatedSlugs = new Set(curated.map((project) => project.slug));
  const extras = fromGithub
    .filter((project) => !curatedRepos.has(project.repositoryUrl?.toLowerCase()) && !curatedSlugs.has(project.slug))
    .sort((a, b) => (b.updatedAt ?? "").localeCompare(a.updatedAt ?? ""));

  const all = [...curated, ...extras];
  // Entre os que estão no ar, os melhores (ordem de destaque) vêm primeiro.
  const rank = (project: Project) => {
    const index = order.indexOf(project.slug);
    return index < 0 ? Number.POSITIVE_INFINITY : index;
  };
  const live = all.filter(isLive).sort((a, b) => (rank(a) === rank(b) ? 0 : rank(a) - rank(b)));
  return [...live, ...all.filter((project) => !isLive(project))];
}

/** Destaques: primeiro a ordem definida à mão, depois os marcados como destaque no GitHub. Só projetos no ar. */
export function pickHighlights(projects: Project[], order: readonly string[], limit: number): Project[] {
  const bySlug = new Map(projects.map((project) => [project.slug, project]));
  const ranked = order.map((slug) => bySlug.get(slug)).filter((project): project is Project => Boolean(project));
  const extra = projects.filter((project) => project.featured && project.fromGithub && !order.includes(project.slug));
  return [...ranked, ...extra].filter(isLive).slice(0, limit);
}
