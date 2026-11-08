// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';
import waveforms from './scripts/waveform-integration.mjs';

// https://astro.build/config
export default defineConfig({
  // Hält src/data/waveforms.json aktuell (siehe scripts/generate-peaks.mjs)
  integrations: [waveforms()],
  vite: {
    plugins: [tailwindcss()]
  },
  devToolbar: {
    enabled: false,
  },
});