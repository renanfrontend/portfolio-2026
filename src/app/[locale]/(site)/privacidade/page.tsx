import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/components/layout/container";
import { PageHeader } from "@/components/shared/page-header";
import { privacyPolicy } from "@/content/privacy";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { buildPageMetadata } from "@/lib/seo";

export async function generateMetadata({ params }: PageProps<"/[locale]/privacidade">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const dict = getDictionary(locale);
  return buildPageMetadata({ locale, path: "/privacidade", title: dict.meta.privacy.title, description: dict.meta.privacy.description });
}

export default async function PrivacyPage({ params }: PageProps<"/[locale]/privacidade">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDictionary(locale);

  return (
    <>
      <PageHeader eyebrow={dict.privacy.eyebrow} title={dict.privacy.title} description={dict.privacy.updated} />
      <Container className="py-14 sm:py-20">
        <div className="grid max-w-3xl gap-12">
          {privacyPolicy[locale].map((section) => (
            <section key={section.title}>
              <h2 className="text-2xl font-bold text-fg">{section.title}</h2>
              <div className="mt-4 grid gap-4 text-lg text-fg-muted">
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </section>
          ))}
        </div>
      </Container>
    </>
  );
}
