"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { startCodeRain, type FieldSource } from "../code-rain";

type CodeRainFigureProps = {
  /** Texto alternativo da ilustração. */
  label: string;
  /** Modelo com {count}, ex.: "Retrato com {count} caracteres". */
  countLabel: string;
  hint: string;
  locale: string;
  load: () => Promise<FieldSource>;
  lensSource: string[];
  columnsFor: (width: number) => number;
  /** Proporção largura/altura do quadro. */
  aspect?: string;
  className?: string;
  /** Conteúdo extra sobre a ilustração (ex.: rótulos). */
  children?: ReactNode;
};

const fade = "radial-gradient(ellipse 72% 72% at 50% 46%, #000 55%, transparent 100%)";

/** Quadro sem moldura: a chuva é desenhada sobre o fundo do site e esmaece nas bordas. */
export function CodeRainFigure({ label, countLabel, hint, locale, load, lensSource, columnsFor, aspect = "1 / 1", className, children }: CodeRainFigureProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayRef = useRef<HTMLCanvasElement>(null);
  const [count, setCount] = useState<number | null>(null);
  // As funções vêm de componentes de cliente estáveis; guardá-las em ref evita reiniciar a animação.
  const optionsRef = useRef({ load, lensSource, columnsFor });

  useEffect(() => {
    const canvas = canvasRef.current;
    const overlay = overlayRef.current;
    if (!canvas || !overlay) return;
    const options = optionsRef.current;
    return startCodeRain({ canvas, overlay, ...options, onCount: setCount });
  }, []);

  return (
    <figure className={className}>
      <div className="relative w-full" style={{ aspectRatio: aspect }}>
        <div className="absolute inset-0" style={{ maskImage: fade, WebkitMaskImage: fade }}>
          <canvas ref={canvasRef} role="img" aria-label={label} className="absolute inset-0 size-full" />
          {/* Camada dos feixes de luz; também recebe o cursor da lente. */}
          <canvas ref={overlayRef} aria-hidden className="absolute inset-0 size-full touch-pan-y" />
        </div>
        {children}
      </div>
      <figcaption className="mt-3 flex flex-col items-center gap-1 font-mono text-xs text-fg-subtle">
        <span className="text-fg-muted">{count === null ? " " : countLabel.replace("{count}", count.toLocaleString(locale))}</span>
        <span className="motion-reduce:hidden">{hint}</span>
      </figcaption>
    </figure>
  );
}
