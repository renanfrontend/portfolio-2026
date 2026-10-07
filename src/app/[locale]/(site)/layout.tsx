import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { IntroScreen } from "@/components/shared/intro-screen";
import { WhatsappButton } from "@/components/shared/whatsapp-button";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { notFound } from "next/navigation";

export default async function SiteLayout({ children, params }: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDictionary(locale);

  return (
    <>
      <a
        href="#conteudo"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-accent focus:px-4 focus:py-2 focus:text-accent-fg"
      >
        {dict.common.skipToContent}
      </a>
      <IntroScreen portraitSrc="/images/profile/renan-github.jpg" labels={dict.intro} />
      <SiteHeader locale={locale} dict={dict} />
      <main id="conteudo" tabIndex={-1} className="outline-none">
        {children}
      </main>
      <SiteFooter locale={locale} dict={dict} />
      <WhatsappButton label={dict.contact.whatsappCta} message={dict.contact.whatsappMessage} newTabHint={dict.common.opensInNewTab} />
    </>
  );
}
