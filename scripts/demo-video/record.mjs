// Grava o fluxo de contratação em modo de teste: site -> modal -> Stripe Checkout -> confirmação.
// Salva os quadros (JPEG) e a linha do tempo das cenas; o compose.mjs monta o vídeo com narração e legendas.
// Uso: DEMO_URL=http://localhost:3400 STRIPE_LISTEN_LOG=listen.log node scripts/demo-video/record.mjs <landscape|portrait> <pasta-de-trabalho>
// Pré-requisitos: build de produção rodando em DEMO_URL com STRIPE_SECRET_KEY de TESTE e `stripe listen` encaminhando para ele.
import { createRequire } from "node:module";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { outroCard, terminalCard, titleCard } from "./cards.mjs";

const require = createRequire(import.meta.url);
const { chromium } = require("@playwright/test");

const [format = "landscape", work = "demo-video-work"] = process.argv.slice(2);
const BASE = (process.env.DEMO_URL || "http://localhost:3400").replace(/\/+$/, "");
const LISTEN_LOG = process.env.STRIPE_LISTEN_LOG || "";
const portrait = format === "portrait";
const out = path.join(work, format);
rmSync(out, { recursive: true, force: true });
mkdirSync(path.join(out, "frames"), { recursive: true });
const durations = JSON.parse(readFileSync(path.join(work, "durations.json"), "utf8"));
/** Respiro entre o fim de uma fala e a próxima cena. */
const GAP = 450;
/**
 * Câmera lenta: a página roda K vezes mais devagar e o compose.mjs acelera de volta.
 * Em máquinas modestas, isso multiplica por K os quadros por segundo do vídeo final.
 */
const K = Number(process.env.SLOWMO || 3);

// 16:9 (LinkedIn) em 1920x1080 e 9:16 (Reels) em 1080x1920, renderizados em alta densidade.
const viewport = portrait ? { width: 405, height: 720 } : { width: 1280, height: 720 };
const scale = portrait ? 1080 / 405 : 1.5;
const size = { width: Math.round(viewport.width * scale), height: Math.round(viewport.height * scale) };
const userAgent = portrait
  ? "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Mobile Safari/537.36"
  : "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0";

const customer = {
  name: "Mariana Souza",
  email: "mariana.souza@example.com",
  whatsapp: "11987654321",
  message: "Quero revisar a performance e a acessibilidade do meu site antes de uma campanha.",
};

// A densidade forçada faz o screencast sair em pixels reais (1920x1080 / 1080x1920), sem ampliação;
// a GPU ligada evita que a renderização em alta resolução fique lenta.
const browser = await chromium.launch({
  channel: process.env.PW_CHANNEL || "msedge",
  args: [`--force-device-scale-factor=${scale}`, "--use-angle=d3d11", "--enable-gpu", "--ignore-gpu-blocklist", "--enable-gpu-rasterization"],
});
const context = await browser.newContext({
  viewport,
  deviceScaleFactor: scale,
  isMobile: portrait,
  hasTouch: portrait,
  userAgent,
  locale: "pt-BR",
  colorScheme: "dark",
});

// Relógio do JavaScript do site K vezes mais lento (rAF, performance.now e timers). A página do Stripe não é alterada.
await context.addInitScript(
  ({ factor, origin }) => {
    if (location.origin !== origin) return;
    const realNow = performance.now.bind(performance);
    const start = realNow();
    performance.now = () => start + (realNow() - start) / factor;
    const raf = window.requestAnimationFrame.bind(window);
    window.requestAnimationFrame = (callback) => raf((time) => callback(start + (time - start) / factor));
    const setTimeoutReal = window.setTimeout.bind(window);
    const setIntervalReal = window.setInterval.bind(window);
    window.setTimeout = (handler, ms = 0, ...args) => setTimeoutReal(handler, ms * factor, ...args);
    window.setInterval = (handler, ms = 0, ...args) => setIntervalReal(handler, ms * factor, ...args);
  },
  { factor: K, origin: new URL(BASE).origin },
);

if (process.env.DEMO_DEBUG) {
  await context.addInitScript(() => {
    window.__scrollLog = [];
    const log = (what) => window.__scrollLog.push(`${Math.round(performance.now())} ${what} ${(new Error().stack || "").split("\n").slice(2, 5).join(" | ")}`);
    const intoView = Element.prototype.scrollIntoView;
    Element.prototype.scrollIntoView = function (...args) {
      log(`scrollIntoView <${this.tagName}.${String(this.className).slice(0, 30)}>`);
      return intoView.apply(this, args);
    };
    let lastY = 0;
    addEventListener("scroll", () => {
      if (Math.abs(scrollY - lastY) > 150) log(`salto ${Math.round(lastY)} -> ${Math.round(scrollY)}`);
      lastY = scrollY;
    }, { passive: true });
    const to = window.scrollTo;
    window.scrollTo = function (...args) {
      log(`scrollTo ${JSON.stringify(args)}`);
      return to.apply(this, args);
    };
  });
}

// Cursor desenhado na página (o screencast não mostra o ponteiro do sistema). Toque vira um círculo no celular.
await context.addInitScript(({ touch }) => {
  if (window.top !== window) return;
  const state = { x: innerWidth * 0.62, y: innerHeight * 0.7 };
  const install = () => {
    if (document.getElementById("__demo_cursor") || !document.body) return;
    const el = document.createElement("div");
    el.id = "__demo_cursor";
    const ns = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(ns, "svg");
    svg.setAttribute("width", touch ? "34" : "26");
    svg.setAttribute("height", touch ? "34" : "26");
    svg.setAttribute("viewBox", touch ? "0 0 34 34" : "0 0 24 24");
    if (touch) {
      const circle = document.createElementNS(ns, "circle");
      circle.setAttribute("cx", "17");
      circle.setAttribute("cy", "17");
      circle.setAttribute("r", "14");
      circle.setAttribute("fill", "rgba(255,255,255,.35)");
      circle.setAttribute("stroke", "rgba(255,255,255,.9)");
      circle.setAttribute("stroke-width", "2");
      svg.appendChild(circle);
    } else {
      const arrow = document.createElementNS(ns, "path");
      arrow.setAttribute("d", "M4 2l15 9.5-6.8 1.4 3.9 7.6-2.8 1.4-3.9-7.6L4 19z");
      arrow.setAttribute("fill", "#ffffff");
      arrow.setAttribute("stroke", "#0a0d0d");
      arrow.setAttribute("stroke-width", "1.4");
      arrow.setAttribute("stroke-linejoin", "round");
      svg.appendChild(arrow);
    }
    el.appendChild(svg);
    Object.assign(el.style, {
      position: "fixed",
      left: "0",
      top: "0",
      zIndex: "2147483647",
      pointerEvents: "none",
      filter: "drop-shadow(0 2px 6px rgba(0,0,0,.45))",
      transition: "transform .55s cubic-bezier(.22,.8,.3,1), opacity .2s",
      transform: `translate(${state.x - (touch ? 17 : 4)}px, ${state.y - (touch ? 17 : 2)}px)`,
      opacity: location.href === "about:blank" ? "0" : "1",
    });
    document.documentElement.appendChild(el);
  };
  window.__demoCursor = {
    move(x, y, instant = false) {
      install();
      const el = document.getElementById("__demo_cursor");
      if (!el) return;
      state.x = x;
      state.y = y;
      el.style.transition = instant ? "none" : "transform .55s cubic-bezier(.22,.8,.3,1), opacity .2s";
      el.style.transform = `translate(${x - (touch ? 17 : 4)}px, ${y - (touch ? 17 : 2)}px)`;
    },
    press() {
      const ring = document.createElement("div");
      Object.assign(ring.style, {
        position: "fixed",
        left: `${state.x - 22}px`,
        top: `${state.y - 22}px`,
        width: "44px",
        height: "44px",
        borderRadius: "50%",
        border: "3px solid #22d3ee",
        zIndex: "2147483646",
        pointerEvents: "none",
      });
      document.documentElement.appendChild(ring);
      ring.animate([{ transform: "scale(.3)", opacity: 1 }, { transform: "scale(1.25)", opacity: 0 }], { duration: 520, easing: "ease-out" }).onfinish = () => ring.remove();
    },
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", install);
  else install();
}, { touch: portrait });

const page = await context.newPage();
page.setDefaultTimeout(45_000 * K);

// Animações e transições CSS (inclusive no Stripe) K vezes mais lentas, reaplicado a cada navegação.
let cdp = null;
async function applySlowmo() {
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      if (!cdp) {
        cdp = await context.newCDPSession(page);
        await cdp.send("Animation.enable");
      }
      await cdp.send("Animation.setPlaybackRate", { playbackRate: 1 / K });
      return;
    } catch {
      cdp = null;
    }
  }
}
page.on("framenavigated", (frame) => {
  if (frame === page.mainFrame()) void applySlowmo();
});
await applySlowmo();
let cursor = { x: viewport.width * 0.62, y: viewport.height * 0.7 };

const frames = [];
let frameIndex = 0;
const timeline = [];
/** Espera em "tempo da página" (multiplicada pela câmera lenta). */
const wait = (ms) => page.waitForTimeout(ms * K);

async function scene(id, run) {
  const start = Date.now();
  timeline.push({ id, t: start });
  await run();
  if (process.env.DEMO_STOP_AFTER === id) {
    const log = await page.evaluate(() => (window.__scrollLog ?? []).join("\n"));
    console.log(`[${id}] rolagens:\n${log}`);
    await browser.close();
    process.exit(0);
  }
  const minimum = ((durations[id] ?? 0) + (durations[id] ? GAP : 0)) * K;
  const elapsed = Date.now() - start;
  // `minimum` já está em tempo real (multiplicado por K): espera direto, sem o wait() da página.
  if (elapsed < minimum) await page.waitForTimeout(minimum - elapsed);
}

/**
 * Espera a rolagem parar (a troca de página pode rolar com atraso) e só então posiciona no topo.
 * Com DEMO_DEBUG=1, mostra quem chamou cada rolagem.
 */
async function settleAtTop() {
  let last = -1;
  let stable = 0;
  for (let i = 0; i < 60 && stable < 8; i += 1) {
    const y = await page.evaluate(() => Math.round(scrollY));
    stable = y === last ? stable + 1 : 0;
    last = y;
    await wait(200);
  }
  if (process.env.DEMO_DEBUG) console.log("[rolagem]", await page.evaluate(() => (window.__scrollLog ?? []).join("\n")));
  await page.evaluate(() => scrollTo({ top: 0, behavior: "instant" }));
  await wait(300);
}

/** Recoloca o cursor depois de uma navegação (cada página nova cria o seu). */
async function restoreCursor() {
  await page.evaluate(({ x, y }) => window.__demoCursor?.move(x, y, true), cursor).catch(() => {});
}

async function pointTo(locator) {
  await locator.scrollIntoViewIfNeeded();
  await wait(250);
  const box = await locator.boundingBox();
  if (!box) throw new Error("Elemento sem posição na tela.");
  cursor = { x: box.x + box.width / 2, y: box.y + box.height / 2 };
  await page.evaluate(({ x, y }) => window.__demoCursor?.move(x, y), cursor);
  await wait(560);
  return cursor;
}

async function click(locator) {
  const { x, y } = await pointTo(locator);
  await page.evaluate(() => window.__demoCursor?.press());
  if (portrait) await page.touchscreen.tap(x, y);
  else await page.mouse.click(x, y);
}

async function type(locator, text, delay = 55) {
  await click(locator);
  await locator.pressSequentially(text, { delay: delay * K });
  await wait(200);
}

/** Rolagem suave (ignora o scroll-behavior do CSS para controlar o tempo). */
async function smoothScrollTo(top, ms = 1300) {
  await page.evaluate(
    ([target, duration]) =>
      new Promise((resolve) => {
        const from = scrollY;
        const start = performance.now();
        // O progresso vem sempre de performance.now(): o horário que o rAF entrega pode vir em outra base
        // com a câmera lenta, e um progresso negativo jogava a página para o rodapé.
        const step = () => {
          const p = Math.min(1, Math.max(0, (performance.now() - start) / duration));
          const eased = p < 0.5 ? 2 * p * p : 1 - (-2 * p + 2) ** 2 / 2;
          scrollTo({ top: from + (target - from) * eased, behavior: "instant" });
          if (p < 1) requestAnimationFrame(step);
          else resolve();
        };
        requestAnimationFrame(step);
      }),
    [top, ms],
  );
}

async function scrollIntoCenter(locator, ms = 1300) {
  const top = await locator.evaluate((el) => el.getBoundingClientRect().top + scrollY - innerHeight * 0.18);
  await smoothScrollTo(Math.max(0, top), ms);
}

async function goto(url) {
  await page.goto(url, { waitUntil: "domcontentloaded" });
  await restoreCursor();
}

async function showCard(html) {
  await page.setContent(html, { waitUntil: "load" });
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(() => document.body.classList.add("go"));
}

/** Últimas linhas do `stripe listen` desta compra, sem o endereço local. */
async function webhookLines(sinceMs) {
  if (!LISTEN_LOG || !existsSync(LISTEN_LOG)) return null;
  for (let attempt = 0; attempt < 30; attempt += 1) {
    const lines = readFileSync(LISTEN_LOG, "utf8")
      .split(/\r?\n/)
      .filter((line) => /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/.test(line))
      .filter((line) => Date.parse(line.slice(0, 19).replace(" ", "T")) >= sinceMs - 2000);
    const done = lines.findIndex((line) => line.includes("[200]") && line.includes("/api/webhooks/stripe"));
    if (done >= 0) {
      return lines
        .slice(0, done + 1)
        .map((line) => line.replace(/https?:\/\/localhost:\d+/, "").replace(/\s{2,}/g, "  ").replace(/\s*\[evt_[A-Za-z0-9]+\]$/, ""));
    }
    await wait(500);
  }
  return null;
}

// ── Abertura ────────────────────────────────────────────────────────────
await page.setContent(titleCard(), { waitUntil: "load" });
await page.evaluate(() => document.fonts.ready);
await page.screencast.start({
  size,
  quality: 85,
  onFrame: ({ data }) => {
    writeFileSync(path.join(out, "frames", `${String(frameIndex).padStart(6, "0")}.jpg`), data);
    frameIndex += 1;
    frames.push(Date.now());
  },
});
await wait(400);
await scene("intro", () => page.evaluate(() => document.body.classList.add("go")));

// ── Site ────────────────────────────────────────────────────────────────
await scene("home", async () => {
  await goto(`${BASE}/pt-BR`);
  // A abertura animada do site roda na primeira visita.
  await page.locator(".intro").waitFor({ state: "hidden", timeout: 9000 * K }).catch(() => {});
  await wait(700);
  if (!portrait) {
    // Passa o cursor pelo retrato para mostrar a "lente" que decodifica o código.
    const frame = page.locator("figure").first();
    const box = await frame.boundingBox();
    if (box) {
      for (let i = 0; i <= 24; i += 1) {
        const t = i / 24;
        cursor = { x: box.x + box.width * (0.25 + 0.5 * t), y: box.y + box.height * (0.38 + 0.06 * Math.sin(t * Math.PI * 2)) };
        await page.mouse.move(cursor.x, cursor.y);
        await page.evaluate(({ x, y }) => window.__demoCursor?.move(x, y, true), cursor);
        await wait(35);
      }
    }
  } else {
    await smoothScrollTo(420, 1600);
    await wait(500);
    await smoothScrollTo(0, 900);
  }
});

// Navegação até os pacotes (sem narração): Serviços -> Ver pacotes.
await scene("navegacao", async () => {
  if (portrait) {
    const menu = page.getByRole("button", { name: "Abrir menu" });
    const panelId = await menu.getAttribute("aria-controls");
    await click(menu);
    await wait(500);
    await click(page.locator(`[id="${panelId}"]`).getByRole("link", { name: "Serviços", exact: true }));
  } else {
    await click(page.locator("header").getByRole("link", { name: "Serviços", exact: true }));
  }
  await page.waitForURL(/\/servicos$/);
  await restoreCursor();
  await wait(900);
  await click(page.getByRole("link", { name: /Ver pacotes/ }));
  await page.waitForURL(/\/contratar$/);
  await page.getByRole("heading", { level: 1 }).waitFor();
  // No navegador do gravador a página nova às vezes abre rolada; garante o topo (trecho acelerado na montagem).
  await settleAtTop();
  await restoreCursor();
});

await scene("pacotes", async () => {
  await page.getByRole("heading", { level: 1 }).waitFor();
  await wait(900);
  const firstCard = page.locator("#pacote-diagnostico-tecnico, article").first();
  await scrollIntoCenter(firstCard, 1500);
  if (portrait) {
    await wait(700);
    const button = page.getByRole("link", { name: /Contratar Serviço\s*:\s*Diagnóstico Técnico/ });
    const top = await button.evaluate((el) => el.getBoundingClientRect().top + scrollY - innerHeight * 0.55);
    await smoothScrollTo(top, 2600);
  } else {
    for (const name of ["Diagnóstico Técnico", "Setup / MVP", "Pacote de Horas de Consultoria", "Suporte Mensal"]) {
      await pointTo(page.getByRole("heading", { name, exact: true }));
      await wait(300);
    }
  }
});

// ── Modal ───────────────────────────────────────────────────────────────
const dialog = page.getByRole("dialog");
await scene("modal", async () => {
  await click(page.getByRole("link", { name: /Contratar Serviço\s*:\s*Diagnóstico Técnico/ }));
  await dialog.waitFor();
  await wait(1200);
});

await scene("validacao", async () => {
  await click(dialog.getByRole("button", { name: "Avançar para pagamento" }));
  await dialog.getByText("Revise os campos destacados.").waitFor();
  await wait(1300);
  await type(dialog.getByLabel("Nome completo"), customer.name, 40);
  await type(dialog.getByLabel("E-mail"), customer.email, 15);
  await type(dialog.getByLabel("WhatsApp"), customer.whatsapp, 90);
  await type(dialog.getByLabel(/Conte brevemente/), customer.message, 0);
});

await scene("servidor", async () => {
  await click(dialog.getByRole("button", { name: "Avançar para pagamento" }));
  await page.waitForURL(/checkout\.stripe\.com/, { timeout: 60_000 });
  await restoreCursor();
  await page.locator("[data-testid=card-accordion-item]").waitFor({ timeout: 60_000 });
  await restoreCursor();
});

// ── Stripe Checkout (modo de teste) ─────────────────────────────────────
await scene("checkout", async () => {
  await wait(600);
  // Linhas visíveis de cada forma de pagamento (os botões internos do acordeão ficam ocultos).
  await pointTo(page.locator("[data-testid=pix-accordion-item]"));
  await wait(450);
  await pointTo(page.locator("[data-testid=boleto-accordion-item]"));
  await wait(450);
  await click(page.locator("[data-testid=card-accordion-item]"));
  await page.locator("#cardNumber").waitFor();
});

let paidAt = 0;
await scene("cartao", async () => {
  await type(page.locator("#cardNumber"), "4242424242424242", 45);
  await type(page.locator("#cardExpiry"), "1230", 90);
  await type(page.locator("#cardCvc"), "123", 90);
  await type(page.locator("#billingName"), customer.name, 45);
  paidAt = Date.now();
  await click(page.locator("[data-testid=hosted-payment-submit-button]"));
  await page.waitForURL(/\/contratar\/sucesso/, { timeout: 90_000 });
  await restoreCursor();
});

// ── Confirmação ─────────────────────────────────────────────────────────
let orderId = "RA-";
await scene("sucesso", async () => {
  await page.getByText("Pagamento confirmado").waitFor();
  orderId = new URL(page.url()).searchParams.get("order_id") ?? orderId;
  await wait(2200);
  const steps = page.getByRole("heading", { name: "Próximos passos" });
  await scrollIntoCenter(steps, 1700);
  await wait(600);
  await pointTo(page.getByRole("link", { name: /Agendar kickoff/ }));
});

const lines = (await webhookLines(paidAt)) ?? [
  "--> checkout.session.completed",
  "<--  [200] POST /api/webhooks/stripe",
];
await scene("bastidores", () => showCard(terminalCard({ lines: ["$ stripe listen --forward-to /api/webhooks/stripe", ...lines], orderId })));
await scene("outro", () => showCard(outroCard({ origin: BASE })));
await wait(1600);

await page.screencast.stop();
const end = Date.now();
writeFileSync(path.join(out, "timeline.json"), JSON.stringify({ format, size, slowmo: K, frames, scenes: timeline, end, orderId }, null, 2));
await browser.close();
console.log(`${format}: ${frames.length} quadros, ${((end - frames[0]) / 1000 / K).toFixed(1)} s de vídeo antes dos cortes, pedido ${orderId}`);
