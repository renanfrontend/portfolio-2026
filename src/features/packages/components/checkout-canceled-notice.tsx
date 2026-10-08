"use client";

import { useSearchParams } from "next/navigation";

type Props = { title: string; text: string };

/** Aviso quando a pessoa volta do Stripe sem pagar (?cancelado=1). Fica dentro de <Suspense>. */
export function CheckoutCanceledNotice({ title, text }: Props) {
  const params = useSearchParams();
  if (params.get("cancelado") !== "1") return null;
  return (
    <div role="status" className="mb-8 rounded-2xl border border-border-strong bg-surface p-5">
      <p className="font-display font-bold text-fg">{title}</p>
      <p className="mt-1 text-sm text-fg-muted">{text}</p>
    </div>
  );
}
