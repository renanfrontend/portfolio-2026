export const projectCategories = ["web", "dashboard", "automation", "ai"] as const;
export type ProjectCategory = (typeof projectCategories)[number];

export type ProjectKind = "personal" | "professional" | "demo";
export type ProjectStatus = "live" | "in-progress" | "archived";

export type ProjectImage = {
  src: string;
  alt: string;
  width: number;
  height: number;
};

/** Dados que não mudam entre idiomas. */
export type ProjectBase = {
  id: string;
  slug: string;
  category: ProjectCategory;
  technologies: string[];
  kind: ProjectKind;
  /** Omitido quando não há informação pública confirmada. */
  status?: ProjectStatus;
  featured: boolean;
  cover?: Omit<ProjectImage, "alt">;
  gallery: Omit<ProjectImage, "alt">[];
  repositoryUrl?: string;
  liveUrl?: string;
};

/** Textos traduzidos de cada projeto. */
export type ProjectCopy = {
  title: string;
  summary: string;
  coverAlt?: string;
  galleryAlt: string[];
  challenge: string;
  solution: string;
  contribution: string;
  outcomes: string[];
};

export type Project = Omit<ProjectBase, "cover" | "gallery"> & {
  title: string;
  summary: string;
  cover?: ProjectImage;
  gallery: ProjectImage[];
  challenge: string;
  solution: string;
  contribution: string;
  outcomes: string[];
};
