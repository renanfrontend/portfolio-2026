import { describe, expect, it } from "vitest";
import { resolveInitialService } from "@/features/contact/service-param";
import {
  collectCategories,
  collectTechnologies,
  filterProjects,
  parseProjectFilters,
  serializeProjectFilters,
} from "@/features/projects/filters";
import type { Project } from "@/features/projects/types";
import { localePath, switchLocalePath } from "@/lib/links";

const project = (overrides: Partial<Project>): Project => ({
  id: "x",
  slug: "x",
  title: "Projeto",
  summary: "Resumo",
  category: "web",
  technologies: ["React"],
  kind: "personal",
  featured: false,
  gallery: [],
  challenge: "",
  solution: "",
  contribution: "",
  outcomes: [],
  ...overrides,
});

const projects = [
  project({ slug: "logiflow", title: "LogiFlow 3D", category: "dashboard", technologies: ["React", "Three.js"] }),
  project({ slug: "vision", title: "VisionStock", summary: "Catálogo com IA", category: "ai", technologies: ["Next.js", "Zod"] }),
];

describe("filtros de projetos", () => {
  const techs = collectTechnologies(projects);

  it("lê filtros válidos e ignora valores desconhecidos", () => {
    const params = new URLSearchParams("q=%20react%20&categoria=ai&tecnologia=three.js");
    expect(parseProjectFilters(params, techs)).toEqual({ q: "react", category: "ai", tech: "Three.js" });
    expect(parseProjectFilters(new URLSearchParams("categoria=games&tecnologia=COBOL"), techs)).toEqual({
      q: "",
      category: null,
      tech: null,
    });
  });

  it("limita o tamanho da busca", () => {
    expect(parseProjectFilters(new URLSearchParams(`q=${"a".repeat(200)}`), techs).q).toHaveLength(80);
  });

  it("filtra por texto sem diferenciar acentos, por categoria e por tecnologia", () => {
    expect(filterProjects(projects, { q: "catalogo", category: null, tech: null }).map((p) => p.slug)).toEqual(["vision"]);
    expect(filterProjects(projects, { q: "", category: "dashboard", tech: null }).map((p) => p.slug)).toEqual(["logiflow"]);
    expect(filterProjects(projects, { q: "", category: null, tech: "Zod" }).map((p) => p.slug)).toEqual(["vision"]);
    expect(filterProjects(projects, { q: "", category: "ai", tech: "Three.js" })).toEqual([]);
  });

  it("serializa apenas filtros preenchidos", () => {
    expect(serializeProjectFilters({ q: "", category: null, tech: null })).toBe("");
    expect(serializeProjectFilters({ q: "3d", category: "web", tech: "Next.js" })).toBe("q=3d&categoria=web&tecnologia=Next.js");
  });

  it("lista só as categorias que têm projetos", () => {
    expect(collectCategories(projects)).toEqual(["dashboard", "ai"]);
  });
});

describe("parâmetro de serviço do contato", () => {
  const slugs = ["desenvolvimento-web", "automacao-ia"];

  it("pré-seleciona apenas serviços existentes", () => {
    expect(resolveInitialService("automacao-ia", slugs)).toBe("automacao-ia");
    expect(resolveInitialService(" AUTOMACAO-IA ", slugs)).toBe("automacao-ia");
    expect(resolveInitialService("<script>", slugs)).toBeUndefined();
    expect(resolveInitialService(null, slugs)).toBeUndefined();
  });
});

describe("links por idioma", () => {
  it("troca o idioma preservando o caminho", () => {
    expect(switchLocalePath("/pt-BR/projetos/logiflow", "en")).toBe("/en/projetos/logiflow");
    expect(switchLocalePath("/en", "pt-BR")).toBe("/pt-BR");
    expect(localePath("en", "/contato")).toBe("/en/contato");
  });
});
