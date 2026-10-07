"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { INTRO_STORAGE_KEY } from "@/providers/theme-script";

type IntroScreenProps = {
  /** Imagem do retrato pré-carregada durante a abertura. */
  portraitSrc: string;
  labels: { label: string; skip: string; command: string; steps: string[] };
};

/** Monograma "RA" em matriz de pontos 5x7, com uma coluna de espaço entre as letras. */
const GLYPHS = {
  R: ["11110", "10001", "10001", "11110", "10100", "10010", "10001"],
  A: ["01110", "10001", "10001", "11111", "10001", "10001", "10001"],
};
const ROWS = 7;
const MATRIX = GLYPHS.R.map((row, index) => `${row}0${GLYPHS.A[index]}`);
const COLUMNS = MATRIX[0].length;

/** Ordem em que os pontos acendem: coluna a coluna, como uma varredura. */
const litOrder: number[] = [];
for (let column = 0; column < COLUMNS; column += 1) {
  for (let row = 0; row < ROWS; row += 1) {
    if (MATRIX[row][column] === "1") litOrder.push(row * COLUMNS + column);
  }
}
const rankByCell = new Map(litOrder.map((cell, rank) => [cell, rank]));

const MIN_DURATION = 1100;
const MAX_DURATION = 3500;

/**
 * Abertura curta, uma vez por sessão. O progresso acompanha etapas reais
 * (fontes, retrato e carregamento da página); pode ser pulada com o botão ou Esc.
 */
export function IntroScreen({ portraitSrc, labels }: IntroScreenProps) {
  const [state, setState] = useState<"active" | "leaving" | "done">("active");
  const [progress, setProgress] = useState(0);
  const [completed, setCompleted] = useState<boolean[]>(() => labels.steps.map(() => false));
  const skipRef = useRef<() => void>(() => {});

  useEffect(() => {
    const root = document.documentElement;
    // Já desligada pelo script inicial: o CSS mantém a abertura oculta.
    if (root.getAttribute("data-intro") === "off") return;

    const steps = labels.steps.map(() => false);
    const markDone = (index: number) => {
      steps[index] = true;
      setCompleted([...steps]);
    };

    document.fonts.ready.then(() => markDone(0));
    const image = new Image();
    image.onload = image.onerror = () => markDone(1);
    image.src = portraitSrc;
    if (document.readyState === "complete") markDone(2);
    else window.addEventListener("load", () => markDone(2), { once: true });

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const startedAt = performance.now();
    let shown = 0;
    let lastPercent = -1;
    let frame = 0;
    let finished = false;

    const finish = () => {
      if (finished) return;
      finished = true;
      cancelAnimationFrame(frame);
      try {
        sessionStorage.setItem(INTRO_STORAGE_KEY, "1");
      } catch {
        // Sem sessionStorage a abertura volta na próxima visita; não há prejuízo.
      }
      setProgress(1);
      setState("leaving");
      document.body.style.overflow = previousOverflow;
      window.setTimeout(() => {
        root.setAttribute("data-intro", "off");
        setState("done");
      }, 750);
    };
    skipRef.current = finish;

    const tick = (now: number) => {
      const elapsed = now - startedAt;
      const realProgress = steps.filter(Boolean).length / steps.length;
      // Nunca passa à frente das etapas reais; o tempo mínimo só suaviza a animação.
      const timeCap = Math.min(1, elapsed / MIN_DURATION);
      const target = elapsed > MAX_DURATION ? 1 : Math.min(realProgress, timeCap);
      shown += (target - shown) * 0.12;
      if (target - shown < 0.004) shown = target;
      // Só atualiza a tela quando o percentual muda (no máximo 100 renderizações).
      const percent = Math.round(shown * 100);
      if (percent !== lastPercent) {
        lastPercent = percent;
        setProgress(shown);
      }
      if (shown >= 1) {
        frame = requestAnimationFrame(() => finish());
        return;
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") finish();
    };
    window.addEventListener("keydown", onKey);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [labels.steps, portraitSrc]);

  if (state === "done") return null;

  const litCount = Math.round(progress * litOrder.length);
  const percent = Math.round(progress * 100);

  return (
    <div
      className="intro fixed inset-0 z-[100] items-center justify-center bg-bg px-6"
      data-state={state}
      role="status"
      aria-label={labels.label}
    >
      <div className="bg-grid pointer-events-none absolute inset-0" aria-hidden />
      <div className="glow pointer-events-none absolute inset-0" aria-hidden />

      <div className="relative flex w-full max-w-3xl flex-col items-center gap-10 md:flex-row md:items-center md:justify-between">
        <div
          className="grid gap-[clamp(5px,1.2vw,9px)]"
          style={{ gridTemplateColumns: `repeat(${COLUMNS}, minmax(0, 1fr))` }}
          aria-hidden
        >
          {MATRIX.flatMap((row, rowIndex) =>
            row.split("").map((cell, column) => {
              const index = rowIndex * COLUMNS + column;
              const rank = rankByCell.get(index);
              const lit = rank !== undefined && rank < litCount;
              return (
                <span
                  key={index}
                  className={cn(
                    "size-[clamp(12px,3vw,20px)] rounded-full transition-[background-color,box-shadow,transform] duration-300",
                    lit
                      ? "scale-110 bg-accent shadow-[0_0_14px_var(--accent)]"
                      : cell === "1"
                        ? "bg-fg-subtle/35"
                        : "bg-border/25",
                  )}
                />
              );
            }),
          )}
        </div>

        <div className="w-full max-w-xs font-mono text-sm">
          <p className="text-fg">
            <span className="text-accent-strong">$</span> {labels.command}
          </p>
          <ul className="mt-3 grid gap-1.5">
            {labels.steps.map((step, index) => (
              <li key={step} className={cn("transition-colors", completed[index] ? "text-fg-muted" : "text-fg-subtle/60")}>
                <span className={cn("inline-block w-5", completed[index] ? "text-success" : "text-fg-subtle")} aria-hidden>
                  {completed[index] ? "✓" : "·"}
                </span>
                {step}
              </li>
            ))}
          </ul>
          <div className="mt-5 flex items-center gap-3">
            <div className="h-1 flex-1 overflow-hidden rounded-full bg-border" aria-hidden>
              <div
                className="h-full rounded-full bg-gradient-to-r from-accent to-violet"
                style={{ width: `${percent}%` }}
              />
            </div>
            <span className="w-10 text-right tabular-nums text-fg-muted">{percent}%</span>
          </div>
          <button
            type="button"
            onClick={() => skipRef.current()}
            className="mt-6 text-xs text-fg-subtle underline-offset-4 hover:text-fg hover:underline"
          >
            {labels.skip} <kbd className="ml-1 rounded border border-border px-1">Esc</kbd>
          </button>
        </div>
      </div>
    </div>
  );
}
