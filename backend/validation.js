import { z } from 'zod';

// ─── Shared primitives ───

const repoParam = z.string().regex(/^[a-zA-Z0-9._-]+$/).max(200);
const githubUrl = z.string().max(500).regex(/^https:\/\/github\.com\/[a-zA-Z0-9._-]+\/[a-zA-Z0-9._-]+\/?$/);
// Coerce date but treat empty string and null as undefined (strip the field)
const optionalDate = z.preprocess(
  (v) => (v === '' || v === null) ? undefined : v,
  z.coerce.date().optional()
);

const STATUSES = ['inbox', 'to-review', 'reviewed', 'to-implement', 'implemented', 'archived'];
const CATEGORIES = ['uncategorized', 'ai-ml', 'dev-tools', 'cli', 'libraries', 'learning', 'boilerplate', 'apis', 'data'];
const SORTS = ['savedAt', 'stars', 'name'];

// ─── Repo schemas ───

// Shared base fields for repo create/update
const repoFields = {
  url: githubUrl.optional(),
  name: repoParam.optional(),
  owner: repoParam.optional(),
  description: z.string().max(2000).optional(),
  stars: z.number().int().min(0).optional(),
  forks: z.number().int().min(0).optional(),
  language: z.string().max(100).optional(),
  license: z.string().max(100).optional(),
  lastCommit: optionalDate,
  topics: z.array(z.string().max(200)).max(50).optional(),
  category: z.string().max(100).optional(),
  status: z.enum(STATUSES).optional(),
  tags: z.array(z.string().max(200)).max(50).optional(),
  rating: z.number().min(0).max(5).nullable().optional(),
  notes: z.string().max(50_000).optional(),
  aiSummary: z.string().max(5000).optional(),
  readme: z.string().max(500_000).optional(),
  sparkline: z.array(z.number().finite()).max(50).optional(),
  readAt: optionalDate,
};

export const repoSchema = z.object(repoFields);

// Stricter schema for POST /api/repos — url, name, owner are required
export const repoCreateSchema = z.object({
  ...repoFields,
  url: githubUrl,
  name: repoParam,
  owner: repoParam,
});

// ─── Query params ───

export const repoQuerySchema = z.object({
  search: z.string().max(200).optional(),
  status: z.enum([...STATUSES, 'all']).optional(),
  category: z.string().max(100).optional(),
  sort: z.enum(SORTS).optional().default('savedAt'),
});

// ─── Bulk import ───

export const bulkSchema = z.object({
  repos: z.array(repoSchema).max(200),
});

// ─── Cache fields (subset of repo — no user-specific fields) ───

export const cacheSchema = z.object({
  description: z.string().max(2000).optional(),
  stars: z.number().int().min(0).optional(),
  forks: z.number().int().min(0).optional(),
  language: z.string().max(100).optional(),
  license: z.string().max(100).optional(),
  lastCommit: optionalDate,
  topics: z.array(z.string().max(200)).max(50).optional(),
  readme: z.string().max(500_000).optional(),
  sparkline: z.array(z.number().finite()).max(50).optional(),
  aiSummary: z.string().max(5000).optional(),
  aiCategory: z.string().max(100).optional(),
});

// ─── Enrich schemas ───

export const enrichGithubSchema = z.object({
  owner: repoParam,
  name: repoParam,
});

export const enrichSummarySchema = z.object({
  owner: repoParam,
  name: repoParam,
  readme: z.string().max(500_000).optional(),
});

export const enrichCategorizeSchema = z.object({
  summary: z.string().max(5000),
  topics: z.array(z.string().max(100)).max(30).optional(),
  language: z.string().max(100).optional(),
});

// ─── Settings schema ───

const settingValue = z.union([z.string().max(200), z.number(), z.boolean()]);

export const settingsSchema = z.object({
  defaultView: settingValue.optional(),
  cardDensity: settingValue.optional(),
  autoFetch: settingValue.optional(),
  aiSummary: settingValue.optional(),
  snapshotReadme: settingValue.optional(),
  autoCategory: settingValue.optional(),
  staleAlert: settingValue.optional(),
  weeklyDigest: settingValue.optional(),
  releaseAlert: settingValue.optional(),
  defaultSort: settingValue.optional(),
  exportFormat: settingValue.optional(),
  theme: settingValue.optional(),
  ghSync: settingValue.optional(),
  obsidian: settingValue.optional(),
});

// ─── Helpers ───

export const repoParamSchema = repoParam;

export const VALID_STATUSES = STATUSES;
export const VALID_SORTS = SORTS;
export const VALID_CATEGORIES = CATEGORIES;

// Shared fields that come from cache (GitHub metadata + AI)
export const CACHED_FIELDS = [
  'description', 'stars', 'forks', 'language', 'license',
  'lastCommit', 'topics', 'readme', 'sparkline', 'aiSummary',
];

/**
 * Parse request body with a zod schema.
 * Returns { data } on success, or sends 400 and returns { error: true }.
 */
export function parseBody(schema, body, res) {
  const result = schema.safeParse(body);
  if (!result.success) {
    const msg = result.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join('; ');
    res.status(400).json({ error: msg });
    return { error: true };
  }
  return { data: result.data };
}
