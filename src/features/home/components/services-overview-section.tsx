import { Section } from "@/components/layout/section";
import { ArrowRightIcon } from "@/components/shared/icons";
import { SectionHeading } from "@/components/shared/section-heading";
import { ButtonLink } from "@/components/ui/button";
import { ServiceCard } from "@/features/services/components/service-card";
import type { Service } from "@/features/services/types";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { localePath } from "@/lib/links";

type Props = { locale: Locale; dict: Dictionary; services: Service[] };

export function ServicesOverviewSection({ locale, dict, services }: Props) {
  const t = dict.home.services;

  return (
    <Section aria-labelledby="services-title">
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <SectionHeading id="services-title" index={t.index} eyebrow={t.eyebrow} title={t.title} description={t.description} />
        <ButtonLink href={localePath(locale, "/servicos")} variant="secondary" className="shrink-0 self-start md:self-auto">
          {t.cta}
          <ArrowRightIcon width={16} height={16} />
        </ButtonLink>
      </div>
      <ul className="mt-14 grid gap-5 sm:grid-cols-2">
        {services.map((service, index) => (
          <li key={service.slug}>
            <ServiceCard
              service={service}
              index={index}
              href={localePath(locale, `/servicos/${service.slug}`)}
              detailsLabel={dict.services.details}
            />
          </li>
        ))}
      </ul>
    </Section>
  );
}
