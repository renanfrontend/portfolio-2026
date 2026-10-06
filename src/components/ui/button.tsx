import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "ghost";
type Size = "md" | "lg";

const variants: Record<Variant, string> = {
  primary: "bg-accent text-accent-fg hover:bg-accent-strong shadow-[0_8px_30px_-12px_var(--accent)]",
  secondary: "border border-border-strong bg-surface text-fg hover:border-accent hover:text-accent-strong",
  ghost: "text-fg-muted hover:text-fg hover:bg-surface-strong",
};

const sizes: Record<Size, string> = {
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-6 text-[0.95rem]",
};

export function buttonClasses(variant: Variant = "primary", size: Size = "md", className?: string) {
  return cn(
    "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-colors duration-200",
    "disabled:cursor-not-allowed disabled:opacity-60",
    variants[variant],
    sizes[size],
    className,
  );
}

type ButtonLinkProps = ComponentProps<typeof Link> & { variant?: Variant; size?: Size; children: ReactNode };

export function ButtonLink({ variant, size, className, ...props }: ButtonLinkProps) {
  return <Link className={buttonClasses(variant, size, className)} {...props} />;
}

type ButtonProps = ComponentProps<"button"> & { variant?: Variant; size?: Size };

export function Button({ variant, size, className, type = "button", ...props }: ButtonProps) {
  return <button type={type} className={buttonClasses(variant, size, className)} {...props} />;
}
