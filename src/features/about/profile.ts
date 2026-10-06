import "server-only";
import { contentByLocale } from "@/content";
import type { Profile } from "@/content/types";
import type { Locale } from "@/i18n/config";

export function getProfile(locale: Locale): Profile {
  return contentByLocale[locale].profile;
}
