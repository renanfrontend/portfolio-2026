"use client";

import { use } from "react";
import { ThemeContext } from "@/providers/theme-provider";

export function useTheme() {
  const context = use(ThemeContext);
  if (!context) throw new Error("useTheme precisa estar dentro de <ThemeProvider>.");
  return context;
}
