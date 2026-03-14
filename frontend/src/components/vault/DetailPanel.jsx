import { useState, useEffect, useRef, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { F } from "../../theme";
import { CATEGORIES, STATUSES, TAG_PRESETS } from "../../constants";
import { fmt, ago, langColor } from "../../utils";
import Spark from "../common/Spark";

export default function DetailPanel({ T, sel, setSel, repos, onUpdateRepo, onDeleteRepo }) {
  const [tab, setTab] = useState("overview");
  const [notes, setNotes] = useState(sel.notes || "");
  const [status, setStatus] = useState(sel.status);
  const [category, setCategory] = useState(sel.category);
  const [rating, setRating] = useState(sel.rating || 0);
  const [tags, setTags] = useState(sel.tags || []);
  const [showTags, setShowTags] = useState(false);
  const [showNotes, setShowNotes] = useState(!!sel.notes);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const selIdRef = useRef(sel.id);
  useEffect(() => {
    selIdRef.current = sel.id;
    setTimeout(() => {
      setNotes(sel.notes || ""); setStatus(sel.status); setCategory(sel.category);
      setRating(sel.rating || 0); setTags(sel.tags || []); setShowNotes(!!sel.notes); setTab("overview");
      setConfirmDelete(false);
    }, 0);
  }, [sel]);

  const saveToRepos = useCallback((overrides = {}) => {
    const updates = { ...overrides, readAt: sel.readAt || new Date().toISOString() };
    onUpdateRepo(selIdRef.current, updates);
  }, [onUpdateRepo, sel.readAt]);

  const mounted = useRef(false);
  useEffect(() => {
    if (!mounted.current) { mounted.current = true; return; }
    saveToRepos({ status, category, rating, tags });
  }, [status, category, rating, tags, saveToRepos]);
  const saveNotes = () => saveToRepos({ notes, status, category, rating, tags });

  const cat = CATEGORIES.find(c => c.id === category);
  const st = STATUSES.find(s => s.id === status);
  const trend = sel.sparkline ? (sel.sparkline[sel.sparkline.length - 1] - sel.sparkline[0]) : 0;
  const trendLabel = trend > 2 ? "Trending up" : trend < -2 ? "Declining" : "Stable";
  const trendColor = trend > 2 ? T.sparkUp : trend < -2 ? T.sparkDown : T.sparkFlat;

  const similar = repos.filter(r => r.id !== sel.id && (r.category === sel.category || r.topics?.some(t => sel.topics?.includes(t)))).slice(0, 3);

  const stIdx = STATUSES.findIndex(s => s.id === status);
  const nextSt = stIdx < STATUSES.length - 1 ? STATUSES[stIdx + 1] : null;
  const prevSt = stIdx > 0 ? STATUSES[stIdx - 1] : null;

  const readmeText = sel.readme || `# ${sel.name}\n\n${sel.aiSummary}\n\n## Quick Start\n\nRefer to the GitHub repository for installation instructions and documentation.\n\n## Links\n\n- Repository: github.com/${sel.owner}/${sel.name}\n- License: ${sel.license}\n- Stars: ${fmt(sel.stars)}`;

  // We now use react-markdown for robust rendering.

  const tabBtn = (id) => ({ padding: "7px 14px", borderRadius: "6px 6px 0 0", border: "none", cursor: "pointer", fontSize: "13px", fontWeight: tab === id ? 600 : 400, fontFamily: F.body, background: tab === id ? `${T.acc}18` : "transparent", color: tab === id ? T.acc : T.inkF, borderBottom: tab === id ? `2px solid ${T.acc}` : "2px solid transparent", transition: "all 0.15s", paddingBottom: 9 });

  const handleDelete = () => {
    if (onDeleteRepo) {
      onDeleteRepo(sel._id || sel.id);
    }
  };

  return (
    <div onClick={() => setSel(null)} style={{ position: "fixed", inset: 0, zIndex: 1000, background: T.overlay, backdropFilter: "blur(3px)", display: "flex", justifyContent: "flex-end" }}>
      <div onClick={e => e.stopPropagation()} style={{ width: "100%", maxWidth: 580, height: "100%", background: T.surface, borderLeft: `1px solid ${T.bdr}`, overflowY: "auto", boxShadow: T.panelShadow, display: "flex", flexDirection: "column" }}>

        <div style={{ position: "sticky", top: 0, zIndex: 10, background: T.headerBg, backdropFilter: "blur(12px)", borderBottom: `1px solid ${T.bdrLt}`, padding: "14px 20px 0" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: "11px", color: T.inkF, fontFamily: F.mono, marginBottom: 2 }}>{sel.owner}</p>
              <h2 style={{ fontFamily: F.display, fontSize: "24px", fontWeight: 400, color: T.ink, lineHeight: 1.1, margin: 0 }}>{sel.name}</h2>
            </div>
            <div style={{ display: "flex", gap: 5, flexShrink: 0 }}>
              <a href={`https://github.com/${sel.owner}/${sel.name}`} target="_blank" rel="noopener noreferrer" style={{ width: 28, height: 28, borderRadius: 7, border: `1px solid ${T.bdr}`, background: T.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", color: T.inkM, textDecoration: "none" }}>{"\u2197"}</a>
              <button data-umami-event="DetailPanel: Close" onClick={() => setSel(null)} style={{ width: 28, height: 28, borderRadius: 7, border: `1px solid ${T.bdr}`, background: T.bg, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", color: T.inkM }}>{"\u2715"}</button>
            </div>
          </div>

          <div style={{ display: "flex", gap: 8, marginBottom: 8, alignItems: "center", fontSize: "11px", fontFamily: F.mono, color: T.inkM, flexWrap: "wrap" }}>
            <span><span style={{ color: T.acc }}>{"\u2605"}</span>{fmt(sel.stars)}</span>
            <span>{"\u2491"}{fmt(sel.forks)}</span>
            <span style={{ display: "flex", alignItems: "center", gap: 3 }}><span style={{ width: 6, height: 6, borderRadius: "50%", background: langColor(sel.language) }} />{sel.language}</span>
            <span style={{ color: T.inkF }}>{sel.license}</span>
            <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 5 }}>
              <Spark data={sel.sparkline} w={44} h={14} />
              <span style={{ fontSize: "9px", color: trendColor, fontWeight: 600 }}>{trendLabel}</span>
            </div>
          </div>

          <div style={{ display: "flex", gap: 6, marginBottom: 8, alignItems: "center" }}>
            {prevSt && <button data-umami-event="DetailPanel: Move Status Back" onClick={() => setStatus(prevSt.id)} style={{ padding: "4px 8px", borderRadius: 5, border: `1px solid ${T.bdr}`, background: "transparent", color: T.inkF, cursor: "pointer", fontSize: "10px", fontFamily: F.body }}>{"\u2190"} {prevSt.label}</button>}
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 3 }}>
              {STATUSES.map((s, i) => (
                <div key={s.id} onClick={() => setStatus(s.id)} style={{ cursor: "pointer", width: stIdx >= i ? 14 : 7, height: 5, borderRadius: 3, background: stIdx >= i ? st.color : T.bdr, transition: "all 0.2s" }} title={s.label} />
              ))}
            </div>
            {nextSt && <button data-umami-event="DetailPanel: Move Status Forward" onClick={() => setStatus(nextSt.id)} style={{ padding: "4px 8px", borderRadius: 5, border: "none", background: T.acc, color: "#fff", cursor: "pointer", fontSize: "10px", fontFamily: F.body, fontWeight: 600 }}>{nextSt.label} {"\u2192"}</button>}
          </div>

          <div style={{ display: "flex", gap: 4 }}>
            <button data-umami-event="DetailPanel: Tab Overview" onClick={() => setTab("overview")} style={tabBtn("overview")}>Overview</button>
            <button data-umami-event="DetailPanel: Tab README" onClick={() => setTab("readme")} style={tabBtn("readme")}>README</button>
          </div>
        </div>

        <div style={{ padding: "16px 20px", flex: 1 }}>
          {tab === "overview" && (<>
            <div style={{ background: T.accLt, border: `1px solid ${T.accBdr}`, borderRadius: 8, padding: "12px 14px", marginBottom: 14 }}>
              <p style={{ fontSize: "10px", fontWeight: 700, color: T.acc, fontFamily: F.mono, letterSpacing: "0.06em", marginBottom: 4 }}>AI SUMMARY</p>
              <p style={{ fontSize: "13px", color: T.ink, lineHeight: 1.7, fontFamily: F.body, margin: 0 }}>{sel.aiSummary}</p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
              <div>
                <p style={{ fontSize: "10px", fontWeight: 700, color: T.inkF, fontFamily: F.mono, letterSpacing: "0.06em", marginBottom: 4 }}>STATUS</p>
                <select value={status} onChange={e => setStatus(e.target.value)} style={{ padding: "6px 8px", borderRadius: 6, border: `1.5px solid ${T.bdr}`, background: T.bg, color: st?.color, fontSize: "12px", fontFamily: F.body, fontWeight: 600, outline: "none", cursor: "pointer", width: "100%" }}>
                  {STATUSES.map(s => <option key={s.id} value={s.id} style={{ color: T.ink }}>{s.label}</option>)}
                </select>
              </div>
              <div>
                <p style={{ fontSize: "10px", fontWeight: 700, color: T.inkF, fontFamily: F.mono, letterSpacing: "0.06em", marginBottom: 4 }}>CATEGORY</p>
                <select value={category} onChange={e => setCategory(e.target.value)} style={{ padding: "6px 8px", borderRadius: 6, border: `1.5px solid ${T.bdr}`, background: T.bg, color: cat?.color, fontSize: "12px", fontFamily: F.body, fontWeight: 600, outline: "none", cursor: "pointer", width: "100%" }}>
                  {CATEGORIES.map(c => <option key={c.id} value={c.id} style={{ color: T.ink }}>{c.label}</option>)}
                </select>
              </div>
              <div>
                <p style={{ fontSize: "10px", fontWeight: 700, color: T.inkF, fontFamily: F.mono, letterSpacing: "0.06em", marginBottom: 4 }}>RATING</p>
                <div style={{ display: "flex", gap: 1 }}>{[1, 2, 3, 4, 5].map(n => (
                  <button key={n} onClick={() => setRating(n === rating ? 0 : n)} style={{ background: "none", border: "none", cursor: "pointer", padding: "1px", fontSize: "16px", color: n <= rating ? "#D97706" : T.bdr, lineHeight: 1 }}>{"\u2605"}</button>
                ))}</div>
              </div>
              <div>
                <p style={{ fontSize: "10px", fontWeight: 700, color: T.inkF, fontFamily: F.mono, letterSpacing: "0.06em", marginBottom: 4 }}>TIMELINE</p>
                <p style={{ fontSize: "11px", color: T.inkM, fontFamily: F.mono }}>Saved {ago(sel.savedAt)}</p>
                <p style={{ fontSize: "11px", color: T.inkM, fontFamily: F.mono }}>Read {ago(sel.readAt)}</p>
              </div>
            </div>

            <div style={{ marginBottom: 12 }}>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 4, alignItems: "center" }}>
                <span style={{ fontSize: "10px", fontWeight: 700, color: T.inkF, fontFamily: F.mono, letterSpacing: "0.06em", marginRight: 4 }}>TAGS</span>
                {tags.map(t => (
                  <span key={t} style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "2px 8px", borderRadius: 5, background: T.bg, border: `1px solid ${T.bdr}`, color: T.inkM, fontSize: "11px", fontFamily: F.mono }}>
                    {t}<button onClick={() => setTags(tags.filter(x => x !== t))} style={{ background: "none", border: "none", color: T.inkF, cursor: "pointer", padding: 0, fontSize: 11, lineHeight: 1 }}>{"\u00D7"}</button>
                  </span>
                ))}
                <div style={{ position: "relative" }}>
                  <button onClick={() => setShowTags(!showTags)} style={{ padding: "2px 8px", borderRadius: 5, border: `1px dashed ${T.bdr}`, background: "transparent", color: T.inkF, cursor: "pointer", fontSize: "11px", fontFamily: F.body }}>+</button>
                  {showTags && (<div style={{ position: "absolute", top: "100%", left: 0, marginTop: 4, background: T.surface, border: `1px solid ${T.bdr}`, borderRadius: 8, padding: 4, boxShadow: T.modalShadow, zIndex: 20, minWidth: 140 }}>
                    {TAG_PRESETS.filter(t => !tags.includes(t)).map(t => (
                      <button key={t} onClick={() => { setTags([...tags, t]); setShowTags(false); }} style={{ display: "block", width: "100%", textAlign: "left", padding: "4px 8px", borderRadius: 4, border: "none", background: "transparent", color: T.inkM, cursor: "pointer", fontSize: "11px", fontFamily: F.mono }}
                        onMouseEnter={e => e.currentTarget.style.background = T.surfHov}
                        onMouseLeave={e => e.currentTarget.style.background = "transparent"}>{t}</button>
                    ))}
                  </div>)}
                </div>
              </div>
            </div>

            {sel.topics?.length > 0 && (<div style={{ marginBottom: 12, display: "flex", flexWrap: "wrap", gap: 4, alignItems: "center" }}>
              <span style={{ fontSize: "10px", fontWeight: 700, color: T.inkF, fontFamily: F.mono, letterSpacing: "0.06em", marginRight: 4 }}>TOPICS</span>
              {sel.topics.map(t => <span key={t} style={{ padding: "2px 8px", borderRadius: 12, background: T.bg, color: T.inkF, fontSize: "11px", fontFamily: F.mono }}>{t}</span>)}
            </div>)}

            <div style={{ marginBottom: 14 }}>
              <button onClick={() => setShowNotes(!showNotes)} style={{ display: "flex", alignItems: "center", gap: 4, background: "none", border: "none", cursor: "pointer", padding: 0, marginBottom: showNotes ? 6 : 0 }}>
                <span style={{ fontSize: "10px", fontWeight: 700, color: T.inkF, fontFamily: F.mono, letterSpacing: "0.06em" }}>NOTES</span>
                <span style={{ fontSize: "10px", color: T.inkF, transform: showNotes ? "rotate(90deg)" : "rotate(0)", transition: "transform 0.2s" }}>{"\u25B6"}</span>
                {!showNotes && notes && <span style={{ fontSize: "11px", color: T.inkM, fontFamily: F.body, marginLeft: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 180 }}>{notes}</span>}
              </button>
              {showNotes && <textarea value={notes} onChange={e => setNotes(e.target.value)} onBlur={saveNotes} placeholder="What's this for? When would you use it?" rows={3} style={{ width: "100%", padding: "8px 10px", borderRadius: 6, border: `1.5px solid ${T.bdr}`, background: T.bg, color: T.ink, fontSize: "12px", fontFamily: F.body, outline: "none", resize: "vertical", lineHeight: 1.6, boxSizing: "border-box" }} onFocus={e => e.target.style.borderColor = T.acc} />}
            </div>

            {similar.length > 0 && (<div style={{ marginBottom: 14 }}>
              <p style={{ fontSize: "10px", fontWeight: 700, color: T.inkF, fontFamily: F.mono, letterSpacing: "0.06em", marginBottom: 6 }}>RELATED IN YOUR VAULT</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                {similar.map(r => {
                  const sc = CATEGORIES.find(c => c.id === r.category);
                  return (
                    <div key={r.id} onClick={() => setSel(r)} style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 10px", borderRadius: 6, background: T.bg, border: `1px solid ${T.bdrLt}`, cursor: "pointer", transition: "border-color 0.15s" }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = T.acc}
                      onMouseLeave={e => e.currentTarget.style.borderColor = T.bdrLt}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <span style={{ fontSize: "12px", fontWeight: 600, color: T.ink, fontFamily: F.body }}>{r.name}</span>
                        <span style={{ fontSize: "10px", color: T.inkF, fontFamily: F.mono, marginLeft: 6 }}>{r.owner}</span>
                      </div>
                      <Spark data={r.sparkline} w={36} h={10} />
                      <span style={{ fontSize: "10px", color: sc?.color, fontFamily: F.mono, fontWeight: 600 }}>{sc?.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>)}

            {/* Delete repo */}
            <div style={{ borderTop: `1px solid ${T.bdr}`, paddingTop: 14, marginTop: 6 }}>
              {!confirmDelete ? (
                <button data-umami-event="DetailPanel: Delete Repo Request" onClick={() => setConfirmDelete(true)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 6, border: `1px solid #EF444433`, background: "transparent", color: "#EF4444", cursor: "pointer", fontSize: "11px", fontFamily: F.body, fontWeight: 500, transition: "all 0.15s" }}
                  onMouseEnter={e => { e.currentTarget.style.background = "#EF444410"; e.currentTarget.style.borderColor = "#EF4444"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "#EF444433"; }}>
                  {"\u{1F5D1}"} Remove from vault
                </button>
              ) : (
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: "12px", color: "#EF4444", fontFamily: F.body }}>Delete this repo?</span>
                  <button data-umami-event="DetailPanel: Confirm Delete Repo" onClick={handleDelete} style={{ padding: "5px 14px", borderRadius: 6, border: "none", background: "#EF4444", color: "#fff", cursor: "pointer", fontSize: "11px", fontFamily: F.body, fontWeight: 600 }}>Yes, delete</button>
                  <button data-umami-event="DetailPanel: Cancel Delete Repo" onClick={() => setConfirmDelete(false)} style={{ padding: "5px 14px", borderRadius: 6, border: `1px solid ${T.bdr}`, background: "transparent", color: T.inkM, cursor: "pointer", fontSize: "11px", fontFamily: F.body }}>Cancel</button>
                </div>
              )}
            </div>
          </>)}

          {tab === "readme" && (<div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <p style={{ fontSize: "11px", color: T.inkF, fontFamily: F.mono }}>README.md</p>
              <a href={`https://github.com/${sel.owner}/${sel.name}#readme`} target="_blank" rel="noopener noreferrer" style={{ fontSize: "11px", color: T.acc, textDecoration: "none", fontFamily: F.mono }}>View on GitHub {"\u2197"}</a>
            </div>
            <div style={{ background: T.bg, border: `1px solid ${T.bdrLt}`, borderRadius: 8, padding: "20px", wordBreak: "break-word", overflowY: "auto", flex: 1 }}>
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                /* eslint-disable no-unused-vars */
                components={{
                  h1: ({node: _, ...props}) => <h1 style={{ fontFamily: F.display, fontSize: "22px", fontWeight: 600, color: T.ink, margin: "0 0 16px 0", paddingBottom: 8, borderBottom: `1px solid ${T.bdrLt}` }} {...props} />,
                  h2: ({node: _, ...props}) => <h2 style={{ fontFamily: F.display, fontSize: "18px", fontWeight: 600, color: T.ink, margin: "24px 0 12px 0", paddingBottom: 6, borderBottom: `1px solid ${T.bdrLt}` }} {...props} />,
                  h3: ({node: _, ...props}) => <h3 style={{ fontFamily: F.display, fontSize: "15px", fontWeight: 600, color: T.ink, margin: "20px 0 10px 0" }} {...props} />,
                  h4: ({node: _, ...props}) => <h4 style={{ fontFamily: F.body, fontSize: "14px", fontWeight: 600, color: T.ink, margin: "16px 0 8px 0" }} {...props} />,
                  p: ({node: _, ...props}) => <p style={{ fontSize: "14px", color: T.inkM, fontFamily: F.body, lineHeight: 1.6, margin: "0 0 14px 0" }} {...props} />,
                  a: ({node: _, ...props}) => <a style={{ color: T.acc, textDecoration: "none", fontWeight: 500 }} target="_blank" rel="noopener noreferrer" {...props} />,
                  ul: ({node: _, ...props}) => <ul style={{ paddingLeft: 24, margin: "0 0 14px 0", color: T.inkM, fontSize: "14px", fontFamily: F.body, lineHeight: 1.6 }} {...props} />,
                  ol: ({node: _, ...props}) => <ol style={{ paddingLeft: 24, margin: "0 0 14px 0", color: T.inkM, fontSize: "14px", fontFamily: F.body, lineHeight: 1.6 }} {...props} />,
                  li: ({node: _, ...props}) => <li style={{ marginBottom: 4 }} {...props} />,
                  blockquote: ({node: _, ...props}) => <blockquote style={{ borderLeft: `4px solid ${T.acc}`, paddingLeft: 16, margin: "0 0 14px 0", color: T.inkM, fontStyle: "italic", background: `${T.acc}08`, padding: "10px 16px", borderRadius: "0 6px 6px 0" }} {...props} />,
                  code: ({node: _, inline, className, ...props}) => {
                    if (inline) {
                      return <code style={{ padding: "2px 6px", borderRadius: 4, background: `${T.acc}15`, border: `1px solid ${T.acc}30`, fontSize: "12px", fontFamily: F.mono, color: T.acc }} {...props} />
                    }
                    return <code style={{ display: "block", fontSize: "13px", fontFamily: F.mono, color: T.inkM, lineHeight: 1.5, whiteSpace: "pre-wrap" }} {...props} />
                  },
                  pre: ({node: _, ...props}) => <pre style={{ background: T.bg, border: `1px solid ${T.bdr}`, borderRadius: 6, padding: "14px", overflowX: "auto", margin: "0 0 14px 0" }} {...props} />,
                  img: ({node: _, ...props}) => <img style={{ maxWidth: "100%", borderRadius: 6, margin: "10px 0", border: `1px solid ${T.bdrLt}` }} loading="lazy" {...props} />,
                  table: ({node: _, ...props}) => <div style={{ overflowX: "auto", margin: "0 0 16px 0" }}><table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px", fontFamily: F.body }} {...props} /></div>,
                  th: ({node: _, ...props}) => <th style={{ padding: "8px 12px", textAlign: "left", fontWeight: 600, color: T.ink, borderBottom: `2px solid ${T.bdrLt}`, background: `${T.acc}05` }} {...props} />,
                  td: ({node: _, ...props}) => <td style={{ padding: "8px 12px", color: T.inkM, borderBottom: `1px solid ${T.bdrLt}` }} {...props} />,
                  hr: ({node: _, ...props}) => <hr style={{ border: "none", borderTop: `1px solid ${T.bdrLt}`, margin: "24px 0" }} {...props} />,
                }}
                /* eslint-enable no-unused-vars */
              >
                {readmeText}
              </ReactMarkdown>
            </div>
          </div>)}
        </div>
      </div>
    </div>
  );
}
