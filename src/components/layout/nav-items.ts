import type { Dictionary } from "@/i18n/dictionaries";

export type NavItem = { href: string; label: string };

export function getNavItems(dict: Dictionary): { path: string; label: string }[] {
  return [
    { path: "/sobre", label: dict.nav.about },
    { path: "/projetos", label: dict.nav.projects },
    { path: "/servicos", label: dict.nav.services },
    { path: "/contato", label: dict.nav.contact },
  ];
}
