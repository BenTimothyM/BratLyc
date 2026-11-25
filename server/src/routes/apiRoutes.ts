import { Router } from 'express';
import * as lyrics from '../controllers/lyricsController';
import { extract } from '../controllers/metadataController';
import { audioUpload } from '../middlewares/uploadMiddleware';

const router = Router();

router.get('/health', (_req, res) => {
  res.json({ ok: true });
});
router.get('/lyrics/search', lyrics.search);
router.get('/lyrics/get', lyrics.get);
router.post('/lyrics/parse', lyrics.parse);
router.post('/lyrics/format', lyrics.format);
router.post('/metadata', audioUpload, extract);

export default router;
