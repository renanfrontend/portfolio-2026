import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Container } from "@/components/layout/container";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { ArrowLeftIcon, ArrowRightIcon, CheckIcon } from "@/components/shared/icons";
import { PageHeader } from "@/components/shared/page-header";
import { ButtonLink } from "@/components/ui/button";
import { ServiceFaq } from "@/features/services/components/service-faq";
import { getServiceBySlug, getServices, getServiceSlugs } from "@/features/services/server/queries";
import { isLocale, locales } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { localePath } from "@/lib/links";
import { absoluteUrl, buildPageMetadata } from "@/lib/seo";
import { siteConfig } from "@/config/site";

export function generateStaticParams() {
  return locales.flatMap((locale) => getServiceSlugs().map((slug) => ({ locale, slug })));
}

export async function generateMetadata({ params }: PageProps<"/[locale]/servicos/[slug]">): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return {};
  const service = getServiceBySlug(locale, slug);
  if (!service) return {};
  return buildPageMetadata({ locale, path: `/servicos/${slug}`, title: service.title, description: service.summary });
}

/** Os params ficam dentro do Suspense para o Next gerar o shell estático das rotas dinâmicas. */
export default function ServicePage({ params }: PageProps<"/[locale]/servicos/[slug]">) {
  return (
    <Suspense fallback={<CaseFallback />}>
      <ServiceContent params={params} />
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

async function ServiceContent({ params }: Pick<PageProps<"/[locale]/servicos/[slug]">, "params">) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();
  const service = getServiceBySlug(locale, slug);
  if (!service) notFound();

  const dict = getDictionary(locale);
  const t = dict.services;
  const contactHref = `${localePath(locale, "/contato")}?servico=${service.slug}`;
  const others = getServices(locale).filter((item) => item.slug !== service.slug);

  const serviceJsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.title,
    description: service.summary,
    url: absoluteUrl(`/${locale}/servicos/${service.slug}`),
    provider: { "@type": "Person", name: siteConfig.fullName, url: absoluteUrl(`/${locale}`) },
    areaServed: "BR",
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJsonLd) }} />
      <PageHeader
        eyebrow={t.eyebrow}
        title={service.title}
        description={service.summary}
        breadcrumbs={
          <Breadcrumbs
            label={dict.common.breadcrumb}
            items={[
              { label: dict.common.home, href: localePath(locale) },
              { label: dict.nav.services, href: localePath(locale, "/servicos") },
              { label: service.title },
            ]}
          />
        }
      >
        <ButtonLink href={contactHref} size="lg" className="mt-8">
          {service.ctaLabel}
          <ArrowRightIcon width={18} height={18} />
        </ButtonLink>
      </PageHeader>

      <Container className="grid gap-16 py-14 sm:py-20">
        <div className="grid gap-6 md:grid-cols-2">
          <section aria-labelledby="problems-title" className="rounded-2xl card-neon p-7">
            <h2 id="problems-title" className="text-2xl font-bold text-fg">
              {t.problemsTitle}
            </h2>
            <ul className="mt-5 grid gap-3 text-fg-muted">
              {service.problems.map((problem) => (
                <li key={problem} className="flex gap-3">
                  <span className="mt-2.5 size-1.5 shrink-0 rounded-full bg-fg-subtle" aria-hidden />
                  {problem}
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="deliverables-title" className="rounded-2xl card-neon card-neon-strong p-7">
            <h2 id="deliverables-title" className="text-2xl font-bold text-fg">
              {t.deliverablesTitle}
            </h2>
            <ul className="mt-5 grid gap-3 text-fg">
              {service.deliverables.map((deliverable) => (
                <li key={deliverable} className="flex gap-3">
                  <CheckIcon width={18} height={18} className="mt-1 shrink-0 text-accent-strong" />
                  {deliverable}
                </li>
              ))}
            </ul>
          </section>
        </div>

        <section aria-labelledby="process-title">
          <h2 id="process-title" className="text-3xl font-bold text-fg">
            {t.processTitle}
          </h2>
          <ol className="mt-8 grid gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
            {service.process.map((step, index) => (
              <li key={step.title} className="bg-surface p-6">
                <span className="font-display text-3xl font-bold text-accent" aria-hidden>
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-3 text-lg font-bold text-fg">{step.title}</h3>
                <p className="mt-2 text-sm text-fg-muted">{step.description}</p>
              </li>
            ))}
          </ol>
        </section>

        {service.faq.length > 0 && (
          <section aria-labelledby="faq-title" className="max-w-3xl">
            <h2 id="faq-title" className="text-3xl font-bold text-fg">
              {t.faqTitle}
            </h2>
            <div className="mt-8">
              <ServiceFaq items={service.faq} />
            </div>
          </section>
        )}

        <div className="flex flex-col items-start justify-between gap-6 rounded-2xl border border-border bg-bg-elevated p-8 md:flex-row md:items-center">
          <p className="font-display text-2xl font-bold text-fg">{service.title}</p>
          <ButtonLink href={contactHref} size="lg">
            {service.ctaLabel}
          </ButtonLink>
        </div>

        <nav aria-labelledby="other-services-title">
          <h2 id="other-services-title" className="font-mono text-xs uppercase tracking-[0.2em] text-fg-subtle">
            {t.otherServices}
          </h2>
          <ul className="mt-4 flex flex-wrap gap-3">
            {others.map((item) => (
              <li key={item.slug}>
                <Link
                  href={localePath(locale, `/servicos/${item.slug}`)}
                  className="inline-block rounded-full border border-border bg-surface px-4 py-2 text-sm text-fg-muted transition-colors hover:border-accent hover:text-fg"
                >
                  {item.title}
                </Link>
              </li>
            ))}
          </ul>
          <Link
            href={localePath(locale, "/servicos")}
            className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-accent-strong hover:underline"
          >
            <ArrowLeftIcon width={16} height={16} />
            {t.back}
          </Link>
        </nav>
      </Container>
    </>
  );
}
