import { cn } from "@/lib/cn";
import type { Project } from "../types";
import { ProjectCard, type ProjectCardLabels } from "./project-card";

export type ProjectGridProps = {
  projects: Project[];
  /** Prefixo dos links, ex.: "/pt-BR/projetos". */
  basePath: string;
  labels: ProjectCardLabels;
  className?: string;
};

export function ProjectGrid({ projects, basePath, labels, className }: ProjectGridProps) {
  return (
    <ul className={cn("grid gap-6 sm:grid-cols-2 lg:grid-cols-3", className)}>
      {projects.map((project, index) => (
        <li key={project.slug}>
          <ProjectCard
            project={project}
            href={`${basePath}/${project.slug}`}
            labels={labels}
            headingLevel="h2"
            priority={index < 3}
          />
        </li>
      ))}
    </ul>
  );
}
