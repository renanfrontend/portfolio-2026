import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/components/layout/container";
import { PageHeader } from "@/components/shared/page-header";
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
