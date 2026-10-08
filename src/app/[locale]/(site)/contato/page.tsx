import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/components/layout/container";
import { PageHeader } from "@/components/shared/page-header";
import { siteConfig } from "@/config/site";
import { ContactChannels } from "@/features/contact/components/contact-channels";
import { ContactForm } from "@/features/contact/components/contact-form";
import { getPackages } from "@/features/packages/packages";
import { getServices } from "@/features/services/server/queries";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { localePath } from "@/lib/links";
import { buildPageMetadata } from "@/lib/seo";

export async function generateMetadata({ params }: PageProps<"/[locale]/contato">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const dict = getDictionary(locale);
  return buildPageMetadata({ locale, path: "/contato", title: dict.meta.contact.title, description: dict.meta.contact.description });
}

export default async function ContactPage({ params }: PageProps<"/[locale]/contato">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDictionary(locale);
  const t = dict.contact;

  const formProps = {
    labels: t.form,
    services: getServices(locale).map((service) => ({ slug: service.slug, title: service.title })),
    packages: getPackages(locale).map((item) => ({ id: item.id, name: item.name })),
    privacyHref: localePath(locale, "/privacidade"),
    fallbackEmail: siteConfig.email,
  };

  return (
    <>
      <PageHeader eyebrow={t.eyebrow} title={t.title} description={t.description} />
      <Container className="grid gap-12 py-14 sm:py-20 lg:grid-cols-[1.6fr_1fr]">
        <ContactForm {...formProps} />
        <ContactChannels dict={dict} />
      </Container>
    </>
  );
}
