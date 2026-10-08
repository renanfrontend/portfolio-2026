import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/components/layout/container";
import { ArrowRightIcon } from "@/components/shared/icons";
import { PageHeader } from "@/components/shared/page-header";
import { ButtonLink } from "@/components/ui/button";
import { ServiceCard } from "@/features/services/components/service-card";
import { getServices } from "@/features/services/server/queries";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { localePath } from "@/lib/links";
import { buildPageMetadata } from "@/lib/seo";

export async function generateMetadata({ params }: PageProps<"/[locale]/servicos">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const dict = getDictionary(locale);
  return buildPageMetadata({ locale, path: "/servicos", title: dict.meta.services.title, description: dict.meta.services.description });
}

export default async function ServicesPage({ params }: PageProps<"/[locale]/servicos">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDictionary(locale);
  const t = dict.services;

  return (
    <>
      <PageHeader eyebrow={t.eyebrow} title={t.title} description={t.description} />
      <Container className="py-14 sm:py-20">
        <div className="mb-10 flex flex-col items-start justify-between gap-4 rounded-2xl card-neon card-neon-strong p-6 sm:flex-row sm:items-center">
          <p className="font-display text-lg font-bold text-fg">{t.packagesBanner.title}</p>
          <ButtonLink href={localePath(locale, "/contratar")} className="shrink-0">
            {t.packagesBanner.cta}
            <ArrowRightIcon width={16} height={16} />
          </ButtonLink>
        </div>
        <ul className="grid gap-5 md:grid-cols-2">
          {getServices(locale).map((service, index) => (
            <li key={service.slug}>
              <ServiceCard
                service={service}
                index={index}
                href={localePath(locale, `/servicos/${service.slug}`)}
                detailsLabel={t.details}
                headingLevel="h2"
              />
            </li>
          ))}
        </ul>
      </Container>
    </>
  );
}
