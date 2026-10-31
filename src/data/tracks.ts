import type { TrackConfig } from '../types/track';

export const tracks: TrackConfig[] = [
  {
    id: 1,
    title: 'Track 01',
    subtitle: 'Industrial Beats',
    audio: '/music/IHEIZ_02.mp3',
    download: { mp3: '/music/IHEIZ_01.mp3', wav: '/music/IHEIZ_01.wav' },
    gradient: 'from-red-900 to-red-600',
    accentColor: '#f87171',
  },
  {
    id: 2,
    title: 'Track 02',
    subtitle: 'Cyberpunk Synth',
    audio: '/music/IHEIZ_01.wav',
    download: { wav: '/music/IHEIZ_01.wav' },
    gradient: 'from-amber-800 to-amber-500',
    accentColor: '#fbbf24',
  },
  {
    id: 3,
    title: 'Track 03',
    subtitle: 'Heavy Bass',
    audio: '/music/IHEIZ_03.mp3',
    download: false,
    gradient: 'from-slate-800 to-slate-600',
    accentColor: '#94a3b8',
  },
];