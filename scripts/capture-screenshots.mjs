// Captura screenshots das demonstrações públicas dos projetos para public/images/projects.
// Uso: node scripts/capture-screenshots.mjs  (requer Microsoft Edge ou Chrome instalado)
import { chromium } from "@playwright/test";

const targets = [
  { file: "logiflow.png", url: "https://renanfrontend.github.io/logiflow-3d/", wait: 6000 },
  { file: "visionstock.png", url: "https://visionstock-ai-nine.vercel.app", wait: 5000 },
  { file: "fnaf.png", url: "https://renanfrontend.github.io/fnaf-web/", wait: 6000 },
];

const channel = process.env.PW_CHANNEL ?? "msedge";
const browser = await chromium.launch({ channel });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, colorScheme: "dark" });

const only = process.argv[2];
for (const target of targets.filter((item) => !only || item.file === only)) {
  await page.goto(target.url, { waitUntil: "networkidle", timeout: 60_000 });
  await page.waitForTimeout(target.wait);
  await page.screenshot({ path: `public/images/projects/${target.file}` });
  console.log("ok", target.file);
}

await browser.close();
