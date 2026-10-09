// Captura a tela real do site publicado de cada projeto importado do GitHub (GitHub Pages, Netlify ou Vercel).
// As imagens vão para public/images/projects/github/<slug>.png (1440x900, como as capas curadas) e a lista
// para src/content/github-covers.ts, que o site usa no lugar do cartão do repositório.
//
// Uso: node scripts/capture-github-covers.mjs [slug]   (requer Microsoft Edge ou Chrome; PW_CHANNEL troca o navegador)
// Rode de novo quando entrar um projeto novo com site publicado. Sem captura, o site mostra o cartão do GitHub.
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { chromium } from "@playwright/test";
import { fetchShowcaseReposOrNull } from "../src/lib/github-showcase.ts";

const HOSTED = /(^|\.)(github\.io|netlify\.app|vercel\.app)$/i;
const OUT_DIR = "public/images/projects/github";
const only = process.argv[2];

// Projetos curados já têm captura própria em public/images/projects.
const base = await readFile("src/content/projects-base.ts", "utf8");
const curated = new Set([...base.matchAll(/github\("([^"]+)"\)/g)].map((match) => match[1].toLowerCase()));

const repos = await fetchShowcaseReposOrNull();
if (!repos) throw new Error("Não foi possível ler os repositórios do GitHub (limite da API? defina GITHUB_TOKEN).");

const targets = repos
  .filter((repo) => !curated.has(repo.name.toLowerCase()))
  .map((repo) => ({ slug: repo.name.toLowerCase(), url: repo.homepage?.trim() ?? "" }))
  .filter((item) => {
    try {
      return item.url && HOSTED.test(new URL(item.url).hostname);
    } catch {
      return false;
    }
  })
  .filter((item) => !only || item.slug === only);

await mkdir(OUT_DIR, { recursive: true });
const captured = new Set();
for (const { slug, url } of targets) {
  // Um navegador novo por site: um site pesado (WebGL, por exemplo) pode derrubar o navegador inteiro.
  // WebGL por software: sites 3D derrubavam o navegador sem placa de vídeo disponível.
  const browser = await chromium.launch({ channel: process.env.PW_CHANNEL ?? "msedge", args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, colorScheme: "dark" });
  try {
    const response = await page.goto(url, { waitUntil: "networkidle", timeout: 45_000 }).catch(() => page.goto(url, { waitUntil: "load", timeout: 45_000 }));
    if (!response || response.status() >= 400) {
      console.log(`pulou  ${slug}: o site respondeu ${response?.status() ?? "sem resposta"}`);
      continue;
    }
    await page.evaluate(() => Promise.all([...document.images].map((image) => image.decode().catch(() => null))));
    await page.waitForTimeout(3000);
    // Site quebrado ou vazio: melhor ficar com o cartão do GitHub do que uma capa em branco.
    const content = await page.evaluate(() => ({
      text: document.body?.innerText.trim().length ?? 0,
      media: document.querySelectorAll("img, canvas, video, svg").length,
    }));
    if (content.text < 40 && content.media < 2) {
      console.log(`pulou  ${slug}: a página está em branco`);
      continue;
    }
    await page.screenshot({ path: `${OUT_DIR}/${slug}.png` });
    captured.add(slug);
    console.log(`ok     ${slug}`);
  } catch (error) {
    console.log(`pulou  ${slug}: ${error instanceof Error ? error.message.split("\n")[0] : "erro"}`);
  } finally {
    await browser.close().catch(() => undefined);
  }
}

// Junta com as capturas já existentes (rodar para um slug só não apaga as outras).
let previous = [];
try {
  previous = [...(await readFile("src/content/github-covers.ts", "utf8")).matchAll(/^\s+"([^"]+)":/gm)].map((match) => match[1]);
} catch {
  /* primeira execução */
}
const slugs = [...new Set([...(only ? previous : []), ...captured])].sort();
const body = slugs.map((slug) => `  "${slug}": { src: "/images/projects/github/${slug}.png", width: 1440, height: 900 },`).join("\n");
await writeFile(
  "src/content/github-covers.ts",
  `// Gerado por scripts/capture-github-covers.mjs. Não edite à mão.
export const githubCovers: Record<string, { src: string; width: number; height: number }> = {
${body}
};
`,
);
console.log(`\n${slugs.length} capas em src/content/github-covers.ts`);
