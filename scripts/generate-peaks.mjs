// scripts/generate-peaks.mjs
// Berechnet die Wellenform (Peaks) der MP3-Dateien in public/music/ vorab
// und speichert sie in src/data/waveforms.json (wird eingecheckt).
//
// Läuft automatisch über die Integration in scripts/waveform-integration.mjs
// (beim Start von `astro dev` / `astro build` und bei Änderungen im Musikordner).
// Manuell: `npm run peaks` – mit `-- --force` wird alles neu berechnet.
//
// Jede Datei wird über einen Prüfwert ihres Inhalts erkannt: Nur neue oder
// geänderte Dateien werden dekodiert, auch wenn eine Datei unter gleichem
// Namen ersetzt wurde.

import { createHash } from 'node:crypto';
import { existsSync } from 'node:fs';
import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

// Muss zu BARS_COUNT in src/components/WaveformPlayer.astro passen.
const BARS_COUNT = 96;
const SAMPLE_STEP = 8;
const MIN_PEAK = 0.12;
const CHUNK_SIZE = 64 * 1024;

const defaultRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const consoleLogger = {
  info: (msg) => console.log(msg),
  warn: (msg) => console.warn(msg),
};

/**
 * Dekodiert die Datei stückweise und behält nur jedes SAMPLE_STEP-te Sample
 * von Kanal 1 (als Betrag). Das hält den Speicherbedarf klein.
 */
function decodeDecimated(decoder, bytes) {
  const parts = [];
  let total = 0;
  let sampleRate = 0;
  let offset = 0; // Position im Gesamtsignal, damit der Schritt über Chunks hinweg stimmt

  for (let pos = 0; pos < bytes.length; pos += CHUNK_SIZE) {
    const { channelData, samplesDecoded, sampleRate: rate } = decoder.decode(bytes.subarray(pos, pos + CHUNK_SIZE));
    if (!samplesDecoded) continue;
    sampleRate = rate;
    const ch = channelData[0];
    const first = (SAMPLE_STEP - (offset % SAMPLE_STEP)) % SAMPLE_STEP;
    const part = new Float32Array(Math.ceil((samplesDecoded - first) / SAMPLE_STEP));
    for (let i = first, k = 0; i < samplesDecoded; i += SAMPLE_STEP, k++) part[k] = Math.abs(ch[i]);
    parts.push(part);
    total += part.length;
    offset += samplesDecoded;
  }

  const samples = new Float32Array(total);
  let at = 0;
  for (const part of parts) {
    samples.set(part, at);
    at += part.length;
  }
  return { samples, samplesDecoded: offset, sampleRate };
}

/** Gleiche Berechnung wie früher im Browser: Mittelwert der Beträge pro Block. */
function computePeaks(samples, bars) {
  const blockSize = Math.floor(samples.length / bars);
  const peaks = [];
  for (let i = 0; i < bars; i++) {
    let sum = 0;
    for (let j = i * blockSize; j < (i + 1) * blockSize; j++) sum += samples[j];
    peaks.push(sum / blockSize);
  }
  const max = Math.max(...peaks, 0.01);
  return peaks.map((p) => Number(Math.max(MIN_PEAK, p / max).toFixed(3)));
}

async function readJson(file) {
  try {
    return JSON.parse(await readFile(file, 'utf8'));
  } catch {
    return {};
  }
}

/** Kompakte, stabile Ausgabe: ein Track pro Block, Peaks in einer Zeile (übersichtliche Git-Diffs). */
function serialize(data) {
  const entries = Object.keys(data)
    .sort()
    .map((key) => {
      const { hash, peaks } = data[key];
      return `  ${JSON.stringify(key)}: {\n    "hash": ${JSON.stringify(hash)},\n    "peaks": ${JSON.stringify(peaks)}\n  }`;
    });
  return entries.length ? `{\n${entries.join(',\n')}\n}\n` : '{}\n';
}

/** Alle Audio-Pfade, die in src/data/tracks.ts vorkommen (z. B. '/music/IHEIZ_01.mp3'). */
async function referencedAudio(root) {
  try {
    const source = await readFile(path.join(root, 'src', 'data', 'tracks.ts'), 'utf8');
    return new Set([...source.matchAll(/['"](\/music\/[^'"]+\.mp3)['"]/gi)].map((m) => m[1]));
  } catch {
    return new Set();
  }
}

/**
 * Aktualisiert src/data/waveforms.json.
 * @returns {Promise<{ changed: boolean, computed: string[] }>}
 */
export async function generatePeaks({ root = defaultRoot, force = false, logger = consoleLogger } = {}) {
  const musicDir = path.join(root, 'public', 'music');
  const outFile = path.join(root, 'src', 'data', 'waveforms.json');

  const files = existsSync(musicDir)
    ? (await readdir(musicDir)).filter((f) => f.toLowerCase().endsWith('.mp3')).sort()
    : [];

  // Z. B. auf einem Build-Server ohne Audiodateien: eingecheckte Wellenformen behalten
  if (files.length === 0) {
    logger.info('Keine MP3-Dateien in public/music/ – vorhandene Wellenformen bleiben unverändert.');
    return { changed: false, computed: [] };
  }

  const previous = await readJson(outFile);
  const next = {};
  const computed = [];
  let MPEGDecoder;

  for (const file of files) {
    const key = `/music/${file}`;
    const bytes = new Uint8Array(await readFile(path.join(musicDir, file)));
    const hash = createHash('sha256').update(bytes).digest('hex').slice(0, 16);

    const known = previous[key];
    if (!force && known?.hash === hash && Array.isArray(known.peaks)) {
      next[key] = known;
      continue;
    }

    // Decoder (WebAssembly) nur laden, wenn wirklich etwas zu berechnen ist
    MPEGDecoder ??= (await import('mpg123-decoder')).MPEGDecoder;
    const decoder = new MPEGDecoder();
    await decoder.ready;
    let result;
    try {
      result = decodeDecimated(decoder, bytes);
    } finally {
      decoder.free();
    }

    if (result.samples.length < BARS_COUNT) {
      logger.warn(`${file}: konnte nicht dekodiert werden – übersprungen.`);
      if (known) next[key] = known;
      continue;
    }

    next[key] = { hash, peaks: computePeaks(result.samples, BARS_COUNT) };
    computed.push(file);
    const minutes = (result.samplesDecoded / result.sampleRate / 60).toFixed(1);
    logger.info(`Wellenform berechnet: ${file} (${minutes} min)`);
  }

  // Einträge, deren Datei fehlt, nur behalten, wenn tracks.ts sie noch verwendet
  const referenced = await referencedAudio(root);
  for (const [key, value] of Object.entries(previous)) {
    if (next[key]) continue;
    if (referenced.has(key)) {
      next[key] = value;
      logger.warn(`${key} wird in tracks.ts verwendet, fehlt aber in public/music/ – alte Wellenform bleibt erhalten.`);
    }
  }
  for (const key of referenced) {
    if (!next[key]) logger.warn(`${key} wird in tracks.ts verwendet, aber es gibt weder Datei noch Wellenform.`);
  }

  const output = serialize(next);
  const current = existsSync(outFile) ? await readFile(outFile, 'utf8') : '';
  const changed = output !== current.replace(/\r\n/g, '\n');
  if (changed) {
    await writeFile(outFile, output, 'utf8');
    logger.info(`Wellenformen gespeichert: src/data/waveforms.json (${Object.keys(next).length} Datei(en)).`);
  }
  return { changed, computed };
}

// Direkter Aufruf: npm run peaks [-- --force]
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const { changed, computed } = await generatePeaks({ force: process.argv.includes('--force') });
  if (!changed) console.log('Wellenformen sind aktuell.');
  else if (!computed.length) console.log('Wellenformen aktualisiert.');
}
