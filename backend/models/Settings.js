import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema({
  userId: { type: String, unique: true, required: true },
  config: {
    type: mongoose.Schema.Types.Mixed,
    default: {
      defaultView: 'grid', cardDensity: 'default',
      autoFetch: true, aiSummary: true, snapshotReadme: true,
      autoCategory: true, staleAlert: true, weeklyDigest: false,
      releaseAlert: false, defaultSort: 'savedAt',
      exportFormat: 'json', theme: 'dark',
    },
  },
});

export default mongoose.model('Settings', settingsSchema);
