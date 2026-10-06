import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type SectionHeadingProps = {
  id?: string;
  index?: string;
  eyebrow: string;
  title: string;
  description?: ReactNode;
  as?: "h1" | "h2";
  align?: "left" | "center";
  className?: string;
};

export function SectionHeading({ id, index, eyebrow, title, description, as: Tag = "h2", align = "left", className }: SectionHeadingProps) {
  return (
    <div className={cn("max-w-3xl", align === "center" && "mx-auto text-center", className)}>
      <p className={cn("flex items-center gap-2 font-mono text-sm text-accent-strong", align === "center" && "justify-center")}>
        <span className="text-fg-subtle" aria-hidden>
          {"//"}
        </span>
        <span className="lowercase">{eyebrow}</span>
        {index && (
          <span className="rounded-md border border-border px-1.5 py-0.5 text-[0.7rem] text-fg-subtle" aria-hidden>
            {index}
          </span>
        )}
      </p>
      <Tag id={id} className={cn("mt-4 font-bold text-fg", Tag === "h1" ? "text-4xl sm:text-5xl lg:text-6xl" : "text-3xl sm:text-4xl lg:text-5xl")}>
        {title}
      </Tag>
      {description && <div className="mt-5 text-lg text-fg-muted">{description}</div>}
    </div>
  );
}
