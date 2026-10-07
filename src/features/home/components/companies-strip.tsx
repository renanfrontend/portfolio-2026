import Link from "next/link";
import { Container } from "@/components/layout/container";
import type { ExperienceItem } from "@/content/types";
import type { Locale } from "@/i18n/config";
import { localePath } from "@/lib/links";

type CompaniesStripProps = { locale: Locale; label: string; experience: ExperienceItem[] };

/** Empresas da trajetória, só em texto (sem logos, que dependeriam de autorização das marcas). */
export function CompaniesStrip({ locale, label, experience }: CompaniesStripProps) {
  const companies = [...new Set(experience.map((item) => item.company.split(",")[0].trim()))];

  return (
    <section aria-labelledby="companies-title" className="pt-10">
      <Container>
        <div className="flex flex-col gap-4 rounded-2xl border border-border/70 px-5 py-5 md:flex-row md:items-center md:gap-8">
          <h2 id="companies-title" className="shrink-0 font-mono text-xs text-fg-subtle">
            {"// "}
            {label}
          </h2>
          <ul className="flex flex-wrap items-center gap-x-6 gap-y-2">
            {companies.map((company) => (
              <li key={company}>
                <Link
                  href={`${localePath(locale, "/sobre")}#experience-title`}
                  className="font-display text-[0.95rem] font-bold text-fg-muted transition-colors hover:text-accent-strong"
                >
                  {company}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </section>
  );
}
