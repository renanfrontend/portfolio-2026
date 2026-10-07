// Grava a animação do retrato do site e gera um GIF para o README do GitHub.
// Uso (na pasta do projeto, com gifenc e pngjs instalados: npm i -D gifenc pngjs):
//   node scripts/record-portrait-gif.mjs https://www.renanaugusto.com.br/pt-BR public/images/profile/renan-matrix.gif
import { createRequire } from "node:module";
import { writeFileSync } from "node:fs";
import { PNG } from "pngjs";
import gifenc from "gifenc";

const { GIFEncoder, quantize, applyPalette } = gifenc;
const require = createRequire(import.meta.url);
const { chromium } = require("@playwright/test");

const [url = "http://localhost:3100/pt-BR", out = "renan-matrix.gif"] = process.argv.slice(2);
const FRAMES = Number(process.env.FRAMES || 96);
const INTERVAL = 70; // ms entre quadros (~14 fps)

const browser = await chromium.launch({ channel: "msedge" });
const page = await browser.newPage({ viewport: { width: 1280, height: 860 }, colorScheme: "dark" });
await page.addInitScript(() => {
  sessionStorage.setItem("intro-seen", "1");
  localStorage.setItem("theme", "dark");
});
await page.goto(url, { waitUntil: "networkidle", timeout: 120000 });

// Quadro do retrato (canvas + camada dos feixes), sem a legenda.
const frame = page.locator("figure").first().locator("div").first();
await frame.scrollIntoViewIfNeeded();
const box = await frame.boundingBox();
if (!box) throw new Error("Retrato não encontrado na página.");
const clip = { x: Math.round(box.x), y: Math.round(box.y), width: Math.round(box.width), height: Math.round(box.height) };

const frames = [];
let last = Date.now();
for (let i = 0; i < FRAMES; i += 1) {
  // Na parte final, o "cursor" passa pelo rosto para mostrar a lente que decodifica o código.
  if (i >= 58 && i < 86) {
    const t = (i - 58) / 27;
    await page.mouse.move(clip.x + clip.width * (0.28 + 0.44 * t), clip.y + clip.height * (0.36 + 0.08 * Math.sin(t * Math.PI)));
  } else if (i === 86) {
    await page.mouse.move(5, 5);
  }
  const png = PNG.sync.read(await page.screenshot({ clip }));
  const now = Date.now();
  frames.push({ png, delay: Math.max(40, Math.min(140, now - last)) });
  last = now;
  const wait = INTERVAL - (Date.now() - now);
  if (wait > 0) await page.waitForTimeout(wait);
}
await browser.close();

// Paleta única (amostra de vários quadros) evita "piscadas" de cor entre os quadros.
const sample = [];
for (let i = 0; i < frames.length; i += 6) {
  const data = frames[i].png.data;
  for (let p = 0; p < data.length; p += 4 * 7) sample.push(data[p], data[p + 1], data[p + 2], data[p + 3]);
}
const palette = quantize(new Uint8Array(sample), Number(process.env.COLORS || 192));
if (process.env.DUMP) for (const i of process.env.DUMP.split(",").map(Number)) writeFileSync(`frame-${i}.png`, PNG.sync.write(frames[Math.min(i, frames.length - 1)].png));

// Cada quadro guarda só os pixels que mudaram; o resto fica transparente e reaproveita o quadro anterior.
const transparentIndex = palette.length;
const fullPalette = [...palette, [0, 0, 0]];
const gif = GIFEncoder();
let previous = null;
for (const { png, delay } of frames) {
  const index = applyPalette(png.data, palette);
  if (previous) {
    const diff = new Uint8Array(index.length);
    for (let p = 0; p < index.length; p += 1) diff[p] = index[p] === previous[p] ? transparentIndex : index[p];
    gif.writeFrame(diff, png.width, png.height, { palette: fullPalette, delay, transparent: true, transparentIndex, dispose: 1 });
  } else {
    gif.writeFrame(index, png.width, png.height, { palette: fullPalette, delay, dispose: 1 });
  }
  previous = index;
}
gif.finish();
writeFileSync(out, gif.bytes());
console.log(`${out}: ${frames.length} quadros, ${clip.width}x${clip.height}px, ${(gif.bytes().length / 1024 / 1024).toFixed(1)} MB`);
