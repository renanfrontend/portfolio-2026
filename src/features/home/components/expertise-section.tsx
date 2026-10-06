import { Section } from "@/components/layout/section";
import { Reveal } from "@/components/shared/reveal";
import { SectionHeading } from "@/components/shared/section-heading";
import type { ExpertiseArea } from "@/content/types";
import type { Dictionary } from "@/i18n/dictionaries";

export function ExpertiseSection({ dict, areas }: { dict: Dictionary; areas: ExpertiseArea[] }) {
  const t = dict.home.expertise;

  return (
    <Section aria-labelledby="expertise-title">
      <SectionHeading id="expertise-title" index={t.index} eyebrow={t.eyebrow} title={t.title} description={t.description} />
      <div className="mt-14 grid gap-5 md:grid-cols-3">
        {areas.map((area, index) => (
          <Reveal key={area.title} className="h-full rounded-2xl card-neon p-7">
            <p className="font-mono text-xs text-accent-strong" aria-hidden>
              {String(index + 1).padStart(2, "0")}
            </p>
            <h3 className="mt-4 text-xl font-bold text-fg">{area.title}</h3>
            <p className="mt-3 text-fg-muted">{area.description}</p>
            <ul className="mt-6 grid gap-2 text-sm text-fg">
              {area.items.map((item) => (
                <li key={item} className="flex items-center gap-3">
                  <span className="size-1.5 rounded-full bg-accent" aria-hidden />
                  {item}
                </li>
              ))}
            </ul>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
