import { F } from "../../theme";
import { CATEGORIES, STATUSES } from "../../constants";

export default function Toolbar({ T, fSt, setFSt, fCat, setFCat, sort, setSort, view, setView }) {
  const selS = { padding: "6px 10px", borderRadius: 6, border: `1.5px solid ${T.bdr}`, background: T.surface, color: T.ink, fontSize: "12px", fontFamily: F.body, outline: "none", cursor: "pointer", fontWeight: 500 };

  return (
    <div style={{ borderBottom: `1px solid ${T.bdrLt}`, background: T.toolbarBg }}>
      <div style={{ maxWidth: 1360, margin: "0 auto", padding: "6px 16px", display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
        <select data-umami-event="Toolbar: Filter Status" value={fSt} onChange={e => setFSt(e.target.value)} style={selS}>
          <option value="all">Status</option>
          {STATUSES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
        </select>
        <select data-umami-event="Toolbar: Filter Category" value={fCat} onChange={e => setFCat(e.target.value)} style={selS}>
          <option value="all">Category</option>
          {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
        </select>
        <select data-umami-event="Toolbar: Sort" value={sort} onChange={e => setSort(e.target.value)} style={selS}>
          <option value="savedAt">Recent</option>
          <option value="stars">Stars</option>
          <option value="name">A{"\u2192"}Z</option>
        </select>
        <div style={{ flex: 1 }} />
        <div style={{ display: "flex", gap: 2, background: T.bg, borderRadius: 5, padding: 2, border: `1px solid ${T.bdrLt}` }}>
          {[{ id: "grid", l: "\u25A6" }, { id: "list", l: "\u2630" }, { id: "kanban", l: "\u25A5" }].map(v => (
            <button key={v.id} data-umami-event={`Toolbar: View ${v.id}`} onClick={() => setView(v.id)} style={{ padding: "3px 9px", borderRadius: 4, border: "none", cursor: "pointer", fontSize: "13px", background: view === v.id ? T.surface : "transparent", color: view === v.id ? T.ink : T.inkF, boxShadow: view === v.id ? `0 1px 3px ${T.shadow}` : "none" }}>{v.l}</button>
          ))}
        </div>
      </div>
    </div>
  );
}
