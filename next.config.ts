import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Builds de validação usam outra pasta para não corromper o cache de um "next dev" em execução.
  distDir: process.env.NEXT_DIST_DIR || ".next",
  cacheComponents: true,
  partialPrefetching: true,
  poweredByHeader: false,
  // Navegadores e robôs ainda pedem /favicon.ico; o ícone oficial é o SVG.
  async redirects() {
    return [{ source: "/favicon.ico", destination: "/icon.svg", permanent: true }];
  },
  images: {
    // Capas dos projetos importados do GitHub (cartão gerado pelo próprio GitHub).
    remotePatterns: [{ protocol: "https", hostname: "opengraph.githubassets.com" }],
  },
  experimental: {
    // O layout raiz fica em app/[locale]; URLs sem rota usam app/global-not-found.tsx.
    globalNotFound: true,
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
