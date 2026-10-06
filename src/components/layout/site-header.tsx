import Link from "next/link";
import { LanguageSwitcher } from "@/components/shared/language-switcher";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { ButtonLink } from "@/components/ui/button";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { localePath } from "@/lib/links";
import { Container } from "./container";
import { DesktopNav } from "./desktop-nav";
import { MobileNav } from "./mobile-nav";
import { getNavItems } from "./nav-items";

export function SiteHeader({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const items = getNavItems(dict).map((item) => ({ href: localePath(locale, item.path), label: item.label }));
  const contactHref = localePath(locale, "/contato");
  const otherLocale: Locale = locale === "pt-BR" ? "en" : "pt-BR";

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-bg/80 backdrop-blur-xl supports-[backdrop-filter]:bg-bg/65">
      <Container className="relative flex h-16 items-center justify-between gap-4 sm:h-[4.5rem]">
        <Link href={localePath(locale)} className="group flex items-center gap-3" aria-label={`Renan Augusto, ${dict.common.home}`}>
          <span
            aria-hidden
            className="grid size-9 place-items-center rounded-xl bg-accent font-mono text-sm font-bold text-accent-fg transition-transform group-hover:-rotate-6 motion-reduce:transition-none"
          >
            RA
          </span>
          <span className="hidden font-display text-[0.95rem] font-bold text-fg min-[400px]:inline">Renan Augusto</span>
        </Link>

        <DesktopNav items={items} label={dict.nav.label} />

        <div className="flex items-center gap-1.5 sm:gap-2">
          <LanguageSwitcher target={otherLocale} short={dict.language.short} label={dict.language.switchTo} />
          <ThemeToggle
            labels={{ dark: dict.theme.dark, light: dict.theme.light, system: dict.theme.system }}
            changeLabel={dict.theme.change}
          />
          <span className="hidden lg:block">
            <ButtonLink href={contactHref}>{dict.nav.cta}</ButtonLink>
          </span>
          <MobileNav
            items={items}
            label={dict.nav.label}
            openLabel={dict.nav.openMenu}
            closeLabel={dict.nav.closeMenu}
            cta={{ href: contactHref, label: dict.nav.cta }}
          />
        </div>
      </Container>
    </header>
  );
}
