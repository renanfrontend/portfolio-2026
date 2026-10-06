/**
 * Dados públicos e estáveis do site. Canais só aparecem quando definidos aqui
 * (confirmados pelo responsável) ou nas variáveis de ambiente públicas.
 */
function resolveSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) return explicit.replace(/\/+$/, "");
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (vercel) return `https://${vercel}`;
  return "http://localhost:3000";
}

export const siteConfig = {
  name: "Renan Augusto",
  fullName: "Renan Augusto dos Santos",
  url: resolveSiteUrl(),
  email: "renan.gabba@gmail.com",
  github: "https://github.com/renanfrontend",
  linkedin: "https://www.linkedin.com/in/renan-augusto-santos/",
} as const;
