import { F } from "../../theme";
import { CATEGORIES, STATUSES } from "../../constants";
import { fmt, langColor } from "../../utils";
import Spark from "../common/Spark";

const DENSITY = {
  compact: { padding: "10px 12px", nameSize: "16px", showSummary: false, summaryClamp: 1 },
  default: { padding: "14px 16px", nameSize: "19px", showSummary: true, summaryClamp: 2 },
  expanded: { padding: "18px 20px", nameSize: "21px", showSummary: true, summaryClamp: 4 },
};

export default function RepoCard({ T, repo, density = "default", onClick }) {
  const cat = CATEGORIES.find(c => c.id === repo.category);
  const st = STATUSES.find(s => s.id === repo.status);
  const d = DENSITY[density] || DENSITY.default;

  const enriching = repo._enriching;

  return (
    <div onClick={onClick} style={{ background: T.surface, borderRadius: 11, cursor: "pointer", border: `1px solid ${T.bdr}`, overflow: "hidden", transition: "all 0.2s", boxShadow: `0 1px 3px ${T.shadow}`, opacity: enriching ? 0.75 : 1 }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = `0 8px 30px ${T.shadowHov}`; e.currentTarget.style.transform = "translateY(-2px)"; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = `0 1px 3px ${T.shadow}`; e.currentTarget.style.transform = "translateY(0)"; }}>
      <div style={{ height: 3, background: enriching ? T.acc : st.color, ...(enriching ? { animation: "enrichPulse 1.5s ease-in-out infinite" } : {}) }} />
      {enriching && <style>{`@keyframes enrichPulse { 0%,100% { opacity: 0.4 } 50% { opacity: 1 } }`}</style>}
      <div style={{ padding: d.padding }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: d.showSummary ? 5 : 3 }}>
          <div>
            <p style={{ fontSize: "11px", color: T.inkF, fontFamily: F.mono, marginBottom: 1 }}>{repo.owner}</p>
            <h3 style={{ fontFamily: F.display, fontSize: d.nameSize, fontWeight: 400, color: T.ink, lineHeight: 1.15, margin: 0 }}>{repo.name}</h3>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 3 }}>
            {enriching ? (
              <span style={{ fontSize: "10px", fontWeight: 600, fontFamily: F.mono, color: T.acc, padding: "2px 6px", borderRadius: 3, background: `${T.acc}14` }}>fetching…</span>
            ) : (
              <>
                <span style={{ fontSize: "10px", fontWeight: 600, fontFamily: F.mono, color: cat?.color, background: `${cat?.color}14`, padding: "2px 6px", borderRadius: 3 }}>{cat?.label}</span>
                <Spark data={repo.sparkline} w={40} h={12} />
              </>
            )}
          </div>
        </div>
        {d.showSummary && !enriching && <p style={{ fontSize: "12px", color: T.inkM, lineHeight: 1.5, fontFamily: F.body, margin: "0 0 10px", display: "-webkit-box", WebkitLineClamp: d.summaryClamp, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{repo.aiSummary}</p>}
        {d.showSummary && enriching && <div style={{ height: 14, borderRadius: 4, background: T.bdr, margin: "0 0 10px", width: "70%", animation: "enrichPulse 1.5s ease-in-out infinite" }} />}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", gap: 10, fontSize: "11px", color: T.inkF, fontFamily: F.mono }}>
            {enriching ? (
              <span style={{ color: T.inkF }}>Loading metadata…</span>
            ) : (
              <>
                <span style={{ display: "flex", alignItems: "center", gap: 3 }}><span style={{ width: 6, height: 6, borderRadius: "50%", background: langColor(repo.language) }} />{repo.language}</span>
                <span style={{ color: T.inkM }}>{"\u2605"}{fmt(repo.stars)}</span>
              </>
            )}
          </div>
          {repo.rating > 0 && <span style={{ fontSize: "10px", color: "#D97706", fontFamily: F.mono }}>{"\u2605".repeat(repo.rating)}</span>}
        </div>
      </div>
    </div>
  );
}
