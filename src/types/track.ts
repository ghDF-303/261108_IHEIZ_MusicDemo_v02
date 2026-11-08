import type { ImageMetadata } from 'astro';

export interface DownloadOptions {
  mp3?: string;
  wav?: string;
}

export interface TrackConfig {
  id: number;
  bgNumber?: string;
  isFeatured?: boolean;
  title: string;
  subtitle: string;
  /** Pfad unter public/, z. B. '/music/IHEIZ_01.mp3'. Wellenform per `npm run peaks` erzeugen. */
  audio: string;
  gradient: string;
  accentColor: string;
  download?: DownloadOptions;
  bgImage?: ImageMetadata; // Typ für Astros Bild-Pipeline
  bgOpacity?: number;
}

/** Lage eines Panels in der Reihe – bestimmt die Schrägen auf Mobile. */
export type PanelPosition = 'only' | 'first' | 'middle' | 'last';
