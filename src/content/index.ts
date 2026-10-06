import type { Locale } from "@/i18n/config";
import { profile as enProfile } from "./en/profile";
import { projectsCopy as enProjects } from "./en/projects";
import { services as enServices } from "./en/services";
import { profile as ptProfile } from "./pt-BR/profile";
import { projectsCopy as ptProjects } from "./pt-BR/projects";
import { services as ptServices } from "./pt-BR/services";

/** Ponto único de acesso ao conteúdo editorial por idioma. */
export const contentByLocale = {
  "pt-BR": { profile: ptProfile, projects: ptProjects, services: ptServices },
  en: { profile: enProfile, projects: enProjects, services: enServices },
} satisfies Record<Locale, unknown>;
