import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { siteConfig } from "@/config/site";
import { getProfile } from "@/features/about/profile";
import { AiSection } from "@/features/home/components/ai-section";
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
import { absoluteUrl, buildPageMetadata } from "@/lib/seo";

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

  const personJsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: siteConfig.fullName,
    jobTitle: dict.home.hero.role,
    url: absoluteUrl(`/${locale}`),
    email: `mailto:${siteConfig.email}`,
    address: { "@type": "PostalAddress", addressLocality: "São Paulo", addressCountry: "BR" },
    sameAs: [siteConfig.github, siteConfig.linkedin],
    knowsAbout: ["React", "Next.js", "TypeScript", "Frontend development", "Dashboards", "AI automation"],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }} />
      <HeroSection locale={locale} dict={dict} />
      <FactsStrip dict={dict} />
      <ExpertiseSection dict={dict} areas={profile.expertise} />
      <FeaturedProjectsSection locale={locale} dict={dict} projects={await getFeaturedProjects(locale)} />
      <AiSection locale={locale} dict={dict} />
      <ServicesOverviewSection locale={locale} dict={dict} services={getServices(locale)} />
      <WorkProcessSection dict={dict} steps={profile.workProcess} />
      <ContactCtaSection locale={locale} dict={dict} />
    </>
  );
}
