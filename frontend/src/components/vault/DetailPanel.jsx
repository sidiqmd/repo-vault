import { useState, useEffect, useRef, useCallback } from "react";
import { F } from "../../theme";
import { CATEGORIES, STATUSES, TAG_PRESETS } from "../../constants";
import { fmt, ago, langColor } from "../../utils";
import Spark from "../common/Spark";

export default function DetailPanel({ T, sel, setSel, repos, onUpdateRepo }) {
  const [tab, setTab] = useState("overview");
  const [notes, setNotes] = useState(sel.notes || "");
  const [status, setStatus] = useState(sel.status);
  const [category, setCategory] = useState(sel.category);
  const [rating, setRating] = useState(sel.rating || 0);
  const [tags, setTags] = useState(sel.tags || []);
  const [showTags, setShowTags] = useState(false);
  const [showNotes, setShowNotes] = useState(!!sel.notes);

  const selIdRef = useRef(sel.id);
  useEffect(() => {
    selIdRef.current = sel.id;
    setTimeout(() => {
      setNotes(sel.notes || ""); setStatus(sel.status); setCategory(sel.category);
      setRating(sel.rating || 0); setTags(sel.tags || []); setShowNotes(!!sel.notes); setTab("overview");
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

  // Simple markdown line renderer
  const renderLine = (line, i) => {
    if (line.startsWith("### ")) return <h3 key={i} style={{ fontFamily: F.display, fontSize: "15px", fontWeight: 600, color: T.ink, margin: "12px 0 4px" }}>{line.slice(4)}</h3>;
    if (line.startsWith("## ")) return <h2 key={i} style={{ fontFamily: F.display, fontSize: "18px", fontWeight: 400, color: T.ink, margin: "14px 0 4px", borderBottom: `1px solid ${T.bdrLt}`, paddingBottom: 6 }}>{line.slice(3)}</h2>;
    if (line.startsWith("# ")) return <h1 key={i} style={{ fontFamily: F.display, fontSize: "22px", fontWeight: 400, color: T.ink, margin: "16px 0 6px" }}>{line.slice(2)}</h1>;
    if (line.startsWith("- ") || line.startsWith("* ")) return <li key={i} style={{ fontSize: "13px", color: T.inkM, fontFamily: F.body, lineHeight: 1.6, marginLeft: 16, marginBottom: 2 }}>{renderInline(line.slice(2))}</li>;
    if (line.trim() === "") return <div key={i} style={{ height: 6 }} />;
    return <p key={i} style={{ fontSize: "13px", color: T.inkM, fontFamily: F.body, lineHeight: 1.6, margin: "3px 0" }}>{renderInline(line)}</p>;
  };

  // Inline markdown: bold, code, links
  const renderInline = (text) => {
    const parts = [];
    let remaining = text;
    let key = 0;
    const regex = /(\*\*(.+?)\*\*|`([^`]+)`|\[([^\]]+)\]\(([^)]+)\))/g;
    let lastIndex = 0;
    let match;
    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) parts.push(<span key={key++}>{text.slice(lastIndex, match.index)}</span>);
      if (match[2]) parts.push(<strong key={key++} style={{ fontWeight: 600, color: T.ink }}>{match[2]}</strong>);
      else if (match[3]) parts.push(<code key={key++} style={{ padding: "1px 4px", borderRadius: 3, background: T.bg, border: `1px solid ${T.bdr}`, fontSize: "12px", fontFamily: F.mono }}>{match[3]}</code>);
      else if (match[4] && match[5]) parts.push(<a key={key++} href={match[5]} target="_blank" rel="noopener noreferrer" style={{ color: T.acc, textDecoration: "none" }}>{match[4]}</a>);
      lastIndex = match.index + match[0].length;
    }
    if (lastIndex < text.length) parts.push(<span key={key++}>{text.slice(lastIndex)}</span>);
    return parts.length ? parts : text;
  };

  // Process readme into lines, handling code blocks
  const renderReadme = (text) => {
    const lines = text.split("\n");
    const elements = [];
    let inCode = false;
    let codeLines = [];
    let codeLang = "";
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].startsWith("```") && !inCode) {
        inCode = true;
        codeLang = lines[i].slice(3).trim();
        codeLines = [];
      } else if (lines[i].startsWith("```") && inCode) {
        inCode = false;
        elements.push(
          <pre key={`code-${i}`} style={{ background: T.bg, border: `1px solid ${T.bdr}`, borderRadius: 6, padding: "10px 12px", overflow: "auto", margin: "6px 0" }}>
            <code style={{ fontSize: "12px", fontFamily: F.mono, color: T.inkM, lineHeight: 1.5 }}>{codeLines.join("\n")}</code>
          </pre>
        );
      } else if (inCode) {
        codeLines.push(lines[i]);
      } else {
        elements.push(renderLine(lines[i], i));
      }
    }
    return elements;
  };

  const tabBtn = (id) => ({ padding: "7px 14px", borderRadius: "6px 6px 0 0", border: "none", cursor: "pointer", fontSize: "13px", fontWeight: tab === id ? 600 : 400, fontFamily: F.body, background: tab === id ? `${T.acc}18` : "transparent", color: tab === id ? T.acc : T.inkF, borderBottom: tab === id ? `2px solid ${T.acc}` : "2px solid transparent", transition: "all 0.15s", paddingBottom: 9 });

  return (
    <div onClick={() => setSel(null)} style={{ position: "fixed", inset: 0, zIndex: 1000, background: T.overlay, backdropFilter: "blur(3px)", display: "flex", justifyContent: "flex-end" }}>
      <div onClick={e => e.stopPropagation()} style={{ width: "100%", maxWidth: 580, height: "100%", background: T.surface, borderLeft: `1px solid ${T.bdr}`, overflowY: "auto", boxShadow: T.panelShadow }}>

        <div style={{ position: "sticky", top: 0, zIndex: 10, background: T.headerBg, backdropFilter: "blur(12px)", borderBottom: `1px solid ${T.bdrLt}`, padding: "14px 20px 0" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: "11px", color: T.inkF, fontFamily: F.mono, marginBottom: 2 }}>{sel.owner}</p>
              <h2 style={{ fontFamily: F.display, fontSize: "24px", fontWeight: 400, color: T.ink, lineHeight: 1.1, margin: 0 }}>{sel.name}</h2>
            </div>
            <div style={{ display: "flex", gap: 5, flexShrink: 0 }}>
              <a href={`https://github.com/${sel.owner}/${sel.name}`} target="_blank" rel="noopener noreferrer" style={{ width: 28, height: 28, borderRadius: 7, border: `1px solid ${T.bdr}`, background: T.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", color: T.inkM, textDecoration: "none" }}>{"\u2197"}</a>
              <button onClick={() => setSel(null)} style={{ width: 28, height: 28, borderRadius: 7, border: `1px solid ${T.bdr}`, background: T.bg, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", color: T.inkM }}>{"\u2715"}</button>
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
            {prevSt && <button onClick={() => setStatus(prevSt.id)} style={{ padding: "4px 8px", borderRadius: 5, border: `1px solid ${T.bdr}`, background: "transparent", color: T.inkF, cursor: "pointer", fontSize: "10px", fontFamily: F.body }}>{"\u2190"} {prevSt.label}</button>}
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 3 }}>
              {STATUSES.map((s, i) => (
                <div key={s.id} onClick={() => setStatus(s.id)} style={{ cursor: "pointer", width: stIdx >= i ? 14 : 7, height: 5, borderRadius: 3, background: stIdx >= i ? st.color : T.bdr, transition: "all 0.2s" }} title={s.label} />
              ))}
            </div>
            {nextSt && <button onClick={() => setStatus(nextSt.id)} style={{ padding: "4px 8px", borderRadius: 5, border: "none", background: T.acc, color: "#fff", cursor: "pointer", fontSize: "10px", fontFamily: F.body, fontWeight: 600 }}>{nextSt.label} {"\u2192"}</button>}
          </div>

          <div style={{ display: "flex", gap: 4 }}>
            <button onClick={() => setTab("overview")} style={tabBtn("overview")}>Overview</button>
            <button onClick={() => setTab("readme")} style={tabBtn("readme")}>README</button>
          </div>
        </div>

        <div style={{ padding: "16px 20px" }}>
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

            {similar.length > 0 && (<div>
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
          </>)}

          {tab === "readme" && (<div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <p style={{ fontSize: "11px", color: T.inkF, fontFamily: F.mono }}>README.md</p>
              <a href={`https://github.com/${sel.owner}/${sel.name}#readme`} target="_blank" rel="noopener noreferrer" style={{ fontSize: "11px", color: T.acc, textDecoration: "none", fontFamily: F.mono }}>View on GitHub {"\u2197"}</a>
            </div>
            <div style={{ background: T.bg, border: `1px solid ${T.bdrLt}`, borderRadius: 8, padding: "16px 18px" }}>
              {renderReadme(readmeText)}
            </div>
          </div>)}
        </div>
      </div>
    </div>
  );
}
