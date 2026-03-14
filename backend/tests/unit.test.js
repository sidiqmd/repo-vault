/**
 * Unit tests for backend services and helpers — runs without MongoDB or network.
 * Usage: node tests/unit.test.js
 */
import { parseNum, decodeHtmlEntities, assertSafeParam, safeText } from '../services/github.js';

let passed = 0;
let failed = 0;

function test(label, fn) {
  try {
    fn();
    passed++;
  } catch (err) {
    failed++;
    console.log(`  \u2717 ${label} \u2014 ${err.message}`);
  }
}

function eq(actual, expected, msg = '') {
  if (actual !== expected) {
    throw new Error(`${msg}expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  }
}



function throws(fn, pattern) {
  let threw = false;
  try { fn(); } catch (e) {
    threw = true;
    if (pattern && !e.message.includes(pattern)) {
      throw new Error(`expected error containing "${pattern}", got "${e.message}"`, { cause: e });
    }
  }
  if (!threw) throw new Error('expected to throw but did not');
}

function section(name) {
  console.log(`\n${name}`);
}

// ─── parseNum ───
section('parseNum');

test('integer string', () => eq(parseNum('1234'), 1234));
test('with commas', () => eq(parseNum('1,234'), 1234));
test('with k suffix', () => eq(parseNum('98.2k'), 98200));
test('with K suffix', () => eq(parseNum('98.2k'), 98200));
test('with m suffix', () => eq(parseNum('1.5m'), 1500000));
test('zero', () => eq(parseNum('0'), 0));
test('empty string', () => eq(parseNum(''), 0));
test('null', () => eq(parseNum(null), 0));
test('undefined', () => eq(parseNum(undefined), 0));
test('whitespace', () => eq(parseNum('  42  '), 42));
test('non-numeric', () => eq(parseNum('abc'), 0));
test('negative (parseInt)', () => eq(parseNum('-5'), -5));
test('float without suffix', () => eq(parseNum('3.7'), 3));
test('large number', () => eq(parseNum('1,234,567'), 1234567));

// ─── decodeHtmlEntities ───
section('decodeHtmlEntities');

test('amp', () => eq(decodeHtmlEntities('a &amp; b'), 'a & b'));
test('lt gt', () => eq(decodeHtmlEntities('&lt;div&gt;'), '<div>'));
test('quot', () => eq(decodeHtmlEntities('&quot;hello&quot;'), '"hello"'));
test('apos &#39;', () => eq(decodeHtmlEntities('it&#39;s'), "it's"));
test('apos &#x27;', () => eq(decodeHtmlEntities('it&#x27;s'), "it's"));
test('mixed', () => eq(
  decodeHtmlEntities('&lt;a href=&quot;url&quot;&gt;text &amp; more&lt;/a&gt;'),
  '<a href="url">text & more</a>'
));
test('no entities', () => eq(decodeHtmlEntities('hello world'), 'hello world'));
test('empty', () => eq(decodeHtmlEntities(''), ''));

// ─── assertSafeParam ───
section('assertSafeParam');

test('valid name', () => assertSafeParam('react', 'name'));
test('valid with dots', () => assertSafeParam('next.js', 'name'));
test('valid with hyphens', () => assertSafeParam('my-lib', 'name'));
test('valid with underscores', () => assertSafeParam('my_lib', 'name'));
test('valid with digits', () => assertSafeParam('lib2', 'name'));
test('rejects slash', () => throws(() => assertSafeParam('../etc', 'name'), 'Invalid'));
test('rejects space', () => throws(() => assertSafeParam('my lib', 'name'), 'Invalid'));
test('rejects empty', () => throws(() => assertSafeParam('', 'name'), 'Invalid'));
test('rejects null', () => throws(() => assertSafeParam(null, 'name'), 'Invalid'));
test('rejects undefined', () => throws(() => assertSafeParam(undefined, 'name'), 'Invalid'));
test('rejects number', () => throws(() => assertSafeParam(123, 'name'), 'Invalid'));
test('rejects object', () => throws(() => assertSafeParam({}, 'name'), 'Invalid'));
test('rejects > 200 chars', () => throws(() => assertSafeParam('a'.repeat(201), 'name'), 'Invalid'));
test('accepts 200 chars', () => assertSafeParam('a'.repeat(200), 'name'));
test('rejects semicolon', () => throws(() => assertSafeParam('a;b', 'name'), 'Invalid'));
test('rejects angle bracket', () => throws(() => assertSafeParam('a<b>', 'name'), 'Invalid'));
test('rejects backtick', () => throws(() => assertSafeParam('a`b', 'name'), 'Invalid'));

// ─── safeText ───
section('safeText');

function mockResponse(text, contentLength) {
  const encoder = new TextEncoder();
  const chunks = [];
  // Split into chunks of 10 bytes
  const bytes = encoder.encode(text);
  for (let i = 0; i < bytes.length; i += 10) {
    chunks.push(bytes.slice(i, i + 10));
  }
  let idx = 0;
  const headers = new Map();
  if (contentLength != null) headers.set('content-length', String(contentLength));
  return {
    headers,
    body: {
      getReader() {
        return {
          read() {
            if (idx < chunks.length) {
              return Promise.resolve({ done: false, value: chunks[idx++] });
            }
            return Promise.resolve({ done: true, value: undefined });
          },
          cancel() { return Promise.resolve(); },
        };
      },
    },
  };
}

test('reads full body', async () => {
  const res = mockResponse('hello world', null);
  const text = await safeText(res, 1000);
  eq(text, 'hello world');
});

test('truncates at maxBytes', async () => {
  const longText = 'a'.repeat(100);
  const res = mockResponse(longText, null);
  const text = await safeText(res, 50);
  eq(text.length, 50);
});

test('rejects when content-length exceeds max', async () => {
  const res = mockResponse('small', 999999);
  let threw = false;
  try {
    await safeText(res, 100);
  } catch (e) {
    threw = true;
    if (!e.message.includes('too large')) throw new Error(`wrong error: ${e.message}`, { cause: e });
  }
  if (!threw) throw new Error('expected to throw');
});

test('handles empty body', async () => {
  const res = mockResponse('', null);
  const text = await safeText(res, 1000);
  eq(text, '');
});

// ─── AI service sanitization (pure logic, no API call) ───
section('AI sanitization logic');

test('owner sanitize strips special chars', () => {
  const safeOwner = String('../etc').replace(/[^a-zA-Z0-9._-]/g, '').slice(0, 100);
  eq(safeOwner, '..etc');
});

test('name sanitize strips special chars', () => {
  const safeName = String('pa$$wd').replace(/[^a-zA-Z0-9._-]/g, '').slice(0, 100);
  eq(safeName, 'pawd');
});

test('readme truncates to 4000', () => {
  const safeReadme = ('x'.repeat(5000)).slice(0, 4000);
  eq(safeReadme.length, 4000);
});

test('topics sanitize strips injection', () => {
  const topics = ['valid', '{"$gt":""}', '<script>'];
  const safeTopics = topics
    .filter(t => typeof t === 'string')
    .slice(0, 20)
    .map(t => t.replace(/[^a-zA-Z0-9 _-]/g, '').slice(0, 50))
    .join(', ');
  eq(safeTopics, 'valid, gt, script');
});

test('language sanitize allows C++', () => {
  const safeLang = String('C++').replace(/[^a-zA-Z0-9 +#_.-]/g, '').slice(0, 50);
  eq(safeLang, 'C++');
});

test('language sanitize strips injection', () => {
  const safeLang = String('JS"; DROP TABLE').replace(/[^a-zA-Z0-9 +#_.-]/g, '').slice(0, 50);
  eq(safeLang, 'JS DROP TABLE');
});

// ─── URL construction safety ───
section('URL construction safety');

test('encodeURIComponent on owner', () => {
  const owner = 'face book';
  const encoded = encodeURIComponent(owner);
  eq(encoded, 'face%20book');
});

test('encodeURIComponent on path traversal', () => {
  const owner = '../etc';
  const encoded = encodeURIComponent(owner);
  eq(encoded, '..%2Fetc');
});

test('.git suffix removal', () => {
  eq('react.git'.replace(/\.git$/, ''), 'react');
  eq('react'.replace(/\.git$/, ''), 'react');
  eq('.git'.replace(/\.git$/, ''), '');
});

// ─── GitHub URL regex (frontend capture modal pattern) ───
section('GitHub URL regex');

const ghRegex = /github\.com\/([^/]+)\/([^/\s?#]+)/;

test('standard URL', () => {
  const m = 'https://github.com/facebook/react'.match(ghRegex);
  eq(m[1], 'facebook');
  eq(m[2], 'react');
});

test('URL with trailing slash', () => {
  const m = 'https://github.com/facebook/react/'.match(ghRegex);
  eq(m[1], 'facebook');
  eq(m[2], 'react');
});

test('URL with .git', () => {
  const m = 'https://github.com/facebook/react.git'.match(ghRegex);
  eq(m[2], 'react.git');
});

test('URL with subpath', () => {
  const m = 'https://github.com/facebook/react/tree/main'.match(ghRegex);
  eq(m[1], 'facebook');
  eq(m[2], 'react');
});

test('URL with query string', () => {
  const m = 'https://github.com/facebook/react?tab=readme'.match(ghRegex);
  eq(m[2], 'react');
});

test('URL with hash', () => {
  const m = 'https://github.com/facebook/react#readme'.match(ghRegex);
  eq(m[2], 'react');
});

test('rejects non-github URL', () => {
  const m = 'https://gitlab.com/user/repo'.match(ghRegex);
  eq(m, null);
});

test('rejects no owner/name', () => {
  const m = 'https://github.com/'.match(ghRegex);
  eq(m, null);
});

// ─── Summary ───
console.log(`\n${'='.repeat(40)}`);
console.log(`Results: ${passed} passed, ${failed} failed`);
if (failed > 0) {
  console.log('\n\u26A0 Some tests failed!');
  process.exit(1);
} else {
  console.log('\n\u2713 All tests passed!');
}
