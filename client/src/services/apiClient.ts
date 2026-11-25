import type { LrclibTrack, LyricLine, TrackMeta } from '../types/lyrics.types';

async function json<T>(res: Response): Promise<T> {
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((body as { error?: string }).error ?? `Request failed (${res.status})`);
  return body as T;
}

const qs = (p: Record<string, string | number | undefined>) =>
  new URLSearchParams(
    Object.entries(p)
      .filter(([, v]) => v !== undefined && v !== '')
      .map(([k, v]) => [k, String(v)]),
  ).toString();

const post = (url: string, body: unknown) =>
  fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

export const api = {
  searchLyrics: (p: { track?: string; artist?: string; q?: string }) =>
    fetch(`/api/lyrics/search?${qs(p)}`).then((r) => json<{ results: LrclibTrack[] }>(r)),

  getLyrics: (track: string, artist: string, duration?: number) =>
    fetch(`/api/lyrics/get?${qs({ track, artist, duration: duration ? Math.round(duration) : undefined })}`).then((r) =>
      json<LrclibTrack & { lines: LyricLine[]; synced: boolean }>(r),
    ),

  uploadAudio: (file: File) => {
    const form = new FormData();
    form.append('audio', file);
    return fetch('/api/metadata', { method: 'POST', body: form }).then((r) => json<TrackMeta>(r));
  },

  parseText: (text: string, duration?: number) =>
    post('/api/lyrics/parse', { text, duration }).then((r) =>
      json<{ lines: LyricLine[]; warnings: string[] }>(r),
    ),

  formatLrc: (lines: LyricLine[], meta: { title?: string; artist?: string }) =>
    post('/api/lyrics/format', { lines, ...meta }).then((r) => json<{ lrc: string }>(r)),
};
