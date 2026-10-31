export interface DownloadOptions {
  mp3?: string;
  wav?: string;
}

export interface TrackConfig {
  id: number;
  title: string;
  subtitle: string;
  audio: string;
  download: DownloadOptions | false;
  gradient: string;
  accentColor: string;
}