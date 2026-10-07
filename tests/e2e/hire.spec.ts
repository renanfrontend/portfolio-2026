import { expect, test } from "./fixtures";

test.describe("contratação de serviços", () => {
  test("mostra os pacotes com preço, parcelamento, prazo e botões", async ({ page }) => {
    await page.goto("/pt-BR/contratar");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Escolha como começar");
    await expect(page.getByRole("main").getByRole("article")).toHaveCount(4);
    // MVP conversa no WhatsApp; os outros três vão para o formulário.
    await expect(page.getByRole("link", { name: /Contratar Serviço/ })).toHaveCount(3);
    await expect(page.getByText("ou parcelado no cartão")).toHaveCount(2);
    await expect(page.getByText("Mais popular")).toBeVisible();
    await expect(page.getByText("Dúvidas sobre a contratação")).toBeVisible();
  });

  test("Setup / MVP abre uma conversa no WhatsApp com briefing", async ({ page }) => {
    await page.goto("/pt-BR/contratar");
    const talk = page.getByRole("link", { name: /Falar sobre o projeto\s*:\s*Setup \/ MVP/ });
    const href = decodeURIComponent((await talk.getAttribute("href")) ?? "");
    expect(href).toContain("https://wa.me/");
    expect(href).toContain("*Setup / MVP*");
  });

  test("o botão de contratar leva ao contato com serviço e mensagem preenchidos", async ({ page }) => {
    await page.goto("/pt-BR/contratar", { waitUntil: "networkidle" });
    await page.getByRole("link", { name: /Contratar Serviço\s*:\s*Diagnóstico Técnico/ }).click();
    await expect(page).toHaveURL(/\/pt-BR\/contato\?servico=consultoria-frontend&pacote=diagnostico-tecnico$/);
    await expect(page.getByLabel("Serviço de interesse")).toHaveValue("consultoria-frontend");
    await expect(page.getByLabel("Descreva a sua necessidade")).toHaveValue("Quero contratar o pacote: Diagnóstico Técnico.");
  });

  test("a página de serviços leva aos pacotes e /contratar sem idioma redireciona", async ({ page }) => {
    await page.goto("/pt-BR/servicos", { waitUntil: "networkidle" });
    await page.getByRole("link", { name: "Ver pacotes" }).click();
    await expect(page).toHaveURL(/\/pt-BR\/contratar$/);
    await page.goto("/contratar");
    await expect(page).toHaveURL(/\/pt-BR\/contratar$/);
  });
});
