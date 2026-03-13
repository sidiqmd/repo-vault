// Validate MongoDB ObjectId format to prevent path traversal
const OBJECT_ID_RE = /^[a-f\d]{24}$/i;
function assertId(id) {
  if (!OBJECT_ID_RE.test(id)) throw new Error('Invalid ID format');
}

// Validate GitHub owner/name params before interpolating into URL paths
const REPO_PARAM_RE = /^[a-zA-Z0-9._-]+$/;
function assertRepoParam(val, label) {
  if (typeof val !== 'string' || !REPO_PARAM_RE.test(val) || val.length > 200) {
    throw new Error(`Invalid ${label}`);
  }
}

async function authFetch(path, options = {}) {
  const res = await fetch(path, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export const api = {
  getRepos: (params = {}) => {
    const qs = new URLSearchParams(
      Object.entries(params).filter(([, v]) => v && v !== 'all')
    ).toString();
    return authFetch(`/api/repos${qs ? `?${qs}` : ''}`);
  },
  saveRepo: (repo) => authFetch('/api/repos', { method: 'POST', body: JSON.stringify(repo) }),
  updateRepo: (id, data) => { assertId(id); return authFetch(`/api/repos/${id}`, { method: 'PATCH', body: JSON.stringify(data) }); },
  deleteRepo: (id) => { assertId(id); return authFetch(`/api/repos/${id}`, { method: 'DELETE' }); },
  bulkImport: (repos) => authFetch('/api/repos/bulk', { method: 'POST', body: JSON.stringify({ repos }) }),
  getSettings: () => authFetch('/api/settings'),
  saveSettings: (config) => authFetch('/api/settings', { method: 'PUT', body: JSON.stringify(config) }),

  // Shared repo cache — check before calling GitHub API / AI enrichment
  checkCache: (owner, name) => { assertRepoParam(owner, 'owner'); assertRepoParam(name, 'name'); return authFetch(`/api/repos/cache/${owner}/${name}`); },
  saveCache: (owner, name, data) => { assertRepoParam(owner, 'owner'); assertRepoParam(name, 'name'); return authFetch(`/api/repos/cache/${owner}/${name}`, { method: 'PUT', body: JSON.stringify(data) }); },

  // GitHub enrichment — backend fetches via API (auth) or web scraping (guest)
  // For auth users: also runs AI summary + auto-categorize automatically
  enrichGithub: (owner, name) => authFetch('/api/enrich/github', { method: 'POST', body: JSON.stringify({ owner, name }) }),

  // AI endpoints (auth only) — for manual re-summarize / re-categorize
  aiSummary: (owner, name, readme) => authFetch('/api/enrich/summary', { method: 'POST', body: JSON.stringify({ owner, name, readme }) }),
  aiCategorize: (summary, topics, language) => authFetch('/api/enrich/categorize', { method: 'POST', body: JSON.stringify({ summary, topics, language }) }),
};
