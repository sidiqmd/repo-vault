import { F } from "../../theme";
import { CATEGORIES, STATUSES } from "../../constants";
import { fmt, ago, langColor } from "../../utils";
import Spark from "../common/Spark";

export default function RepoListRow({ T, repo, onClick }) {
  const cat = CATEGORIES.find(c => c.id === repo.category);
  const st = STATUSES.find(s => s.id === repo.status);
  const enriching = repo._enriching;

  return (
    <tr onClick={onClick} style={{ cursor: "pointer", opacity: enriching ? 0.65 : 1 }}
      onMouseEnter={e => e.currentTarget.style.background = T.surfHov}
      onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
      <td style={{ padding: "9px 10px", borderBottom: `1px solid ${T.bdrLt}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <div style={{ width: 3, height: 20, borderRadius: 2, background: enriching ? T.acc : st.color }} />
          <span style={{ fontSize: "13px", fontWeight: 600, color: T.ink, fontFamily: F.body }}>{repo.name}</span>
          <span style={{ fontSize: "10px", color: T.inkF, fontFamily: F.mono }}>{repo.owner}</span>
          {enriching && <span style={{ fontSize: "9px", color: T.acc, fontFamily: F.mono }}>fetching…</span>}
        </div>
      </td>
      <td style={{ padding: "9px 8px", borderBottom: `1px solid ${T.bdrLt}`, fontSize: "10px", color: enriching ? T.inkF : cat?.color, fontFamily: F.mono, fontWeight: 600 }}>{enriching ? "…" : cat?.label}</td>
      <td style={{ padding: "9px 8px", borderBottom: `1px solid ${T.bdrLt}` }}>
        {enriching ? <span style={{ fontSize: "10px", color: T.inkF, fontFamily: F.mono }}>…</span> : (
          <span style={{ display: "flex", alignItems: "center", gap: 3, fontSize: "10px", color: T.inkM, fontFamily: F.mono }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: langColor(repo.language) }} />{repo.language}
          </span>
        )}
      </td>
      <td style={{ padding: "9px 6px", borderBottom: `1px solid ${T.bdrLt}`, textAlign: "center" }}>
        {!enriching && <Spark data={repo.sparkline} w={40} h={10} />}
      </td>
      <td style={{ padding: "9px 8px", borderBottom: `1px solid ${T.bdrLt}`, fontSize: "11px", color: T.inkM, fontFamily: F.mono, textAlign: "right" }}>{enriching ? "…" : <>{"\u2605"}{fmt(repo.stars)}</>}</td>
      <td style={{ padding: "9px 10px", borderBottom: `1px solid ${T.bdrLt}`, fontSize: "10px", color: T.inkF, fontFamily: F.mono, textAlign: "right" }}>{ago(repo.savedAt)}</td>
    </tr>
  );
}
