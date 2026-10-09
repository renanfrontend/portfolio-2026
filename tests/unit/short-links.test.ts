import { afterEach, describe, expect, it, vi } from "vitest";
import { acquisitionFromUrl } from "@/lib/acquisition";
import { INSTAGRAM_WHATSAPP_MESSAGE, resolveShortLink } from "@/lib/short-links";

const INSTAGRAM_CAMPAIGN = "utm_source=instagram&utm_medium=social&utm_campaign=bio";

afterEach(() => { vi.unstubAllEnvs(); });

describe("atalhos de bio", () => {
  it("/ig abre a página inicial com a campanha da bio do Instagram", () => {
    const destination = resolveShortLink("/ig");
    expect(destination).toBe(`/pt-BR?${INSTAGRAM_CAMPAIGN}`);
    // A origem chega inteira ao pedido feito pelo formulário.
    expect(acquisitionFromUrl(`https://www.renanaugusto.com.br${destination}`, "")).toMatchObject({
      landingPage: "/pt-BR",
      source: "instagram",
      medium: "social",
      campaign: "bio",
    });
  });

  it("/whatsapp abre a conversa com a mensagem que identifica o Instagram", () => {
    vi.stubEnv("NEXT_PUBLIC_WHATSAPP_NUMBER", "5511987654321");
    const url = new URL(resolveShortLink("/whatsapp") ?? "");
    expect(`${url.origin}${url.pathname}`).toBe("https://wa.me/5511987654321");
    expect(url.searchParams.get("text")).toBe(INSTAGRAM_WHATSAPP_MESSAGE);
  });

  it("sem número válido, /whatsapp cai no formulário de contato com a mesma campanha", () => {
    vi.stubEnv("NEXT_PUBLIC_WHATSAPP_NUMBER", "1234");
    expect(resolveShortLink("/whatsapp")).toBe(`/pt-BR/contato?${INSTAGRAM_CAMPAIGN}`);
  });

  it("aceita barra final e maiúsculas", () => {
    expect(resolveShortLink("/IG/")).toBe(resolveShortLink("/ig"));
  });

  it("ignora caminhos que não são atalhos", () => {
    for (const path of ["/", "/pt-BR", "/pt-BR/ig", "/igreja", "/whatsapp/extra", "/toString", "/constructor"]) {
      expect(resolveShortLink(path)).toBeNull();
    }
  });
});
