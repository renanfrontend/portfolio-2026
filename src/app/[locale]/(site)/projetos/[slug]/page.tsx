import { JsonLd } from "@/components/shared/json-ld";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Container } from "@/components/layout/container";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { ArrowLeftIcon, ArrowRightIcon, ExternalIcon, GithubIcon } from "@/components/shared/icons";
import { Badge } from "@/components/ui/badge";
import { ButtonLink, buttonClasses } from "@/components/ui/button";
import { getProjectBySlug, getProjectSlugs } from "@/features/projects/server/queries";
import { isLocale, locales } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { localePath } from "@/lib/links";
import { buildPageMetadata } from "@/lib/seo";
import { breadcrumbSchema, jsonLd, projectSchema } from "@/lib/structured-data";

export async function generateStaticParams() {
  const slugs = await getProjectSlugs();
  return locales.flatMap((locale) => slugs.map((slug) => ({ locale, slug })));
}

export async function generateMetadata({ params }: PageProps<"/[locale]/projetos/[slug]">): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return {};
  const project = await getProjectBySlug(locale, slug);
  if (!project) return {};
  const dict = getDictionary(locale);
  return buildPageMetadata({
    locale,
    path: `/projetos/${slug}`,
    title: `${project.title}: ${dict.meta.caseStudySuffix}`,
    description: project.summary,
    type: "article",
    image: project.cover ? { url: project.cover.src, width: project.cover.width, height: project.cover.height, alt: project.cover.alt } : undefined,
  });
}

/** Os params ficam dentro do Suspense para o Next gerar o shell estático das rotas dinâmicas. */
export default function ProjectPage({ params }: PageProps<"/[locale]/projetos/[slug]">) {
  return (
    <Suspense fallback={<CaseFallback />}>
      <ProjectContent params={params} />
    </Suspense>
  );
}

function CaseFallback() {
  return (
    <Container className="py-24" aria-hidden>
      <div className="h-10 w-2/3 max-w-xl animate-pulse rounded-xl bg-surface-strong motion-reduce:animate-none" />
      <div className="mt-6 h-5 w-full max-w-2xl animate-pulse rounded-lg bg-surface-strong motion-reduce:animate-none" />
    </Container>
  );
}

async function ProjectContent({ params }: Pick<PageProps<"/[locale]/projetos/[slug]">, "params">) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();
  const project = await getProjectBySlug(locale, slug);
  if (!project) notFound();

  const dict = getDictionary(locale);
  const t = dict.projects.caseStudy;
  const hasLinks = Boolean(project.repositoryUrl || project.liveUrl);

  // Projetos importados do GitHub não têm estudo de caso escrito: só as seções com texto aparecem.
  const sections = [
    { id: "desafio", title: t.challenge, body: project.challenge },
    { id: "solucao", title: t.solution, body: project.solution },
    { id: "contribuicao", title: t.contribution, body: project.contribution },
  ].filter((section): section is { id: string; title: string; body: string } => Boolean(section.body));

  return (
    <article>
      <JsonLd
        data={jsonLd(
          projectSchema({
            locale,
            slug: project.slug,
            title: project.title,
            summary: project.summary,
            image: project.cover?.src,
            technologies: project.technologies,
            repositoryUrl: project.repositoryUrl,
            liveUrl: project.liveUrl,
          }),
          breadcrumbSchema([
            { name: dict.common.home, path: `/${locale}` },
            { name: dict.nav.projects, path: `/${locale}/projetos` },
            { name: project.title, path: `/${locale}/projetos/${project.slug}` },
          ]),
        )}
      />
      <header className="relative isolate overflow-hidden border-b border-border">
        <div className="bg-grid absolute inset-0 -z-10" aria-hidden />
        <Container className="pb-12 pt-12 sm:pt-16">
          <Breadcrumbs
            label={dict.common.breadcrumb}
            items={[
              { label: dict.common.home, href: localePath(locale) },
              { label: dict.nav.projects, href: localePath(locale, "/projetos") },
              { label: project.title },
            ]}
          />
          <div className="mt-8 flex flex-wrap gap-2">
            <Badge tone="accent">{dict.projects.categories[project.category]}</Badge>
            <Badge>{dict.projects.kinds[project.kind]}</Badge>
            {project.status && <Badge tone={project.status === "live" ? "success" : "default"}>{dict.projects.statuses[project.status]}</Badge>}
          </div>
          <h1 className="mt-5 max-w-4xl text-4xl font-bold text-fg sm:text-5xl lg:text-6xl">{project.title}</h1>
          <p className="mt-5 max-w-3xl text-lg text-fg-muted">{project.summary}</p>
          {project.fromGithub && <p className="mt-3 font-mono text-xs text-fg-subtle">{t.fromGithub}</p>}

          {hasLinks && (
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              {project.liveUrl && (
                <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className={buttonClasses("primary", "lg")}>
                  {t.live}
                  <ExternalIcon width={18} height={18} />
                  <span className="sr-only">{dict.common.opensInNewTab}</span>
                </a>
              )}
              {project.repositoryUrl && (
                <a href={project.repositoryUrl} target="_blank" rel="noopener noreferrer" className={buttonClasses("secondary", "lg")}>
                  <GithubIcon width={18} height={18} />
                  {t.repository}
                  <span className="sr-only">{dict.common.opensInNewTab}</span>
                </a>
              )}
            </div>
          )}
        </Container>
      </header>

      {project.cover && (
        <Container className="pt-12">
          <Image
            src={project.cover.src}
            alt={project.cover.alt}
            width={project.cover.width}
            height={project.cover.height}
            priority
            sizes="(min-width: 1152px) 1088px, 100vw"
            className="w-full rounded-2xl border border-border"
          />
        </Container>
      )}

      <Container className="grid gap-12 py-14 sm:py-20 lg:grid-cols-[2fr_1fr]">
        <div className="grid gap-12">
          {sections.map((section) => (
            <section key={section.id} aria-labelledby={`${section.id}-title`}>
              <h2 id={`${section.id}-title`} className="text-2xl font-bold text-fg sm:text-3xl">
                {section.title}
              </h2>
              <p className="mt-4 text-lg text-fg-muted">{section.body}</p>
            </section>
          ))}

          {project.outcomes.length > 0 && (
            <section aria-labelledby="resultados-title">
              <h2 id="resultados-title" className="text-2xl font-bold text-fg sm:text-3xl">
                {t.outcomes}
              </h2>
              <ul className="mt-4 grid gap-3 text-lg text-fg-muted">
                {project.outcomes.map((outcome) => (
                  <li key={outcome} className="flex gap-3">
                    <span className="mt-3 size-1.5 shrink-0 rounded-full bg-accent" aria-hidden />
                    {outcome}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {project.gallery.length > 0 && (
            <section aria-labelledby="galeria-title">
              <h2 id="galeria-title" className="text-2xl font-bold text-fg sm:text-3xl">
                {t.gallery}
              </h2>
              <div className="mt-6 grid gap-6">
                {project.gallery.map((image) => (
                  <Image key={image.src} src={image.src} alt={image.alt} width={image.width} height={image.height} sizes="(min-width: 1024px) 700px, 100vw" className="w-full rounded-2xl border border-border" />
                ))}
              </div>
            </section>
          )}
        </div>

        <aside className="grid content-start gap-6">
          <div className="rounded-2xl card-neon p-6">
            <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-fg-subtle">{t.technologies}</h2>
            <ul className="mt-4 flex flex-wrap gap-2">
              {project.technologies.map((tech) => (
                <li key={tech}>
                  <Link
                    href={`${localePath(locale, "/projetos")}?tecnologia=${encodeURIComponent(tech)}`}
                    className="inline-block rounded-full border border-border bg-surface-strong px-3 py-1 text-sm text-fg-muted transition-colors hover:border-accent hover:text-fg"
                  >
                    {tech}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {!hasLinks && (
            <div className="rounded-2xl card-neon p-6">
              <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-fg-subtle">{t.links}</h2>
              <p className="mt-3 text-sm text-fg-muted">{t.noLinks}</p>
            </div>
          )}

          <div className="rounded-2xl card-neon card-neon-strong p-6">
            <h2 className="text-lg font-bold text-fg">{t.ctaTitle}</h2>
            <ButtonLink href={localePath(locale, "/contato")} className="mt-4">
              {t.ctaButton}
              <ArrowRightIcon width={16} height={16} />
            </ButtonLink>
          </div>
        </aside>
      </Container>

      <Container className="pb-16">
        <Link href={localePath(locale, "/projetos")} className="inline-flex items-center gap-2 text-sm font-semibold text-accent-strong hover:underline">
          <ArrowLeftIcon width={16} height={16} />
          {t.back}
        </Link>
      </Container>
    </article>
  );
}
