import type { ImageMetadata } from 'astro';

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
  bgImage?: ImageMetadata; // Typ für Astros Bild-Pipeline
  bgOpacity?: number;
}

export interface TrackArtworkProps {
  trackNumber: string;
  trackId: string;
  accentColor: string;
  title: string;
}