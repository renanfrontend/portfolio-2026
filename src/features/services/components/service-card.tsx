import Link from "next/link";
import { ArrowRightIcon } from "@/components/shared/icons";
import type { Service } from "../types";

type ServiceCardProps = { service: Service; href: string; index: number; detailsLabel: string; headingLevel?: "h2" | "h3" };

export function ServiceCard({ service, href, index, detailsLabel, headingLevel: Heading = "h3" }: ServiceCardProps) {
  return (
    <article className="group relative flex h-full flex-col rounded-2xl card-neon p-7 transition-colors has-[a:focus-visible]:ring-2 has-[a:focus-visible]:ring-[var(--ring)]">
      <p className="font-mono text-xs text-fg-subtle" aria-hidden>
        {String(index + 1).padStart(2, "0")}
      </p>
      <Heading className="mt-4 text-xl font-bold text-fg">
        <Link href={href} className="after:absolute after:inset-0 after:rounded-2xl focus-visible:outline-none">
          {service.title}
        </Link>
      </Heading>
      <p className="mt-3 flex-1 text-fg-muted">{service.summary}</p>
      <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-accent-strong" aria-hidden>
        {detailsLabel}
        <ArrowRightIcon width={16} height={16} className="transition-transform group-hover:translate-x-1 motion-reduce:transition-none" />
      </span>
    </article>
  );
}
