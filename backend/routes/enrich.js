import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import RepoCache from '../models/RepoCache.js';
import { enrichRepo } from '../services/github.js';
import { generateSummary, suggestCategory } from '../services/ai.js';
import { getAuth } from '../config/auth.js';
import { fromNodeHeaders } from 'better-auth/node';
import { requireAuth } from '../middleware/auth.js';
import { enrichGithubSchema, enrichSummarySchema, enrichCategorizeSchema, parseBody } from '../validation.js';
import log from '../config/logger.js';

const router = Router();

// Strict rate limits — GitHub enrichment: 20/min, AI calls: 10/min
const enrichLimiter = rateLimit({ windowMs: 60_000, max: 20, message: { error: 'Too many enrichment requests, try again later' } });
const aiLimiter = rateLimit({ windowMs: 60_000, max: 10, message: { error: 'Too many AI requests, try again later' } });

// Optional auth — works for both guests and signed-in users.
async function optionalAuth(req, res, next) {
  try {
    const auth = getAuth();
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });
    req.user = session?.user || null;
  } catch {
    req.user = null;
  }
  next();
}

// POST /api/enrich/github
router.post('/github', enrichLimiter, optionalAuth, async (req, res) => {
  const { error, data } = parseBody(enrichGithubSchema, req.body, res);
  if (error) return;

  const { owner, name } = data;

  try {
    // 1. Check shared cache
    const cached = await RepoCache.lookup(owner, name);
    if (cached && cached.isFresh()) {
      return res.json({ source: 'cache', data: cached });
    }

    // 2/3. Fetch GitHub data
    const isAuth = !!req.user;
    const enrichData = await enrichRepo(owner, name, { useApi: isAuth });

    // 4. AI enrichment — auth users only
    if (isAuth && process.env.ANTHROPIC_API_KEY) {
      try {
        const summary = await generateSummary(owner, name, enrichData.readme);
        if (summary) {
          enrichData.aiSummary = summary;
          const category = await suggestCategory(summary, enrichData.topics, enrichData.language);
          if (category) enrichData.aiCategory = category;
        }
      } catch (err) {
        log.warn({ err }, 'AI enrichment failed');
      }
    }

    // 5. Save to shared cache
    const saved = await RepoCache.upsert(owner, name, enrichData);

    res.json({ source: isAuth ? 'api' : 'web', data: saved });
  } catch (err) {
    log.error({ err }, 'Enrich failed');
    res.status(err.message.includes('404') ? 404 : 502).json({
      error: err.message.includes('404') ? 'Repository not found' : 'Failed to fetch repo data',
    });
  }
});

// POST /api/enrich/summary — regenerate AI summary
router.post('/summary', aiLimiter, requireAuth, async (req, res) => {
  const { error, data } = parseBody(enrichSummarySchema, req.body, res);
  if (error) return;

  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(503).json({ error: 'AI not configured' });
  }

  try {
    let readmeText = data.readme;
    if (!readmeText) {
      const cached = await RepoCache.lookup(data.owner, data.name);
      readmeText = cached?.readme || '';
    }

    const summary = await generateSummary(data.owner, data.name, readmeText);
    if (!summary) {
      return res.status(500).json({ error: 'Summary generation failed' });
    }

    await RepoCache.upsert(data.owner, data.name, { aiSummary: summary });
    res.json({ summary });
  } catch (err) {
    log.error({ err }, 'AI summary failed');
    res.status(500).json({ error: 'Summary generation failed' });
  }
});

// POST /api/enrich/categorize — suggest category from summary
router.post('/categorize', aiLimiter, requireAuth, async (req, res) => {
  const { error, data } = parseBody(enrichCategorizeSchema, req.body, res);
  if (error) return;

  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(503).json({ error: 'AI not configured' });
  }

  try {
    const category = await suggestCategory(data.summary, data.topics, data.language);
    res.json({ category: category || 'uncategorized' });
  } catch (err) {
    log.warn({ err }, 'AI categorize failed');
    res.json({ category: 'uncategorized' });
  }
});

export default router;
