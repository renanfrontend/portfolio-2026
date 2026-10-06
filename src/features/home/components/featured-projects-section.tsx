import { Section } from "@/components/layout/section";
import { ArrowRightIcon } from "@/components/shared/icons";
import { SectionHeading } from "@/components/shared/section-heading";
import { ButtonLink } from "@/components/ui/button";
import { ProjectCard } from "@/features/projects/components/project-card";
import { getProjectCardLabels } from "@/features/projects/labels";
import type { Project } from "@/features/projects/types";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { localePath } from "@/lib/links";

type Props = { locale: Locale; dict: Dictionary; projects: Project[] };

export function FeaturedProjectsSection({ locale, dict, projects }: Props) {
  const t = dict.home.featured;
  const labels = getProjectCardLabels(dict);

  return (
    <Section aria-labelledby="featured-title" className="border-t border-border bg-bg-elevated/50">
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <SectionHeading id="featured-title" index={t.index} eyebrow={t.eyebrow} title={t.title} description={t.description} />
        <ButtonLink href={localePath(locale, "/projetos")} variant="secondary" className="shrink-0 self-start md:self-auto">
          {t.cta}
          <ArrowRightIcon width={16} height={16} />
        </ButtonLink>
      </div>
      <ul className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <li key={project.slug}>
            <ProjectCard project={project} href={localePath(locale, `/projetos/${project.slug}`)} labels={labels} />
          </li>
        ))}
      </ul>
    </Section>
  );
}
