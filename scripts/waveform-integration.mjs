// scripts/waveform-integration.mjs
// Astro-Integration: hält src/data/waveforms.json automatisch aktuell.
//  - beim Start von `astro dev` und `astro build` (nur neue/geänderte MP3s werden berechnet)
//  - im laufenden Dev-Server, sobald in public/music/ eine MP3 hinzukommt, ersetzt oder gelöscht wird

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { generatePeaks } from './generate-peaks.mjs';

// Wartezeit nach der letzten Dateiänderung – große Dateien werden in mehreren Schritten geschrieben
const SETTLE_MS = 1500;

/** @returns {import('astro').AstroIntegration} */
export default function waveforms() {
  let root;

  return {
    name: 'iheiz-waveforms',
    hooks: {
      'astro:config:setup': async ({ config, command, logger }) => {
        root = fileURLToPath(config.root);
        if (command !== 'dev' && command !== 'build') return;
        try {
          await generatePeaks({ root, logger });
        } catch (error) {
          // Nie den Start/Build blockieren – im Notfall rechnet der Browser selbst
          logger.warn(`Wellenformen konnten nicht aktualisiert werden: ${error instanceof Error ? error.message : error}`);
        }
      },

      'astro:server:setup': ({ server, logger }) => {
        const musicDir = path.join(root, 'public', 'music');
        let timer;
        let running = Promise.resolve();

        const isMp3 = (file) => path.dirname(file) === musicDir && file.toLowerCase().endsWith('.mp3');
        const schedule = (file) => {
          if (!isMp3(path.resolve(file))) return;
          clearTimeout(timer);
          timer = setTimeout(() => {
            // Läufe nacheinander ausführen, nie parallel
            running = running.then(async () => {
              try {
                await generatePeaks({ root, logger });
              } catch (error) {
                logger.warn(`Wellenformen konnten nicht aktualisiert werden: ${error instanceof Error ? error.message : error}`);
              }
            });
          }, SETTLE_MS);
        };

        server.watcher.add(musicDir);
        server.watcher.on('add', schedule);
        server.watcher.on('change', schedule);
        server.watcher.on('unlink', schedule);
      },
    },
  };
}
