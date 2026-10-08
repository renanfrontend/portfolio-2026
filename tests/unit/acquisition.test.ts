import { describe, expect, it } from "vitest";
import { acquisitionFromUrl, publicPagePath } from "@/lib/acquisition";
import { createContactSchema } from "@/features/contact/schemas/contact-schema";

describe("acquisition privacy boundaries", () => {
  it("keeps campaign slugs and external host, never full URLs or arbitrary parameters", () => {
    expect(acquisitionFromUrl(
      "https://example.com/pt-BR/servicos/automacao-ia?utm_source=linkedin&utm_medium=social&utm_campaign=ia_2026&email=private@example.com#secret",
      "https://www.google.com/search?q=private@example.com",
    )).toEqual({ landingPage: "/pt-BR/servicos/automacao-ia", referrerHost: "www.google.com", source: "linkedin", medium: "social", campaign: "ia_2026" });
  });
  it("drops email-shaped campaign values and same-site referrals", () => {
    const data = acquisitionFromUrl("https://example.com/pt-BR?utm_source=private%40example.com", "https://example.com/en");
    expect(data.source).toBeUndefined();
    expect(data.referrerHost).toBeUndefined();
    expect(publicPagePath("/account/private@example.com")).toBe("/");
    // Páginas de contratação contam como páginas próprias, não como a página inicial.
    expect(publicPagePath("/pt-BR/contratar")).toBe("/pt-BR/contratar");
    expect(publicPagePath("/pt-BR/contratar/sucesso?session_id=cs_test_x")).toBe("/pt-BR/contratar/sucesso");
  });
  it("invalid attribution cannot prevent a valid enquiry", () => {
    const result = createContactSchema(["automacao-ia"]).safeParse({
      name: "Test User", email: "test@example.com", service: "automacao-ia",
      message: "Preciso automatizar os pedidos da empresa.", acquisition: { landingPage: 123 },
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.acquisition).toBeUndefined();
  });
});
