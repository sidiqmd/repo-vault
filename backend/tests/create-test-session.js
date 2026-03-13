/**
 * Creates a test user + session directly in MongoDB for API testing.
 *
 * Usage:
 *   node tests/create-test-session.js
 *
 * Output:
 *   Prints the session cookie value to use in .rest files or curl.
 *   Cookie: better-auth.session_token=<token>
 */
import 'dotenv/config';
import crypto from 'crypto';
import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/repovault';

async function main() {
  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  const db = client.db();

  const userId = crypto.randomUUID();
  const sessionToken = crypto.randomBytes(32).toString('hex');
  const now = new Date();
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

  // Create user in Better Auth's users collection
  await db.collection('users').updateOne(
    { id: userId },
    {
      $set: {
        id: userId,
        name: 'Test User',
        email: 'test@repovault.dev',
        image: null,
        createdAt: now,
        updatedAt: now,
      },
    },
    { upsert: true }
  );

  // Create session in Better Auth's sessions collection
  await db.collection('sessions').updateOne(
    { userId },
    {
      $set: {
        id: crypto.randomUUID(),
        userId,
        token: sessionToken,
        expiresAt,
        createdAt: now,
        updatedAt: now,
        ipAddress: '127.0.0.1',
        userAgent: 'RepoVault-Test/1.0',
      },
    },
    { upsert: true }
  );

  console.log('\n=== Test Session Created ===');
  console.log(`User ID:  ${userId}`);
  console.log(`Expires:  ${expiresAt.toISOString()}`);
  console.log(`\nUse this cookie in .rest files or curl:\n`);
  console.log(`Cookie: better-auth.session_token=${sessionToken}`);
  console.log(`\ncurl example:`);
  console.log(`curl http://localhost:5050/api/repos -b "better-auth.session_token=${sessionToken}"`);

  await client.close();
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
