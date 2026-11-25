import type { Request, Response } from 'express';
import { HttpError } from '../middlewares/errorHandler';
import { getTrack, searchTracks } from '../services/lrclibService';
import { formatLrc, parseLrc, plainToLines, type LyricLine } from '../services/lrcFormatterService';

const str = (v: unknown) => (typeof v === 'string' && v.trim() ? v.trim() : undefined);

export async function search(req: Request, res: Response) {
  const query = str(req.query.q);
  const track = str(req.query.track);
  const artist = str(req.query.artist);
  if (!query && !track) throw new HttpError(400, 'Provide q or track');
  const results = await searchTracks({ query, track, artist });
  res.json({ results: results.slice(0, 20) });
}

export async function get(req: Request, res: Response) {
  const track = str(req.query.track);
  const artist = str(req.query.artist);
  const duration = Number(req.query.duration) || undefined;
  if (!track || !artist) throw new HttpError(400, 'track and artist are required');

  const found = await getTrack({ track, artist, duration });
  if (!found) throw new HttpError(404, 'No lyrics found for that track');

  const lines = found.syncedLyrics ? parseLrc(found.syncedLyrics).lines : [];
  res.json({ ...found, lines, synced: lines.length > 0 });
}

export function parse(req: Request, res: Response) {
  const { text, duration } = req.body ?? {};
  if (typeof text !== 'string') throw new HttpError(400, 'text is required');

  if (/\[\d{1,3}:\d{2}/.test(text)) return res.json({ ...parseLrc(text), synced: true });
  res.json({
    lines: plainToLines(text, typeof duration === 'number' ? duration : undefined),
    warnings: [],
    synced: false,
  });
}

export function format(req: Request, res: Response) {
  const { lines, title, artist, album } = req.body ?? {};
  if (!Array.isArray(lines)) throw new HttpError(400, 'lines must be an array');
  const clean = (lines as LyricLine[]).filter((l) => typeof l?.time === 'number' && typeof l?.text === 'string');
  res.json({ lrc: formatLrc(clean, { title, artist, album }) });
}
