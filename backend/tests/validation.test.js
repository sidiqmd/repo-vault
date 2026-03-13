/**
 * Validation schema tests — runs without MongoDB.
 * Usage: node tests/validation.test.js
 */
import {
  repoSchema, repoCreateSchema, repoQuerySchema, bulkSchema, cacheSchema,
  enrichGithubSchema, enrichSummarySchema, enrichCategorizeSchema,
  settingsSchema, repoParamSchema, parseBody,
} from '../validation.js';

let passed = 0;
let failed = 0;

function test(label, schema, input, expectSuccess) {
  const r = schema.safeParse(input);
  const ok = r.success === expectSuccess;
  if (ok) {
    passed++;
  } else {
    failed++;
    const detail = r.success
      ? `expected FAIL but got data: ${JSON.stringify(r.data).slice(0, 80)}`
      : `expected OK but got: ${r.error.issues[0]?.message}`;
    console.log(`  ✗ ${label} — ${detail}`);
  }
}

function section(name) {
  console.log(`\n${name}`);
}

// ─── repoSchema ───
section('repoSchema');

test('valid full repo', repoSchema, {
  url: 'https://github.com/facebook/react',
  name: 'react', owner: 'facebook',
  description: 'UI library', stars: 220000, forks: 45000,
  language: 'JavaScript', license: 'MIT',
  status: 'inbox', category: 'libraries',
  tags: ['frontend', 'ui'], rating: 5,
  sparkline: [10, 15, 12, 18, 14, 20, 16, 22],
  notes: 'Great library',
}, true);

test('valid minimal', repoSchema, {}, true);
test('strips unknown fields', repoSchema, { name: 'test', userId: 'hacked' }, true);
test('strips __proto__', repoSchema, { name: 'test', __proto__: { admin: true } }, true);

// URL
test('valid URL', repoSchema, { url: 'https://github.com/a/b' }, true);
test('valid URL trailing slash', repoSchema, { url: 'https://github.com/a/b/' }, true);
test('rejects javascript: URL', repoSchema, { url: 'javascript:alert(1)' }, false);
test('rejects data: URL', repoSchema, { url: 'data:text/html,<script>alert(1)</script>' }, false);
test('rejects http URL', repoSchema, { url: 'http://github.com/a/b' }, false);
test('rejects non-github URL', repoSchema, { url: 'https://gitlab.com/a/b' }, false);
test('rejects URL > 500 chars', repoSchema, { url: 'https://github.com/a/' + 'b'.repeat(500) }, false);

// Name/Owner (repoParam)
test('valid name', repoSchema, { name: 'next.js' }, true);
test('valid name with dots/hyphens', repoSchema, { name: 'my-lib_v2.0' }, true);
test('rejects name with slash', repoSchema, { name: '../etc' }, false);
test('rejects name with spaces', repoSchema, { name: 'my lib' }, false);
test('rejects name > 200', repoSchema, { name: 'a'.repeat(201) }, false);

// Numbers
test('valid stars', repoSchema, { stars: 100 }, true);
test('stars = 0', repoSchema, { stars: 0 }, true);
test('rejects negative stars', repoSchema, { stars: -5 }, false);
test('rejects float stars', repoSchema, { stars: 1.5 }, false);
test('rejects string stars', repoSchema, { stars: '100' }, false);
test('valid forks', repoSchema, { forks: 0 }, true);
test('rejects negative forks', repoSchema, { forks: -1 }, false);

// Rating
test('rating 0', repoSchema, { rating: 0 }, true);
test('rating 5', repoSchema, { rating: 5 }, true);
test('rating 3.5', repoSchema, { rating: 3.5 }, true);
test('rejects rating > 5', repoSchema, { rating: 6 }, false);
test('rejects rating < 0', repoSchema, { rating: -1 }, false);
test('rejects rating NaN', repoSchema, { rating: NaN }, false);
test('rating null', repoSchema, { rating: null }, true);

// Status enum
test('valid status inbox', repoSchema, { status: 'inbox' }, true);
test('valid status archived', repoSchema, { status: 'archived' }, true);
test('rejects invalid status', repoSchema, { status: 'hacked' }, false);
test('rejects number status', repoSchema, { status: 1 }, false);

// Arrays
test('valid tags', repoSchema, { tags: ['react', 'ui'] }, true);
test('empty tags', repoSchema, { tags: [] }, true);
test('rejects object in tags', repoSchema, { tags: ['ok', { '$gt': '' }] }, false);
test('rejects number in tags', repoSchema, { tags: ['ok', 42] }, false);
test('rejects tags > 50', repoSchema, { tags: Array(51).fill('a') }, false);
test('valid sparkline', repoSchema, { sparkline: [5, 10, 3, 8] }, true);
test('rejects NaN in sparkline', repoSchema, { sparkline: [5, NaN] }, false);
test('rejects Infinity in sparkline', repoSchema, { sparkline: [Infinity] }, false);
test('rejects string in sparkline', repoSchema, { sparkline: ['5'] }, false);

// Strings with limits
test('valid description', repoSchema, { description: 'A test' }, true);
test('rejects description > 2000', repoSchema, { description: 'A'.repeat(2001) }, false);
test('valid notes 50KB', repoSchema, { notes: 'A'.repeat(50000) }, true);
test('rejects notes > 50KB', repoSchema, { notes: 'A'.repeat(50001) }, false);
test('rejects object description', repoSchema, { description: { '$gt': '' } }, false);

// Dates
test('valid ISO date', repoSchema, { lastCommit: '2024-01-01T00:00:00Z' }, true);
test('valid date string', repoSchema, { lastCommit: '2024-01-01' }, true);
test('empty string date', repoSchema, { lastCommit: '' }, true);
test('null date', repoSchema, { lastCommit: null }, true);
test('rejects invalid date', repoSchema, { lastCommit: 'not-a-date' }, false);
test('rejects object date', repoSchema, { lastCommit: { '$gt': '' } }, false);
test('readAt null', repoSchema, { readAt: null }, true);
test('readAt empty string', repoSchema, { readAt: '' }, true);
test('readAt valid', repoSchema, { readAt: '2024-06-01' }, true);

// ─── repoCreateSchema ───
section('repoCreateSchema');

test('valid create', repoCreateSchema, {
  url: 'https://github.com/facebook/react',
  name: 'react', owner: 'facebook',
}, true);
test('rejects missing url', repoCreateSchema, { name: 'react', owner: 'facebook' }, false);
test('rejects missing name', repoCreateSchema, { url: 'https://github.com/a/b', owner: 'a' }, false);
test('rejects missing owner', repoCreateSchema, { url: 'https://github.com/a/b', name: 'b' }, false);
test('rejects empty body', repoCreateSchema, {}, false);
test('allows optional fields', repoCreateSchema, {
  url: 'https://github.com/a/b', name: 'b', owner: 'a',
  stars: 100, description: 'test',
}, true);

// ─── repoQuerySchema ───
section('repoQuerySchema');

test('valid query', repoQuerySchema, { search: 'react', status: 'inbox', sort: 'stars' }, true);
test('default sort', repoQuerySchema, {}, true);
test('status all', repoQuerySchema, { status: 'all' }, true);
test('rejects invalid sort', repoQuerySchema, { sort: 'hacked' }, false);
test('rejects invalid status', repoQuerySchema, { status: 'hacked' }, false);
test('rejects search > 200', repoQuerySchema, { search: 'A'.repeat(201) }, false);

// ─── bulkSchema ───
section('bulkSchema');

test('valid bulk', bulkSchema, { repos: [{ name: 'react', owner: 'fb' }] }, true);
test('empty array', bulkSchema, { repos: [] }, true);
test('rejects > 200', bulkSchema, { repos: Array(201).fill({ name: 'x' }) }, false);
test('rejects non-array', bulkSchema, { repos: 'not-array' }, false);
test('rejects missing repos', bulkSchema, {}, false);
test('validates nested repo', bulkSchema, { repos: [{ stars: -1 }] }, false);

// ─── cacheSchema ───
section('cacheSchema');

test('valid cache', cacheSchema, { stars: 100, aiSummary: 'test', aiCategory: 'dev-tools' }, true);
test('rejects huge readme', cacheSchema, { readme: 'A'.repeat(500001) }, false);
test('rejects negative stars', cacheSchema, { stars: -1 }, false);

// ─── enrichGithubSchema ───
section('enrichGithubSchema');

test('valid', enrichGithubSchema, { owner: 'facebook', name: 'react' }, true);
test('rejects missing owner', enrichGithubSchema, { name: 'react' }, false);
test('rejects missing name', enrichGithubSchema, { owner: 'facebook' }, false);
test('rejects path traversal', enrichGithubSchema, { owner: '../etc', name: 'passwd' }, false);
test('rejects too long', enrichGithubSchema, { owner: 'a'.repeat(201), name: 'b' }, false);
test('strips extra fields', enrichGithubSchema, { owner: 'fb', name: 'react', evil: true }, true);

// ─── enrichSummarySchema ───
section('enrichSummarySchema');

test('valid', enrichSummarySchema, { owner: 'fb', name: 'react' }, true);
test('valid with readme', enrichSummarySchema, { owner: 'fb', name: 'react', readme: '# React' }, true);
test('rejects invalid owner', enrichSummarySchema, { owner: '../x', name: 'y' }, false);
test('rejects huge readme', enrichSummarySchema, { owner: 'fb', name: 'r', readme: 'A'.repeat(500001) }, false);

// ─── enrichCategorizeSchema ───
section('enrichCategorizeSchema');

test('valid', enrichCategorizeSchema, { summary: 'A library', topics: ['js'], language: 'JS' }, true);
test('valid without optionals', enrichCategorizeSchema, { summary: 'A library' }, true);
test('rejects missing summary', enrichCategorizeSchema, {}, false);
test('rejects object in topics', enrichCategorizeSchema, { summary: 'x', topics: [{ '$gt': '' }] }, false);
test('rejects topics > 30', enrichCategorizeSchema, { summary: 'x', topics: Array(31).fill('a') }, false);

// ─── settingsSchema ───
section('settingsSchema');

test('valid string', settingsSchema, { theme: 'dark' }, true);
test('valid boolean', settingsSchema, { autoFetch: false }, true);
test('valid number', settingsSchema, { defaultSort: 1 }, true);
test('rejects object', settingsSchema, { theme: { '$gt': '' } }, false);
test('rejects array', settingsSchema, { theme: [1, 2] }, false);
test('rejects string > 200', settingsSchema, { theme: 'A'.repeat(201) }, false);
test('strips unknown keys', settingsSchema, { theme: 'dark', evil: true }, true);

// ─── repoParamSchema ───
section('repoParamSchema');

test('valid', repoParamSchema, 'facebook', true);
test('valid with dots/hyphens', repoParamSchema, 'next.js', true);
test('rejects slash', repoParamSchema, '../etc', false);
test('rejects space', repoParamSchema, 'my lib', false);
test('rejects empty', repoParamSchema, '', false);
test('rejects > 200', repoParamSchema, 'a'.repeat(201), false);

// ─── parseBody helper ───
section('parseBody');

const mockRes = {
  _status: null,
  _body: null,
  status(code) { this._status = code; return this; },
  json(body) { this._body = body; },
};

const r1 = parseBody(enrichGithubSchema, { owner: 'fb', name: 'react' }, mockRes);
test('parseBody success', { safeParse: () => ({ success: !r1.error }) }, null, true);

const mockRes2 = { _status: null, _body: null, status(c) { this._status = c; return this; }, json(b) { this._body = b; } };
const r2 = parseBody(enrichGithubSchema, { owner: '../x' }, mockRes2);
test('parseBody failure returns error', { safeParse: () => ({ success: !!r2.error }) }, null, true);
test('parseBody sends 400', { safeParse: () => ({ success: mockRes2._status === 400 }) }, null, true);

// ─── Summary ───
console.log(`\n${'='.repeat(40)}`);
console.log(`Results: ${passed} passed, ${failed} failed`);
if (failed > 0) {
  console.log('\n⚠ Some tests failed!');
  process.exit(1);
} else {
  console.log('\n✓ All tests passed!');
}
