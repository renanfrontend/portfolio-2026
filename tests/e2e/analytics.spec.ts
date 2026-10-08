import { expect, test } from "./fixtures";
import type { Page } from "@playwright/test";

test.use({ analyticsPrompt: true });

async function events(page: Page, name: string) {
  return page.evaluate((eventName) => (window.dataLayer ?? []).map((entry) => Array.from(entry as ArrayLike<unknown>)).filter((entry) =>
    entry[0] === "event" && entry[1] === eventName,
  ), name);
}

test.beforeEach(async ({ page }) => {
  // Exercise the real loader without contacting Google or sending production data.
  await page.route("https://www.googletagmanager.com/**", (route) => route.fulfill({ contentType: "application/javascript", body: "/* offline analytics test */" }));
  await page.route(/https:\/\/[^/]*google-analytics\.com\//, (route) => route.abort());
});

test("no tag before consent or after refusal; accepting tracks navigation once", async ({ page }) => {
  await page.goto("/pt-BR?utm_source=linkedin&utm_medium=social&utm_campaign=portfolio");
  await expect(page.getByRole("button", { name: "Continuar sem permitir" })).toBeVisible();
  await expect(page.locator('script[src*="googletagmanager"]')).toHaveCount(0);
  await page.getByRole("button", { name: "Continuar sem permitir" }).click();
  expect(await events(page, "page_view")).toHaveLength(0);
  await expect(page.locator('script[src*="googletagmanager"]')).toHaveCount(0);
  await page.getByRole("button", { name: "Preferências de estatísticas" }).click();
  await expect.poll(async () => (await events(page, "page_view")).length).toBe(1);
  await page.getByRole("link", { name: "Solicitar orçamento", exact: true }).click();
  await expect(page).toHaveURL(/\/pt-BR\/contato$/);
  await expect.poll(async () => (await events(page, "page_view")).length).toBe(2);
  const data = await page.evaluate(() => JSON.stringify(window.dataLayer));
  expect(data).not.toContain("?utm_");
  await page.getByRole("button", { name: "Preferências de estatísticas" }).click();
  await page.waitForLoadState("load");
  await expect(page.locator('script[src*="googletagmanager"]')).toHaveCount(0);
  expect(await page.evaluate(() => sessionStorage.getItem("portfolio-acquisition-v1"))).toBeNull();
});

test("form errors never count as leads; success sends no personal form fields to GA", async ({ page }) => {
  await page.goto("/pt-BR/contato?servico=automacao-ia&utm_source=linkedin&email=secret@example.com");
  await page.getByRole("button", { name: "Permitir estatísticas", exact: true }).click();
  await expect.poll(async () => (await events(page, "page_view")).length).toBe(1);
  await page.getByRole("button", { name: "Enviar mensagem" }).click();
  expect(await events(page, "generate_lead")).toHaveLength(0);
  await page.getByLabel("Nome").fill("Private Person");
  await page.getByRole("textbox", { name: /^E-mail/ }).fill("private@example.com");
  await page.getByLabel("Descreva a sua necessidade").fill("Private message: preciso automatizar os pedidos da empresa.");
  await page.route("**/api/contact", (route) => route.fulfill({ status: 503, contentType: "application/json", body: '{"ok":false,"error":"unavailable"}' }));
  await page.getByRole("button", { name: "Enviar mensagem" }).click();
  await expect(page.getByText(/indisponível no momento/)).toBeVisible();
  expect(await events(page, "generate_lead")).toHaveLength(0);
  await page.unroute("**/api/contact");
  const request = page.waitForRequest("**/api/contact");
  await page.getByRole("button", { name: "Enviar mensagem" }).click();
  expect((await request).postDataJSON().acquisition).toMatchObject({ source: "linkedin", landingPage: "/pt-BR/contato" });
  await expect(page.getByRole("heading", { name: "Mensagem enviada" })).toBeVisible();
  expect(await events(page, "generate_lead")).toHaveLength(1);
  expect(await events(page, "contact_start")).toHaveLength(1);
  const data = await page.evaluate(() => JSON.stringify(window.dataLayer));
  expect(data).not.toMatch(/Private Person|Private message|private@example|secret@example|servico=/);
});

test("WhatsApp is a click only and a refused visit submits without attribution", async ({ page }) => {
  await page.goto("/pt-BR/contato?servico=automacao-ia");
  await page.getByRole("button", { name: "Permitir estatísticas", exact: true }).click();
  await expect.poll(async () => (await events(page, "page_view")).length).toBe(1);
  // Cancel navigation only; the production delegated click handler still runs.
  await page.evaluate(() => {
    const a = document.createElement("a");
    a.href = "https://wa.me/5511000000000?text=private-message";
    a.addEventListener("click", (event) => event.preventDefault());
    document.body.appendChild(a);
    a.click();
    a.remove();
  });
  expect(await events(page, "whatsapp_click")).toHaveLength(1);
  expect(await events(page, "generate_lead")).toHaveLength(0);
  expect(await page.evaluate(() => JSON.stringify(window.dataLayer))).not.toContain("private-message");
  await page.getByRole("button", { name: "Preferências de estatísticas" }).click();
  await page.waitForLoadState("load");
  await page.getByLabel("Nome").fill("Test Person");
  await page.getByRole("textbox", { name: /^E-mail/ }).fill("test@example.com");
  await page.getByLabel("Descreva a sua necessidade").fill("Preciso automatizar os pedidos recebidos no meu site.");
  const request = page.waitForRequest("**/api/contact");
  await page.getByRole("button", { name: "Enviar mensagem" }).click();
  expect((await request).postDataJSON()).not.toHaveProperty("acquisition");
  await expect(page.getByRole("heading", { name: "Mensagem enviada" })).toBeVisible();
  expect(await events(page, "generate_lead")).toHaveLength(0);
});
