// Gera a narração (voz do Windows), corta silêncios, trata o áudio e mede a duração de cada trecho.
// Uso: FFMPEG=caminho/ffmpeg.exe node scripts/demo-video/prepare-audio.mjs <pasta-de-trabalho> [Voz]
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { narration, toSsml } from "./narration.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const [work = "demo-video-work", voice = "Daniel"] = process.argv.slice(2);
const ffmpeg = process.env.FFMPEG || "ffmpeg";
const raw = path.join(work, "tts-raw");
const audio = path.join(work, "audio");
mkdirSync(audio, { recursive: true });

const jsonPath = path.join(work, "narration.json");
writeFileSync(jsonPath, JSON.stringify(narration.map((item) => ({ id: item.id, ssml: toSsml(item) }))), "utf8");
execFileSync(
  "powershell",
  ["-NoProfile", "-ExecutionPolicy", "Bypass", "-File", path.join(here, "tts.ps1"), "-Json", jsonPath, "-OutDir", raw, "-Voice", voice],
  { stdio: "inherit" },
);

// Silêncio das pontas fora; 48 kHz; corte de graves; compressão leve para a voz ficar presente no celular.
const trim = "silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.04";
const filter = [trim, "areverse", trim, "areverse", "aresample=48000", "highpass=f=80", "equalizer=f=3200:t=q:w=1.2:g=2.5", "acompressor=threshold=-20dB:ratio=3:attack=5:release=90"].join(",");

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

const durations = {};
for (const item of narration) {
  const out = path.join(audio, `${item.id}.wav`);
  execFileSync(ffmpeg, ["-y", "-hide_banner", "-loglevel", "error", "-i", path.join(raw, `${item.id}.wav`), "-af", filter, "-ac", "1", "-c:a", "pcm_s16le", out]);
  durations[item.id] = Math.round(wavSeconds(out) * 1000);
}
writeFileSync(path.join(work, "durations.json"), JSON.stringify(durations, null, 2));
const total = Object.values(durations).reduce((sum, ms) => sum + ms, 0);
console.log(durations, `total de fala: ${(total / 1000).toFixed(1)} s`);
