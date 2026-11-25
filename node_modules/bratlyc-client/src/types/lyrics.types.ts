export interface LyricLine {
  time: number;
  text: string;
}

export interface TrackMeta {
  title: string;
  artist: string;
  album: string;
  duration: number;
}

export interface LrclibTrack {
  id: number;
  trackName: string;
  artistName: string;
  albumName: string | null;
  duration: number;
  instrumental: boolean;
  plainLyrics: string | null;
  syncedLyrics: string | null;
}
