import { smoothstep } from "./portrait-sampling";

/**
 * Motor da "chuva de código" neon usada no retrato e nas ilustrações.
 * Desenha uma grade de caracteres cujo brilho vem de um campo (foto ou desenho),
 * com gotas caindo por coluna, feixes de luz e uma lente que decodifica um trecho de código.
 */

/** Chuva de letras minúsculas e números. */
const RAIN_GLYPHS = "abcdefghijklmnopqrstuvwxyz0123456789";

/** Matizes neon por coluna: ciano, azul-céu, azul, violeta e roxo. */
const HUES_DARK: [number, number, number][] = [
  [34, 211, 238],
  [56, 189, 248],
  [59, 130, 246],
  [139, 92, 246],
  [192, 132, 252],
];
const HUES_LIGHT: [number, number, number][] = [
  [14, 116, 144],
  [3, 105, 161],
  [29, 78, 216],
  [109, 40, 217],
  [126, 34, 206],
];
const HUE_WEIGHTS = [0.3, 0.22, 0.22, 0.14, 0.12];

const LEVELS = 10;
const HEAD_LEVEL = LEVELS;
const ROWS_PER_HUE = LEVELS + 1;
const LENS_RADIUS = 100;
const FRAME_MS = 1000 / 30;
const DROPS_PER_COLUMN = 2;
const MAX_STREAKS = 7;

/** Campo de brilho (0 a 1) e silhueta (0 a 1) por célula da grade. */
export type Field = { value: Float32Array; mask: Float32Array };

export type FieldSource = {
  /** Monta o campo para a grade atual. `light` indica o tema claro. */
  build(columns: number, rows: number, light: boolean): Field;
  /** Atualiza o campo a cada passo (ilustrações animadas). */
  update?(field: Field, columns: number, rows: number, time: number): void;
  /** Se verdadeiro, a chuva revela o campo aos poucos ao passar. */
  revealByRain?: boolean;
};

export type CodeRainOptions = {
  canvas: HTMLCanvasElement;
  overlay: HTMLCanvasElement;
  /** Carrega a fonte do campo (ex.: amostra a foto). */
  load: () => Promise<FieldSource>;
  columnsFor: (width: number) => number;
  /** Linhas de código mostradas pela lente do cursor. */
  lensSource: string[];
  onCount?: (count: number) => void;
};

type Drop = { head: number; speed: number; trail: number };
type Streak = { x: number; y: number; length: number; speed: number; hue: number };

function pickHue(): number {
  let r = Math.random();
  for (let hue = 0; hue < HUE_WEIGHTS.length; hue += 1) {
    r -= HUE_WEIGHTS[hue];
    if (r <= 0) return hue;
  }
  return 0;
}

function levelStyle(hue: number, level: number, light: boolean) {
  const [r, g, b] = (light ? HUES_LIGHT : HUES_DARK)[hue];
  if (level === HEAD_LEVEL) {
    // Cabeça: quase branca no escuro (com brilho), a cor mais intensa no claro.
    if (light) return { color: `rgb(${r}, ${g}, ${b})`, glow: 0, glowColor: "transparent" };
    const mix = (value: number) => Math.round(value + (255 - value) * 0.75);
    return { color: `rgb(${mix(r)}, ${mix(g)}, ${mix(b)})`, glow: 1, glowColor: `rgba(${r}, ${g}, ${b}, 0.95)` };
  }
  const t = level / (LEVELS - 1);
  const alpha = (light ? 0.25 : 0.18) + t * (light ? 0.75 : 0.82);
  return {
    color: `rgba(${r}, ${g}, ${b}, ${alpha})`,
    glow: light ? 0 : Math.max(0, (t - 0.55) / 0.45),
    glowColor: `rgba(${r}, ${g}, ${b}, 0.8)`,
  };
}

function newDrop(rows: number, initial: boolean): Drop {
  return {
    head: initial ? -Math.random() * rows * 0.6 : -Math.random() * rows * 0.8,
    speed: 0.3 + Math.random() * 0.7,
    trail: Math.round(rows * (0.2 + Math.random() * 0.45)),
  };
}

/** Inicia a animação e devolve a função de limpeza. */
export function startCodeRain({ canvas, overlay, load, columnsFor, lensSource, onCount }: CodeRainOptions): () => void {
  const ctx = canvas.getContext("2d");
  const fx = overlay.getContext("2d");
  if (!ctx || !fx) return () => {};

  const atlasChars = [...new Set([...RAIN_GLYPHS, ...lensSource.join("")])].filter((char) => char !== " ");
  const atlasIndex = new Map(atlasChars.map((char, index) => [char, index]));
  const rainCount = RAIN_GLYPHS.length;
  const randomRainGlyph = () => Math.floor(Math.random() * rainCount);

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  // Em celulares e aparelhos modestos, o brilho (shadowBlur) do atlas é o passo mais caro: fica desligado.
  const lowPower = window.matchMedia("(max-width: 640px)").matches || (navigator.hardwareConcurrency ?? 8) <= 4;
  const isLight = () => document.documentElement.getAttribute("data-theme") === "light";
  const pointer = { x: 0, y: 0, strength: 0, target: 0 };
  let source: FieldSource | null = null;
  let field: Field = { value: new Float32Array(0), mask: new Float32Array(0) };
  let atlas: HTMLCanvasElement | null = null;
  let atlasCell = 0;
  let reveal = new Float32Array(0);
  let glyphs = new Uint8Array(0);
  let columnHue = new Uint8Array(0);
  /** O que cada célula mostrou no último quadro; -1 = vazia. */
  let shown = new Int32Array(0);
  /** Bordas das células em pixels inteiros, para limpar e desenhar sem emendas. */
  let edgesX = new Float32Array(0);
  let edgesY = new Float32Array(0);
  let drops: Drop[] = [];
  let streaks: Streak[] = [];
  let columns = 0;
  let rows = 0;
  let cell = 6;
  let width = 0;
  let height = 0;
  let frame = 0;
  let lastStep = 0;
  let running = false;
  let visible = true;
  let disposed = false;

  /** Pré-desenha cada caractere em cada cor e nível de brilho (com o glow já aplicado). */
  function buildAtlas(dpr: number) {
    const light = isLight();
    atlasCell = Math.ceil(cell * dpr);
    atlas = document.createElement("canvas");
    atlas.width = atlasChars.length * atlasCell;
    atlas.height = HUES_DARK.length * ROWS_PER_HUE * atlasCell;
    const a = atlas.getContext("2d");
    if (!a) return;
    a.textAlign = "center";
    a.textBaseline = "middle";
    a.font = `700 ${Math.round(atlasCell * 0.95)}px ui-monospace, "Cascadia Code", Consolas, monospace`;
    for (let hue = 0; hue < HUES_DARK.length; hue += 1) {
      for (let level = 0; level <= LEVELS; level += 1) {
        const style = levelStyle(hue, level, light);
        a.fillStyle = style.color;
        a.shadowColor = style.glowColor;
        a.shadowBlur = lowPower ? 0 : style.glow * atlasCell * 0.5;
        const cy = (hue * ROWS_PER_HUE + level) * atlasCell + atlasCell / 2;
        atlasChars.forEach((char, index) => a.fillText(char, index * atlasCell + atlasCell / 2, cy));
      }
    }
  }

  function countVisible() {
    let visibleCount = 0;
    for (const value of field.value) if (value > 0.1) visibleCount += 1;
    onCount?.(visibleCount);
  }

  function build() {
    if (!source || !ctx || !fx) return;
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = rect.width;
    height = rect.height;
    for (const [target, context] of [
      [canvas, ctx],
      [overlay, fx],
    ] as const) {
      target.width = Math.round(width * dpr);
      target.height = Math.round(height * dpr);
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    columns = columnsFor(width);
    cell = width / columns;
    rows = Math.ceil(height / cell);
    buildAtlas(dpr);

    const total = columns * rows;
    field = source.build(columns, rows, isLight());
    reveal = new Float32Array(total).fill(reducedMotion || !source.revealByRain ? 1 : 0);
    glyphs = Uint8Array.from({ length: total }, randomRainGlyph);
    columnHue = Uint8Array.from({ length: columns }, pickHue);
    shown = new Int32Array(total).fill(-2);
    edgesX = Float32Array.from({ length: columns + 1 }, (_, i) => Math.round(i * cell * dpr) / dpr);
    edgesY = Float32Array.from({ length: rows + 1 }, (_, i) => Math.round(i * cell * dpr) / dpr);
    ctx.clearRect(0, 0, width, height);
    drops = Array.from({ length: columns * DROPS_PER_COLUMN }, () => newDrop(rows, true));
    streaks = [];
    if (source.update) source.update(field, columns, rows, performance.now());
    countVisible();
  }

  function step(now: number) {
    for (let column = 0; column < columns; column += 1) {
      for (let k = 0; k < DROPS_PER_COLUMN; k += 1) {
        const drop = drops[column * DROPS_PER_COLUMN + k];
        drop.head += drop.speed;
        if (drop.head - drop.trail > rows) {
          Object.assign(drop, newDrop(rows, false));
          // A coluna troca de cor de vez em quando, para a paleta ir se renovando.
          if (k === 0 && Math.random() < 0.35) columnHue[column] = pickHue();
        }
        const headRow = Math.floor(drop.head);
        if (headRow >= 0 && headRow < rows) {
          const index = headRow * columns + column;
          if (reveal[index] === 0) reveal[index] = 0.01;
          glyphs[index] = randomRainGlyph();
        }
      }
    }
    for (let index = 0; index < reveal.length; index += 1) {
      if (reveal[index] > 0 && reveal[index] < 1) reveal[index] = Math.min(1, reveal[index] + 0.05);
      if (Math.random() < 0.01) glyphs[index] = randomRainGlyph();
    }
    source?.update?.(field, columns, rows, now);

    // Feixes de luz neon: poucos, rápidos e de comprimentos variados.
    streaks = streaks.filter((streak) => streak.y - streak.length < height);
    for (const streak of streaks) streak.y += streak.speed;
    if (streaks.length < MAX_STREAKS && Math.random() < 0.12) {
      const column = Math.floor(Math.random() * columns);
      streaks.push({
        x: (column + 0.5) * cell,
        y: -Math.random() * 40,
        length: 40 + Math.random() * (height * 0.28),
        speed: 7 + Math.random() * 9,
        hue: pickHue(),
      });
    }
  }

  function drawStreaks() {
    if (!fx) return;
    fx.clearRect(0, 0, width, height);
    const light = isLight();
    fx.lineCap = "round";
    for (const streak of streaks) {
      const [r, g, b] = (light ? HUES_LIGHT : HUES_DARK)[streak.hue];
      const top = streak.y - streak.length;
      const gradient = fx.createLinearGradient(0, top, 0, streak.y);
      gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0)`);
      gradient.addColorStop(0.8, `rgba(${r}, ${g}, ${b}, ${light ? 0.45 : 0.75})`);
      gradient.addColorStop(1, light ? `rgba(${r}, ${g}, ${b}, 0.8)` : "rgba(235, 250, 255, 0.95)");
      fx.strokeStyle = gradient;
      fx.shadowColor = `rgba(${r}, ${g}, ${b}, 0.9)`;
      fx.shadowBlur = light ? 4 : 14;
      fx.lineWidth = Math.max(1.5, cell * 0.35);
      fx.beginPath();
      fx.moveTo(streak.x, top);
      fx.lineTo(streak.x, streak.y);
      fx.stroke();
    }
  }

  function lensAt(x: number, y: number): number {
    if (pointer.strength < 0.01) return 0;
    const dx = x - pointer.x;
    const dy = y - pointer.y;
    const distSq = dx * dx + dy * dy;
    if (distSq >= LENS_RADIUS * LENS_RADIUS) return 0;
    return smoothstep(0, 1, 1 - Math.sqrt(distSq) / LENS_RADIUS) * pointer.strength;
  }

  /** Atualiza só as células que mudaram desde o último quadro. */
  function paint(index: number, column: number, row: number, charIndex: number, hue: number, level: number) {
    const key = charIndex < 0 ? -1 : (charIndex * HUES_DARK.length + hue) * 16 + level;
    if (shown[index] === key || !atlas || !ctx) return;
    shown[index] = key;
    const x = edgesX[column];
    const y = edgesY[row];
    const w = edgesX[column + 1] - x;
    const h = edgesY[row + 1] - y;
    ctx.clearRect(x, y, w, h);
    if (key >= 0) {
      const sy = (hue * ROWS_PER_HUE + level) * atlasCell;
      ctx.drawImage(atlas, charIndex * atlasCell, sy, atlasCell, atlasCell, x, y, w, h);
    }
  }

  function draw() {
    if (!ctx || !atlas) return;
    const { value, mask } = field;
    const anchorColumn = Math.floor(pointer.x / cell) - 14;
    const anchorRow = Math.floor(pointer.y / cell) - 3;

    for (let column = 0; column < columns; column += 1) {
      const hue = columnHue[column];
      for (let row = 0; row < rows; row += 1) {
        const index = row * columns + column;

        // Lente: o código-fonte legível, ancorado no cursor.
        const lens = reducedMotion ? 0 : lensAt((column + 0.5) * cell, (row + 0.5) * cell);
        if (lens > 0.2) {
          const line = lensSource[(((row - anchorRow) % lensSource.length) + lensSource.length) % lensSource.length];
          const char = line[column - anchorColumn];
          const charIndex = char ? atlasIndex.get(char) : undefined;
          if (charIndex !== undefined) {
            paint(index, column, row, charIndex, 0, lens > 0.6 ? HEAD_LEVEL : LEVELS - 1);
            continue;
          }
        }

        let rain = 0;
        let isHead = false;
        if (!reducedMotion) {
          for (let k = 0; k < DROPS_PER_COLUMN; k += 1) {
            const drop = drops[column * DROPS_PER_COLUMN + k];
            const distance = drop.head - row;
            if (distance >= 0 && distance < drop.trail) {
              if (distance < 1) isHead = true;
              rain = Math.max(rain, 1 - distance / drop.trail);
            }
          }
        }

        const inside = mask[index] > 0.05;
        if (isHead && (!inside || value[index] > 0.15)) {
          paint(index, column, row, glyphs[index], hue, HEAD_LEVEL);
          continue;
        }
        // Dentro da forma o brilho vem do campo (áreas escuras continuam escuras); fora dela, só a chuva.
        const brightness = inside
          ? value[index] * reveal[index] * (0.62 + rain * 0.38) + rain * 0.1 * value[index]
          : rain * rain * 0.6 * (1 - mask[index]);
        if (brightness < 0.07) paint(index, column, row, -1, 0, 0);
        else paint(index, column, row, glyphs[index], hue, Math.min(LEVELS - 1, Math.floor(brightness * LEVELS)));
      }
    }
    drawStreaks();
  }

  function loop(now: number) {
    if (!running) return;
    pointer.strength += (pointer.target - pointer.strength) * 0.15;
    if (now - lastStep >= FRAME_MS) {
      lastStep = now;
      step(now);
      draw();
    }
    frame = requestAnimationFrame(loop);
  }

  function start() {
    if (reducedMotion || running || !visible || document.hidden || !source) return;
    running = true;
    frame = requestAnimationFrame(loop);
  }

  function stop() {
    running = false;
    cancelAnimationFrame(frame);
  }

  /**
   * Só prepara a ilustração quando ela aparece na tela e o navegador está ocioso,
   * para não disputar processamento com o carregamento da página (importante no celular).
   */
  let loadRequested = false;
  function ensureLoaded() {
    if (loadRequested) return;
    loadRequested = true;
    const run = () =>
      load()
        .then((loaded) => {
          if (disposed) return;
          source = loaded;
          build();
          if (reducedMotion) draw();
          else start();
        })
        .catch(() => {
          // Sem o campo a ilustração simplesmente não aparece; o restante da página segue normal.
        });
    const whenIdle = () => {
      if (typeof window.requestIdleCallback === "function") window.requestIdleCallback(run, { timeout: 1500 });
      else setTimeout(run, 300);
    };
    if (document.readyState === "complete") whenIdle();
    else window.addEventListener("load", whenIdle, { once: true });
  }

  const onMove = (event: PointerEvent) => {
    const rect = overlay.getBoundingClientRect();
    pointer.x = event.clientX - rect.left;
    pointer.y = event.clientY - rect.top;
    pointer.target = 1;
  };
  const onLeave = () => {
    pointer.target = 0;
  };

  // Cores e campo são refeitos quando o tema muda.
  const themeObserver = new MutationObserver(() => {
    if (!source) return;
    buildAtlas(Math.min(window.devicePixelRatio || 1, 2));
    field = source.build(columns, rows, isLight());
    shown.fill(-2);
    if (!running) draw();
  });
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

  const resizeObserver = new ResizeObserver(() => {
    if (!source) return;
    build();
    if (!running) draw();
  });
  resizeObserver.observe(canvas);

  const intersectionObserver = new IntersectionObserver(
    ([entry]) => {
      visible = entry.isIntersecting;
      if (visible) {
        ensureLoaded();
        start();
      } else stop();
    },
    // Começa a preparar um pouco antes de entrar na tela.
    { rootMargin: "200px 0px" },
  );
  intersectionObserver.observe(canvas);

  const onVisibility = () => (document.hidden ? stop() : start());
  document.addEventListener("visibilitychange", onVisibility);
  if (!reducedMotion) {
    overlay.addEventListener("pointermove", onMove);
    overlay.addEventListener("pointerdown", onMove);
    overlay.addEventListener("pointerleave", onLeave);
    overlay.addEventListener("pointerup", onLeave);
  }

  return () => {
    disposed = true;
    stop();
    themeObserver.disconnect();
    resizeObserver.disconnect();
    intersectionObserver.disconnect();
    document.removeEventListener("visibilitychange", onVisibility);
    overlay.removeEventListener("pointermove", onMove);
    overlay.removeEventListener("pointerdown", onMove);
    overlay.removeEventListener("pointerleave", onLeave);
    overlay.removeEventListener("pointerup", onLeave);
  };
}
