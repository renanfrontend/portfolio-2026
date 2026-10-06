import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type BadgeProps = { children: ReactNode; tone?: "default" | "accent" | "success"; className?: string };

const tones = {
  default: "border-border bg-surface-strong text-fg-muted",
  accent: "border-transparent bg-accent-soft text-accent-strong",
  success: "border-transparent bg-[color-mix(in_srgb,var(--success)_14%,transparent)] text-success",
};

export function Badge({ children, tone = "default", className }: BadgeProps) {
  return (
    <span className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium", tones[tone], className)}>
      {children}
    </span>
  );
}
