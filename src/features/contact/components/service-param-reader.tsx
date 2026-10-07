"use client";

import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { resolveInitialService } from "../service-param";

type Props = {
  serviceSlugs: readonly string[];
  packageIds: readonly string[];
  onResolve: (slug: string | undefined, packageId: string | undefined) => void;
};

/**
 * Lê `?servico=slug` e `?pacote=id` e informa o formulário. Fica isolado em um Suspense próprio
 * para que o formulário nunca seja recriado (e o texto digitado nunca se perca).
 */
export function ServiceParamReader({ serviceSlugs, packageIds, onResolve }: Props) {
  const params = useSearchParams();
  const slug = resolveInitialService(params.get("servico"), serviceSlugs);
  const packageId = resolveInitialService(params.get("pacote"), packageIds);
  useEffect(() => onResolve(slug, packageId), [slug, packageId, onResolve]);
  return null;
}
