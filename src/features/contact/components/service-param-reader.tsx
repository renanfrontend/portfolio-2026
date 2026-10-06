"use client";

import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { resolveInitialService } from "../service-param";

type Props = { serviceSlugs: readonly string[]; onResolve: (slug: string | undefined) => void };

/**
 * Lê `?servico=slug` e informa o formulário. Fica isolado em um Suspense próprio
 * para que o formulário nunca seja recriado (e o texto digitado nunca se perca).
 */
export function ServiceParamReader({ serviceSlugs, onResolve }: Props) {
  const param = useSearchParams().get("servico");
  const slug = resolveInitialService(param, serviceSlugs);
  useEffect(() => onResolve(slug), [slug, onResolve]);
  return null;
}
