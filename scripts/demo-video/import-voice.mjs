// Importa a narração gravada pelo Renan: limpa o áudio, separa os 11 trechos e mede cada um.
// Aceita (1) uma pasta com 01 ... 11 (um arquivo de áudio por trecho, qualquer formato) ou
//        (2) um único arquivo com uma pausa de uns 3 segundos entre os trechos.
// Uso: FFMPEG=caminho/ffmpeg.exe node scripts/demo-video/import-voice.mjs <arquivo-ou-pasta> <pasta-de-trabalho> [--cortes=14.5,21.6]
// --cortes: inícios de trecho (em segundos) onde a pausa ficou curta demais para ser detectada sozinha.
import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
import { narration } from "./narration.mjs";

const args = process.argv.slice(2);
const [source, work = "demo-video-work"] = args.filter((arg) => !arg.startsWith("--"));
const cuts = (args.find((arg) => arg.startsWith("--cortes="))?.slice("--cortes=".length) ?? "")
  .split(",")
  .map(Number)
  .filter((value) => Number.isFinite(value) && value > 0);
if (!source || !existsSync(source)) throw new Error("Informe o arquivo ou a pasta com a gravação.");
const ffmpeg = process.env.FFMPEG || "ffmpeg";
const audio = path.join(work, "audio");
mkdirSync(audio, { recursive: true });

// Voz: mono, corta graves e agudos sem voz, reduz o ruído do microfone, suaviza "s" fortes,
// compressão leve e um pouco de presença. O volume final é ajustado no compose.mjs.
const clean = [
  "aformat=channel_layouts=mono",
  "highpass=f=80",
  "lowpass=f=10000",
  "afftdn=nr=18:nf=-30",
  "deesser=i=0.4",
  "equalizer=f=3000:t=q:w=1.2:g=2",
  "acompressor=threshold=-24dB:ratio=3:attack=5:release=80:makeup=2",
].join(",");
const fades = "afade=t=in:d=0.03,areverse,afade=t=in:d=0.06,areverse";

function run(args) {
  execFileSync(ffmpeg, ["-y", "-hide_banner", "-loglevel", "error", ...args]);
}

/** Duração de um WAV PCM a partir do cabeçalho. */
function wavSeconds(file) {
  const buffer = readFileSync(file);
  const byteRate = buffer.readUInt32LE(28);
  let offset = 12;
  while (offset < buffer.length - 8) {
    const id = buffer.toString("ascii", offset, offset + 4);
    const size = buffer.readUInt32LE(offset + 4);
    if (id === "data") return size / byteRate;
    offset += 8 + size + (size % 2);
  }
  throw new Error(`WAV sem bloco de dados: ${file}`);
}

/**
 * Trechos de fala pelo volume médio a cada 50 ms. O detector de silêncio do ffmpeg olha amostra por
 * amostra e falha com o chiado de microfone embutido; a média com limiar automático não.
 */
function speechSegments(file) {
  const WINDOW = 0.05;
  // O arquivo de saída do filtro fica na pasta de trabalho: caminhos com "C:" quebram a sintaxe do filtro.
  spawnSync(
    ffmpeg,
    ["-hide_banner", "-nostats", "-y", "-i", path.resolve(file), "-af", "asetnsamples=2400,astats=metadata=1:reset=1,ametadata=print:key=lavfi.astats.Overall.RMS_level:file=rms.txt", "-f", "null", "-"],
    { cwd: work },
  );
  const levels = readFileSync(path.join(work, "rms.txt"), "utf8")
    .split(/\r?\n/)
    .map((line) => /RMS_level=(\S+)/.exec(line)?.[1])
    .filter(Boolean)
    .map((value) => (value === "-inf" ? -120 : Number(value)));
  const sorted = [...levels].sort((a, b) => a - b);
  const noise = sorted[Math.floor(sorted.length * 0.15)];
  const speech = sorted[Math.floor(sorted.length * 0.85)];
  console.log(`ruído ${noise.toFixed(1)} dB, voz ${speech.toFixed(1)} dB`);

  // Duração esperada de cada trecho: proporcional ao tamanho do texto no roteiro.
  const chars = narration.map((item) => item.text.length);
  const totalChars = chars.reduce((sum, count) => sum + count, 0);

  const find = (threshold, minGap) => {
    const loud = levels.map((level) => level > threshold);
    /** Encosta início e fim do trecho na primeira e na última janela com voz. */
    const tighten = ([start, end]) => {
      let a = Math.round(start / WINDOW);
      let b = Math.round(end / WINDOW) - 1;
      while (a < b && !loud[a]) a += 1;
      while (b > a && !loud[b]) b -= 1;
      return [a * WINDOW, (b + 1) * WINDOW];
    };
    const gap = Math.round(minGap / WINDOW);
    const segments = [];
    let start = -1;
    let quiet = 0;
    loud.forEach((isLoud, index) => {
      if (isLoud) {
        if (start < 0) start = index;
        quiet = 0;
      } else if (start >= 0 && ++quiet >= gap) {
        segments.push([start * WINDOW, (index - quiet + 1) * WINDOW]);
        start = -1;
        quiet = 0;
      }
    });
    if (start >= 0) segments.push([start * WINDOW, (loud.length - quiet) * WINDOW]);
    // Cortes manuais dividem o trecho que os contém.
    const split = segments.flatMap((segment) => {
      const inside = cuts.filter((cut) => cut > segment[0] && cut < segment[1]).sort((a, b) => a - b);
      const bounds = [segment[0], ...inside, segment[1]];
      return bounds.slice(0, -1).map((from, index) => tighten([from, bounds[index + 1]]));
    });
    // Trechos com menos de 1 s são cliques e respirações, não fala.
    return split.filter(([a, b]) => b - a >= 1);
  };

  /** Quanto as durações fogem do esperado pelo texto (0 = proporção perfeita). */
  const deviation = (segments) => {
    const total = segments.reduce((sum, [a, b]) => sum + (b - a), 0);
    return segments.reduce((sum, [a, b], index) => sum + Math.abs(Math.log((b - a) / ((chars[index] / totalChars) * total))), 0);
  };

  // Testa limiares e pausas mínimas; fica com a divisão de 11 trechos mais coerente com o roteiro.
  let best = null;
  for (const factor of [0.25, 0.3, 0.35, 0.4, 0.45]) {
    for (const minGap of [2.0, 1.8, 1.6, 1.4, 1.2, 1.0, 0.8]) {
      const segments = find(noise + (speech - noise) * factor, minGap);
      if (segments.length !== narration.length) continue;
      const value = deviation(segments);
      if (!best || value < best.value) best = { value, segments, factor, minGap };
    }
  }
  if (!best) return find(noise + (speech - noise) * 0.35, 1.6);
  console.log(`limiar ${(noise + (speech - noise) * best.factor).toFixed(1)} dB, pausa mínima ${best.minGap} s, desvio ${best.value.toFixed(2)}`);
  return best.segments;
}

const audioFile = /\.(m4a|mp3|wav|ogg|opus|aac|flac|wma|webm|mp4|3gp|amr)$/i;

if (statSync(source).isDirectory()) {
  // Modo 1: um arquivo por trecho, em ordem numérica (01, 02, ... 11).
  const files = readdirSync(source)
    .filter((name) => audioFile.test(name))
    .sort((a, b) => a.localeCompare(b, "pt-BR", { numeric: true }));
  if (files.length !== narration.length) {
    throw new Error(`Esperava ${narration.length} arquivos de áudio em ${source}, encontrei ${files.length}: ${files.join(", ")}`);
  }
  const trim = "silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.08";
  narration.forEach((item, index) => {
    run(["-i", path.join(source, files[index]), "-af", `${clean},${trim},areverse,${trim},areverse,${fades}`, "-ar", "48000", "-c:a", "pcm_s16le", path.join(audio, `${item.id}.wav`)]);
  });
} else {
  // Modo 2: arquivo único. Limpa tudo e separa pelas pausas entre os trechos.
  const full = path.join(work, "voz-limpa.wav");
  run(["-i", source, "-af", clean, "-ar", "48000", "-c:a", "pcm_s16le", full]);
  // As pausas são medidas numa versão só com redução de ruído: a compressão levanta o chiado nas pausas.
  const analysis = path.join(work, "voz-analise.wav");
  run(["-i", source, "-af", "aformat=channel_layouts=mono,highpass=f=100,lowpass=f=6000,afftdn=nf=-25", "-ar", "48000", "-c:a", "pcm_s16le", analysis]);
  const segments = speechSegments(analysis);
  const list = segments.map(([a, b], index) => `  ${String(index + 1).padStart(2)}. ${a.toFixed(2)}s a ${b.toFixed(2)}s (${(b - a).toFixed(1)} s)`).join("\n");
  if (segments.length !== narration.length) {
    throw new Error(
      `Esperava ${narration.length} trechos, encontrei ${segments.length}:\n${list}\n` +
        "Indique onde começam os trechos grudados com --cortes=SEGUNDOS,SEGUNDOS ou grave com pausas maiores.",
    );
  }
  console.log(list);
  narration.forEach((item, index) => {
    const [start, end] = segments[index];
    run(["-ss", Math.max(0, start - 0.12).toFixed(3), "-to", (end + 0.18).toFixed(3), "-i", full, "-af", fades, "-c:a", "pcm_s16le", path.join(audio, `${item.id}.wav`)]);
  });
}

const durations = Object.fromEntries(narration.map((item) => [item.id, Math.round(wavSeconds(path.join(audio, `${item.id}.wav`)) * 1000)]));
writeFileSync(path.join(work, "durations.json"), JSON.stringify(durations, null, 2));
const total = Object.values(durations).reduce((sum, ms) => sum + ms, 0);
console.log(durations, `total de fala: ${(total / 1000).toFixed(1)} s`);
