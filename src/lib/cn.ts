type ClassValue = string | false | null | undefined;

/** Junta classes condicionais. */
export function cn(...values: ClassValue[]): string {
  return values.filter(Boolean).join(" ");
}
