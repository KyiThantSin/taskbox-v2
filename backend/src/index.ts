import http from 'http';
import express from 'express';
import cookieParser from 'cookie-parser';
import gateway from './routes/gateway';
import { errorHandler } from './middlewares/errorHandler';
import { prisma, waitForDb } from './db';

const PORT = Number(process.env.API_PORT) || 3000;

const app = express();
app.disable('x-powered-by');
app.use(express.json({ limit: '100kb' })); 
app.use(cookieParser());

app.use('/api', gateway);
app.use(errorHandler); 

let server: http.Server | undefined;

// graceful shutdown
async function shutdown(signal: string): Promise<void> {
  console.log(`[api] ${signal} received, shutting down gracefully`);
  try {
    const s = server;
    if (s) await new Promise<void>((resolve) => s.close(() => resolve()));
    await prisma.$disconnect();
    console.log('[api] bye');
    process.exit(0);
  } catch (err) {
    console.error('[api] error during shutdown:', err);
    process.exit(1);
  }
}
process.on('SIGTERM', () => void shutdown('SIGTERM'));
process.on('SIGINT', () => void shutdown('SIGINT'));

async function main(): Promise<void> {
  server = app.listen(PORT, '0.0.0.0', () => console.log(`[api] listening on port ${PORT}`));
  await waitForDb();
}

main().catch((err: unknown) => {
  console.error('[api] fatal:', err instanceof Error ? err.message : err);
  process.exit(1);
});
