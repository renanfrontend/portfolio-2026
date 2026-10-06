export const SAMPLE_SIZE = 200;

export function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

/**
 * Silhueta aproximada (cabeça + ombros) em coordenadas normalizadas da foto do GitHub,
 * com borda suave. Remove o fundo da foto sem processamento externo.
 */
export function silhouette(nx: number, ny: number): number {
  const head = 1 - Math.hypot((nx - 0.49) / 0.21, (ny - 0.38) / 0.33);
  let torso = -1;
  if (ny > 0.6) {
    const t = Math.min(1, (ny - 0.6) / 0.16);
    torso = 1 - Math.abs(nx - 0.49) / (0.17 + t * t * 0.36);
  }
  const bottomFade = 1 - smoothstep(0.82, 0.98, ny);
  const sideFade = smoothstep(0, 0.14, Math.min(nx, 1 - nx));
  return Math.max(0, Math.min(1, Math.max(head, torso) / 0.12)) * bottomFade * sideFade;
}

/** Luminância com contraste normalizado dentro da silhueta (percentis 3% e 97%). */
export function normalizedLuminance(pixels: Uint8ClampedArray): Float32Array {
  const values = new Float32Array(SAMPLE_SIZE * SAMPLE_SIZE);
  const inside: number[] = [];
  for (let index = 0; index < values.length; index += 1) {
    const i = index * 4;
    values[index] = (0.299 * pixels[i] + 0.587 * pixels[i + 1] + 0.114 * pixels[i + 2]) / 255;
    const x = (index % SAMPLE_SIZE) / SAMPLE_SIZE;
    const y = Math.floor(index / SAMPLE_SIZE) / SAMPLE_SIZE;
    if (silhouette(x, y) > 0.5) inside.push(values[index]);
  }
  inside.sort((a, b) => a - b);
  const low = inside[Math.floor(inside.length * 0.03)] ?? 0;
  const high = inside[Math.floor(inside.length * 0.97)] ?? 1;
  const range = Math.max(0.01, high - low);
  for (let index = 0; index < values.length; index += 1) {
    values[index] = Math.pow(Math.max(0, Math.min(1, (values[index] - low) / range)), 0.9);
  }
  return values;
}

/** Carrega a foto e devolve a luminância amostrada em SAMPLE_SIZE x SAMPLE_SIZE. */
export function loadLuminance(src: string): Promise<Float32Array> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.decoding = "async";
    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = SAMPLE_SIZE;
      canvas.height = SAMPLE_SIZE;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) return reject(new Error("Canvas 2D indisponível."));
      ctx.drawImage(image, 0, 0, SAMPLE_SIZE, SAMPLE_SIZE);
      resolve(normalizedLuminance(ctx.getImageData(0, 0, SAMPLE_SIZE, SAMPLE_SIZE).data));
    };
    image.onerror = () => reject(new Error("Não foi possível carregar o retrato."));
    image.src = src;
  });
}

/** Luminância x silhueta em um ponto normalizado (0 a 1). */
export function sampleAt(luminance: Float32Array, nx: number, ny: number): { lum: number; mask: number } {
  const px = Math.min(SAMPLE_SIZE - 1, Math.max(0, Math.floor(nx * SAMPLE_SIZE)));
  const py = Math.min(SAMPLE_SIZE - 1, Math.max(0, Math.floor(ny * SAMPLE_SIZE)));
  return { lum: luminance[py * SAMPLE_SIZE + px], mask: silhouette(nx, ny) };
}
