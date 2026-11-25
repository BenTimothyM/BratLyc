export interface LyricLine {
  time: number;
  text: string;
}

export interface ParseResult {
  lines: LyricLine[];
  warnings: string[];
}

const TS = /\[(\d{1,3}):(\d{2}(?:\.\d{1,3})?)\]/g;

/** Parses synced LRC text. Supports multiple timestamps per line and skips ID tags like [ti:...]. */
export function parseLrc(input: string): ParseResult {
  const lines: LyricLine[] = [];
  const warnings: string[] = [];

  input.split(/\r?\n/).forEach((raw, i) => {
    if (!raw.trim()) return;
    const stamps = [...raw.matchAll(TS)];
    if (!stamps.length) {
      if (!/^\[[a-z]+:/i.test(raw.trim())) warnings.push(`line ${i + 1}: no timestamp, skipped`);
      return;
    }
    const text = raw.replace(TS, '').trim();
    if (!text) {
      warnings.push(`line ${i + 1}: timestamp without lyric text`);
      return;
    }
    for (const m of stamps) lines.push({ time: Number(m[1]) * 60 + Number(m[2]), text });
  });

  lines.sort((a, b) => a.time - b.time);
  return { lines, warnings };
}

/** Spreads plain lyric lines evenly across a duration (4s per line when duration is unknown). */
export function plainToLines(input: string, duration?: number): LyricLine[] {
  const texts = input.split(/\r?\n/).map((s) => s.trim()).filter(Boolean);
  const step = duration && duration > 0 ? duration / (texts.length + 1) : 4;
  return texts.map((text, i) => ({ time: Number((i * step).toFixed(2)), text }));
}

const pad = (n: number) => String(n).padStart(2, '0');

/** Serializes lines into a valid .lrc file with optional ID tags. */
export function formatLrc(lines: LyricLine[], meta: { title?: string; artist?: string; album?: string } = {}): string {
  const header = [
    meta.title && `[ti:${meta.title}]`,
    meta.artist && `[ar:${meta.artist}]`,
    meta.album && `[al:${meta.album}]`,
  ].filter(Boolean) as string[];

  const body = lines
    .filter((l) => Number.isFinite(l.time) && l.time >= 0 && l.text.trim())
    .sort((a, b) => a.time - b.time)
    .map((l) => {
      const m = Math.floor(l.time / 60);
      const s = l.time - m * 60;
      return `[${pad(m)}:${s.toFixed(2).padStart(5, '0')}]${l.text.trim()}`;
    });

  return [...header, ...body].join('\n') + '\n';
}
