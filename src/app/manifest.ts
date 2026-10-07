import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Renan Augusto: Desenvolvedor Frontend Sênior",
    short_name: "Renan Augusto",
    description: "Portfólio e consultoria: React, Next.js, TypeScript e automação com IA.",
    start_url: "/pt-BR",
    display: "standalone",
    background_color: "#0a0d0d",
    theme_color: "#0a0d0d",
    lang: "pt-BR",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  };
}
