// src/data/tracks.ts
import type { TrackConfig } from '../types/track';

export const tracks: TrackConfig[] = [
  {
    id: 1,
    title: 'Analogue Session',
    subtitle: '138 BPM / Techno',
    audio: '/music/IHEIZ_02.mp3',
    gradient: 'from-[#1A1A00] via-[#0D0E12] to-[#050505]',
    accentColor: '#FFE600', // Acid Yellow
    download: {
      wav: '/music/IHEIZ_02.mp3'
    },
    bgImage: '/images/bg-01.jpg', // Optional: Hier dein Bild/SVG hinterlegen (liegt in /public)
    bgOpacity: 0.15,
  },
  {
    id: 2,
    title: 'Traditions',
    subtitle: '142 BPM / Hypnotic / Raw Techno',
    audio: '/music/IHEIZ_01.wav',
    gradient: 'from-[#001A24] via-[#090C15] to-[#040508]',
    accentColor: '#00F0FF', // Cyber Cyan
    download: {
      wav: '/music/IHEIZ_01.wav'
    },
    bgImage: '/images/bg-02.jpg',
    bgOpacity: 0.18,
  },
  {
    id: 3,
    title: 'Deep Pulsar',
    subtitle: '138 BPM / Techno',
    audio: '/music/IHEIZ_03.mp3',
    gradient: 'from-[#240A0A] via-[#120B0D] to-[#080405]',
    accentColor: '#FF3344', // Hazard Red
    download: {
      mp3: '/music/IHEIZ_03.mp3'
    },
    bgImage: '/images/bg-03.jpg',
    bgOpacity: 0.12,
  },
];