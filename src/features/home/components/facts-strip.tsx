import { Container } from "@/components/layout/container";
import type { Dictionary } from "@/i18n/dictionaries";

/** Fatos verificáveis do perfil (datas e empresas listadas em Sobre). */
export function FactsStrip({ dict }: { dict: Dictionary }) {
  const f = dict.home.facts;
  const facts = [
    { label: f.roleLabel, value: f.roleValue, detail: f.roleDetail },
    { label: f.experienceLabel, value: f.experienceValue, detail: f.experienceDetail },
    { label: f.domainsLabel, value: f.domainsValue, detail: f.domainsDetail },
    { label: f.educationLabel, value: f.educationValue, detail: f.educationDetail },
  ];

  return (
    <section aria-label={f.label}>
      <Container>
        <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {facts.map((fact) => (
            <div
              key={fact.label}
              className="relative overflow-hidden rounded-2xl card-neon p-5"
            >
              <dt className="font-mono text-xs text-fg-subtle">{fact.label}</dt>
              <dd className="mt-2 font-display text-xl font-bold text-fg">{fact.value}</dd>
              <dd className="mt-1 text-sm text-fg-muted">{fact.detail}</dd>
            </div>
          ))}
        </dl>
      </Container>
    </section>
  );
}
