import { api } from './api';

const REPOS_KEY = 'rv_repos';

function getLocal() {
  try { return JSON.parse(localStorage.getItem(REPOS_KEY) || '[]'); }
  catch { return []; }
}

function setLocal(repos) {
  localStorage.setItem(REPOS_KEY, JSON.stringify(repos));
}

export function createStorageService(isGuest) {
  return {
    async getRepos() {
      if (isGuest) return getLocal();
      const repos = await api.getRepos();
      // Normalize MongoDB _id to id for frontend consistency
      return repos.map(r => ({ ...r, id: r._id || r.id }));
    },

    async saveRepo(repo) {
      if (isGuest) {
        const repos = getLocal();
        repos.unshift(repo);
        setLocal(repos);
        return repo;
      }
      return api.saveRepo(repo);
    },

    async updateRepo(id, updates) {
      if (isGuest) {
        const repos = getLocal();
        const idx = repos.findIndex(r => r.id === id);
        if (idx >= 0) repos[idx] = { ...repos[idx], ...updates };
        setLocal(repos);
        return repos[idx];
      }
      return api.updateRepo(id, updates);
    },

    async deleteRepo(id) {
      if (isGuest) {
        const repos = getLocal();
        setLocal(repos.filter(r => r.id !== id));
        return;
      }
      return api.deleteRepo(id);
    },

    async migrateGuestData() {
      if (isGuest) return;
      const localRepos = getLocal();
      if (localRepos.length) {
        await api.bulkImport(localRepos).catch(() => {});
        localStorage.removeItem(REPOS_KEY);
      }
    },
  };
}
