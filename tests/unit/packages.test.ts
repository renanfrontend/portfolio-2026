import { describe, expect, it } from "vitest";
import { servicePackages } from "@/content/packages";
import { buildMessage } from "@/features/contact/server/submit-contact";
import { formatPrice, getPackages, hireHref } from "@/features/packages/packages";
import { getServiceSlugs } from "@/features/services/server/queries";

describe("pacotes de contratação", () => {
  it("tem de 3 a 4 pacotes com os campos obrigatórios nos dois idiomas", () => {
    expect(servicePackages.length).toBeGreaterThanOrEqual(3);
    expect(servicePackages.length).toBeLessThanOrEqual(4);
    for (const locale of ["pt-BR", "en"] as const) {
      for (const item of getPackages(locale)) {
        expect(item.id).toMatch(/^[a-z0-9-]+$/);
        expect(item.name.length).toBeGreaterThan(3);
        expect(item.description.length).toBeGreaterThan(20);
        expect(item.deliverables.length).toBeGreaterThanOrEqual(3);
        expect(["available", "limited", "unavailable"]).toContain(item.status);
      }
    }
  });

  it("aponta cada pacote para um serviço existente", () => {
    const slugs = getServiceSlugs();
    for (const item of servicePackages) expect(slugs).toContain(item.serviceSlug);
  });

  it("formata o preço em reais e trata o valor ausente como sob consulta", () => {
    expect(formatPrice(12000, "pt-BR")?.replace(/\s/g, " ")).toBe("R$ 12.000");
    expect(formatPrice(1999.9, "pt-BR")?.replace(/\s/g, " ")).toBe("R$ 1.999,90");
    expect(formatPrice(null, "pt-BR")).toBeNull();
  });

  it("monta o link de contratação com serviço e pacote", () => {
    expect(hireHref({ id: "setup-mvp", serviceSlug: "desenvolvimento-web" }, "pt-BR")).toBe(
      "/pt-BR/contato?servico=desenvolvimento-web&pacote=setup-mvp",
    );
  });

  it("cita o pacote no e-mail só quando ele é conhecido", () => {
    const base = { name: "Ana", email: "ana@example.com", company: undefined, phone: undefined, timeline: undefined, service: "desenvolvimento-web", message: "Quero contratar o pacote." };
    const labels = { services: { "desenvolvimento-web": "Sites" }, packages: { "setup-mvp": "Setup / MVP" } };
    expect(buildMessage({ ...base, package: "setup-mvp" }, "x@example.com", labels).subject).toBe("[Site] Contratar Setup / MVP: contato de Ana");
    expect(buildMessage({ ...base, package: "inexistente" }, "x@example.com", labels).text).not.toContain("Pacote:");
  });
});
