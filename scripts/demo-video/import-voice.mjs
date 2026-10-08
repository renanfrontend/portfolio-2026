// Importa a narração gravada pelo Renan: limpa o áudio, separa os 11 trechos e mede cada um.
// Aceita (1) uma pasta com 01.m4a ... 11.m4a (qualquer formato de áudio) ou
//        (2) um único arquivo com uma pausa de uns 3 segundos entre os trechos.
// Uso: FFMPEG=caminho/ffmpeg.exe node scripts/demo-video/import-voice.mjs <arquivo-ou-pasta> <pasta-de-trabalho>
import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
import { narration } from "./narration.mjs";

const [source, work = "demo-video-work"] = process.argv.slice(2);
if (!source || !existsSync(source)) throw new Error("Informe o arquivo ou a pasta com a gravação.");
const ffmpeg = process.env.FFMPEG || "ffmpeg";
const audio = path.join(work, "audio");
mkdirSync(audio, { recursive: true });

// Voz: corta graves e ruído de fundo, suaviza "s" fortes, compressão leve e um pouco de presença.
const clean = [
  "highpass=f=80",
  "afftdn=nf=-28",
  "deesser=i=0.4",
  "equalizer=f=3000:t=q:w=1.2:g=2",
  "acompressor=threshold=-20dB:ratio=3:attack=5:release=80:makeup=2",
].join(",");
const trim = "silenceremove=start_periods=1:start_threshold=-42dB:start_silence=0.08";
const edges = `${trim},areverse,${trim},areverse`;

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

const audioFile = /\.(m4a|mp3|wav|ogg|opus|aac|flac|webm|mp4|3gp|amr)$/i;

if (statSync(source).isDirectory()) {
  // Modo 1: um arquivo por trecho, em ordem alfabética (01, 02, ... 11).
  const files = readdirSync(source).filter((name) => audioFile.test(name)).sort();
  if (files.length !== narration.length) {
    throw new Error(`Esperava ${narration.length} arquivos de áudio em ${source}, encontrei ${files.length}: ${files.join(", ")}`);
  }
  narration.forEach((item, index) => {
    run(["-i", path.join(source, files[index]), "-af", `${clean},${edges}`, "-ac", "1", "-ar", "48000", "-c:a", "pcm_s16le", path.join(audio, `${item.id}.wav`)]);
  });
} else {
  // Modo 2: arquivo único. Limpa tudo e separa pelos silêncios longos entre os trechos.
  const full = path.join(work, "voz-limpa.wav");
  run(["-i", source, "-af", clean, "-ac", "1", "-ar", "48000", "-c:a", "pcm_s16le", full]);
  const total = wavSeconds(full);
  const findSegments = (minSilence) => {
    const log = spawnSync(ffmpeg, ["-hide_banner", "-nostats", "-i", full, "-af", `silencedetect=noise=-38dB:d=${minSilence}`, "-f", "null", "-"], {
      encoding: "utf8",
    }).stderr;
    const starts = [...log.matchAll(/silence_start: ([\d.]+)/g)].map((match) => Number(match[1]));
    const ends = [...log.matchAll(/silence_end: ([\d.]+)/g)].map((match) => Number(match[1]));
    const segments = [];
    let cursor = 0;
    starts.forEach((start, index) => {
      if (start - cursor > 0.5) segments.push([cursor, start]);
      cursor = ends[index] ?? total;
    });
    if (total - cursor > 0.5) segments.push([cursor, total]);
    return segments;
  };
  // Tenta pausas de 1,6 s a 0,9 s até achar exatamente um trecho por cena.
  let segments = [];
  for (const minSilence of [1.6, 1.4, 1.2, 1.0, 0.9, 1.8, 2.2]) {
    segments = findSegments(minSilence);
    if (segments.length === narration.length) break;
  }
  if (segments.length !== narration.length) {
    const found = segments.map(([a, b], index) => `  ${index + 1}. ${a.toFixed(1)}s a ${b.toFixed(1)}s`).join("\n");
    throw new Error(
      `Esperava ${narration.length} trechos separados por pausas, encontrei ${segments.length}:\n${found}\n` +
        "Grave de novo com uma pausa de uns 3 segundos entre os trechos, ou salve um arquivo por trecho (01 a 11) numa pasta.",
    );
  }
  narration.forEach((item, index) => {
    const [start, end] = segments[index];
    run(["-ss", Math.max(0, start - 0.15).toFixed(3), "-to", (end + 0.15).toFixed(3), "-i", full, "-af", edges, "-c:a", "pcm_s16le", path.join(audio, `${item.id}.wav`)]);
  });
}

const durations = Object.fromEntries(narration.map((item) => [item.id, Math.round(wavSeconds(path.join(audio, `${item.id}.wav`)) * 1000)]));
writeFileSync(path.join(work, "durations.json"), JSON.stringify(durations, null, 2));
const total = Object.values(durations).reduce((sum, ms) => sum + ms, 0);
console.log(durations, `total de fala: ${(total / 1000).toFixed(1)} s`);
