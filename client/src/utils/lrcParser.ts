import type { LyricLine } from '../types/lyrics.types';

const TS = /\[(\d{1,3}):(\d{2}(?:\.\d{1,3})?)\]/g;

/** Instant client-side LRC parse, used for demo lyrics and the live editor preview. */
export function parseLrcText(text: string): LyricLine[] {
  const out: LyricLine[] = [];
  for (const raw of text.split(/\r?\n/)) {
    const stamps = [...raw.matchAll(TS)];
    const body = raw.replace(TS, '').trim();
    if (!stamps.length || !body) continue;
    for (const m of stamps) out.push({ time: Number(m[1]) * 60 + Number(m[2]), text: body });
  }
  return out.sort((a, b) => a.time - b.time);
}
