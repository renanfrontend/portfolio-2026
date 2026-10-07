import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/shared/json-ld";
import { getProfile } from "@/features/about/profile";
import { AiSection } from "@/features/home/components/ai-section";
import { CompaniesStrip } from "@/features/home/components/companies-strip";
import { ContactCtaSection } from "@/features/home/components/contact-cta-section";
import { ExpertiseSection } from "@/features/home/components/expertise-section";
import { FactsStrip } from "@/features/home/components/facts-strip";
import { FeaturedProjectsSection } from "@/features/home/components/featured-projects-section";
import { HeroSection } from "@/features/home/components/hero-section";
import { ServicesOverviewSection } from "@/features/home/components/services-overview-section";
import { WorkProcessSection } from "@/features/home/components/work-process-section";
import { getFeaturedProjects } from "@/features/projects/server/queries";
import { getServices } from "@/features/services/server/queries";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { buildPageMetadata } from "@/lib/seo";
import { jsonLd, personSchema, websiteSchema } from "@/lib/structured-data";

export async function generateMetadata({ params }: PageProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const dict = getDictionary(locale);
  return buildPageMetadata({
    locale,
    path: "",
    title: dict.meta.siteTitle,
    description: dict.meta.home.description,
    absoluteTitle: true,
  });
}

export default async function HomePage({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDictionary(locale);
  const profile = getProfile(locale);


  return (
    <>
      <JsonLd data={jsonLd(websiteSchema(locale, dict.meta.siteDescription), personSchema(locale, dict.home.hero.role))} />
      <HeroSection locale={locale} dict={dict} />
      <FactsStrip dict={dict} />
      <CompaniesStrip locale={locale} label={dict.home.companies} experience={profile.experience} />
      <ExpertiseSection dict={dict} areas={profile.expertise} />
      <FeaturedProjectsSection locale={locale} dict={dict} projects={await getFeaturedProjects(locale)} />
      <AiSection locale={locale} dict={dict} />
      <ServicesOverviewSection locale={locale} dict={dict} services={getServices(locale)} />
      <WorkProcessSection dict={dict} steps={profile.workProcess} />
      <ContactCtaSection locale={locale} dict={dict} />
    </>
  );
}
