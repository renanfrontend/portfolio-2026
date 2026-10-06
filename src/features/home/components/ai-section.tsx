import Link from "next/link";
import { Section } from "@/components/layout/section";
import { ArrowRightIcon, CheckIcon } from "@/components/shared/icons";
import { SectionHeading } from "@/components/shared/section-heading";
import { ButtonLink } from "@/components/ui/button";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { localePath } from "@/lib/links";
import { NeuralHub } from "./neural-hub";

/** Pós-graduação em IA e Ciência de Dados e como esse estudo aparece no trabalho. */
export function AiSection({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const t = dict.home.ai;

  return (
    <Section aria-labelledby="ai-title" className="relative overflow-hidden">
      <div className="glow pointer-events-none absolute inset-0 -z-10" aria-hidden />
      <div className="grid items-center gap-14 lg:grid-cols-[1fr_1.1fr]">
        <div>
          <SectionHeading id="ai-title" index={t.index} eyebrow={t.eyebrow} title={t.title} description={t.description} />
          <ul className="mt-8 grid gap-4">
            {t.points.map((point) => (
              <li key={point.text} className="flex gap-3 text-fg-muted">
                <CheckIcon width={20} height={20} className="mt-0.5 shrink-0 text-accent-strong" />
                <span>
                  {point.text}
                  {point.project && (
                    <>
                      {" "}
                      <Link
                        href={localePath(locale, `/projetos/${point.project.slug}`)}
                        className="font-medium text-accent-strong underline-offset-4 hover:underline"
                      >
                        {point.project.label}
                      </Link>
                    </>
                  )}
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href={`${localePath(locale, "/projetos")}?categoria=ai`} size="lg">
              {t.projectsCta}
              <ArrowRightIcon width={18} height={18} />
            </ButtonLink>
            <ButtonLink href={localePath(locale, "/servicos/automacao-ia")} size="lg" variant="secondary">
              {t.serviceCta}
            </ButtonLink>
          </div>
        </div>

        <NeuralHub label={t.artLabel} countLabel={t.artCount} hint={dict.home.hero.portraitHint} locale={locale} layers={t.layers} />
      </div>
    </Section>
  );
}
