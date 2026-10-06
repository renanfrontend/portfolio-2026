"use client";

import { loadLuminance, sampleAt, smoothstep } from "../portrait-sampling";
import type { FieldSource } from "../code-rain";
import { CodeRainFigure } from "./code-rain-figure";

type MatrixPortraitProps = {
  src: string;
  label: string;
  countLabel: string;
  hint: string;
  locale: string;
};

/** Texto revelado pela lente do cursor. */
const SOURCE = [
  "const renan = {",
  '  role: "Senior Frontend",',
  '  stack: ["React", "Next.js", "TS"],',
  '  base: "São Paulo",',
  '  focus: ["web", "dashboards", "ai"],',
  "} satisfies Developer;",
  "",
];

/** Retrato a partir da foto: a chuva revela o rosto aos poucos. */
function photoSource(src: string): () => Promise<FieldSource> {
  return async () => {
    const luminance = await loadLuminance(src);
    return {
      revealByRain: true,
      build(columns, rows, light) {
        const value = new Float32Array(columns * rows);
        const mask = new Float32Array(columns * rows);
        for (let row = 0; row < rows; row += 1) {
          for (let column = 0; column < columns; column += 1) {
            const index = row * columns + column;
            const sample = sampleAt(luminance, (column + 0.5) / columns, (row + 0.5) / rows);
            // No fundo escuro, áreas claras viram caracteres brilhantes; no claro, o inverso.
            const lum = light ? 1 - sample.lum : sample.lum;
            // Curva em S: realça olhos, barba e contornos.
            value[index] = smoothstep(0.1, 0.9, lum) * sample.mask;
            mask[index] = sample.mask;
          }
        }
        return { value, mask };
      },
    };
  };
}

export function MatrixPortrait({ src, label, countLabel, hint, locale }: MatrixPortraitProps) {
  return (
    <CodeRainFigure
      className="relative mx-auto w-full max-w-[36rem] lg:mx-0"
      label={label}
      countLabel={countLabel}
      hint={hint}
      locale={locale}
      load={photoSource(src)}
      lensSource={SOURCE}
      // Grade densa: mais caracteres deixam o rosto mais legível.
      columnsFor={(width) => (width < 420 ? 64 : 100)}
    />
  );
}
