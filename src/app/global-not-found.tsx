import type { Metadata } from "next";
import Link from "next/link";
import { Inter, Space_Grotesk } from "next/font/google";
import { themeInitScript } from "@/providers/theme-script";
import "@/styles/globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const display = Space_Grotesk({ subsets: ["latin"], weight: ["700"], variable: "--font-display-face", display: "swap" });

export const metadata: Metadata = {
  title: "404 | Renan Augusto",
  description: "Página não encontrada. Page not found.",
  robots: { index: false, follow: false },
};

/** 404 para URLs fora das rotas por idioma (inclui idiomas inválidos). Bilíngue porque o idioma é desconhecido. */
export default function GlobalNotFound() {
  return (
    <html lang="pt-BR" data-theme="dark" suppressHydrationWarning className={`${inter.variable} ${display.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>
        <main className="bg-grid flex min-h-dvh flex-col items-center justify-center px-4 text-center">
          <p className="font-mono text-sm text-accent-strong">404</p>
          <h1 className="mt-4 text-4xl font-bold text-fg sm:text-5xl">Página não encontrada</h1>
          <p className="mt-3 text-fg-muted" lang="en">
            Page not found
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/pt-BR" className="inline-flex h-11 items-center rounded-full bg-accent px-5 text-sm font-semibold text-accent-fg">
              Voltar para o início
            </Link>
            <Link
              href="/en"
              lang="en"
              className="inline-flex h-11 items-center rounded-full border border-border-strong px-5 text-sm font-semibold text-fg"
            >
              Back to home
            </Link>
          </div>
        </main>
      </body>
    </html>
  );
}
