import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import { notFound } from "next/navigation";
import { siteConfig } from "@/config/site";
import { isLocale, locales } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { isIndexable } from "@/lib/seo";
import { AppProviders } from "@/providers/app-providers";
import { themeInitScript } from "@/providers/theme-script";
import "@/styles/globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const display = Space_Grotesk({
  subsets: ["latin"],
  weight: ["700"],
  variable: "--font-display-face",
  display: "swap",
});

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: LayoutProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const dict = getDictionary(locale);

  return {
    metadataBase: new URL(siteConfig.url),
    title: { default: dict.meta.siteTitle, template: `%s | ${siteConfig.name}` },
    description: dict.meta.siteDescription,
    applicationName: siteConfig.name,
    authors: [{ name: siteConfig.fullName, url: siteConfig.url }],
    creator: siteConfig.fullName,
    robots: isIndexable() ? { index: true, follow: true } : { index: false, follow: false },
  };
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0a0d0d" },
    { media: "(prefers-color-scheme: light)", color: "#f4f7f6" },
  ],
};

export default async function RootLayout({ children, params }: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  return (
    <html lang={locale} data-theme="dark" suppressHydrationWarning className={`${inter.variable} ${display.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
