import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoose from 'mongoose';
import { toNodeHandler } from 'better-auth/node';
import { connectDB, getMongoClient } from './config/db.js';
import { initAuth, getAuth } from './config/auth.js';
import log from './config/logger.js';
import repoRoutes from './routes/repos.js';
import settingsRoutes from './routes/settings.js';
import enrichRoutes from './routes/enrich.js';

const app = express();

// Trust one level of reverse proxy (Railway, Render, etc.)
// Required for rate limiter to use real client IP from X-Forwarded-For
app.set('trust proxy', 1);

app.use(helmet({
  contentSecurityPolicy: false, // frontend uses inline styles
}));

// CORS — supports comma-separated CLIENT_URL for multiple origins (e.g. localhost + Tailscale)
const allowedOrigins = (process.env.CLIENT_URL || '').split(',').map(s => s.trim()).filter(Boolean);
if (!allowedOrigins.length) {
  log.warn('CLIENT_URL not set — CORS will reject all cross-origin requests');
}
app.use(cors({
  origin: allowedOrigins.length === 1 ? allowedOrigins[0] : allowedOrigins,
  credentials: true,
}));

// Global rate limiter — 100 requests per minute per IP
app.use(rateLimit({ windowMs: 60_000, max: 100, standardHeaders: true, legacyHeaders: false }));

// Better Auth handles its own routes at /api/auth/*
// Mount BEFORE express.json() middleware
app.all('/api/auth/{*splat}', (req, res) => {
  const auth = getAuth();
  return toNodeHandler(auth)(req, res);
});

app.use(express.json({ limit: '1mb' }));

// App routes
app.use('/api/repos', repoRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/enrich', enrichRoutes);

// Health check — pings MongoDB to verify connectivity
const healthCheck = async (req, res) => {
  try {
    await mongoose.connection.db.admin().ping();
    res.json({ ok: true });
  } catch (err) {
    res.status(503).json({ ok: false, error: 'Database unavailable' });
  }
};
app.get('/api/health', healthCheck);

// Global error handler — prevents unhandled rejections from crashing the server
app.use((err, req, res, _next) => {
  log.error({ err, path: req.path, method: req.method }, 'Unhandled error');
  res.status(500).json({ error: 'Internal server error' });
});

// Start
const PORT = process.env.PORT || 5050;

// Fail-safe: refuse to start with the default placeholder secret
const secret = process.env.BETTER_AUTH_SECRET || '';
if (!secret || secret === 'change_me_to_a_random_32_char_string' || secret.length < 32) {
  log.fatal('BETTER_AUTH_SECRET is missing, too short (min 32 chars), or still set to the placeholder default.');
  process.exit(1);
}

let server;

connectDB().then(() => {
  initAuth();
  server = app.listen(PORT, '0.0.0.0', () => log.info(`API running on :${PORT}`));
}).catch(err => {
  log.fatal({ err }, 'Failed to connect to MongoDB');
  process.exit(1);
});

// Graceful shutdown — close connections before exit
async function shutdown(signal) {
  log.info({ signal }, 'Shutting down...');
  if (server) {
    server.close(() => log.info('HTTP server closed'));
  }
  try {
    await mongoose.disconnect();
    log.info('Mongoose disconnected');
    const client = getMongoClient();
    if (client) {
      await client.close();
      log.info('MongoClient closed');
    }
  } catch (err) {
    log.error({ err }, 'Error during shutdown');
  }
  process.exit(0);
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
