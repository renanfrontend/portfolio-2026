import type { Dictionary } from "@/i18n/dictionaries";
import type { ProjectCardLabels } from "./components/project-card";

export function getProjectCardLabels(dict: Dictionary): ProjectCardLabels {
  return {
    viewCaseStudy: dict.projects.viewCaseStudy,
    technologies: dict.projects.caseStudy.technologies,
    categories: dict.projects.categories,
    kinds: dict.projects.kinds,
    statuses: dict.projects.statuses,
  };
}
