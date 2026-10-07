"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import type { Locale } from "@/i18n/config";
import { switchLocalePath } from "@/lib/links";

type LanguageSwitcherProps = {
  target: Locale;
  short: string;
  label: string;
};

const className =
  "inline-flex h-10 min-w-10 items-center justify-center rounded-full border border-border bg-surface px-3 font-mono text-xs font-semibold text-fg-muted transition-colors hover:text-fg";

function LinkWithQuery({ target, short, label }: LanguageSwitcherProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const query = searchParams.toString();
  const href = `${switchLocalePath(pathname, target)}${query ? `?${query}` : ""}`;

  return (
    <Link href={href} hrefLang={target} lang={target} aria-label={`${short}, ${label}`} title={label} className={className}>
      {short}
    </Link>
  );
}

/** Enquanto o caminho não é conhecido (shell estático), aponta para a home do outro idioma. */
function LinkWithoutQuery({ target, short, label }: LanguageSwitcherProps) {
  return (
    <Link href={`/${target}`} hrefLang={target} lang={target} aria-label={`${short}, ${label}`} title={label} className={className}>
      {short}
    </Link>
  );
}

/** Troca o idioma mantendo a página atual e os filtros da URL. */
export function LanguageSwitcher(props: LanguageSwitcherProps) {
  return (
    <Suspense fallback={<LinkWithoutQuery {...props} />}>
      <LinkWithQuery {...props} />
    </Suspense>
  );
}
