import { expect, test } from "./fixtures";

const cards = (page: import("@playwright/test").Page) => page.getByRole("main").getByRole("article");

test.describe("busca e filtros de projetos", () => {
  test("filtros ficam na URL, funcionam com voltar/avançar e ao abrir o link direto", async ({ page }) => {
    await page.goto("/pt-BR/projetos", { waitUntil: "networkidle" });
    const total = await cards(page).count();
    expect(total).toBeGreaterThanOrEqual(3);

    await page.getByLabel("Categoria", { exact: true }).selectOption("ai");
    await expect(page).toHaveURL(/categoria=ai/);
    const aiCount = await cards(page).count();
    expect(aiCount).toBeLessThan(total);

    await page.getByLabel("Tecnologia", { exact: true }).selectOption("Next.js");
    await expect(page).toHaveURL(/tecnologia=Next\.js/);

    await page.goBack();
    await expect(page).not.toHaveURL(/tecnologia=/);
    await expect(cards(page)).toHaveCount(aiCount);

    await page.goForward();
    await expect(page).toHaveURL(/tecnologia=Next\.js/);

    // Link compartilhado abre com os mesmos filtros.
    await page.goto("/pt-BR/projetos?categoria=ai");
    await expect(page.getByLabel("Categoria", { exact: true })).toHaveValue("ai");
    await expect(cards(page)).toHaveCount(aiCount);
  });

  test("busca textual, estado vazio e limpeza de filtros", async ({ page }) => {
    await page.goto("/pt-BR/projetos");
    const total = await cards(page).count();

    await page.getByLabel("Buscar projetos").fill("logiflow");
    await expect(page).toHaveURL(/q=logiflow/);
    await expect(cards(page)).toHaveCount(1);

    await page.getByLabel("Buscar projetos").fill("nada-com-isso-xyz");
    await expect(page.getByRole("heading", { name: "Nenhum projeto encontrado" })).toBeVisible();

    await page.getByRole("button", { name: "Limpar filtros" }).last().click();
    await expect(cards(page)).toHaveCount(total);
    await expect(page).toHaveURL(/\/pt-BR\/projetos$/);
  });

  test("parâmetros inválidos não quebram a página", async ({ page }) => {
    await page.goto("/pt-BR/projetos?categoria=<script>&tecnologia=COBOL");
    await expect(page.getByRole("heading", { level: 1, name: "Projetos" })).toBeVisible();
    await expect(page.getByLabel("Categoria", { exact: true })).toHaveValue("");
  });

  test("trocar idioma preserva os filtros", async ({ page }) => {
    await page.goto("/pt-BR/projetos?categoria=dashboard");
    await page.getByRole("link", { name: "Ler em inglês" }).click();
    await expect(page).toHaveURL(/\/en\/projetos\?categoria=dashboard/);
    await expect(page.getByLabel("Category", { exact: true })).toHaveValue("dashboard");
  });

  test("estudo de caso abre a partir do card", async ({ page }) => {
    await page.goto("/pt-BR/projetos", { waitUntil: "networkidle" });
    await page.getByRole("link", { name: "VisionStock", exact: true }).click();
    await expect(page).toHaveURL(/\/pt-BR\/projetos\/visionstock-ai$/);
    await expect(page.getByRole("heading", { name: "Minha contribuição" })).toBeVisible();
  });
});
