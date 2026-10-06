import { Section } from "@/components/layout/section";
import { ArrowRightIcon } from "@/components/shared/icons";
import { SectionHeading } from "@/components/shared/section-heading";
import { ButtonLink } from "@/components/ui/button";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { localePath } from "@/lib/links";

export function ContactCtaSection({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const t = dict.home.cta;
  const cards = [
    { title: t.recruitersTitle, text: t.recruitersText, cta: t.recruitersCta, href: localePath(locale, "/sobre"), variant: "secondary" as const },
    { title: t.clientsTitle, text: t.clientsText, cta: t.clientsCta, href: localePath(locale, "/contato"), variant: "primary" as const },
  ];

  return (
    <Section aria-labelledby="cta-title">
      <SectionHeading id="cta-title" index={t.index} eyebrow={t.eyebrow} title={t.title} />
      <div className="mt-12 grid gap-5 md:grid-cols-2">
        {cards.map((card) => (
          <div key={card.title} className="flex flex-col rounded-2xl card-neon p-8">
            <h3 className="text-2xl font-bold text-fg">{card.title}</h3>
            <p className="mt-3 flex-1 text-fg-muted">{card.text}</p>
            <ButtonLink href={card.href} variant={card.variant} size="lg" className="mt-8 self-start">
              {card.cta}
              <ArrowRightIcon width={18} height={18} />
            </ButtonLink>
          </div>
        ))}
      </div>
    </Section>
  );
}
