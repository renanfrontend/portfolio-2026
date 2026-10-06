import type { ReactNode } from "react";
import { Container } from "@/components/layout/container";
import { SectionHeading } from "./section-heading";

type PageHeaderProps = {
  eyebrow: string;
  title: string;
  description?: ReactNode;
  breadcrumbs?: ReactNode;
  children?: ReactNode;
};

/** Cabeçalho padrão das páginas internas, com o único h1 da página. */
export function PageHeader({ eyebrow, title, description, breadcrumbs, children }: PageHeaderProps) {
  return (
    <div className="relative isolate overflow-hidden border-b border-border">
      <div className="bg-grid absolute inset-0 -z-10" aria-hidden />
      <div className="glow absolute inset-0 -z-10" aria-hidden />
      <Container className="pb-14 pt-12 sm:pb-20 sm:pt-16">
        {breadcrumbs && <div className="mb-8">{breadcrumbs}</div>}
        <SectionHeading as="h1" eyebrow={eyebrow} title={title} description={description} />
        {children}
      </Container>
    </div>
  );
}
