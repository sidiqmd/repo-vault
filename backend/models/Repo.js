import mongoose from 'mongoose';

const repoSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  url: { type: String, required: true },
  name: { type: String, required: true },
  owner: { type: String, required: true },
  description: String,
  stars: { type: Number, default: 0 },
  forks: { type: Number, default: 0 },
  language: String,
  license: String,
  lastCommit: Date,
  topics: [String],
  category: { type: String, default: 'uncategorized' },
  status: {
    type: String, default: 'inbox',
    enum: ['inbox', 'to-review', 'reviewed', 'to-implement', 'implemented', 'archived'],
  },
  tags: [String],
  rating: { type: Number, min: 0, max: 5 },
  notes: { type: String, default: '' },
  aiSummary: { type: String, default: '' },
  readme: String,
  sparkline: [Number],
  savedAt: { type: Date, default: Date.now },
  readAt: Date,
});

repoSchema.index({ userId: 1, url: 1 }, { unique: true });
repoSchema.index({ userId: 1, status: 1 });
repoSchema.index({ userId: 1, category: 1 });
repoSchema.index(
  { name: 'text', owner: 'text', description: 'text', aiSummary: 'text', notes: 'text' },
  { language_override: 'textSearchLanguage' }
);

export default mongoose.model('Repo', repoSchema);
