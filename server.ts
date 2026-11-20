import 'dotenv/config';
import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  handleAffirmations,
  handleChat,
  handleGoalAdvice,
  handleHealth,
  handleLetter,
  handleRoadmap,
} from './api/_lib/gemini.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;

async function createServer() {
  const app = express();
  app.use(express.json({ limit: '2mb' }));

  app.get('/api/health', (req: Request, res: Response) => {
    void handleHealth(req, res);
  });

  app.post('/api/chat', (req: Request, res: Response) => {
    void handleChat(req, res);
  });

  app.post('/api/letter', (req: Request, res: Response) => {
    void handleLetter(req, res);
  });

  app.post('/api/affirmations', (req: Request, res: Response) => {
    void handleAffirmations(req, res);
  });

  app.post('/api/roadmap', (req: Request, res: Response) => {
    void handleRoadmap(req, res);
  });

  app.post('/api/goal-advice', (req: Request, res: Response) => {
    void handleGoalAdvice(req, res);
  });

  // Dev Vite middleware or Prod static assets
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`FutureMe AI server listening on http://localhost:${PORT}`);
  });
}

createServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
