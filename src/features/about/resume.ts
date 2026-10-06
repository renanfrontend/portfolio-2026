import "server-only";
import { existsSync } from "node:fs";
import path from "node:path";

/** O botão de currículo só aparece quando o arquivo realmente existe em public/. */
export function resumeExists(publicPath: string): boolean {
  return existsSync(path.join(process.cwd(), "public", publicPath));
}
