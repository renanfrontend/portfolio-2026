"use client";

import type { FieldSource } from "../code-rain";
import { CodeRainFigure } from "./code-rain-figure";

type NeuralHubProps = {
  label: string;
  countLabel: string;
  hint: string;
  locale: string;
  /** Rótulos das camadas, da esquerda para a direita. */
  layers: { title: string; description: string }[];
};

/** Texto revelado pela lente do cursor. */
const SOURCE = [
  "df = pd.read_csv(\"dados.csv\")",
  "X_train, X_test = split(df)",
  "model.fit(X_train, y_train)",
  "y_pred = model.predict(X_test)",
  "docs = embed(chunks)",
  "answer = rag.query(question)",
  "",
];

/** Camadas da rede: posição horizontal e número de nós. */
const LAYERS = [
  { x: 0.12, nodes: 4 },
  { x: 0.37, nodes: 6 },
  { x: 0.63, nodes: 6 },
  { x: 0.88, nodes: 3 },
];

type Pulse = { layer: number; from: number; to: number; progress: number; speed: number };

const nodeY = (layer: number, node: number) => 0.14 + ((node + 0.5) / LAYERS[layer].nodes) * 0.72;

/** Posição relativa (0 a 1) do nó dentro da camada. */
const relative = (layer: number, node: number) => (LAYERS[layer].nodes === 1 ? 0.5 : node / (LAYERS[layer].nodes - 1));

/** Cada nó se liga só aos vizinhos mais próximos da camada seguinte, para o desenho ficar legível. */
const EDGES: { layer: number; from: number; to: number }[] = [];
for (let layer = 0; layer < LAYERS.length - 1; layer += 1) {
  for (let from = 0; from < LAYERS[layer].nodes; from += 1) {
    for (let to = 0; to < LAYERS[layer + 1].nodes; to += 1) {
      if (Math.abs(relative(layer, from) - relative(layer + 1, to)) <= 0.36) EDGES.push({ layer, from, to });
    }
  }
}

/** Escolhe uma conexão existente a partir de um nó (ou de qualquer nó da camada). */
function randomPulse(layer = Math.floor(Math.random() * (LAYERS.length - 1)), from?: number): Pulse {
  const options = EDGES.filter((edge) => edge.layer === layer && (from === undefined || edge.from === from));
  const edge = options[Math.floor(Math.random() * options.length)] ?? EDGES[0];
  return { layer: edge.layer, from: edge.from, to: edge.to, progress: 0, speed: 0.025 + Math.random() * 0.03 };
}

/**
 * Rede neural desenhada em baixa resolução (uma célula = um pixel) e lida como campo de brilho:
 * dados entram à esquerda, passam pelos modelos e chegam ao produto, com pulsos correndo pelas conexões.
 */
function networkSource(): () => Promise<FieldSource> {
  return async () => {
    const scratch = document.createElement("canvas");
    const pulses: Pulse[] = Array.from({ length: 16 }, () => ({ ...randomPulse(), progress: Math.random() }));
    /** Brilho extra de cada nó quando recebe um pulso. */
    const flashes = LAYERS.map((layer) => new Float32Array(layer.nodes));

    function render(columns: number, rows: number, time: number, value: Float32Array, mask: Float32Array) {
      if (scratch.width !== columns || scratch.height !== rows) {
        scratch.width = columns;
        scratch.height = rows;
      }
      const g = scratch.getContext("2d", { willReadFrequently: true });
      if (!g) return;
      g.fillStyle = "#000";
      g.fillRect(0, 0, columns, rows);
      const px = (x: number) => x * columns;
      const py = (y: number) => y * rows;
      const unit = Math.min(columns, rows);

      // Conexões entre camadas vizinhas, discretas.
      g.strokeStyle = "rgba(255, 255, 255, 0.3)";
      g.lineWidth = 1;
      for (const edge of EDGES) {
        g.beginPath();
        g.moveTo(px(LAYERS[edge.layer].x), py(nodeY(edge.layer, edge.from)));
        g.lineTo(px(LAYERS[edge.layer + 1].x), py(nodeY(edge.layer + 1, edge.to)));
        g.stroke();
      }

      // Pulsos de dados percorrendo as conexões.
      g.fillStyle = "#fff";
      for (const pulse of pulses) {
        const x0 = LAYERS[pulse.layer].x;
        const x1 = LAYERS[pulse.layer + 1].x;
        const y0 = nodeY(pulse.layer, pulse.from);
        const y1 = nodeY(pulse.layer + 1, pulse.to);
        g.beginPath();
        g.arc(px(x0 + (x1 - x0) * pulse.progress), py(y0 + (y1 - y0) * pulse.progress), Math.max(1.2, unit * 0.022), 0, Math.PI * 2);
        g.fill();
      }

      // Nós vazados (leem melhor em caracteres): quadrados para os dados, círculos para os neurônios.
      LAYERS.forEach((layer, index) => {
        for (let node = 0; node < layer.nodes; node += 1) {
          const breathe = 1 + Math.sin(time * 0.002 + index * 1.7 + node) * 0.08;
          const radius = unit * (index === LAYERS.length - 1 ? 0.07 : 0.055) * breathe;
          const x = px(layer.x);
          const y = py(nodeY(index, node));
          const flash = flashes[index][node];
          // Apaga as conexões dentro do nó, para o contorno ficar nítido.
          g.fillStyle = "#000";
          g.beginPath();
          if (index === 0) g.rect(x - radius, y - radius, radius * 2, radius * 2);
          else g.arc(x, y, radius, 0, Math.PI * 2);
          g.fill();
          g.strokeStyle = "#fff";
          g.lineWidth = 1.3;
          g.stroke();
          // Núcleo, que acende quando o nó recebe um pulso.
          g.fillStyle = `rgba(255, 255, 255, ${Math.min(1, 0.45 + flash)})`;
          g.beginPath();
          g.arc(x, y, radius * (0.28 + flash * 0.3), 0, Math.PI * 2);
          g.fill();
        }
      });

      const data = g.getImageData(0, 0, columns, rows).data;
      for (let index = 0; index < value.length; index += 1) {
        const v = data[index * 4] / 255;
        value[index] = v;
        mask[index] = v > 0.04 ? 1 : 0;
      }
    }

    return {
      build(columns, rows) {
        const value = new Float32Array(columns * rows);
        const mask = new Float32Array(columns * rows);
        render(columns, rows, performance.now(), value, mask);
        return { value, mask };
      },
      update(field, columns, rows, time) {
        for (const flash of flashes) for (let i = 0; i < flash.length; i += 1) flash[i] *= 0.9;
        for (let i = 0; i < pulses.length; i += 1) {
          const pulse = pulses[i];
          pulse.progress += pulse.speed;
          if (pulse.progress >= 1) {
            flashes[pulse.layer + 1][pulse.to] = 0.55;
            // O pulso segue adiante pela rede; ao chegar ao fim, um novo começa nos dados.
            const next = pulse.layer + 1 < LAYERS.length - 1 ? pulse.layer + 1 : 0;
            pulses[i] = next === 0 ? randomPulse(0) : randomPulse(next, pulse.to);
          }
        }
        render(columns, rows, time, field.value, field.mask);
      },
    };
  };
}

export function NeuralHub({ label, countLabel, hint, locale, layers }: NeuralHubProps) {
  return (
    <div>
      <CodeRainFigure
        className="relative w-full"
        label={label}
        countLabel={countLabel}
        hint={hint}
        locale={locale}
        load={networkSource()}
        lensSource={SOURCE}
        columnsFor={(width) => (width < 420 ? 58 : 110)}
        aspect="4 / 3"
      />
      <ol className="mt-4 grid grid-cols-3 gap-3 text-center">
        {layers.map((layer, index) => (
          <li key={layer.title}>
            <p className="font-mono text-xs text-accent-strong">
              <span className="text-fg-subtle" aria-hidden>
                {String(index + 1).padStart(2, "0")}{" "}
              </span>
              {layer.title}
            </p>
            <p className="mt-1 text-xs text-fg-subtle">{layer.description}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}
