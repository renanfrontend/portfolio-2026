import Link from "next/link";
import { locale as getLocaleParam } from "next/root-params";
import { buttonClasses } from "@/components/ui/button";
import { defaultLocale, isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { localePath } from "@/lib/links";

/** 404 para slugs e páginas inexistentes dentro de um idioma válido. */
export default async function NotFound() {
  const param = await getLocaleParam();
  const locale = param && isLocale(param) ? param : defaultLocale;
  const dict = getDictionary(locale);

  return (
    <main className="bg-grid flex min-h-dvh flex-col items-center justify-center px-4 text-center">
      <p className="font-mono text-sm text-accent-strong">404</p>
      <h1 className="mt-4 text-4xl font-bold text-fg sm:text-5xl">{dict.notFound.title}</h1>
      <p className="mt-3 max-w-md text-fg-muted">{dict.notFound.text}</p>
      <Link href={localePath(locale)} className={buttonClasses("primary", "lg", "mt-8")}>
        {dict.notFound.cta}
      </Link>
    </main>
  );
}
