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

  test("sem JavaScript, o botão de contratar continua levando ao formulário de contato", async ({ page }) => {
    await page.goto("/pt-BR/contratar");
    const button = page.getByRole("link", { name: /Contratar Serviço\s*:\s*Diagnóstico Técnico/ });
    await expect(button).toHaveAttribute("href", "/pt-BR/contato?servico=consultoria-frontend&pacote=diagnostico-tecnico");
  });

  test("o modal valida, aplica a máscara e conclui a pré-contratação", async ({ page }) => {
    await page.goto("/pt-BR/contratar", { waitUntil: "networkidle" });
    await page.getByRole("link", { name: /Contratar Serviço\s*:\s*Diagnóstico Técnico/ }).click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog).toHaveAccessibleName("Contratar serviço");
    await expect(dialog.getByText("Diagnóstico Técnico").first()).toBeVisible();
    await expect(dialog.getByText(/R\$\s?1\.900/)).toBeVisible();

    // Avançar vazio mostra os erros e foca o primeiro campo.
    await dialog.getByRole("button", { name: "Avançar para pagamento" }).click();
    await expect(dialog.getByText("Revise os campos destacados.")).toBeVisible();
    await expect(dialog.getByLabel("Nome completo")).toBeFocused();

    await dialog.getByLabel("Nome completo").fill("Cliente de Teste");
    await dialog.getByLabel("E-mail").fill("cliente@example.com");
    await dialog.getByLabel("WhatsApp").pressSequentially("11987654321");
    await expect(dialog.getByLabel("WhatsApp")).toHaveValue("(11) 98765-4321");
    await dialog.getByLabel(/Conte brevemente/).fill("Quero melhorar a performance do meu site.");

    const response = page.waitForResponse("**/api/pre-contratacao");
    await dialog.getByRole("button", { name: "Avançar para pagamento" }).click();
    expect((await response).status()).toBe(200);
    await expect(dialog.getByRole("heading", { name: /Pedido RA-[0-9A-Z]+-[0-9A-Z]+ recebido/ })).toBeVisible();

    // Pedido guardado para a etapa de pagamento, com o valor do servidor.
    const stored = await page.evaluate(() => JSON.parse(sessionStorage.getItem("pre-hire-checkout") ?? "null"));
    expect(stored.package.id).toBe("diagnostico-tecnico");
    expect(stored.package.amountInCents).toBe(190000);
    expect(stored.customer.phone).toBe("+5511987654321");

    await dialog.getByRole("button", { name: "Concluir" }).click();
    await expect(dialog).toBeHidden();
  });

  test("falha do servidor mantém os dados e Esc fecha o modal", async ({ page }) => {
    await page.route("**/api/pre-contratacao", (route) =>
      route.fulfill({ status: 503, contentType: "application/json", body: JSON.stringify({ ok: false, error: "unavailable" }) }),
    );
    await page.goto("/pt-BR/contratar", { waitUntil: "networkidle" });
    await page.getByRole("link", { name: /Contratar Serviço\s*:\s*Pacote de Horas/ }).click();
    const dialog = page.getByRole("dialog");
    await dialog.getByLabel("Nome completo").fill("Cliente de Teste");
    await dialog.getByLabel("E-mail").fill("cliente@example.com");
    await dialog.getByLabel("WhatsApp").fill("11987654321");
    await dialog.getByLabel(/Conte brevemente/).fill("Preciso de revisão de código no projeto.");
    await dialog.getByRole("button", { name: "Avançar para pagamento" }).click();
    await expect(dialog.getByText(/Não foi possível registrar agora/)).toBeVisible();
    await expect(dialog.getByLabel("Nome completo")).toHaveValue("Cliente de Teste");
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
  });

  test("a página de serviços leva aos pacotes e /contratar sem idioma redireciona", async ({ page }) => {
    await page.goto("/pt-BR/servicos", { waitUntil: "networkidle" });
    await page.getByRole("link", { name: "Ver pacotes" }).click();
    await expect(page).toHaveURL(/\/pt-BR\/contratar$/);
    await page.goto("/contratar");
    await expect(page).toHaveURL(/\/pt-BR\/contratar$/);
  });
});
