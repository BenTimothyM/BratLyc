import type { Request, Response } from 'express';
import { parseBuffer } from 'music-metadata';
import { HttpError } from '../middlewares/errorHandler';

export async function extract(req: Request, res: Response) {
  if (!req.file) throw new HttpError(400, 'Attach an audio file in the "audio" field');

  const fallbackTitle = req.file.originalname.replace(/\.[^.]+$/, '');
  try {
    const meta = await parseBuffer(
      req.file.buffer,
      { mimeType: req.file.mimetype, size: req.file.size },
      { duration: true, skipCovers: true },
    );
    res.json({
      title: meta.common.title || fallbackTitle,
      artist: meta.common.artist || meta.common.albumartist || '',
      album: meta.common.album || '',
      duration: meta.format.duration ?? 0,
    });
  } catch {
    res.json({ title: fallbackTitle, artist: '', album: '', duration: 0 });
  }
}
