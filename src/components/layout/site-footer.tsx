import Link from "next/link";
import { SocialLinks } from "@/components/shared/social-links";
import { siteConfig } from "@/config/site";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { localePath } from "@/lib/links";
import { Container } from "./container";
import { getNavItems } from "./nav-items";

export async function SiteFooter({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const year = await getBuildYear();
  const items = [...getNavItems(dict), { path: "/privacidade", label: dict.footer.privacy }];

  return (
    <footer className="border-t border-border bg-bg-elevated">
      <Container className="grid gap-10 py-14 md:grid-cols-[1.4fr_1fr_1.2fr]">
        <div>
          <p className="font-display text-lg font-bold text-fg">{siteConfig.fullName}</p>
          <p className="mt-2 max-w-xs text-sm text-fg-muted">{dict.footer.tagline}</p>
        </div>

        <nav aria-label={dict.footer.navigation}>
          <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-fg-subtle">{dict.footer.navigation}</h2>
          <ul className="mt-4 grid gap-2">
            {items.map((item) => (
              <li key={item.path}>
                <Link href={localePath(locale, item.path)} className="text-sm text-fg-muted transition-colors hover:text-fg">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-fg-subtle">{dict.footer.contact}</h2>
          <SocialLinks
            className="mt-4 flex-col !items-start"
            labels={{ email: dict.contact.email, github: dict.contact.github, linkedin: dict.contact.linkedin }}
            newTabHint={dict.common.opensInNewTab}
          />
        </div>
      </Container>
      <Container className="flex flex-col gap-2 border-t border-border py-6 text-xs text-fg-subtle sm:flex-row sm:justify-between">
        <p>
          © {year} {siteConfig.fullName}. {dict.footer.rights}
        </p>
        <p>{dict.footer.builtWith}</p>
      </Container>
    </footer>
  );
}

/** Ano calculado no build e mantido em cache junto com o shell estático. */
async function getBuildYear() {
  "use cache";
  return new Date().getFullYear();
}
