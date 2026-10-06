import { Section } from "@/components/layout/section";
import { SectionHeading } from "@/components/shared/section-heading";
import type { Profile } from "@/content/types";
import type { Dictionary } from "@/i18n/dictionaries";

export function WorkProcessSection({ dict, steps }: { dict: Dictionary; steps: Profile["workProcess"] }) {
  const t = dict.home.process;

  return (
    <Section aria-labelledby="process-title" className="border-t border-border bg-bg-elevated/50">
      <SectionHeading id="process-title" index={t.index} eyebrow={t.eyebrow} title={t.title} />
      <ol className="mt-14 grid gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
        {steps.map((step, index) => (
          <li key={step.title} className="bg-surface p-7">
            <span className="font-display text-4xl font-bold text-accent" aria-hidden>
              {String(index + 1).padStart(2, "0")}
            </span>
            <h3 className="mt-4 text-lg font-bold text-fg">{step.title}</h3>
            <p className="mt-2 text-sm text-fg-muted">{step.description}</p>
          </li>
        ))}
      </ol>
    </Section>
  );
}
