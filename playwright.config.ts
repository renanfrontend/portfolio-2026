import { defineConfig, devices } from "@playwright/test";

const PORT = 3300;

/**
 * Testes E2E contra o build de verificação (rode `npm run build:check` antes).
 * O servidor usa o adaptador de e-mail de teste: nenhuma mensagem real é enviada.
 * No Windows usa o Microsoft Edge instalado; em outros ambientes, o Chromium do Playwright
 * (`npx playwright install chromium`). Ajuste com PW_CHANNEL.
 */
const channel = process.env.PW_CHANNEL ?? (process.platform === "win32" ? "msedge" : undefined);

export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  reporter: [["list"]],
  // Com a suíte inteira em paralelo, navegações num build de produção local passam de 5 s.
  expect: { timeout: 15_000 },
  use: {
    baseURL: `http://localhost:${PORT}`,
    channel,
    trace: "retain-on-failure",
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], channel } },
    { name: "mobile", use: { ...devices["Pixel 7"], channel }, testMatch: /navigation\.spec\.ts/ },
  ],
  webServer: {
    command: `npx next start --port ${PORT}`,
    url: `http://localhost:${PORT}/pt-BR`,
    reuseExistingServer: false,
    timeout: 120_000,
    // Variáveis do processo têm prioridade sobre o .env.local: os testes nunca chamam o Stripe de verdade.
    env: {
      EMAIL_PROVIDER: "test",
      NEXT_PUBLIC_SITE_URL: "",
      NEXT_DIST_DIR: ".next-check",
      GITHUB_SHOWCASE: "off",
      STRIPE_SECRET_KEY: "",
      STRIPE_WEBHOOK_SECRET: "",
    },
  },
});
