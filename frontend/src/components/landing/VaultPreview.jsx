import { useState, useEffect } from "react";
import { F } from "../../theme";
import { useTheme } from "../../ThemeContext";
import { genSpark } from "../../utils";
import Spark from "../common/Spark";

export default function VaultPreview() {
  const P = useTheme();
  const [step, setStep] = useState(0);
  const previewRepos = [
    { name: "langchain", owner: "langchain-ai", lang: "Python", langC: "#3572A5", stars: "98.2k", cat: "AI / ML", catC: "#E8723A", status: "Read", statusC: "#059669", spark: genSpark() },
    { name: "ollama", owner: "ollama", lang: "Go", langC: "#00ADD8", stars: "112k", cat: "AI / ML", catC: "#E8723A", status: "Built", statusC: "#7C3AED", spark: genSpark() },
    { name: "ruff", owner: "astral-sh", lang: "Rust", langC: "#DEA584", stars: "35.6k", cat: "Dev Tools", catC: "#5B9EF5", status: "Built", statusC: "#7C3AED", spark: genSpark() },
  ];
  const [progressW, setProgressW] = useState(0);

  useEffect(() => {
    const delays = [300, 600, 900, 1200, 1600, 2000, 2400];
    const timers = delays.map((d, i) => setTimeout(() => setStep(i + 1), d));
    const pw = setTimeout(() => setProgressW(71), 1300);
    return () => { timers.forEach(clearTimeout); clearTimeout(pw); };
  }, []);

  const fadeIn = (s, extra = "") => ({
    opacity: step >= s ? 1 : 0,
    transform: step >= s ? "translateY(0)" : "translateY(12px)",
    transition: `all 0.5s cubic-bezier(0.16,1,0.3,1)${extra}`,
  });

  return (
    <div style={{ background: P.bg, border: `1px solid ${P.bdr}`, borderRadius: 12, overflow: "hidden", width: "100%", boxShadow: P.modalShadow, ...fadeIn(0) }}>
      {/* Title bar */}
      <div style={{ padding: "8px 14px", background: P.surface, borderBottom: `1px solid ${P.bdr}`, display: "flex", alignItems: "center", gap: 6, ...fadeIn(1) }}>
        <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#EF4444" }} />
        <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#F59E0B" }} />
        <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#22C55E" }} />
        <span style={{ marginLeft: 8, fontSize: "11px", color: P.inkF, fontFamily: F.mono }}>RepoVault</span>
        <div style={{ flex: 1 }} />
        <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: "10px", fontFamily: F.mono, color: P.inkF, padding: "2px 6px", borderRadius: 4, background: P.surface }}>
          <div style={{ width: 4, height: 4, borderRadius: "50%", background: "#4ADE80" }} />Synced
        </div>
      </div>

      {/* Toolbar */}
      <div style={{ padding: "8px 14px", borderBottom: `1px solid ${P.bdrLt}`, display: "flex", alignItems: "center", gap: 6, ...fadeIn(2) }}>
        <div style={{ flex: 1, padding: "5px 8px 5px 24px", borderRadius: 6, border: `1px solid ${P.bdr}`, background: P.surface, fontSize: "11px", color: P.inkF, fontFamily: F.body, position: "relative" }}>
          <span style={{ position: "absolute", left: 8, top: "50%", transform: "translateY(-50%)", fontSize: 10 }}>{"\u2315"}</span>Search repos...
        </div>
        <div style={{ display: "flex", gap: 2, padding: 2, borderRadius: 4, background: P.surface }}>
          <div style={{ padding: "3px 6px", borderRadius: 3, background: P.surfHov, fontSize: "10px", color: P.ink }}>{"\u25A6"}</div>
          <div style={{ padding: "3px 6px", borderRadius: 3, fontSize: "10px", color: P.inkF }}>{"\u2630"}</div>
        </div>
      </div>

      {/* Progress */}
      <div style={{ padding: "8px 14px", display: "flex", alignItems: "center", gap: 8, ...fadeIn(3) }}>
        <span style={{ fontSize: "10px", color: P.inkM, fontFamily: F.body, fontWeight: 600 }}>Progress</span>
        <div style={{ flex: 1, height: 4, borderRadius: 2, background: P.bdr, overflow: "hidden" }}>
          <div style={{ height: "100%", borderRadius: 2, background: `linear-gradient(90deg,${P.acc},#D97706)`, width: `${progressW}%`, transition: "width 1s cubic-bezier(0.16,1,0.3,1)" }} />
        </div>
        <span style={{ fontSize: "10px", color: P.inkF, fontFamily: F.mono, opacity: step >= 3 ? 1 : 0, transition: "opacity 0.5s" }}>{progressW}%</span>
      </div>

      {/* Cards */}
      <div style={{ padding: "4px 14px 14px", display: "flex", flexDirection: "column", gap: 8 }}>
        {previewRepos.map((r, i) => (
          <div key={i} style={{
            background: P.surface, border: `1px solid ${P.bdr}`, borderRadius: 8, overflow: "hidden",
            ...fadeIn(4 + i, `, ${0.05 * i}s`),
          }}>
            <div style={{ height: 2, background: r.statusC }} />
            <div style={{ padding: "10px 12px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
                <div>
                  <p style={{ fontSize: "9px", color: P.inkF, fontFamily: F.mono, marginBottom: 1 }}>{r.owner}</p>
                  <p style={{ fontFamily: F.display, fontSize: "15px", fontWeight: 400, color: P.ink, margin: 0 }}>{r.name}</p>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 3 }}>
                  <span style={{ fontSize: "8px", fontWeight: 600, fontFamily: F.mono, color: r.catC, background: `${r.catC}18`, padding: "1px 5px", borderRadius: 3 }}>{r.cat}</span>
                  <Spark data={r.spark} w={36} h={10} />
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, fontSize: "9px", color: P.inkF, fontFamily: F.mono }}>
                <span style={{ display: "flex", alignItems: "center", gap: 3 }}><span style={{ width: 5, height: 5, borderRadius: "50%", background: r.langC }} />{r.lang}</span>
                <span>{"\u2605"} {r.stars}</span>
                <span style={{ marginLeft: "auto", color: r.statusC, fontWeight: 600 }}>{r.status}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* FAB hint */}
      <div style={{ position: "absolute", bottom: 12, right: 26, width: 28, height: 28, borderRadius: 8, background: P.acc, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "16px", fontWeight: 300, boxShadow: `0 4px 12px ${P.acc}55`, ...fadeIn(7), pointerEvents: "none" }}>+</div>
    </div>
  );
}
