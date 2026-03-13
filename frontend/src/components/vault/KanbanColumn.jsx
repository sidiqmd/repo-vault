import { F } from "../../theme";
import { fmt, langColor } from "../../utils";
import Spark from "../common/Spark";

export default function KanbanColumn({ T, status, repos, onSelect }) {
  return (
    <div style={{ minWidth: 0, flex: "0 0 82vw", maxWidth: 290, background: T.bg, borderRadius: 10, border: `1px solid ${T.bdrLt}`, display: "flex", flexDirection: "column", maxHeight: "calc(100vh - 220px)", scrollSnapAlign: "start" }}>
      <div style={{ padding: "10px 12px", borderBottom: `1px solid ${T.bdrLt}`, display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
        <div style={{ width: 8, height: 8, borderRadius: "50%", background: status.color }} />
        <span style={{ fontSize: "12px", fontWeight: 600, color: T.ink, fontFamily: F.body }}>{status.label}</span>
        <span style={{ fontSize: "11px", color: T.inkF, fontFamily: F.mono, marginLeft: "auto" }}>{repos.length}</span>
      </div>
      <div style={{ padding: 5, overflowY: "auto", flex: 1, display: "flex", flexDirection: "column", gap: 5 }}>
        {repos.map(r => (
          <div key={r.id} onClick={() => onSelect(r)} style={{ background: T.surface, border: `1px solid ${T.bdr}`, borderRadius: 7, padding: 10, cursor: "pointer", opacity: r._enriching ? 0.65 : 1 }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div>
                <p style={{ fontSize: "12px", fontWeight: 600, color: T.ink, fontFamily: F.body, margin: 0 }}>{r.name}</p>
                <p style={{ fontSize: "10px", color: T.inkF, fontFamily: F.mono, margin: 0 }}>{r.owner}</p>
              </div>
              {r._enriching ? (
                <span style={{ fontSize: "9px", color: T.acc, fontFamily: F.mono }}>fetching…</span>
              ) : (
                <Spark data={r.sparkline} w={32} h={10} />
              )}
            </div>
            {!r._enriching && (
              <div style={{ display: "flex", gap: 8, fontSize: "10px", color: T.inkF, fontFamily: F.mono, marginTop: 5 }}>
                <span style={{ display: "flex", alignItems: "center", gap: 3 }}><span style={{ width: 5, height: 5, borderRadius: "50%", background: langColor(r.language) }} />{r.language}</span>
                <span>{"\u2605"}{fmt(r.stars)}</span>
              </div>
            )}
          </div>
        ))}
        {repos.length === 0 && <p style={{ padding: 12, textAlign: "center", fontSize: "11px", color: T.inkF, fontStyle: "italic" }}>Empty</p>}
      </div>
    </div>
  );
}
