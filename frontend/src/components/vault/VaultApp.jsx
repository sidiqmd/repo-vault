import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { F } from "../../theme";
import { STATUSES } from "../../constants";
import { genSpark } from "../../utils";
import useLocalStorage from "../../hooks/useLocalStorage";
import Header from "./Header";
import Toolbar from "./Toolbar";
import RepoCard from "./RepoCard";
import RepoListRow from "./RepoListRow";
import KanbanColumn from "./KanbanColumn";
import DetailPanel from "./DetailPanel";
import CaptureModal from "./CaptureModal";
import OnboardingGuide from "./OnboardingGuide";
import SettingsPage from "./SettingsPage";

const DEMO = [
  { id: "1", name: "langchain", owner: "langchain-ai", stars: 98200, forks: 15800, language: "Python", license: "MIT", lastCommit: "2025-03-01", topics: ["llm"], category: "ai-ml", status: "reviewed", tags: ["work"], rating: 5, notes: "Core RAG framework.", aiSummary: "Framework for LLM-powered apps with chains, agents, retrieval and memory.", savedAt: "2025-02-15T10:30:00Z", readAt: "2025-02-18T14:00:00Z", sparkline: genSpark() },
  { id: "2", name: "ollama", owner: "ollama", stars: 112000, forks: 8900, language: "Go", license: "MIT", lastCommit: "2025-03-03", topics: ["llm"], category: "ai-ml", status: "implemented", tags: ["stable"], rating: 5, notes: "Local dev.", aiSummary: "Run large language models locally with a simple CLI and API.", savedAt: "2025-01-20T08:00:00Z", readAt: "2025-01-22T09:00:00Z", sparkline: genSpark() },
  { id: "3", name: "ruff", owner: "astral-sh", stars: 35600, forks: 1200, language: "Rust", license: "MIT", lastCommit: "2025-03-04", topics: ["python"], category: "dev-tools", status: "implemented", tags: ["stable"], rating: 4, notes: "Replaced flake8+black.", aiSummary: "Blazing-fast Python linter and formatter built in Rust.", savedAt: "2025-01-10T12:00:00Z", readAt: "2025-01-11T16:00:00Z", sparkline: genSpark() },
  { id: "4", name: "ui", owner: "shadcn-ui", stars: 78900, forks: 4800, language: "TypeScript", license: "MIT", lastCommit: "2025-03-03", topics: ["react"], category: "libraries", status: "to-implement", tags: ["work"], rating: 4, notes: "Dashboard rebuild.", aiSummary: "Copy-paste UI components on Radix primitives with Tailwind styling.", savedAt: "2025-02-28T15:00:00Z", readAt: "2025-03-01T10:00:00Z", sparkline: genSpark() },
  { id: "5", name: "litellm", owner: "BerriAI", stars: 15200, forks: 1800, language: "Python", license: "MIT", lastCommit: "2025-03-04", topics: ["llm"], category: "ai-ml", status: "inbox", tags: [], rating: null, notes: "", aiSummary: "Unified interface to 100+ LLM providers using OpenAI's API format.", savedAt: "2025-03-05T09:00:00Z", readAt: null, sparkline: genSpark() },
  { id: "6", name: "zed", owner: "zed-industries", stars: 52300, forks: 3200, language: "Rust", license: "GPL-3.0", lastCommit: "2025-03-05", topics: ["editor"], category: "dev-tools", status: "inbox", tags: ["weekend-project"], rating: null, notes: "", aiSummary: "GPU-accelerated code editor in Rust with real-time collaboration.", savedAt: "2025-03-04T18:00:00Z", readAt: null, sparkline: genSpark() },
];

const DEFAULT_CONFIG = {
  defaultView: "grid", cardDensity: "default", autoFetch: true, aiSummary: true,
  snapshotReadme: true, autoCategory: true, staleAlert: true, weeklyDigest: false,
  releaseAlert: false, defaultSort: "savedAt", exportFormat: "json", ghSync: false, obsidian: false,
};

export default function VaultApp({ T, dark, setDark, user, isGuest, storage, onLogout, onLogin }) {
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [config, setConfig] = useLocalStorage("rv_settings", DEFAULT_CONFIG);
  const [search, setSearch] = useState("");
  const [fCat, setFCat] = useState("all");
  const [fSt, setFSt] = useState("all");
  const [view, setView] = useState(config.defaultView || "grid");
  const [sel, setSel] = useState(null);
  const [showCap, setShowCap] = useState(false);
  const [sharedUrl, setSharedUrl] = useState("");
  const [sort, setSort] = useState(config.defaultSort || "savedAt");
  const [showGuide, setShowGuide] = useLocalStorage("rv_showGuide", true);
  const [showSettings, setShowSettings] = useState(false);
  const searchRef = useRef(null);

  // Handle PWA share target: ?shared_url=...
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const shared = params.get("shared_url") || params.get("url") || "";
    if (shared && shared.includes("github.com")) {
      setSharedUrl(shared);
      setShowCap(true);
      // Clean URL without reloading
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  // Load repos from storage on mount and when storage changes
  const seededRef = useRef(false);
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    storage.getRepos().then(data => {
      if (cancelled) return;
      // If guest with no saved repos, seed with demo data (once)
      if (isGuest && (!data || data.length === 0) && !seededRef.current) {
        seededRef.current = true;
        setRepos(DEMO);
        DEMO.forEach(r => storage.saveRepo(r));
      } else {
        setRepos(data || []);
      }
      setLoading(false);
    }).catch(() => {
      if (!cancelled) { setRepos([]); setLoading(false); }
    });
    return () => { cancelled = true; };
  }, [storage]);

  // When settings change defaultView/defaultSort, sync the active state
  const handleConfigChange = (newConfig) => {
    const prev = config;
    setConfig(newConfig);
    if (newConfig.defaultView !== prev.defaultView) setView(newConfig.defaultView);
    if (newConfig.defaultSort !== prev.defaultSort) setSort(newConfig.defaultSort);
  };

  useEffect(() => {
    const h = e => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA" || e.target.tagName === "SELECT") return;
      if (e.key === "/") { e.preventDefault(); searchRef.current?.focus(); }
      if (e.key === "n") { e.preventDefault(); setShowCap(true); }
      if (e.key === "Escape") { setSel(null); setShowCap(false); }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  const filtered = useMemo(() => repos.filter(r => {
    if (search) { const q = search.toLowerCase(); if (![r.name, r.owner, r.aiSummary, r.notes, ...(r.tags || []), ...(r.topics || [])].some(s => s?.toLowerCase().includes(q))) return false; }
    if (fCat !== "all" && r.category !== fCat) return false;
    if (fSt !== "all" && r.status !== fSt) return false;
    return true;
  }).sort((a, b) => sort === "stars" ? b.stars - a.stars : sort === "name" ? a.name.localeCompare(b.name) : new Date(b.savedAt) - new Date(a.savedAt)), [repos, search, fCat, fSt, sort]);

  const stats = useMemo(() => ({ total: repos.length, inbox: repos.filter(r => r.status === "inbox").length }), [repos]);
  const processed = repos.filter(r => r.status !== "inbox").length;
  const pct = repos.length ? Math.round((processed / repos.length) * 100) : 0;
  const density = config.cardDensity || "default";

  const handleAdd = useCallback(async (repo) => {
    setRepos(prev => [repo, ...prev]);
    const saved = await storage.saveRepo(repo);
    // Replace client-generated id with server _id so updates work
    if (saved?._id && saved._id !== repo.id) {
      setRepos(prev => prev.map(r => r.id === repo.id ? { ...r, id: saved._id, _id: saved._id } : r));
    }
    return saved;
  }, [storage]);

  const handleUpdateRepo = useCallback(async (id, updates) => {
    setRepos(prev => prev.map(r => (r.id === id || r._id === id) ? { ...r, ...updates } : r));
    await storage.updateRepo(id, updates);
  }, [storage]);

  const handleDeleteRepo = useCallback(async (id) => {
    setRepos(prev => prev.filter(r => r.id !== id && r._id !== id));
    setSel(null);
    await storage.deleteRepo(id);
  }, [storage]);

  return (
    <div style={{ minHeight: "100vh", background: T.bg }}>
      {showGuide && <OnboardingGuide T={T} onClose={() => setShowGuide(false)} />}
      {showSettings && <SettingsPage T={T} dark={dark} setDark={setDark} config={config} setConfig={handleConfigChange} onClose={() => setShowSettings(false)} />}

      <Header ref={searchRef} T={T} dark={dark} setDark={setDark} user={user} isGuest={isGuest} search={search} setSearch={setSearch} stats={stats} onLogin={onLogin} onLogout={onLogout} onShowSettings={() => setShowSettings(true)} onShowGuide={() => setShowGuide(true)} />

      <Toolbar T={T} fSt={fSt} setFSt={setFSt} fCat={fCat} setFCat={setFCat} sort={sort} setSort={setSort} view={view} setView={setView} />

      <main style={{ maxWidth: 1360, margin: "0 auto", padding: "14px 16px 80px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12, padding: "8px 14px", background: T.surface, border: `1px solid ${T.bdr}`, borderRadius: 8 }}>
          <span style={{ fontSize: "11px", fontWeight: 600, color: T.ink, fontFamily: F.body }}>Progress</span>
          <div style={{ flex: 1, height: 4, borderRadius: 2, background: T.bg, overflow: "hidden" }}><div style={{ height: "100%", borderRadius: 2, background: `linear-gradient(90deg,${T.acc},#D97706)`, width: `${pct}%`, transition: "width 0.5s" }} /></div>
          <span style={{ fontSize: "11px", color: T.inkF, fontFamily: F.mono }}>{pct}%</span>
        </div>

        {isGuest && <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12, padding: "8px 14px", background: T.accLt, border: `1px solid ${T.accBdr}`, borderRadius: 8, flexWrap: "wrap" }}>
          <span style={{ fontSize: "12px", color: T.ink, fontFamily: F.body, flex: 1, minWidth: 150 }}>Guest mode {"\u2014"} data in this browser only.</span>
          <button onClick={onLogin} style={{ padding: "4px 12px", borderRadius: 5, border: "none", background: T.acc, color: "#fff", fontSize: "11px", fontFamily: F.body, fontWeight: 600, cursor: "pointer" }}>Sign in to sync</button>
        </div>}

        {view === "kanban" ? (
          <div style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 12, scrollSnapType: "x mandatory", WebkitOverflowScrolling: "touch" }}>
            {STATUSES.map(s => (
              <KanbanColumn key={s.id} T={T} status={s} repos={filtered.filter(r => r.status === s.id)} onSelect={setSel} />
            ))}
          </div>
        ) : view === "list" ? (
          <div style={{ background: T.surface, borderRadius: 10, border: `1px solid ${T.bdr}`, overflow: "auto" }}>
            <table style={{ borderCollapse: "collapse", width: "100%", minWidth: 480 }}>
              <thead><tr style={{ borderBottom: `1px solid ${T.bdr}` }}>
                {["Repo", "Cat", "Lang", "", "Stars", "Saved"].map((h, i) => (<th key={i} style={{ padding: "7px 10px", fontSize: "10px", fontWeight: 700, color: T.inkF, fontFamily: F.mono, textAlign: i >= 4 ? "right" : i === 3 ? "center" : "left", background: T.bg }}>{h}</th>))}
              </tr></thead>
              <tbody>{filtered.map(r => <RepoListRow key={r.id} T={T} repo={r} onClick={() => setSel(r)} />)}</tbody>
            </table>
          </div>
        ) : (
          <div className="card-grid" style={{ display: "grid", gap: density === "compact" ? 8 : density === "expanded" ? 16 : 12 }}>
            {filtered.map(r => <RepoCard key={r.id} T={T} repo={r} density={density} onClick={() => setSel(r)} />)}
          </div>
        )}
        {filtered.length === 0 && <div style={{ textAlign: "center", padding: "50px 20px" }}><p style={{ fontFamily: F.display, fontSize: "22px", color: T.inkF }}>Nothing here</p></div>}
      </main>

      <button onClick={() => setShowCap(true)} title="Add (N)" style={{ position: "fixed", bottom: 20, right: 20, zIndex: 90, width: 48, height: 48, borderRadius: 14, border: "none", background: T.acc, color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px", fontWeight: 300, lineHeight: 1, boxShadow: `0 6px 20px ${T.acc}55`, transition: "all 0.2s" }}
        onMouseEnter={e => e.currentTarget.style.transform = "scale(1.08)"} onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}>+</button>

      <div style={{ position: "fixed", bottom: 24, left: 20, display: "flex", gap: 8, fontSize: "10px", color: T.inkF, fontFamily: F.mono, opacity: 0.4 }}>
        <span style={{ padding: "2px 5px", borderRadius: 3, border: `1px solid ${T.bdr}` }}>/</span><span>search</span>
        <span style={{ padding: "2px 5px", borderRadius: 3, border: `1px solid ${T.bdr}`, marginLeft: 4 }}>N</span><span>new</span>
      </div>

      {showCap && <CaptureModal T={T} onClose={() => { setShowCap(false); setSharedUrl(""); }} onAdd={handleAdd} onUpdateRepo={handleUpdateRepo} isGuest={isGuest} initialUrl={sharedUrl} />}
      {sel && <DetailPanel T={T} sel={sel} setSel={setSel} repos={repos} onUpdateRepo={handleUpdateRepo} onDeleteRepo={handleDeleteRepo} />}
    </div>
  );
}
