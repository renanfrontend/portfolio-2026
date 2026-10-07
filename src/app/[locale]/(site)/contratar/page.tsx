import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/components/layout/container";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { ArrowRightIcon } from "@/components/shared/icons";
import { JsonLd } from "@/components/shared/json-ld";
import { PageHeader } from "@/components/shared/page-header";
import { ButtonLink } from "@/components/ui/button";
import { PackageCard } from "@/features/packages/components/package-card";
import { getPackages } from "@/features/packages/packages";
import { ServiceFaq } from "@/features/services/components/service-faq";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { localePath } from "@/lib/links";
import { absoluteUrl, buildPageMetadata } from "@/lib/seo";
import { breadcrumbSchema, jsonLd } from "@/lib/structured-data";

export async function generateMetadata({ params }: PageProps<"/[locale]/contratar">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const dict = getDictionary(locale);
  return buildPageMetadata({ locale, path: "/contratar", title: dict.meta.hire.title, description: dict.meta.hire.description });
}

export default async function HirePage({ params }: PageProps<"/[locale]/contratar">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDictionary(locale);
  const t = dict.hire;
  const packages = getPackages(locale);

  // Ofertas para o Google: preço só aparece quando definido.
  const offers = {
    "@type": "OfferCatalog",
    name: t.title,
    url: absoluteUrl(`/${locale}/contratar`),
    itemListElement: packages.map((item) => ({
      "@type": "Offer",
      name: item.name,
      description: item.description,
      url: absoluteUrl(`/${locale}/contratar#pacote-${item.id}`),
      availability: item.status === "unavailable" ? "https://schema.org/OutOfStock" : "https://schema.org/InStock",
      seller: { "@id": absoluteUrl("/#renan") },
      ...(item.price !== null
        ? { priceSpecification: { "@type": "PriceSpecification", price: item.price, priceCurrency: "BRL", ...(item.priceFrom ? { minPrice: item.price } : {}) } }
        : {}),
    })),
  };
  const faq = {
    "@type": "FAQPage",
    mainEntity: t.faq.map((item) => ({ "@type": "Question", name: item.question, acceptedAnswer: { "@type": "Answer", text: item.answer } })),
  };

  return (
    <>
      <JsonLd
        data={jsonLd(
          offers,
          faq,
          breadcrumbSchema([
            { name: dict.common.home, path: `/${locale}` },
            { name: dict.nav.hire, path: `/${locale}/contratar` },
          ]),
        )}
      />
      <PageHeader
        eyebrow={t.eyebrow}
        title={t.title}
        description={t.description}
        breadcrumbs={
          <Breadcrumbs
            label={dict.common.breadcrumb}
            items={[{ label: dict.common.home, href: localePath(locale) }, { label: dict.nav.hire }]}
          />
        }
      />

      <Container className="py-16 sm:py-20">
        <div className="grid gap-6 pt-3 md:grid-cols-2 xl:grid-cols-4">
          {packages.map((item) => (
            <PackageCard key={item.id} item={item} locale={locale} labels={t} />
          ))}
        </div>
        <p className="mt-8 text-center text-sm text-fg-subtle">{t.note}</p>
      </Container>

      <Container className="pb-20">
        <section aria-labelledby="faq-title" className="mx-auto max-w-3xl">
          <h2 id="faq-title" className="text-3xl font-bold text-fg">
            {t.faqTitle}
          </h2>
          <div className="mt-8">
            <ServiceFaq items={t.faq} />
          </div>
          <div className="mt-10 flex flex-col items-start justify-between gap-4 rounded-2xl card-neon p-6 sm:flex-row sm:items-center">
            <p className="font-display text-lg font-bold text-fg">{dict.home.cta.clientsText}</p>
            <ButtonLink href={localePath(locale, "/contato")} variant="secondary" className="shrink-0">
              {dict.nav.cta}
              <ArrowRightIcon width={16} height={16} />
            </ButtonLink>
          </div>
        </section>
      </Container>
    </>
  );
}
