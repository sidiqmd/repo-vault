import mongoose from 'mongoose';

// Shared cache for GitHub metadata + AI analysis.
// Keyed by owner/name. Any user's first add populates it;
// subsequent users reuse the cached data instead of re-calling
// GitHub API and AI analysis — saving cost.
const repoCacheSchema = new mongoose.Schema({
  owner: { type: String, required: true },
  name: { type: String, required: true },
  description: String,
  stars: { type: Number, default: 0 },
  forks: { type: Number, default: 0 },
  language: String,
  license: String,
  lastCommit: Date,
  topics: [String],
  readme: String,
  sparkline: [Number],
  aiSummary: { type: String, default: '' },
  aiCategory: { type: String, default: 'uncategorized' },
  fetchedAt: { type: Date, default: Date.now },
});

// One cache entry per repo
repoCacheSchema.index({ owner: 1, name: 1 }, { unique: true });

// Configurable freshness via CACHE_TTL_HOURS env var (default: 24)
repoCacheSchema.methods.isFresh = function (maxAgeMs) {
  if (maxAgeMs == null) {
    const hours = parseFloat(process.env.CACHE_TTL_HOURS) || 24;
    maxAgeMs = hours * 60 * 60 * 1000;
  }
  return this.fetchedAt && (Date.now() - this.fetchedAt.getTime()) < maxAgeMs;
};

// Static helper: look up or return null
repoCacheSchema.statics.lookup = function (owner, name) {
  return this.findOne({ owner: owner.toLowerCase(), name: name.toLowerCase() });
};

// Whitelist of fields allowed in cache updates — prevents arbitrary field injection
const CACHE_ALLOWED_FIELDS = new Set([
  'description', 'stars', 'forks', 'language', 'license',
  'lastCommit', 'topics', 'readme', 'sparkline',
  'aiSummary', 'aiCategory',
]);

// Static helper: save or update cache entry
// Strips null/undefined/empty values so a guest enrichment doesn't overwrite
// existing AI data with empty strings.
repoCacheSchema.statics.upsert = function (owner, name, data) {
  const clean = { owner: owner.toLowerCase(), name: name.toLowerCase(), fetchedAt: new Date() };
  for (const [key, val] of Object.entries(data)) {
    // Only allow whitelisted fields
    if (!CACHE_ALLOWED_FIELDS.has(key)) continue;
    // Skip null, undefined, and empty strings — don't overwrite existing data with blanks
    if (val == null || val === '') continue;
    // Skip empty arrays
    if (Array.isArray(val) && val.length === 0) continue;
    clean[key] = val;
  }
  return this.findOneAndUpdate(
    { owner: owner.toLowerCase(), name: name.toLowerCase() },
    { $set: clean },
    { upsert: true, returnDocument: 'after' }
  );
};

export default mongoose.model('RepoCache', repoCacheSchema);
