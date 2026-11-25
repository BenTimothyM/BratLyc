import cors from 'cors';
import express from 'express';
import { env } from './config/env';
import { errorHandler, notFound } from './middlewares/errorHandler';
import apiRoutes from './routes/apiRoutes';

const app = express();
app.disable('x-powered-by');
app.use(cors({ origin: env.clientOrigin }));
app.use(express.json({ limit: '1mb' }));
app.use('/api', apiRoutes);
app.use(notFound);
app.use(errorHandler);

app.listen(env.port, () => {
  console.log(`BratLyc API listening on http://localhost:${env.port}`);
});
