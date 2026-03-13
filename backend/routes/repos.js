import { Router } from 'express';
import mongoose from 'mongoose';
import Repo from '../models/Repo.js';
import RepoCache from '../models/RepoCache.js';
import { requireAuth } from '../middleware/auth.js';
import {
  repoSchema, repoCreateSchema, repoQuerySchema, bulkSchema, cacheSchema,
  repoParamSchema, parseBody, CACHED_FIELDS,
} from '../validation.js';
import log from '../config/logger.js';

const router = Router();
router.use(requireAuth);

function isValidId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

function isValidRepoParam(str) {
  return repoParamSchema.safeParse(str).success;
}

// GET /api/repos
router.get('/', async (req, res) => {
  const { error, data } = parseBody(repoQuerySchema, req.query, res);
  if (error) return;

  const query = { userId: req.user.id };
  if (data.status && data.status !== 'all') query.status = data.status;
  if (data.category && data.category !== 'all') query.category = data.category;
  if (data.search) query.$text = { $search: data.search };

  const sortMap = { savedAt: { savedAt: -1 }, stars: { stars: -1 }, name: { name: 1 } };
  const repos = await Repo.find(query).sort(sortMap[data.sort]).limit(500).lean();
  res.json(repos);
});

// POST /api/repos
router.post('/', async (req, res) => {
  const { error, data: clean } = parseBody(repoCreateSchema, req.body, res);
  if (error) return;

  const { owner, name } = clean;

  // Check shared cache for existing enrichment data
  let cacheData = {};
  if (owner && name && isValidRepoParam(owner) && isValidRepoParam(name)) {
    const cached = await RepoCache.lookup(owner, name);
    if (cached && cached.isFresh()) {
      for (const field of CACHED_FIELDS) {
        if (cached[field] != null && !clean[field]) {
          cacheData[field] = cached[field];
        }
      }
      if (cached.aiCategory && (!clean.category || clean.category === 'uncategorized')) {
        cacheData.category = cached.aiCategory;
      }
    }
  }

  try {
    const repo = await Repo.create({ ...cacheData, ...clean, userId: req.user.id });
    res.status(201).json(repo);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ error: 'Repo already in your vault' });
    }
    throw err;
  }
});

// PATCH /api/repos/:id
router.patch('/:id', async (req, res) => {
  if (!isValidId(req.params.id)) return res.status(400).json({ error: 'Invalid ID' });

  const { error, data: clean } = parseBody(repoSchema, req.body, res);
  if (error) return;

  const repo = await Repo.findOneAndUpdate(
    { _id: req.params.id, userId: req.user.id },
    { $set: clean },
    { returnDocument: 'after' }
  );
  if (!repo) return res.status(404).json({ error: 'Not found' });
  res.json(repo);
});

// DELETE /api/repos/:id
router.delete('/:id', async (req, res) => {
  if (!isValidId(req.params.id)) return res.status(400).json({ error: 'Invalid ID' });

  await Repo.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
  res.json({ ok: true });
});

// POST /api/repos/bulk
router.post('/bulk', async (req, res) => {
  const { error, data } = parseBody(bulkSchema, req.body, res);
  if (error) return;

  const repos = data.repos.map(r => ({ ...r, userId: req.user.id }));
  let inserted = 0;
  try {
    const result = await Repo.insertMany(repos, { ordered: false });
    inserted = result.length;
  } catch (err) {
    inserted = err.insertedDocs?.length || 0;
  }
  res.json({ imported: inserted });
});

// GET /api/repos/cache/:owner/:name
router.get('/cache/:owner/:name', async (req, res) => {
  if (!isValidRepoParam(req.params.owner) || !isValidRepoParam(req.params.name)) {
    return res.status(400).json({ error: 'Invalid params' });
  }
  const cached = await RepoCache.lookup(req.params.owner, req.params.name);
  if (cached && cached.isFresh()) {
    return res.json({ hit: true, data: cached });
  }
  res.json({ hit: false });
});

// PUT /api/repos/cache/:owner/:name
router.put('/cache/:owner/:name', async (req, res) => {
  if (!isValidRepoParam(req.params.owner) || !isValidRepoParam(req.params.name)) {
    return res.status(400).json({ error: 'Invalid params' });
  }
  const { error, data: clean } = parseBody(cacheSchema, req.body, res);
  if (error) return;

  const cached = await RepoCache.upsert(req.params.owner, req.params.name, clean);
  res.json(cached);
});

export default router;
