# IHEIZ – Music Demo

Einseitige Promo-Seite für A&R: Tracks als schräge Panels, die sich per Klick öffnen und einen Player mit Wellenform zeigen. Dazu ein Info-Overlay mit Bio und Kontakt.

Gebaut mit [Astro](https://docs.astro.build) (statisch), Tailwind CSS v4 und GSAP.

## Einrichten

```sh
npm ci
```

Die Audiodateien sind **nicht** im Repository (`*.mp3`/`*.wav` stehen in `.gitignore`). Sie gehören nach `public/music/`, z. B. `public/music/IHEIZ_01.mp3`.

## Befehle

| Befehl            | Zweck                                                         |
| :---------------- | :------------------------------------------------------------ |
| `npm run dev`     | Entwicklungsserver (`astro dev --background` für Hintergrund) |
| `npm run build`   | Produktionsversion nach `dist/`                               |
| `npm run preview` | Gebaute Version lokal ansehen                                 |
| `npm run check`   | Typprüfung (TypeScript strict)                                |
| `npm run peaks`   | Wellenformen aus `public/music/*.mp3` neu berechnen           |

## Einen Track hinzufügen oder ersetzen

1. MP3 nach `public/music/` kopieren.
2. Eintrag in [`src/data/tracks.ts`](src/data/tracks.ts) anlegen (Titel, Farbe, Hintergrundbild, …).
3. `npm run peaks` ausführen. Das schreibt `src/data/waveforms.json` – diese Datei einchecken.

Ohne Schritt 3 berechnet der Browser die Wellenform selbst. Das funktioniert, lädt dafür aber die komplette Datei und ist auf Mobilgeräten langsam (Hinweis in der Browser-Konsole).

Das Layout rechnet sich für beliebig viele Tracks aus; ausgelegt und abgestimmt ist es auf drei. Bei mehr Tracks werden die Panels auf dem Desktop schmaler – die Titelgrößen in `TrackPanel.astro` dann ggf. anpassen.

## Aufbau

```text
public/
  fonts/              Inter (lokal, woff2)
  music/              Audiodateien (nicht in Git)
scripts/
  generate-peaks.mjs  Wellenformen vorberechnen
src/
  components/         TrackPanel, WaveformPlayer, InfoOverlay, Preloader, Artworks
  data/               tracks.ts (Inhalte), waveforms.json (generiert)
  layouts/            BaseLayout (Head, Meta-Tags, Schriften)
  pages/index.astro   Seite + Panel-Animationen (GSAP)
  styles/global.css   Tailwind, Schriften, eigene Komponenten-Klassen
  types/              TypeScript-Typen
```
