/**
 * Dados públicos e estáveis do site. Canais só aparecem quando definidos aqui
 * (confirmados pelo responsável) ou nas variáveis de ambiente públicas.
 */
/** Endereço público oficial. Ao usar um domínio próprio, troque aqui ou defina NEXT_PUBLIC_SITE_URL. */
const PRODUCTION_URL = "https://www.renanaugusto.com.br";

function resolveSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) return explicit.replace(/\/+$/, "");
  // Na Vercel (produção e prévias) o canonical aponta sempre para o endereço oficial,
  // e não para o domínio automático do projeto.
  if (process.env.VERCEL_ENV) return PRODUCTION_URL;
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
