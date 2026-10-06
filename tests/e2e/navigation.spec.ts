import { expect, test } from "./fixtures";

test.describe("rotas e idioma", () => {
  test("/ redireciona para /pt-BR e seções sem idioma recebem o prefixo", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/pt-BR$/);
    await expect(page.locator("html")).toHaveAttribute("lang", "pt-BR");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Renan");

    await page.goto("/projetos");
    await expect(page).toHaveURL(/\/pt-BR\/projetos$/);
  });

  test("/en funciona com lang correto", async ({ page }) => {
    await page.goto("/en");
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await expect(page.getByText("Senior Frontend Developer").first()).toBeVisible();
  });

  test("idioma inválido, página e slug inexistentes respondem 404", async ({ page }) => {
    for (const path of ["/fr", "/fr/sobre", "/pt-BR/nao-existe", "/pt-BR/projetos/nao-existe", "/en/servicos/nao-existe"]) {
      const response = await page.goto(path);
      expect(response?.status(), path).toBe(404);
    }
  });

  test("acesso direto e refresh em um estudo de caso", async ({ page }) => {
    await page.goto("/en/projetos/logiflow-3d");
    await expect(page.getByRole("heading", { level: 1, name: "LogiFlow 3D" })).toBeVisible();
    await page.reload();
    await expect(page.getByRole("heading", { level: 1, name: "LogiFlow 3D" })).toBeVisible();
  });

  test("navegação principal leva às páginas e troca de idioma mantém a página", async ({ page, isMobile }) => {
    await page.goto("/pt-BR");
    if (isMobile) await page.getByRole("button", { name: "Abrir menu" }).click();
    await page.getByRole("navigation", { name: "Navegação principal" }).getByRole("link", { name: "Serviços" }).click();
    await expect(page).toHaveURL(/\/pt-BR\/servicos$/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Como posso ajudar a sua empresa");

    await page.getByRole("link", { name: "Ler em inglês" }).click();
    await expect(page).toHaveURL(/\/en\/servicos$/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("How I can help your company");
  });

  test("não há rolagem horizontal", async ({ page }) => {
    for (const path of ["/pt-BR", "/pt-BR/projetos", "/pt-BR/contato"]) {
      await page.goto(path);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      expect(overflow, path).toBeLessThanOrEqual(0);
    }
  });
});

test.describe("tema", () => {
  test("começa escuro e a escolha persiste após recarregar", async ({ page }) => {
    await page.goto("/pt-BR");
    const html = page.locator("html");
    await expect(html).toHaveAttribute("data-theme", "dark");
    await page.getByRole("button", { name: /Alterar tema/ }).click();
    await expect(html).toHaveAttribute("data-theme", "light");
    await page.reload();
    await expect(html).toHaveAttribute("data-theme", "light");
  });
});

test.describe("abertura", () => {
  test.use({ withIntro: true });

  test("aparece na primeira visita, pode ser pulada com Esc e não volta na sessão", async ({ page }) => {
    await page.goto("/pt-BR");
    const intro = page.locator(".intro");
    await expect(intro).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(intro).toBeHidden();
    await page.reload();
    await expect(intro).toBeHidden();
  });
});
