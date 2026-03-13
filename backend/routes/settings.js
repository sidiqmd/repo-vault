import { Router } from 'express';
import Settings from '../models/Settings.js';
import { requireAuth } from '../middleware/auth.js';
import { settingsSchema, parseBody } from '../validation.js';

const router = Router();
router.use(requireAuth);

// GET /api/settings — atomic get-or-create to prevent race condition
router.get('/', async (req, res) => {
  const settings = await Settings.findOneAndUpdate(
    { userId: req.user.id },
    { $setOnInsert: { userId: req.user.id } },
    { upsert: true, returnDocument: 'after', lean: true }
  );
  res.json(settings.config);
});

// PUT /api/settings — merges incoming keys with existing config
router.put('/', async (req, res) => {
  const { error, data: clean } = parseBody(settingsSchema, req.body, res);
  if (error) return;

  // Build $set with dotted paths to merge, not replace
  const update = {};
  for (const [key, val] of Object.entries(clean)) {
    update[`config.${key}`] = val;
  }

  const settings = await Settings.findOneAndUpdate(
    { userId: req.user.id },
    { $set: update },
    { returnDocument: 'after', upsert: true, lean: true }
  );
  res.json(settings.config);
});

export default router;
