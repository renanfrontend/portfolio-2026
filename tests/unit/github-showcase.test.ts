import { describe, expect, it } from "vitest";
import { mergeProjects, pickHighlights } from "@/features/projects/ordering";
import type { Project } from "@/features/projects/types";
import { fetchShowcaseRepos, fetchShowcaseReposOrNull, repoToProject, titleFromRepo, type GithubRepo } from "@/lib/github-showcase";

const repo = (overrides: Partial<GithubRepo>): GithubRepo => ({
  name: "flowboard-kanban",
  description: "Kanban com prioridades.",
  html_url: "https://github.com/renanfrontend/flowboard-kanban",
  homepage: "https://flowboard.example.com",
  language: "TypeScript",
  topics: ["portfolio-site", "react"],
  fork: false,
  archived: false,
  private: false,
  pushed_at: "2026-10-03T10:00:00Z",
  ...overrides,
});

const project = (overrides: Partial<Project>): Project => ({
  id: "x",
  slug: "x",
  title: "X",
  summary: "",
  category: "web",
  technologies: [],
  kind: "personal",
  featured: false,
  gallery: [],
  outcomes: [],
  ...overrides,
});

describe("importação de projetos do GitHub", () => {
  it("monta título legível a partir do nome do repositório", () => {
    expect(titleFromRepo("flowboard-kanban")).toBe("Flowboard Kanban");
    expect(titleFromRepo("logiflow-3d")).toBe("Logiflow 3D");
    expect(titleFromRepo("visionstock_ai")).toBe("Visionstock AI");
  });

  it("converte o repositório em projeto, com link do site e tecnologias", () => {
    const result = repoToProject(repo({ topics: ["portfolio-site", "portfolio-destaque", "react", "games"] }));
    expect(result).toMatchObject({
      slug: "flowboard-kanban",
      title: "Flowboard Kanban",
      summary: "Kanban com prioridades.",
      category: "games",
      status: "live",
      liveUrl: "https://flowboard.example.com/",
      featured: true,
      fromGithub: true,
      technologies: ["TypeScript", "React"],
    });
    expect(result.cover?.src).toContain("opengraph.githubassets.com");
  });

  it("mostra tecnologias com o nome oficial e sem repetir a linguagem", () => {
    const result = repoToProject(repo({ topics: ["portfolio-site", "typescript", "web-audio-api", "react-query"] }));
    expect(result.technologies).toEqual(["TypeScript", "Web Audio API", "React Query"]);
  });

  it("não trata o próprio GitHub nem links inválidos como site publicado", () => {
    expect(repoToProject(repo({ homepage: "https://github.com/renanfrontend" })).liveUrl).toBeUndefined();
    expect(repoToProject(repo({ homepage: "javascript:alert(1)" })).liveUrl).toBeUndefined();
    expect(repoToProject(repo({ homepage: null })).status).toBeUndefined();
  });

  it("busca só repositórios públicos, não arquivados e com o tópico de vitrine", async () => {
    const payload = [
      repo({ name: "ok" }),
      repo({ name: "sem-topico", topics: ["react"] }),
      repo({ name: "fork", fork: true }),
      repo({ name: "arquivado", archived: true }),
    ];
    const fakeFetch = (async () => new Response(JSON.stringify(payload), { status: 200 })) as typeof fetch;
    expect((await fetchShowcaseRepos(fakeFetch)).map((item) => item.name)).toEqual(["ok"]);
  });

  it("em falha do GitHub devolve lista vazia (ou null, para quem precisa distinguir)", async () => {
    const limited = (async () => new Response("rate limited", { status: 403 })) as typeof fetch;
    const offline = (async () => {
      throw new TypeError("network");
    }) as typeof fetch;
    expect(await fetchShowcaseRepos(limited)).toEqual([]);
    expect(await fetchShowcaseReposOrNull(offline)).toBeNull();
  });
});

describe("ordem e destaques", () => {
  const curated = [
    project({ slug: "curado-off", repositoryUrl: "https://github.com/renanfrontend/curado-off" }),
    project({ slug: "curado-no-ar", status: "live", liveUrl: "https://a.example", repositoryUrl: "https://github.com/renanfrontend/curado" }),
  ];
  const fromGithub = [
    project({ slug: "curado", repositoryUrl: "https://github.com/renanfrontend/curado", fromGithub: true }),
    project({ slug: "novo-antigo", fromGithub: true, updatedAt: "2026-01-01" }),
    project({ slug: "novo-no-ar", fromGithub: true, status: "live", liveUrl: "https://b.example", updatedAt: "2026-10-01", featured: true }),
  ];

  it("não duplica repositórios curados e põe os projetos no ar primeiro", () => {
    expect(mergeProjects(curated, fromGithub).map((p) => p.slug)).toEqual(["curado-no-ar", "novo-no-ar", "curado-off", "novo-antigo"]);
  });

  it("ordena os projetos no ar pela ordem de destaque", () => {
    expect(mergeProjects(curated, fromGithub, ["novo-no-ar"]).map((p) => p.slug)).toEqual(["novo-no-ar", "curado-no-ar", "curado-off", "novo-antigo"]);
  });

  it("destaca a ordem definida à mão e depois os marcados no GitHub, só os que estão no ar", () => {
    const all = mergeProjects(curated, fromGithub);
    expect(pickHighlights(all, ["curado-off", "curado-no-ar"], 6).map((p) => p.slug)).toEqual(["curado-no-ar", "novo-no-ar"]);
    expect(pickHighlights(all, ["curado-no-ar"], 1).map((p) => p.slug)).toEqual(["curado-no-ar"]);
  });
});
