import { describe, expect, it } from "vitest";
import { whatsappMessageFor } from "@/lib/whatsapp-message";

const templates = {
  default: "geral",
  service: "serviço *{service}*",
  project: "projeto *{project}*",
  about: "vaga",
};
const context = { services: { "automacao-ia": "Automação com IA" }, projects: { "visionstock-ai": "VisionStock" } };

describe("mensagem do WhatsApp por página", () => {
  it("cita o serviço ou o projeto da página", () => {
    expect(whatsappMessageFor("/pt-BR/servicos/automacao-ia", templates, context)).toBe("serviço *Automação com IA*");
    expect(whatsappMessageFor("/en/projetos/visionstock-ai", templates, context)).toBe("projeto *VisionStock*");
  });

  it("usa a mensagem de vaga na página Sobre", () => {
    expect(whatsappMessageFor("/pt-BR/sobre", templates, context)).toBe("vaga");
  });

  it("cai na mensagem geral nos demais casos", () => {
    for (const path of ["/pt-BR", "/pt-BR/servicos", "/pt-BR/projetos/inexistente", null]) {
      expect(whatsappMessageFor(path, templates, context)).toBe("geral");
    }
  });
});
