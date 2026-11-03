import express from 'express';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const isNginxRunning = Boolean(process.env.NGINX_PORT);
const PORT = isNginxRunning
  ? (Number(process.env.DEFAULT_APP_PORT) || 3000)
  : (Number(process.env.PORT) || Number(process.env.DEFAULT_APP_PORT) || 3000);
const isProduction = process.env.NODE_ENV === 'production';

app.use(express.json());

// Health check endpoint for Cloud Run
app.get('/api/health', (_req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

async function startServer() {
  if (!isProduction) {
    // In development mode, mount Vite middleware for instant HMR / dev
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // In production mode, serve built static files from dist
    const distPath = path.resolve(import.meta.dirname || '.', 'dist');
    const indexPath = path.join(distPath, 'index.html');

    if (!fs.existsSync(indexPath)) {
      console.log('Production build not found in dist/. Building application...');
      const { execSync } = await import('child_process');
      execSync('npm run build', { stdio: 'inherit' });
    }

    app.use(express.static(distPath));

    // SPA fallback: serve index.html for any unhandled route
    app.get('*', (_req, res) => {
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        res.status(404).send('Build not found. Please run npm run build.');
      }
    });
  }

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on port ${PORT} (mode: ${isProduction ? 'production' : 'development'})`);
  });

  server.on('error', (err) => {
    console.error('Server listen error:', err);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
