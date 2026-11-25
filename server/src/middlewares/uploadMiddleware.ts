import multer from 'multer';
import { env } from '../config/env';
import { HttpError } from './errorHandler';

const AUDIO_EXT = /\.(mp3|wav|ogg|m4a)$/i;

export const audioUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: env.maxUploadMb * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ok = file.mimetype.startsWith('audio/') || AUDIO_EXT.test(file.originalname);
    if (ok) cb(null, true);
    else cb(new HttpError(415, 'Only MP3, WAV, OGG and M4A files are accepted'));
  },
}).single('audio');
