import { expect, test } from "./fixtures";

const message = "Preciso de um dashboard para acompanhar pedidos e estoque da operação.";

async function fillRequired(page: import("@playwright/test").Page) {
  await page.waitForLoadState("networkidle");
  await page.getByLabel("Nome").fill("Cliente de Teste");
  await page.getByRole("textbox", { name: /^E-mail/ }).fill("cliente@example.com");
  await page.getByLabel("Descreva a sua necessidade").fill(message);
}

test.describe("serviço até o contato", () => {
  test("CTA do serviço pré-seleciona o serviço no formulário", async ({ page }) => {
    await page.goto("/pt-BR/servicos/automacao-ia");
    await page.getByRole("link", { name: "Conversar sobre automação" }).first().click();
    await expect(page).toHaveURL(/\/pt-BR\/contato\?servico=automacao-ia$/);
    await expect(page.getByLabel("Serviço de interesse")).toHaveValue("automacao-ia");
  });

  test("parâmetro desconhecido não pré-seleciona nada", async ({ page }) => {
    await page.goto("/pt-BR/contato?servico=nao-existe");
    await expect(page.getByLabel("Serviço de interesse")).toHaveValue("");
  });
});

test.describe("formulário de contato", () => {
  test("valida no cliente e foca o primeiro campo inválido", async ({ page }) => {
    await page.goto("/pt-BR/contato");
    await page.getByRole("button", { name: "Enviar mensagem" }).click();
    await expect(page.getByText("Revise os campos destacados.")).toBeVisible();
    await expect(page.getByLabel("Nome")).toBeFocused();
    await expect(page.getByLabel("Nome")).toHaveAttribute("aria-invalid", "true");
  });

  test("envia com sucesso pelo adaptador de teste", async ({ page }) => {
    await page.goto("/pt-BR/contato?servico=desenvolvimento-web");
    await fillRequired(page);
    const responsePromise = page.waitForResponse("**/api/contact");
    await page.getByRole("button", { name: "Enviar mensagem" }).click();
    expect((await responsePromise).status()).toBe(200);
    await expect(page.getByRole("heading", { name: "Mensagem enviada" })).toBeVisible();
  });

  test("indisponibilidade não mostra sucesso e preserva o texto", async ({ page }) => {
    await page.route("**/api/contact", (route) =>
      route.fulfill({ status: 503, contentType: "application/json", body: JSON.stringify({ ok: false, error: "unavailable" }) }),
    );
    await page.goto("/pt-BR/contato?servico=desenvolvimento-web");
    await fillRequired(page);
    await page.getByRole("button", { name: "Enviar mensagem" }).click();
    await expect(page.getByText(/indisponível no momento/)).toBeVisible();
    await expect(page.getByRole("link", { name: /Enviar por e-mail/ })).toBeVisible();
    await expect(page.getByLabel("Descreva a sua necessidade")).toHaveValue(message);
    await expect(page.getByRole("heading", { name: "Mensagem enviada" })).toHaveCount(0);
  });

  test("limite de requisições informa o usuário", async ({ page }) => {
    await page.route("**/api/contact", (route) =>
      route.fulfill({ status: 429, contentType: "application/json", body: JSON.stringify({ ok: false, error: "rate_limited" }) }),
    );
    await page.goto("/en/contato?servico=integracoes");
    await page.waitForLoadState("networkidle");
    await page.getByRole("textbox", { name: /^Name/ }).fill("Test Client");
    await page.getByRole("textbox", { name: /^Email/ }).fill("client@example.com");
    await page.getByLabel("Describe what you need").fill(message);
    await page.getByRole("button", { name: "Send message" }).click();
    await expect(page.getByText(/Too many attempts/)).toBeVisible();
  });

  test("falha de rede preserva o texto", async ({ page }) => {
    await page.route("**/api/contact", (route) => route.abort("failed"));
    await page.goto("/pt-BR/contato?servico=desenvolvimento-web");
    await fillRequired(page);
    await page.getByRole("button", { name: "Enviar mensagem" }).click();
    await expect(page.getByText(/Não foi possível conectar/)).toBeVisible();
    await expect(page.getByLabel("Descreva a sua necessidade")).toHaveValue(message);
  });

  test("API rejeita dados inválidos com 400", async ({ request }) => {
    const response = await request.post("/api/contact", { data: { name: "x", email: "y" } });
    expect(response.status()).toBe(400);
    expect(await response.json()).toMatchObject({ ok: false, error: "validation" });
  });
});
