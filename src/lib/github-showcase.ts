import { z } from "zod";
import type { Project, ProjectCategory } from "@/features/projects/types";

/**
 * Projetos importados automaticamente do GitHub.
 * Basta adicionar o tópico SHOWCASE_TOPIC a um repositório público (e o link do site em "Website", se houver);
 * com HIGHLIGHT_TOPIC ele também entra nos destaques da home.
 */
export const GITHUB_USER = "renanfrontend";
export const SHOWCASE_TOPIC = "portfolio-site";
export const HIGHLIGHT_TOPIC = "portfolio-destaque";

const repoSchema = z.object({
  name: z.string(),
  description: z.string().nullable(),
  html_url: z.url(),
  homepage: z.string().nullable(),
  language: z.string().nullable(),
  topics: z.array(z.string()).default([]),
  fork: z.boolean(),
  archived: z.boolean(),
  private: z.boolean(),
  pushed_at: z.string(),
});

export type GithubRepo = z.infer<typeof repoSchema>;

const categoryByTopic: [string, ProjectCategory][] = [
  ["ai", "ai"],
  ["ia", "ai"],
  ["llm", "ai"],
  ["game", "games"],
  ["games", "games"],
  ["jogo", "games"],
  ["dashboard", "dashboard"],
  ["automation", "automation"],
  ["automacao", "automation"],
];

/** Tópicos técnicos que não devem aparecer como tecnologia. */
const hiddenTopics = new Set([SHOWCASE_TOPIC, HIGHLIGHT_TOPIC, "portfolio", "game", "games", "jogo", "ai", "ia"]);

/** Nomes oficiais dos tópicos de tecnologia mais comuns (o GitHub só aceita tópicos em minúsculas). */
const topicLabels: Record<string, string> = {
  react: "React",
  typescript: "TypeScript",
  javascript: "JavaScript",
  nextjs: "Next.js",
  vite: "Vite",
  vue: "Vue",
  nodejs: "Node.js",
  threejs: "Three.js",
  "react-three-fiber": "React Three Fiber",
  tailwindcss: "Tailwind CSS",
  glsl: "GLSL",
  vitest: "Vitest",
  playwright: "Playwright",
  redux: "Redux",
  "web-audio-api": "Web Audio API",
  supabase: "Supabase",
  firebase: "Firebase",
  python: "Python",
  java: "Java",
};

/** Tópico em rótulo legível: nome oficial quando conhecido; senão, palavras com inicial maiúscula. */
export function topicLabel(topic: string): string {
  return topicLabels[topic] ?? topic.split("-").map((word) => word[0].toUpperCase() + word.slice(1)).join(" ");
}

/** Nome do repositório em título legível (ex.: "flowboard-kanban" -> "Flowboard Kanban"). */
export function titleFromRepo(name: string): string {
  return name
    .split(/[-_]+/)
    .filter(Boolean)
    .map((word) => (word.length <= 3 && word === word.toLowerCase() && /\d|^(ai|api|ui|3d)$/.test(word) ? word.toUpperCase() : word[0].toUpperCase() + word.slice(1)))
    .join(" ");
}

function validHomepage(url: string | null): string | undefined {
  if (!url) return undefined;
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") return undefined;
    // O link para o próprio GitHub não é um site publicado.
    if (parsed.hostname === "github.com") return undefined;
    return parsed.toString();
  } catch {
    return undefined;
  }
}

/** Converte um repositório em projeto. A capa é o cartão gerado pelo próprio GitHub. */
export function repoToProject(repo: GithubRepo): Project {
  const topics = repo.topics.map((topic) => topic.toLowerCase());
  const category = categoryByTopic.find(([topic]) => topics.includes(topic))?.[1] ?? "web";
  const liveUrl = validHomepage(repo.homepage);
  // Linguagem + tópicos técnicos, sem repetir ("TypeScript" e o tópico "typescript" são a mesma coisa).
  const labels = [repo.language, ...topics.filter((topic) => !hiddenTopics.has(topic)).map(topicLabel)].filter(Boolean) as string[];
  const technologies = labels.filter((label, index) => labels.findIndex((other) => other.toLowerCase() === label.toLowerCase()) === index);

  return {
    id: `github:${repo.name}`,
    slug: repo.name.toLowerCase(),
    title: titleFromRepo(repo.name),
    summary: repo.description?.trim() || titleFromRepo(repo.name),
    category,
    technologies: technologies.length > 0 ? technologies : ["GitHub"],
    kind: "personal",
    status: liveUrl ? "live" : undefined,
    featured: topics.includes(HIGHLIGHT_TOPIC),
    cover: {
      src: `https://opengraph.githubassets.com/portfolio/${GITHUB_USER}/${repo.name}`,
      alt: `Cartão do repositório ${repo.name} no GitHub.`,
      width: 1200,
      height: 600,
    },
    gallery: [],
    outcomes: [],
    repositoryUrl: repo.html_url,
    liveUrl,
    updatedAt: repo.pushed_at.slice(0, 10),
    fromGithub: true,
  };
}

/**
 * Busca os repositórios públicos com o tópico de vitrine.
 * Em qualquer falha (sem rede, limite da API), devolve lista vazia: o site segue só com os projetos curados.
 */
export async function fetchShowcaseRepos(fetchImpl: typeof fetch = fetch): Promise<GithubRepo[]> {
  return (await fetchShowcaseReposOrNull(fetchImpl)) ?? [];
}

/** Como fetchShowcaseRepos, mas devolve null quando o GitHub não respondeu (para quem precisa distinguir falha de lista vazia). */
export async function fetchShowcaseReposOrNull(fetchImpl: typeof fetch = fetch): Promise<GithubRepo[] | null> {
  // Desligado nos testes E2E para não depender da rede nem da API do GitHub.
  if (process.env.GITHUB_SHOWCASE === "off") return [];
  const headers: Record<string, string> = { Accept: "application/vnd.github+json", "User-Agent": "renanaugusto-portfolio" };
  const token = process.env.GITHUB_TOKEN?.trim();
  if (token) headers.Authorization = `Bearer ${token}`;

  try {
    const response = await fetchImpl(`https://api.github.com/users/${GITHUB_USER}/repos?per_page=100&sort=pushed`, {
      headers,
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) return null;
    const parsed = z.array(z.unknown()).safeParse(await response.json());
    if (!parsed.success) return null;
    return parsed.data
      .map((item) => repoSchema.safeParse(item))
      .filter((result) => result.success)
      .map((result) => result.data)
      .filter((repo) => !repo.private && !repo.fork && !repo.archived && repo.topics.includes(SHOWCASE_TOPIC));
  } catch {
    return null;
  }
}
