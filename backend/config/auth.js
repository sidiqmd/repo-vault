import { betterAuth } from 'better-auth';
import { mongodbAdapter } from 'better-auth/adapters/mongodb';
import { getDb, getMongoClient } from './db.js';

let authInstance;

export function initAuth() {
  const db = getDb();
  const client = getMongoClient();

  authInstance = betterAuth({
    database: mongodbAdapter(db, { client }),
    secret: process.env.BETTER_AUTH_SECRET,
    baseURL: process.env.BETTER_AUTH_URL,
    trustedOrigins: (process.env.CLIENT_URL || '').split(',').map(s => s.trim()).filter(Boolean),

    socialProviders: {
      github: {
        clientId: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        enabled: !!process.env.GITHUB_CLIENT_ID,
      },
      google: {
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        enabled: !!process.env.GOOGLE_CLIENT_ID,
      },
    },
  });

  return authInstance;
}

export function getAuth() {
  return authInstance;
}
