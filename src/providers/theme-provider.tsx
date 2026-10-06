"use client";

import { createContext, useCallback, useEffect, useMemo, useSyncExternalStore, type ReactNode } from "react";
import { THEME_STORAGE_KEY } from "./theme-script";

export type ThemeChoice = "dark" | "light" | "system";
export type ResolvedTheme = "dark" | "light";

type ThemeContextValue = {
  choice: ThemeChoice;
  resolved: ResolvedTheme;
  setChoice: (choice: ThemeChoice) => void;
};

export const ThemeContext = createContext<ThemeContextValue | null>(null);

const DEFAULT_CHOICE: ThemeChoice = "dark";
const listeners = new Set<() => void>();

function readChoice(): ThemeChoice {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    return stored === "light" || stored === "dark" || stored === "system" ? stored : DEFAULT_CHOICE;
  } catch {
    return DEFAULT_CHOICE;
  }
}

function subscribeChoice(callback: () => void) {
  listeners.add(callback);
  const onStorage = (event: StorageEvent) => {
    if (event.key === THEME_STORAGE_KEY) callback();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(callback);
    window.removeEventListener("storage", onStorage);
  };
}

const lightQuery = "(prefers-color-scheme: light)";

function subscribeSystem(callback: () => void) {
  const media = window.matchMedia(lightQuery);
  media.addEventListener("change", callback);
  return () => media.removeEventListener("change", callback);
}

function readSystem(): ResolvedTheme {
  return window.matchMedia(lightQuery).matches ? "light" : "dark";
}

/** Fonte única da preferência de tema; o tema exibido é derivado, nunca duplicado. */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const choice = useSyncExternalStore(subscribeChoice, readChoice, () => DEFAULT_CHOICE);
  const system = useSyncExternalStore(subscribeSystem, readSystem, () => "dark" as const);
  const resolved: ResolvedTheme = choice === "system" ? system : choice;

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", resolved);
  }, [resolved]);

  const setChoice = useCallback((next: ThemeChoice) => {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // Sem armazenamento disponível: a escolha vale só nesta visita.
    }
    listeners.forEach((listener) => listener());
  }, []);

  const value = useMemo(() => ({ choice, resolved, setChoice }), [choice, resolved, setChoice]);

  return <ThemeContext value={value}>{children}</ThemeContext>;
}
