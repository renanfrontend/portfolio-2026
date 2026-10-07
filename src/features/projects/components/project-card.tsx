import Image from "next/image";
import Link from "next/link";
import { ArrowRightIcon, ExternalIcon } from "@/components/shared/icons";
import { Badge } from "@/components/ui/badge";
import type { Project } from "../types";

export type ProjectCardLabels = {
  viewCaseStudy: string;
  viewLive: string;
  opensInNewTab: string;
  technologies: string;
  categories: Record<Project["category"], string>;
  kinds: Record<Project["kind"], string>;
  statuses: Record<NonNullable<Project["status"]>, string>;
};

type ProjectCardProps = {
  project: Pick<Project, "slug" | "title" | "summary" | "cover" | "technologies" | "category" | "kind" | "status" | "liveUrl">;
  href: string;
  labels: ProjectCardLabels;
  headingLevel?: "h2" | "h3";
  priority?: boolean;
};

export function ProjectCard({ project, href, labels, headingLevel: Heading = "h3", priority }: ProjectCardProps) {
  const live = project.status === "live" && project.liveUrl;

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl card-neon transition-colors">
      <div className="relative aspect-[16/10] overflow-hidden border-b border-border bg-surface-strong">
        {project.cover ? (
          <Image
            src={project.cover.src}
            alt={project.cover.alt}
            width={project.cover.width}
            height={project.cover.height}
            priority={priority}
            sizes="(min-width: 1024px) 380px, (min-width: 640px) 50vw, 100vw"
            className="size-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
          />
        ) : (
          <div className="bg-grid flex size-full items-end p-6" aria-hidden>
            <span className="font-display text-3xl font-bold text-fg/80">{project.title}</span>
          </div>
        )}
        {live && (
          // Selo "no ar" sobre a imagem, para os projetos publicados se destacarem na lista.
          <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-bg/85 px-2.5 py-1 text-xs font-semibold text-success backdrop-blur">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-success opacity-60 motion-reduce:animate-none" />
              <span className="relative inline-flex size-2 rounded-full bg-success" />
            </span>
            {labels.statuses.live}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-6">
        <div className="flex flex-wrap gap-2">
          <Badge tone="accent">{labels.categories[project.category]}</Badge>
          <Badge>{labels.kinds[project.kind]}</Badge>
          {project.status && project.status !== "live" && <Badge>{labels.statuses[project.status]}</Badge>}
        </div>

        <Heading className="mt-4 text-xl font-bold text-fg">
          <Link href={href} className="after:absolute after:inset-0 focus-visible:outline-none">
            {project.title}
          </Link>
        </Heading>
        <p className="mt-2 flex-1 text-[0.95rem] text-fg-muted">{project.summary}</p>

        <ul className="mt-5 flex flex-wrap gap-x-3 gap-y-1 font-mono text-xs text-fg-subtle" aria-label={labels.technologies}>
          {project.technologies.slice(0, 4).map((tech) => (
            <li key={tech}>{tech}</li>
          ))}
        </ul>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <span
            className="inline-flex items-center gap-2 text-sm font-semibold text-accent-strong transition-transform group-hover:translate-x-1 motion-reduce:transition-none"
            aria-hidden
          >
            {labels.viewCaseStudy}
            <ArrowRightIcon width={16} height={16} />
          </span>
          {live && (
            // Fica acima do link que cobre o cartão, para abrir o site direto.
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="relative z-10 inline-flex items-center gap-1.5 rounded-full bg-accent px-3.5 py-1.5 text-sm font-semibold text-accent-fg transition-colors hover:bg-accent-strong"
            >
              {labels.viewLive}
              <ExternalIcon width={14} height={14} />
              <span className="sr-only">
                : {project.title} {labels.opensInNewTab}
              </span>
            </a>
          )}
        </div>
      </div>
      {/* Foco visível no cartão inteiro, já que o link cobre a área. */}
      <span className="pointer-events-none absolute inset-0 rounded-2xl ring-2 ring-transparent group-has-[a:focus-visible]:ring-[var(--ring)]" aria-hidden />
    </article>
  );
}
