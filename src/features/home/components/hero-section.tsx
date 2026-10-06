import { Container } from "@/components/layout/container";
import { ArrowRightIcon } from "@/components/shared/icons";
import { SocialLinks } from "@/components/shared/social-links";
import { ButtonLink } from "@/components/ui/button";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { localePath } from "@/lib/links";
import { MatrixPortrait } from "./matrix-portrait";

type HeroSectionProps = { locale: Locale; dict: Dictionary };

export function HeroSection({ locale, dict }: HeroSectionProps) {
  const hero = dict.home.hero;

  return (
    <section aria-labelledby="hero-title" className="relative isolate overflow-hidden">
      <div className="bg-grid absolute inset-0 -z-10" aria-hidden />
      <div className="glow absolute inset-0 -z-10" aria-hidden />

      <Container className="grid items-center gap-14 pb-16 pt-14 sm:pt-20 lg:grid-cols-[1.15fr_1fr] lg:pb-24 lg:pt-24">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/80 px-3 py-1 text-xs font-medium text-fg-muted">
            <span className="size-2 rounded-full bg-success" aria-hidden />
            {hero.eyebrow}
          </p>

          <h1 id="hero-title" className="mt-6 font-bold leading-[0.95] tracking-[-0.04em] text-fg">
            <span className="block text-[clamp(3.25rem,11vw,6.5rem)]">{hero.firstName}</span>
            <span className="block text-[clamp(3.25rem,11vw,6.5rem)] text-gradient pb-2">{hero.lastName}</span>
            <span className="sr-only">, {hero.role}</span>
          </h1>

          <p className="mt-6 font-display text-lg font-bold text-fg sm:text-xl" aria-hidden>
            {hero.role}
          </p>
          <p className="mt-1 text-sm text-fg-subtle">{hero.location}</p>
          <p className="mt-6 max-w-xl text-lg text-fg-muted">{hero.lead}</p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href={localePath(locale, "/projetos")} size="lg">
              {hero.primaryCta}
              <ArrowRightIcon width={18} height={18} />
            </ButtonLink>
            <ButtonLink href={localePath(locale, "/contato")} size="lg" variant="secondary">
              {hero.secondaryCta}
            </ButtonLink>
          </div>

          <SocialLinks
            className="mt-8"
            labels={{ email: dict.contact.email, github: dict.contact.github, linkedin: dict.contact.linkedin }}
            newTabHint={dict.common.opensInNewTab}
          />
        </div>

        <MatrixPortrait
          src="/images/profile/renan-github.jpg"
          label={hero.portraitLabel}
          countLabel={hero.particlesCount}
          hint={hero.portraitHint}
          locale={locale}
        />
      </Container>
    </section>
  );
}
