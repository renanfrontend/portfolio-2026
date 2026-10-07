import { JsonLd } from "@/components/shared/json-ld";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Section } from "@/components/layout/section";
import { DownloadIcon } from "@/components/shared/icons";
import { PageHeader } from "@/components/shared/page-header";
import { buttonClasses } from "@/components/ui/button";
import { getProfile } from "@/features/about/profile";
import { CareerTimeline } from "@/features/about/components/career-timeline";
import { resumeExists } from "@/features/about/resume";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { buildPageMetadata } from "@/lib/seo";
import { breadcrumbSchema, jsonLd, profilePageSchema } from "@/lib/structured-data";

export async function generateMetadata({ params }: PageProps<"/[locale]/sobre">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const dict = getDictionary(locale);
  return buildPageMetadata({ locale, path: "/sobre", title: dict.meta.about.title, description: dict.meta.about.description, type: "profile" });
}

export default async function AboutPage({ params }: PageProps<"/[locale]/sobre">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDictionary(locale);
  const profile = getProfile(locale);
  const t = dict.about;
  const resumePath = profile.resumePath && resumeExists(profile.resumePath) ? profile.resumePath : null;

  return (
    <>
      <JsonLd
        data={jsonLd(
          profilePageSchema(locale, dict.home.hero.role),
          breadcrumbSchema([
            { name: dict.common.home, path: `/${locale}` },
            { name: dict.nav.about, path: `/${locale}/sobre` },
          ]),
        )}
      />
      <PageHeader eyebrow={t.eyebrow} title={profile.headline}>
        <div className="mt-8 grid max-w-3xl gap-4 text-lg text-fg-muted">
          {profile.bio.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
        {resumePath && (
          <a href={resumePath} download className={buttonClasses("primary", "lg", "mt-8")}>
            <DownloadIcon width={18} height={18} />
            {t.resumeCta}
          </a>
        )}
      </PageHeader>

      <Section aria-labelledby="experience-title">
        <div className="grid gap-12 lg:grid-cols-[1fr_2fr]">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <h2 id="experience-title" className="text-3xl font-bold text-fg sm:text-4xl">
              {t.experienceTitle}
            </h2>
          </div>
          <CareerTimeline items={profile.experience} locale={locale} currentLabel={t.current} />
        </div>
      </Section>

      <Section aria-labelledby="skills-title" className="border-t border-border bg-bg-elevated/50">
        <h2 id="skills-title" className="text-3xl font-bold text-fg sm:text-4xl">
          {t.skillsTitle}
        </h2>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {profile.skills.map((group) => (
            <div key={group.title} className="rounded-2xl card-neon p-6">
              <h3 className="text-lg font-bold text-fg">{group.title}</h3>
              <ul className="mt-4 flex flex-wrap gap-2">
                {group.items.map((item) => (
                  <li key={item} className="rounded-full border border-border bg-surface-strong px-3 py-1 text-sm text-fg-muted">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Section>

      <Section aria-labelledby="education-title">
        <h2 id="education-title" className="text-3xl font-bold text-fg sm:text-4xl">
          {t.educationTitle}
        </h2>
        {(
          [
            ["degree", t.educationDegrees],
            ["course", t.educationCourses],
          ] as const
        ).map(([kind, heading]) => (
          <div key={kind} className="mt-10">
            <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-fg-subtle">{heading}</h3>
            <ul className="mt-4 grid gap-4 sm:grid-cols-2">
              {profile.education
                .filter((item) => item.kind === kind)
                .map((item) => (
                  <li key={item.title} className="rounded-2xl card-neon p-6">
                    <p className="font-mono text-xs uppercase tracking-[0.15em] text-accent-strong">{item.period}</p>
                    <h4 className="mt-3 text-lg font-bold text-fg">{item.title}</h4>
                    {item.institution && <p className="mt-1 text-fg-muted">{item.institution}</p>}
                  </li>
                ))}
            </ul>
          </div>
        ))}
      </Section>
    </>
  );
}
