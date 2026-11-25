import 'dotenv/config';

export const env = {
  port: Number(process.env.PORT ?? 5174),
  clientOrigin: process.env.CLIENT_ORIGIN ?? 'http://localhost:5173',
  maxUploadMb: Number(process.env.MAX_UPLOAD_MB ?? 60),
};
