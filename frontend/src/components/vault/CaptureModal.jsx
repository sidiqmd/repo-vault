import { useState } from "react";
import { F } from "../../theme";
import { api } from "../../services/api";

export default function CaptureModal({ T, onClose, onAdd, onUpdateRepo, initialUrl = "" }) {
  const [url, setUrl] = useState(initialUrl);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    const input = url.trim();
    if (!input) return;

    const m = input.match(/github\.com\/([^/]+)\/([^/\s?#]+)/);
    if (!m) {
      setError("Paste a valid GitHub repo URL");
      return;
    }

    const [, owner, name] = m;
    const repoId = Date.now().toString();

    // Normalize URL to canonical GitHub form (prevents storing arbitrary URLs)
    const cleanName = name.replace(/\.git$/, "");
    const normalizedUrl = `https://github.com/${encodeURIComponent(owner)}/${encodeURIComponent(cleanName)}`;

    // 1. Immediately add skeleton card to vault
    const skeleton = {
      id: repoId,
      url: normalizedUrl,
      name: name.replace(/\.git$/, ""),
      owner,
      stars: 0,
      forks: 0,
      language: "",
      license: "",
      lastCommit: "",
      topics: [],
      category: "uncategorized",
      status: "inbox",
      tags: [],
      rating: null,
      notes: "",
      aiSummary: "",
      savedAt: new Date().toISOString(),
      readAt: null,
      sparkline: [],
      _enriching: true,
    };

    let saved;
    try {
      saved = await onAdd(skeleton);
    } catch (err) {
      setError(err.message?.includes('409') ? 'Repo already in your vault' : 'Failed to save repo');
      return;
    }
    onClose();

    // Use server-assigned _id if available, otherwise fall back to client id
    const actualId = saved?._id || repoId;

    // 2. Enrich in background via backend
    try {
      const res = await api.enrichGithub(owner, name.replace(/\.git$/, ""));
      if (res?.data) {
        const d = res.data;
        onUpdateRepo(actualId, {
          description: d.description || "",
          stars: d.stars || 0,
          forks: d.forks || 0,
          language: d.language || "",
          license: d.license || "Unknown",
          lastCommit: d.lastCommit || "",
          topics: d.topics || [],
          sparkline: d.sparkline || [],
          aiSummary: d.aiSummary || d.description || "",
          category: d.aiCategory || "uncategorized",
          _enriching: false,
        });
      }
    } catch {
      // Enrichment failed — card stays with basic info
      onUpdateRepo(actualId, { _enriching: false });
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 1100, background: T.overlayHeavy, backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div onClick={e => e.stopPropagation()} style={{ background: T.surface, borderRadius: 14, width: "100%", maxWidth: 460, boxShadow: T.modalShadow, position: "relative" }}>
        <button onClick={onClose} style={{ position: "absolute", top: 12, right: 12, width: 28, height: 28, borderRadius: 7, border: `1px solid ${T.bdr}`, background: T.bg, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", color: T.inkM }}>{"\u2715"}</button>
        <div style={{ padding: 24 }}>
          <h2 style={{ fontFamily: F.display, fontSize: "24px", fontWeight: 400, color: T.ink, marginBottom: 14 }}>Add to vault</h2>
          <input
            autoFocus
            value={url}
            onChange={e => { setUrl(e.target.value); setError(""); }}
            onKeyDown={handleKeyDown}
            placeholder="https://github.com/owner/repo"
            style={{ width: "100%", padding: "11px 14px", borderRadius: 8, border: `1.5px solid ${error ? "#EF4444" : T.bdr}`, background: T.bg, color: T.ink, fontSize: "14px", fontFamily: F.body, outline: "none", boxSizing: "border-box" }}
            onFocus={e => e.target.style.borderColor = error ? "#EF4444" : T.acc}
            onBlur={e => e.target.style.borderColor = error ? "#EF4444" : T.bdr}
          />
          {error ? (
            <p style={{ fontSize: "11px", color: "#EF4444", fontFamily: F.body, marginTop: 6 }}>{error}</p>
          ) : (
            <p style={{ fontSize: "11px", color: T.inkF, fontFamily: F.body, marginTop: 6 }}>Press Enter to add. Real data will be fetched automatically.</p>
          )}
        </div>
      </div>
    </div>
  );
}
