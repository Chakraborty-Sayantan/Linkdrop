export interface Metadata {
  title: string;
  artist: string;
  album: string;
  genre: string;
  year: string;
  track: string;
  comment: string;
}

export interface TimeRange {
  start: string;
  end: string;
}

export interface MediaFormat {
  format_id: string;
  format: string;
  quality: string;
  size: string;
  aspect?: string;
  url: string;
}

export interface MediaData {
  title: string;
  duration: string;
  thumbnail: string;
  original_url: string;
  preview_url: string;
  preview_audio_url: string;
  formats: {
    audio: MediaFormat[];
    video: MediaFormat[];
  };
  best_audio_id: string | null;
}

export interface MediaProcessorProps {
  mediaData: MediaData;
  onBack: () => void;
}