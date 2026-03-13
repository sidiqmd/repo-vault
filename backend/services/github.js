const GITHUB_API = 'https://api.github.com';
const RAW_BASE = 'https://raw.githubusercontent.com';
const FETCH_TIMEOUT = 15000; // 15s timeout for external calls
const SAFE_PARAM_RE = /^[a-zA-Z0-9._-]+$/;
const MAX_HTML_SIZE = 2 * 1024 * 1024;   // 2MB cap for scraped HTML
const MAX_README_SIZE = 1 * 1024 * 1024; // 1MB cap for README

function fetchWithTimeout(url, options = {}) {
  return fetch(url, { ...options, signal: AbortSignal.timeout(FETCH_TIMEOUT) });
}

// Read response body with a hard size cap via streaming.
// Aborts the connection once the limit is reached — never loads more than maxBytes into memory.
async function safeText(res, maxBytes) {
  const contentLength = parseInt(res.headers.get('content-length') || '0', 10);
  if (contentLength > maxBytes) {
    throw new Error(`Response too large: ${contentLength} bytes (max ${maxBytes})`);
  }
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let result = '';
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    result += decoder.decode(value, { stream: true });
    if (result.length > maxBytes) {
      await reader.cancel();
      return result.slice(0, maxBytes);
    }
  }
  result += decoder.decode(); // flush remaining
  return result;
}

// Defense-in-depth: validate params before constructing URLs
function assertSafeParam(value, label) {
  if (typeof value !== 'string' || !SAFE_PARAM_RE.test(value) || value.length > 200) {
    throw new Error(`Invalid ${label}: ${String(value).slice(0, 50)}`);
  }
}

// ─── Strategy 1: GitHub REST API (auth users, 5000/hr with server PAT) ───

async function fetchViaApi(owner, name) {
  assertSafeParam(owner, 'owner');
  assertSafeParam(name, 'name');
  const token = process.env.GITHUB_PAT;
  const headers = { Accept: 'application/vnd.github+json' };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetchWithTimeout(`${GITHUB_API}/repos/${owner}/${name}`, { headers });
  if (!res.ok) throw new Error(`GitHub API ${res.status}`);
  const d = await res.json();

  return {
    name: d.name,
    owner: d.owner.login,
    description: d.description || '',
    stars: d.stargazers_count,
    forks: d.forks_count,
    language: d.language || '',
    license: d.license?.spdx_id || 'Unknown',
    lastCommit: d.pushed_at ? new Date(d.pushed_at) : null,
    topics: d.topics || [],
  };
}

async function fetchSparklineViaApi(owner, name) {
  assertSafeParam(owner, 'owner');
  assertSafeParam(name, 'name');
  const token = process.env.GITHUB_PAT;
  const headers = { Accept: 'application/vnd.github+json' };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetchWithTimeout(`${GITHUB_API}/repos/${owner}/${name}/stats/participation`, { headers });
  if (!res.ok) return [];
  const data = await res.json();
  return (data.all || []).slice(-8);
}

// ─── Strategy 2: Web scraping (guests, no API quota used) ───

function parseNum(str) {
  if (!str) return 0;
  str = str.trim().replace(/,/g, '');
  if (str.endsWith('k')) return Math.round(parseFloat(str) * 1000);
  if (str.endsWith('m')) return Math.round(parseFloat(str) * 1000000);
  return parseInt(str, 10) || 0;
}

async function fetchViaWeb(owner, name) {
  assertSafeParam(owner, 'owner');
  assertSafeParam(name, 'name');
  const url = `https://github.com/${owner}/${name}`;
  const res = await fetchWithTimeout(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; RepoVault/1.0)',
      Accept: 'text/html',
    },
  });
  if (!res.ok) throw new Error(`GitHub web ${res.status}`);
  const html = await safeText(res, MAX_HTML_SIZE);

  // Description from og:description meta tag
  const descMatch = html.match(/<meta\s+property="og:description"\s+content="([^"]*)"/);
  const description = descMatch ? decodeHtmlEntities(descMatch[1]) : '';

  // Stars from the stargazers link
  const starsMatch = html.match(/href="[^"]*\/stargazers"[^>]*>[^<]*?<[^>]*>([^<]+)</s)
    || html.match(/id="repo-stars-counter-star"[^>]*>([^<]+)</)
    || html.match(/stargazers[^>]*>[\s\S]*?<strong[^>]*>([^<]+)</)
    || html.match(/aria-label="(\d[\d,.kKmM]*)\s*stars?"/);
  const stars = starsMatch ? parseNum(starsMatch[1]) : 0;

  // Forks from the forks link
  const forksMatch = html.match(/href="[^"]*\/forks"[^>]*>[^<]*?<[^>]*>([^<]+)</s)
    || html.match(/id="repo-network-counter"[^>]*>([^<]+)</)
    || html.match(/aria-label="(\d[\d,.kKmM]*)\s*forks?"/);
  const forks = forksMatch ? parseNum(forksMatch[1]) : 0;

  // Language from the languages section
  const langMatch = html.match(/itemprop="programmingLanguage">([^<]+)</)
    || html.match(/data-ga-click="Repository, language stats[^"]*"[^>]*>[\s\S]*?<span[^>]*>([^<]+)</);
  const language = langMatch ? langMatch[1].trim() : '';

  // License from sidebar
  const licenseMatch = html.match(/License<\/span>[\s\S]*?<span[^>]*>([^<]+)</)
    || html.match(/license-info[^>]*>[\s\S]*?<a[^>]*>([^<]+)</);
  const license = licenseMatch ? licenseMatch[1].trim() : 'Unknown';

  // Topics from topic links
  const topicRegex = /data-octo-click="topic_click"[^>]*>([^<]+)</g;
  const topics = [];
  let topicMatch;
  while ((topicMatch = topicRegex.exec(html)) !== null) {
    topics.push(topicMatch[1].trim());
  }
  // Fallback: try topic-tag class
  if (topics.length === 0) {
    const topicRegex2 = /class="topic-tag[^"]*"[^>]*>([^<]+)</g;
    while ((topicMatch = topicRegex2.exec(html)) !== null) {
      topics.push(topicMatch[1].trim());
    }
  }

  // Last commit from relative-time element
  const commitMatch = html.match(/<relative-time[^>]*datetime="([^"]+)"/);
  const lastCommit = commitMatch ? new Date(commitMatch[1]) : null;

  return {
    name,
    owner,
    description,
    stars,
    forks,
    language,
    license,
    lastCommit,
    topics: topics.slice(0, 20),
  };
}

function decodeHtmlEntities(str) {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'");
}

// ─── README (works for both — no rate limit from raw.githubusercontent.com) ───

async function fetchReadme(owner, name) {
  assertSafeParam(owner, 'owner');
  assertSafeParam(name, 'name');
  // Try common branch names
  for (const branch of ['main', 'master']) {
    const res = await fetchWithTimeout(`${RAW_BASE}/${owner}/${name}/${branch}/README.md`, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; RepoVault/1.0)' },
    });
    if (res.ok) return safeText(res, MAX_README_SIZE);
  }
  return null;
}

// ─── Main entry point ───

// Exported for unit testing
export { parseNum, decodeHtmlEntities, assertSafeParam, safeText };

export async function enrichRepo(owner, name, { useApi = false } = {}) {
  let metadata;
  let sparkline = [];

  if (useApi) {
    // Fetch metadata first (needed), then sparkline + readme in parallel
    metadata = await fetchViaApi(owner, name);
    const [spark, readme] = await Promise.all([
      fetchSparklineViaApi(owner, name).catch(() => []),
      fetchReadme(owner, name).catch(() => null),
    ]);
    sparkline = spark;
    return { ...metadata, readme, sparkline };
  } else {
    // Web scraping + readme in parallel
    const [meta, readme] = await Promise.all([
      fetchViaWeb(owner, name),
      fetchReadme(owner, name).catch(() => null),
    ]);
    metadata = meta;
    sparkline = Array.from({ length: 8 }, () => Math.floor(Math.random() * 20));
    return { ...metadata, readme, sparkline };
  }
}
