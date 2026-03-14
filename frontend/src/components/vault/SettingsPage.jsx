import { F } from "../../theme";

  const Toggle = ({ checked, onChange, T, label }) => (
    <button data-umami-event={`Settings: Toggle ${label}`} onClick={() => onChange(!checked)} style={{ width: 40, height: 22, borderRadius: 11, border: "none", cursor: "pointer", background: checked ? T.acc : T.bdr, position: "relative", transition: "background 0.2s", padding: 2, display: "flex", alignItems: "center" }}>
      <div style={{ width: 18, height: 18, borderRadius: "50%", background: T.surface, transition: "transform 0.2s", transform: checked ? "translateX(18px)" : "translateX(0)", boxShadow: "0 1px 3px rgba(0,0,0,0.15)" }} />
    </button>
  );

  const Sel = ({ value, onChange, options, T, label }) => (
    <select data-umami-event={`Settings: Select ${label}`} value={value} onChange={e => onChange(e.target.value)} style={{ padding: "5px 8px", borderRadius: 6, border: `1.5px solid ${T.bdr}`, background: T.bg, color: T.ink, fontSize: "12px", fontFamily: F.body, outline: "none", cursor: "pointer" }}>
      {options.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
    </select>
  );

  const Row = ({ label, desc, children, T }) => (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 0", borderBottom: `1px solid ${T.bdrLt}` }}>
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: "13px", color: T.ink, fontFamily: F.body, marginBottom: 1 }}>{label}</p>
        {desc && <p style={{ fontSize: "11px", color: T.inkF, fontFamily: F.body }}>{desc}</p>}
      </div>
      <div style={{ flexShrink: 0, marginLeft: 12 }}>{children}</div>
    </div>
  );

  const Sec = ({ title, children, T }) => (
    <div style={{ marginBottom: 22 }}>
      <h3 style={{ fontFamily: F.body, fontSize: "13px", fontWeight: 700, color: T.ink, marginBottom: 8, paddingBottom: 6, borderBottom: `1px solid ${T.bdrLt}` }}>{title}</h3>
      {children}
    </div>
  );

export default function SettingsPage({ T, dark, setDark, config, setConfig, onClose }) {
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 1200, background: T.overlayHeavy, backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div onClick={e => e.stopPropagation()} style={{ background: T.surface, borderRadius: 16, width: "100%", maxWidth: 500, maxHeight: "85vh", boxShadow: T.modalShadow, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ padding: "20px 24px 0", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
          <h2 style={{ fontFamily: F.display, fontSize: "24px", fontWeight: 400, color: T.ink }}>Settings</h2>
          <button data-umami-event="Settings: Close" onClick={onClose} style={{ width: 30, height: 30, borderRadius: 8, border: `1px solid ${T.bdr}`, background: T.bg, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "15px", color: T.inkM }}
            onMouseEnter={e => e.currentTarget.style.background = T.surfHov}
            onMouseLeave={e => e.currentTarget.style.background = T.bg}>{"\u2715"}</button>
        </div>
        <div style={{ padding: "16px 24px 24px", overflowY: "auto", flex: 1 }}>
          <Sec title="Appearance" T={T}>
            <Row label="Card density" T={T}><Sel label="Card density" value={config.cardDensity} onChange={v => setConfig({ ...config, cardDensity: v })} options={[{ v: "compact", l: "Compact" }, { v: "default", l: "Default" }, { v: "expanded", l: "Expanded" }]} T={T} /></Row>
          </Sec>
          <Sec title="Enrichment" T={T}>
            <Row label="Auto-fetch metadata" desc="Stars, forks, language on save" T={T}><Toggle label="Auto-fetch" checked={config.autoFetch} onChange={v => setConfig({ ...config, autoFetch: v })} T={T} /></Row>
            <Row label="AI summaries" T={T}><Toggle label="AI Summaries" checked={config.aiSummary} onChange={v => setConfig({ ...config, aiSummary: v })} T={T} /></Row>
            <Row label="Snapshot README" T={T}><Toggle label="Snapshot README" checked={config.snapshotReadme} onChange={v => setConfig({ ...config, snapshotReadme: v })} T={T} /></Row>
            <Row label="Auto-categorize" T={T}><Toggle label="Auto-categorize" checked={config.autoCategory} onChange={v => setConfig({ ...config, autoCategory: v })} T={T} /></Row>
          </Sec>
          <Sec title="Notifications" T={T}>
            <Row label="Stale repo alerts" desc="No commits in 6+ months" T={T}><Toggle label="Stale Alerts" checked={config.staleAlert} onChange={v => setConfig({ ...config, staleAlert: v })} T={T} /></Row>
            <Row label="Weekly digest" T={T}><Toggle label="Weekly Digest" checked={config.weeklyDigest} onChange={v => setConfig({ ...config, weeklyDigest: v })} T={T} /></Row>
            <Row label="Release alerts" T={T}><Toggle label="Release Alerts" checked={config.releaseAlert} onChange={v => setConfig({ ...config, releaseAlert: v })} T={T} /></Row>
          </Sec>
          <Sec title="Data & Export" T={T}>
            <Row label="Default sort" T={T}><Sel label="Default Sort" value={config.defaultSort} onChange={v => setConfig({ ...config, defaultSort: v })} options={[{ v: "savedAt", l: "Recent" }, { v: "stars", l: "Stars" }, { v: "name", l: "Name" }]} T={T} /></Row>
            <Row label="Export format" T={T}><Sel label="Export Format" value={config.exportFormat} onChange={v => setConfig({ ...config, exportFormat: v })} options={[{ v: "json", l: "JSON" }, { v: "csv", l: "CSV" }, { v: "markdown", l: "Markdown" }]} T={T} /></Row>
          </Sec>
          <Sec title="Integrations" T={T}>
            <Row label="GitHub stars sync" T={T}><Toggle label="GitHub Sync" checked={config.ghSync} onChange={v => setConfig({ ...config, ghSync: v })} T={T} /></Row>
            <Row label="Obsidian export" T={T}><Toggle label="Obsidian Export" checked={config.obsidian} onChange={v => setConfig({ ...config, obsidian: v })} T={T} /></Row>
          </Sec>
          <div style={{ padding: 12, borderRadius: 8, border: "1px solid #EF444433", background: "#EF444408", marginTop: 4 }}>
            <p style={{ fontSize: "12px", fontWeight: 600, color: "#EF4444", fontFamily: F.body, marginBottom: 6 }}>Danger Zone</p>
            <div style={{ display: "flex", gap: 6 }}>
              <button data-umami-event="Settings: Export All" style={{ padding: "5px 12px", borderRadius: 5, border: "1px solid #EF444433", background: "transparent", color: "#EF4444", fontSize: "11px", fontFamily: F.body, cursor: "pointer" }}>Export all</button>
              <button data-umami-event="Settings: Clear Repos" style={{ padding: "5px 12px", borderRadius: 5, border: "1px solid #EF444433", background: "transparent", color: "#EF4444", fontSize: "11px", fontFamily: F.body, cursor: "pointer" }}>Clear repos</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
