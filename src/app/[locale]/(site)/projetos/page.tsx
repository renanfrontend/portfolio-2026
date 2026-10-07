import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Container } from "@/components/layout/container";
import { PageHeader } from "@/components/shared/page-header";
import { collectCategories, collectTechnologies } from "@/features/projects/filters";
import { ProjectExplorer } from "@/features/projects/components/project-explorer";
import { ProjectGrid } from "@/features/projects/components/project-grid";
import { getProjectCardLabels } from "@/features/projects/labels";
import { getProjects } from "@/features/projects/server/queries";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { localePath } from "@/lib/links";
import { buildPageMetadata } from "@/lib/seo";

export async function generateMetadata({ params }: PageProps<"/[locale]/projetos">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const dict = getDictionary(locale);
  return buildPageMetadata({ locale, path: "/projetos", title: dict.meta.projects.title, description: dict.meta.projects.description });
}

export default async function ProjectsPage({ params }: PageProps<"/[locale]/projetos">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDictionary(locale);
  const t = dict.projects;
  const projects = await getProjects(locale);
  const basePath = localePath(locale, "/projetos");
  const cardLabels = getProjectCardLabels(dict);

  return (
    <>
      <PageHeader eyebrow={t.eyebrow} title={t.title} description={t.description} />
      <Container className="py-14 sm:py-20">
        {/* O shell estático mostra todos os projetos; os filtros da URL entram no cliente. */}
        <Suspense fallback={<ProjectGrid projects={projects} basePath={basePath} labels={cardLabels} />}>
          <ProjectExplorer
            projects={projects}
            technologies={collectTechnologies(projects)}
            categories={collectCategories(projects)}
            basePath={basePath}
            labels={cardLabels}
            explorerLabels={{
              searchLabel: t.searchLabel,
              searchPlaceholder: t.searchPlaceholder,
              categoryLabel: t.categoryLabel,
              technologyLabel: t.technologyLabel,
              allCategories: t.allCategories,
              allTechnologies: t.allTechnologies,
              clearFilters: t.clearFilters,
              liveOnly: t.liveOnly,
              resultsCount: t.resultsCount,
              emptyTitle: t.emptyTitle,
              emptyText: t.emptyText,
            }}
          />
        </Suspense>
      </Container>
    </>
  );
}
