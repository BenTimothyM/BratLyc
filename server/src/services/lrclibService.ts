import NodeCache from 'node-cache';
import { HttpError } from '../middlewares/errorHandler';

const BASE = 'https://lrclib.net/api';
const USER_AGENT = 'BratLyc/1.0 (https://github.com/bratlyc)';
const cache = new NodeCache({ stdTTL: 60 * 60 * 6, checkperiod: 600, maxKeys: 500 });

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

async function lrclib<T>(path: string, params: URLSearchParams): Promise<T | null> {
  const key = `${path}?${params}`;
  const hit = cache.get<T | null>(key);
  if (hit !== undefined) return hit;

  let res: Response;
  try {
    res = await fetch(`${BASE}${path}?${params}`, { headers: { 'User-Agent': USER_AGENT } });
  } catch {
    throw new HttpError(502, 'Could not reach LRCLIB');
  }
  if (res.status === 404) {
    cache.set(key, null, 600);
    return null;
  }
  if (!res.ok) throw new HttpError(502, `LRCLIB responded with ${res.status}`);

  const data = (await res.json()) as T;
  cache.set(key, data);
  return data;
}

export async function searchTracks(q: { query?: string; track?: string; artist?: string }): Promise<LrclibTrack[]> {
  const p = new URLSearchParams();
  if (q.query) p.set('q', q.query);
  if (q.track) p.set('track_name', q.track);
  if (q.artist) p.set('artist_name', q.artist);
  return (await lrclib<LrclibTrack[]>('/search', p)) ?? [];
}

export function getTrack(q: { track: string; artist: string; duration?: number }): Promise<LrclibTrack | null> {
  const p = new URLSearchParams({ track_name: q.track, artist_name: q.artist });
  if (q.duration) p.set('duration', String(Math.round(q.duration)));
  return lrclib<LrclibTrack>('/get', p);
}
