import type { ExperienceItem } from "@/content/types";
import type { Locale } from "@/i18n/config";

function formatMonth(value: string, locale: Locale) {
  const [year, month] = value.split("-").map(Number);
  // Data fixa em UTC para não variar com o fuso do servidor.
  const date = new Date(Date.UTC(year, month - 1, 1));
  return new Intl.DateTimeFormat(locale, { month: "short", year: "numeric", timeZone: "UTC" }).format(date);
}

type CareerTimelineProps = { items: ExperienceItem[]; locale: Locale; currentLabel: string };

export function CareerTimeline({ items, locale, currentLabel }: CareerTimelineProps) {
  return (
    <ol className="relative grid gap-6 border-l border-border pl-6 sm:pl-8">
      {items.map((item) => (
        <li key={item.id} className="relative">
          <span className="absolute -left-[calc(1.5rem+5px)] top-2 size-2.5 rounded-full bg-accent ring-4 ring-bg sm:-left-[calc(2rem+5px)]" aria-hidden />
          <article className="rounded-2xl card-neon p-6 sm:p-7">
            <p className="font-mono text-xs uppercase tracking-[0.15em] text-fg-subtle">
              <time dateTime={item.start}>{formatMonth(item.start, locale)}</time>
              {" — "}
              {item.end ? <time dateTime={item.end}>{formatMonth(item.end, locale)}</time> : currentLabel}
            </p>
            <h3 className="mt-3 text-xl font-bold text-fg">{item.role}</h3>
            <p className="mt-1 text-fg-muted">
              <span className="font-semibold text-fg">{item.company}</span> · {item.place}
            </p>
            <p className="mt-4 text-fg-muted">{item.summary}</p>
            <ul className="mt-4 grid gap-2 text-[0.95rem] text-fg-muted">
              {item.highlights.map((highlight) => (
                <li key={highlight} className="flex gap-3">
                  <span className="mt-2.5 size-1.5 shrink-0 rounded-full bg-accent" aria-hidden />
                  {highlight}
                </li>
              ))}
            </ul>
            <ul className="mt-5 flex flex-wrap gap-2">
              {item.stack.map((tech) => (
                <li key={tech} className="rounded-full border border-border bg-surface-strong px-2.5 py-0.5 font-mono text-xs text-fg-muted">
                  {tech}
                </li>
              ))}
            </ul>
          </article>
        </li>
      ))}
    </ol>
  );
}
