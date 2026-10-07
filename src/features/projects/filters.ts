import { projectCategories, type Project, type ProjectCategory } from "./types";

export type ProjectFilters = {
  q: string;
  category: ProjectCategory | null;
  tech: string | null;
  /** Mostrar só os projetos com site no ar. */
  liveOnly: boolean;
};

type ParamsReader = { get(name: string): string | null };

const MAX_QUERY_LENGTH = 80;

/** Lê e sanitiza os filtros da URL. Valores desconhecidos são ignorados. */
export function parseProjectFilters(params: ParamsReader, technologies: readonly string[]): ProjectFilters {
  const q = (params.get("q") ?? "").trim().slice(0, MAX_QUERY_LENGTH);
  const rawCategory = params.get("categoria");
  const rawTech = params.get("tecnologia");

  const category = projectCategories.find((item) => item === rawCategory) ?? null;
  const tech = technologies.find((item) => item.toLowerCase() === rawTech?.toLowerCase()) ?? null;

  const liveOnly = params.get("no-ar") === "1";

  return { q, category, tech, liveOnly };
}

/** Serializa os filtros na query string, omitindo os vazios. */
export function serializeProjectFilters(filters: ProjectFilters): string {
  const params = new URLSearchParams();
  if (filters.q) params.set("q", filters.q);
  if (filters.category) params.set("categoria", filters.category);
  if (filters.tech) params.set("tecnologia", filters.tech);
  if (filters.liveOnly) params.set("no-ar", "1");
  return params.toString();
}

function normalize(text: string): string {
  return text
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();
}

export function filterProjects(projects: readonly Project[], filters: ProjectFilters): Project[] {
  const terms = normalize(filters.q).split(/\s+/).filter(Boolean);

  return projects.filter((project) => {
    if (filters.category && project.category !== filters.category) return false;
    if (filters.tech && !project.technologies.includes(filters.tech)) return false;
    if (filters.liveOnly && !(project.status === "live" && project.liveUrl)) return false;
    if (terms.length === 0) return true;

    const haystack = normalize([project.title, project.summary, ...project.technologies].join(" "));
    return terms.every((term) => haystack.includes(term));
  });
}

export function collectTechnologies(projects: readonly Project[]): string[] {
  return [...new Set(projects.flatMap((project) => project.technologies))].sort((a, b) => a.localeCompare(b));
}

export function collectCategories(projects: readonly Project[]): ProjectCategory[] {
  return projectCategories.filter((category) => projects.some((project) => project.category === category));
}
