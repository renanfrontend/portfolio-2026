"use client";

import { useTheme } from "@/hooks/use-theme";
import type { ThemeChoice } from "@/providers/theme-provider";
import { MonitorIcon, MoonIcon, SunIcon } from "./icons";

type ThemeToggleProps = {
  labels: Record<ThemeChoice, string>;
  /** Modelo com {theme}, ex.: "Alterar tema. Atual: {theme}". */
  changeLabel: string;
};

const order: ThemeChoice[] = ["dark", "light", "system"];
const icons = { dark: MoonIcon, light: SunIcon, system: MonitorIcon };

export function ThemeToggle({ labels, changeLabel }: ThemeToggleProps) {
  const { choice, setChoice } = useTheme();
  const Icon = icons[choice];
  const next = order[(order.indexOf(choice) + 1) % order.length];
  const label = changeLabel.replace("{theme}", labels[choice]);

  return (
    <button
      type="button"
      onClick={() => setChoice(next)}
      aria-label={label}
      title={label}
      className="inline-flex size-10 items-center justify-center rounded-full border border-border bg-surface text-fg-muted transition-colors hover:text-fg"
    >
      <Icon />
    </button>
  );
}
