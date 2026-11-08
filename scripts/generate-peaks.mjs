// scripts/generate-peaks.mjs
// Berechnet die Wellenform (Peaks) aller MP3-Dateien in public/music/ vorab
// und schreibt sie nach src/data/waveforms.json.
//
// Aufruf: npm run peaks
// Immer ausführen, wenn eine Audiodatei hinzukommt oder ersetzt wird.
// Die JSON-Datei wird eingecheckt; die MP3s selbst bleiben außerhalb von Git.

import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { MPEGDecoder } from 'mpg123-decoder';

// Muss zu BARS_COUNT in src/components/WaveformPlayer.astro passen.
const BARS_COUNT = 96;
const SAMPLE_STEP = 8;
const MIN_PEAK = 0.12;

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const musicDir = path.join(root, 'public', 'music');
const outFile = path.join(root, 'src', 'data', 'waveforms.json');

const CHUNK_SIZE = 64 * 1024;

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

const files = (await readdir(musicDir)).filter((f) => f.toLowerCase().endsWith('.mp3')).sort();
if (files.length === 0) {
  console.error(`Keine MP3-Dateien in ${musicDir} gefunden.`);
  process.exit(1);
}

const result = {};
for (const file of files) {
  const bytes = new Uint8Array(await readFile(path.join(musicDir, file)));
  const decoder = new MPEGDecoder();
  await decoder.ready;
  const { samples, samplesDecoded, sampleRate } = decodeDecimated(decoder, bytes);
  decoder.free();

  if (samples.length < BARS_COUNT) {
    console.warn(`  ! ${file}: konnte nicht dekodiert werden – übersprungen`);
    continue;
  }
  result[`/music/${file}`] = computePeaks(samples, BARS_COUNT);
  const minutes = (samplesDecoded / sampleRate / 60).toFixed(1);
  console.log(`  ✓ ${file} (${minutes} min)`);
}

await writeFile(outFile, JSON.stringify(result, null, 2) + '\n', 'utf8');
console.log(`Wellenformen für ${Object.keys(result).length} Datei(en) gespeichert: ${path.relative(root, outFile)}`);
