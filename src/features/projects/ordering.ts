import type { Project } from "./types";

const isLive = (project: Project) => project.status === "live" && Boolean(project.liveUrl);

/**
 * Junta curados e importados do GitHub (sem duplicar o mesmo repositório) e ordena do mais recente para o
 * mais antigo, pela data de criação do repositório. O projeto curado herda essa data do seu repositório;
 * sem data conhecida, vai para o fim. Empates seguem a ordem de destaque e depois a ordem curada.
 */
export function mergeProjects(curated: Project[], fromGithub: Project[], order: readonly string[] = []): Project[] {
  const githubByRepo = new Map(fromGithub.filter((project) => project.repositoryUrl).map((project) => [project.repositoryUrl!.toLowerCase(), project]));
  const curatedRepos = new Set(curated.map((project) => project.repositoryUrl?.toLowerCase()).filter(Boolean));
  const curatedSlugs = new Set(curated.map((project) => project.slug));

  const dated = curated.map((project) => {
    const repo = project.repositoryUrl ? githubByRepo.get(project.repositoryUrl.toLowerCase()) : undefined;
    return project.createdAt || !repo?.createdAt ? project : { ...project, createdAt: repo.createdAt };
  });
  const extras = fromGithub.filter((project) => !curatedRepos.has(project.repositoryUrl?.toLowerCase()) && !curatedSlugs.has(project.slug));

  const rank = (project: Project) => {
    const index = order.indexOf(project.slug);
    return index < 0 ? Number.POSITIVE_INFINITY : index;
  };
  return [...dated, ...extras]
    .map((project, index) => ({ project, index }))
    .sort((a, b) => {
      // Datas AAAA-MM-DD comparam como texto; sem data ("") fica por último.
      const byDate = (b.project.createdAt ?? "").localeCompare(a.project.createdAt ?? "");
      if (byDate !== 0) return byDate;
      const byRank = rank(a.project) - rank(b.project);
      return Number.isNaN(byRank) || byRank === 0 ? a.index - b.index : byRank;
    })
    .map(({ project }) => project);
}

/** Destaques: primeiro a ordem definida à mão, depois os marcados como destaque no GitHub. Só projetos no ar. */
export function pickHighlights(projects: Project[], order: readonly string[], limit: number): Project[] {
  const bySlug = new Map(projects.map((project) => [project.slug, project]));
  const ranked = order.map((slug) => bySlug.get(slug)).filter((project): project is Project => Boolean(project));
  const extra = projects.filter((project) => project.featured && project.fromGithub && !order.includes(project.slug));
  return [...ranked, ...extra].filter(isLive).slice(0, limit);
}
