import type { ServiceFaqItem } from "../types";

/** Acordeão nativo (<details>): acessível por teclado e leitor de tela sem JavaScript. */
export function ServiceFaq({ items }: { items: ServiceFaqItem[] }) {
  return (
    <div className="divide-y divide-border rounded-2xl card-neon">
      {items.map((item) => (
        <details key={item.question} className="group px-6 py-5 [&_summary::-webkit-details-marker]:hidden">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-fg">
            {item.question}
            <span
              className="grid size-7 shrink-0 place-items-center rounded-full border border-border text-fg-muted transition-transform group-open:rotate-45 motion-reduce:transition-none"
              aria-hidden
            >
              +
            </span>
          </summary>
          <p className="mt-3 text-fg-muted">{item.answer}</p>
        </details>
      ))}
    </div>
  );
}
