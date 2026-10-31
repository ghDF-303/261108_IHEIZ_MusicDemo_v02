// src/types/track.ts

export interface DownloadOptions {
  mp3?: string;
  wav?: string;
  stems?: string;
}

export interface TrackConfig {
  id: number;
  title: string;
  subtitle: string;
  audio: string;
  gradient: string;
  accentColor: string;
  download: DownloadOptions;
  bgImage?: string;    // z. B. '/images/bg-01.png' oder '/images/texture.svg'
  bgOpacity?: number;  // Optional, z. B. 0.15 bis 0.3
}