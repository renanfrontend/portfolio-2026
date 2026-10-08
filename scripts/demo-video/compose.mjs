// Monta o vídeo final: quadros + narração + legendas queimadas, em MP4 (H.264/AAC).
// Trechos sem fala (digitação, carregamentos) são acelerados até 4x para o vídeo ficar enxuto.
// Uso: FFMPEG=caminho/ffmpeg.exe node scripts/demo-video/compose.mjs <landscape|portrait> <pasta-de-trabalho> <arquivo-saida.mp4>
import { execFileSync, spawnSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { narration } from "./narration.mjs";

const [format = "landscape", work = "demo-video-work", output = `demo-${format}.mp4`] = process.argv.slice(2);
const ffmpeg = process.env.FFMPEG || "ffmpeg";
const dir = path.join(work, format);
const timeline = JSON.parse(readFileSync(path.join(dir, "timeline.json"), "utf8"));
const durations = JSON.parse(readFileSync(path.join(work, "durations.json"), "utf8"));
const portrait = format === "portrait";
const { width, height } = timeline.size;

// ── Linha do tempo: tempo real -> tempo do vídeo ────────────────────────
const KEEP_AFTER_SPEECH = 600; // ms em velocidade normal depois de cada fala
const MAX_SPEED = 4;
/** A gravação foi feita em câmera lenta (record.mjs); aqui ela volta à velocidade real. */
const K = timeline.slowmo ?? 1;
const t0 = timeline.frames[0];
const segments = []; // { from, to, speed } em tempo real
const scenes = timeline.scenes.map((scene, index) => ({
  ...scene,
  end: timeline.scenes[index + 1]?.t ?? timeline.end,
  speech: durations[scene.id] ?? 0,
}));
segments.push({ from: t0, to: scenes[0].t, speed: K });
for (const scene of scenes) {
  const keepUntil = Math.min(scene.end, scene.t + (scene.speech + KEEP_AFTER_SPEECH) * K);
  segments.push({ from: scene.t, to: keepUntil, speed: K });
  const rest = (scene.end - keepUntil) / K; // em tempo da página
  if (rest <= 0) continue;
  // O encerramento fica em velocidade normal; esperas longas viram "avanço rápido".
  const speed = scene.id === "outro" ? 1 : Math.min(MAX_SPEED, Math.max(1, rest / 1500));
  segments.push({ from: keepUntil, to: scene.end, speed: speed * K });
}

function toVideoTime(t) {
  let out = 0;
  for (const segment of segments) {
    if (t <= segment.from) break;
    out += (Math.min(t, segment.to) - segment.from) / segment.speed;
  }
  return out;
}
const total = toVideoTime(timeline.end);

// ── Quadros (duração variável) ──────────────────────────────────────────
const lines = ["ffconcat version 1.0"];
timeline.frames.forEach((t, index) => {
  const next = timeline.frames[index + 1] ?? timeline.end;
  const duration = Math.max(0, toVideoTime(next) - toVideoTime(t)) / 1000;
  lines.push(`file 'frames/${String(index).padStart(6, "0")}.jpg'`, `duration ${duration.toFixed(4)}`);
});
lines.push(`file 'frames/${String(timeline.frames.length - 1).padStart(6, "0")}.jpg'`);
writeFileSync(path.join(dir, "frames.txt"), lines.join("\n"));

// ── Legendas (ASS) ──────────────────────────────────────────────────────
function chunks(text, max) {
  const words = text.split(/\s+/);
  const result = [];
  let current = "";
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length > max && current) {
      result.push(current);
      current = word;
    } else {
      current = candidate;
      // Quebra natural depois de pontuação, quando o trecho já tem bom tamanho.
      if (/[,.!?:]$/.test(word) && current.length >= max * 0.45) {
        result.push(current);
        current = "";
      }
    }
  }
  if (current) result.push(current);
  return result;
}

const assTime = (ms) => {
  const cs = Math.max(0, Math.round(ms / 10));
  const h = Math.floor(cs / 360000);
  const m = Math.floor((cs % 360000) / 6000);
  const s = Math.floor((cs % 6000) / 100);
  return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}.${String(cs % 100).padStart(2, "0")}`;
};

const style = portrait
  ? { size: 60, marginV: 420, marginH: 70, max: 44 }
  : { size: 48, marginV: 54, marginH: 150, max: 62 };
const events = [];
for (const item of narration) {
  const scene = scenes.find((candidate) => candidate.id === item.id);
  if (!scene) continue;
  const start = toVideoTime(scene.t);
  const speech = durations[item.id];
  const parts = chunks(item.text, style.max);
  const totalChars = parts.reduce((sum, part) => sum + part.length, 0);
  let cursor = start;
  for (const part of parts) {
    const length = (speech * part.length) / totalChars;
    events.push(`Dialogue: 0,${assTime(cursor)},${assTime(cursor + length)},Legenda,,0,0,0,,${part.replace(/[{}]/g, "")}`);
    cursor += length;
  }
}
const ass = `[Script Info]
ScriptType: v4.00+
PlayResX: ${width}
PlayResY: ${height}
WrapStyle: 0
ScaledBorderAndShadow: yes

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Legenda,Segoe UI,${style.size},&H00FFFFFF,&H00FFFFFF,&H1A0D0A0A,&H1A0D0A0A,1,0,0,0,100,100,0,0,3,${Math.round(style.size * 0.32)},0,2,${style.marginH},${style.marginH},${style.marginV},1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
${events.join("\n")}
`;
writeFileSync(path.join(dir, "captions.ass"), ass, "utf8");

// ── Áudio: cada fala no início da sua cena ──────────────────────────────
// 1) trilha de narração com as falas posicionadas; 2) mede a loudness; 3) aplica o ganho exato no vídeo final.
const TARGET_LUFS = -14; // referência usada por Instagram, LinkedIn e YouTube
const voiced = narration.filter((item) => scenes.some((scene) => scene.id === item.id));
const voiceInputs = [];
const delays = [];
voiced.forEach((item, index) => {
  voiceInputs.push("-i", path.resolve(work, "audio", `${item.id}.wav`));
  const delay = Math.round(toVideoTime(scenes.find((scene) => scene.id === item.id).t));
  delays.push(`[${index}:a]adelay=${delay}|${delay}[a${index}]`);
});
const voiceTrack = path.join(dir, "narration.wav");
execFileSync(ffmpeg, [
  "-y", "-hide_banner", "-loglevel", "error",
  ...voiceInputs,
  "-filter_complex",
  [...delays, `${voiced.map((_, index) => `[a${index}]`).join("")}amix=inputs=${voiced.length}:normalize=0:dropout_transition=0,aresample=48000,apad[a]`].join(";"),
  "-map", "[a]", "-t", (total / 1000).toFixed(3), "-ac", "1", "-c:a", "pcm_s16le", voiceTrack,
]);
// O ffmpeg escreve a medição no stderr.
const measured = spawnSync(ffmpeg, ["-hide_banner", "-nostats", "-i", voiceTrack, "-af", "ebur128", "-f", "null", "-"], { encoding: "utf8" }).stderr;
const integrated = Number(/Summary:[\s\S]*?I:\s+(-?[\d.]+) LUFS/.exec(measured ?? "")?.[1]);
// A voz é mono e vai igual para os dois canais: em estéreo, a medição EBU R128 sobe ~3 dB.
const gain = Number.isFinite(integrated) ? TARGET_LUFS - integrated - 3.01 : 0;
console.log(`narração: ${integrated} LUFS -> ganho ${gain.toFixed(1)} dB`);

const inputs = ["-f", "concat", "-safe", "0", "-i", "frames.txt", "-i", voiceTrack];
const filter = [
  `[0:v]fps=30,scale=${width}:${height}:flags=lanczos,format=yuv420p,ass=captions.ass[v]`,
  // Limitador em -1 dBFS para o ganho nunca estourar.
  `[1:a]volume=${gain.toFixed(2)}dB,alimiter=limit=0.891:level=false,pan=stereo|c0=c0|c1=c0[a]`,
].join(";");

execFileSync(
  ffmpeg,
  [
    "-y",
    "-hide_banner",
    "-loglevel",
    "error",
    ...inputs,
    "-filter_complex",
    filter,
    "-map",
    "[v]",
    "-map",
    "[a]",
    "-t",
    (total / 1000).toFixed(3),
    "-c:v",
    "libx264",
    "-preset",
    "medium",
    "-crf",
    "18",
    "-profile:v",
    "high",
    "-pix_fmt",
    "yuv420p",
    "-c:a",
    "aac",
    "-b:a",
    "192k",
    "-movflags",
    "+faststart",
    path.resolve(output),
  ],
  { cwd: dir, stdio: "inherit" },
);
console.log(`${output}: ${(total / 1000).toFixed(1)} s (${width}x${height})`);
