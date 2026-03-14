import { useState, useEffect } from "react";
import { F } from "../../theme";
import Icons from "../common/Icons";
import VaultPreview from "./VaultPreview";

export default function LandingPage({ T, dark, setDark, onStart, onLogin }) {
  const [show, setShow] = useState(false);
  useEffect(() => { setTimeout(() => setShow(true), 100); }, []);

  const features = [
    { icon: Icons.capture(), title: "One-tap capture", desc: "Share from Chrome, paste URLs, or bulk-import. Metadata auto-populates." },
    { icon: Icons.brain(), title: "AI summaries", desc: "Every repo gets a plain-English summary on save. Know what it does instantly." },
    { icon: Icons.pipeline(), title: "Pipeline workflow", desc: "Inbox \u2192 To Read \u2192 Read \u2192 To Build \u2192 Built \u2192 Archived." },
    { icon: Icons.chart(), title: "Activity sparklines", desc: "8-week commit charts. Spot trending repos, avoid abandoned ones." },
    { icon: Icons.search(), title: "Semantic search", desc: "Search across names, summaries, notes, and tags." },
    { icon: Icons.tag(), title: "Auto-categorize", desc: "AI suggests categories and tags. Override anytime." },
  ];

  return (
    <div style={{ minHeight: "100vh", background: T.bg, overflow: "hidden" }}>
      <div style={{ position: "fixed", inset: 0, opacity: 0.03, backgroundImage: `linear-gradient(${T.inkF} 1px,transparent 1px),linear-gradient(90deg,${T.inkF} 1px,transparent 1px)`, backgroundSize: "60px 60px", pointerEvents: "none" }} />

      <nav style={{ position: "sticky", top: 0, zIndex: 50, background: T.headerBg, backdropFilter: "blur(16px)", borderBottom: `1px solid ${T.bdr}` }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 20px", display: "flex", alignItems: "center", height: 50 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 2 }}>
            <span style={{ fontFamily: F.display, fontSize: "20px", color: T.ink }}>Repo</span>
            <span style={{ fontFamily: F.display, fontSize: "20px", fontStyle: "italic", color: T.acc }}>Vault</span>
          </div>
          <div style={{ flex: 1 }} />
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <button data-umami-event="Landing: Toggle Dark Mode" onClick={() => setDark(!dark)} title={dark ? "Light mode" : "Dark mode"} style={{ width: 36, height: 20, borderRadius: 10, border: "none", cursor: "pointer", background: dark ? T.acc : T.bdr, position: "relative", transition: "background 0.3s", display: "flex", alignItems: "center", padding: 2, flexShrink: 0 }}>
              <div style={{ width: 16, height: 16, borderRadius: "50%", background: T.surface, transition: "transform 0.3s", transform: dark ? "translateX(16px)" : "translateX(0)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "9px" }}>{dark ? "\u263D" : "\u2600"}</div>
            </button>
            <button data-umami-event="Landing: Log In Header" onClick={onLogin} style={{ padding: "7px 14px", borderRadius: 8, border: `1px solid ${T.bdr}`, background: "transparent", color: T.inkM, fontSize: "13px", fontFamily: F.body, cursor: "pointer" }}>Log in</button>
            <button data-umami-event="Landing: Start Free Header" onClick={onStart} style={{ padding: "7px 14px", borderRadius: 8, border: "none", background: T.acc, color: "#fff", fontSize: "13px", fontFamily: F.body, cursor: "pointer", fontWeight: 600 }}>Start free</button>
          </div>
        </div>
      </nav>

      <section className="hero-section" style={{ maxWidth: 1100, margin: "0 auto", padding: "48px 20px 40px", position: "relative", zIndex: 1, display: "flex", alignItems: "center", gap: 40 }}>
        <div style={{ flex: "1 1 0", minWidth: 0, opacity: show ? 1 : 0, transform: show ? "translateY(0)" : "translateY(30px)", transition: "all 0.8s cubic-bezier(0.16,1,0.3,1)" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 12px 4px 6px", borderRadius: 20, border: `1px solid ${T.bdr}`, marginBottom: 20, background: T.surface }}>
            <span style={{ background: T.acc, color: "#fff", fontSize: "10px", fontWeight: 700, padding: "2px 6px", borderRadius: 10, fontFamily: F.mono }}>NEW</span>
            <span style={{ fontSize: "12px", color: T.inkM, fontFamily: F.body }}>AI summaries auto-generate on save</span>
          </div>
          <h1 style={{ fontFamily: F.display, fontSize: "clamp(36px, 8vw, 52px)", fontWeight: 400, color: T.ink, lineHeight: 1.1, marginBottom: 16 }}>
            Stop hoarding<br /><span style={{ fontStyle: "italic", color: T.acc }}>GitHub tabs.</span>
          </h1>
          <p style={{ fontFamily: F.body, fontSize: "clamp(15px, 3.5vw, 17px)", color: T.inkM, lineHeight: 1.7, marginBottom: 28, maxWidth: 480 }}>
            Capture repos from anywhere, get AI summaries instantly, track what you've reviewed, and find anything in seconds. Built for developers who discover faster than they can read.
          </p>
          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap", marginBottom: 20 }}>
            <button data-umami-event="Landing: Start Free Hero" onClick={onStart} style={{ padding: "12px 24px", borderRadius: 10, border: "none", background: T.acc, color: "#fff", fontSize: "15px", fontFamily: F.body, fontWeight: 600, cursor: "pointer", boxShadow: `0 4px 20px ${T.acc}44` }}>Start free — no signup</button>
            <button data-umami-event="Landing: Sign In Sync Hero" onClick={onLogin} style={{ padding: "12px 18px", borderRadius: 10, border: `1.5px solid ${T.bdr}`, background: "transparent", color: T.ink, fontSize: "14px", fontFamily: F.body, cursor: "pointer" }}>Sign in to sync</button>
          </div>
          <div style={{ display: "flex", gap: 16, fontSize: "12px", color: T.inkF, fontFamily: F.mono, flexWrap: "wrap" }}>
            <span>{"\u2713"} Free forever</span><span>{"\u2713"} No credit card</span><span>{"\u2713"} Works offline</span>
          </div>
        </div>
        <div style={{ flex: "1 1 0", maxWidth: 500, minWidth: 340, opacity: show ? 1 : 0, transform: show ? "translateY(0)" : "translateY(20px)", transition: "all 0.8s cubic-bezier(0.16,1,0.3,1) 0.3s", position: "relative" }}>
          <VaultPreview />
        </div>
      </section>

      {/* How it works */}
      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 20px 48px", position: "relative", zIndex: 1 }}>
        <p style={{ fontSize: "11px", fontWeight: 700, color: T.acc, fontFamily: F.mono, letterSpacing: "0.1em", marginBottom: 8 }}>HOW IT WORKS</p>
        <h2 style={{ fontFamily: F.display, fontSize: "clamp(24px,5vw,32px)", color: T.ink, marginBottom: 32 }}>Three steps. Zero friction.</h2>
        <div style={{ display: "flex", gap: 2, overflowX: "auto", scrollSnapType: "x mandatory", WebkitOverflowScrolling: "touch", paddingBottom: 8 }}>
          {[
            { step: "01", title: "Capture", desc: "Share from mobile Chrome, paste a URL, or bulk-import your bookmark backlog.", color: T.acc },
            { step: "02", title: "Enrich", desc: "We pull stars, language, license, README. AI generates a summary and suggests a category.", color: "#D97706" },
            { step: "03", title: "Retrieve", desc: "Search by name, topic, your notes, or natural language. Filter by status, category, language.", color: "#059669" },
          ].map((s, i) => (
            <div key={i} style={{ background: T.surface, padding: "28px 24px", minWidth: 240, flex: "1 0 240px", scrollSnapAlign: "start", borderRight: i < 2 ? `1px solid ${T.bdr}` : "none", borderRadius: i === 0 ? "12px 0 0 12px" : i === 2 ? "0 12px 12px 0" : "0" }}>
              <span style={{ fontFamily: F.mono, fontSize: "28px", fontWeight: 800, color: s.color, opacity: 0.3 }}>{s.step}</span>
              <h3 style={{ fontFamily: F.body, fontSize: "16px", fontWeight: 700, color: T.ink, margin: "8px 0" }}>{s.title}</h3>
              <p style={{ fontFamily: F.body, fontSize: "13px", color: T.inkM, lineHeight: 1.6 }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 20px 48px", position: "relative", zIndex: 1 }}>
        <p style={{ fontSize: "11px", fontWeight: 700, color: T.acc, fontFamily: F.mono, letterSpacing: "0.1em", marginBottom: 8 }}>FEATURES</p>
        <h2 style={{ fontFamily: F.display, fontSize: "clamp(24px,5vw,32px)", color: T.ink, marginBottom: 32 }}>Everything you need. Nothing you don't.</h2>
        <div className="feat-grid" style={{ display: "grid", gap: 14 }}>
          {features.map((f, i) => (
            <div key={i} style={{ background: T.surface, border: `1px solid ${T.bdr}`, borderRadius: 12, padding: "20px 18px" }}>
              <div style={{ marginBottom: 12 }}>{f.icon}</div>
              <h3 style={{ fontFamily: F.body, fontSize: "15px", fontWeight: 700, color: T.ink, marginBottom: 4 }}>{f.title}</h3>
              <p style={{ fontFamily: F.body, fontSize: "13px", color: T.inkM, lineHeight: 1.5 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "48px 20px 60px", position: "relative", zIndex: 1 }}>
        <p style={{ fontSize: "11px", fontWeight: 700, color: T.acc, fontFamily: F.mono, letterSpacing: "0.1em", marginBottom: 8 }}>PRICING</p>
        <h2 style={{ fontFamily: F.display, fontSize: "clamp(24px,5vw,32px)", color: T.ink, marginBottom: 32 }}>Free to start. Pro when you're ready.</h2>
        <div style={{ display: "flex", gap: 14, overflowX: "auto", scrollSnapType: "x mandatory", WebkitOverflowScrolling: "touch", paddingBottom: 8, paddingTop: 14 }}>
          {/* Free */}
          <div style={{ background: T.surface, border: `2px solid ${T.acc}`, borderRadius: 14, padding: "24px 20px", minWidth: 260, flex: "1 0 260px", scrollSnapAlign: "start", position: "relative", boxShadow: `0 0 40px ${T.acc}15` }}>
            <div style={{ position: "absolute", top: 0, left: "50%", transform: "translate(-50%,-50%)", background: T.acc, color: "#fff", fontSize: "10px", fontWeight: 700, padding: "4px 14px", borderRadius: 20, fontFamily: F.mono, whiteSpace: "nowrap" }}>AVAILABLE NOW</div>
            <p style={{ fontSize: "12px", fontWeight: 700, color: T.acc, fontFamily: F.mono, marginBottom: 4 }}>FREE</p>
            <div style={{ fontFamily: F.display, fontSize: "32px", color: T.ink, marginBottom: 4 }}>$0</div>
            <p style={{ fontSize: "12px", color: T.inkF, fontFamily: F.body, marginBottom: 16 }}>forever · no card</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 20 }}>
              {["Up to 50 repos", "AI summaries", "All views (grid/list/kanban)", "Browser storage", "Full-text search", "Manual categories", "Activity sparklines", "Status pipeline"].map(f => (
                <div key={f} style={{ display: "flex", gap: 6, fontSize: "13px", color: T.inkM, fontFamily: F.body }}><span style={{ color: "#4ADE80", flexShrink: 0 }}>{"\u2713"}</span>{f}</div>
              ))}
            </div>
            <button data-umami-event="Landing: Start Free Card 1" onClick={onStart} style={{ width: "100%", padding: "10px", borderRadius: 8, border: "none", background: T.acc, color: "#fff", fontSize: "13px", fontFamily: F.body, fontWeight: 600, cursor: "pointer" }}>Start free</button>
          </div>
          {/* Pro */}
          <div style={{ background: T.surface, border: `1px solid ${T.bdr}`, borderRadius: 14, padding: "24px 20px", minWidth: 260, flex: "1 0 260px", scrollSnapAlign: "start", position: "relative", opacity: 0.65 }}>
            <div style={{ position: "absolute", top: 0, left: "50%", transform: "translate(-50%,-50%)", background: T.bdr, color: T.inkM, fontSize: "10px", fontWeight: 700, padding: "4px 14px", borderRadius: 20, fontFamily: F.mono, whiteSpace: "nowrap" }}>COMING SOON</div>
            <p style={{ fontSize: "12px", fontWeight: 700, color: T.inkF, fontFamily: F.mono, marginBottom: 4 }}>PRO</p>
            <div style={{ fontFamily: F.display, fontSize: "32px", color: T.ink, marginBottom: 4 }}>$8<span style={{ fontSize: "14px", color: T.inkM }}>/mo</span></div>
            <p style={{ fontSize: "12px", color: T.inkF, fontFamily: F.body, marginBottom: 16 }}>annual · $10/mo monthly</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 20 }}>
              {["Unlimited repos", "Cloud sync", "Semantic search", "Auto-categorize", "README snapshots", "Activity alerts", "Stale detection", "Weekly digest", "Export", "Priority support"].map(f => (
                <div key={f} style={{ display: "flex", gap: 6, fontSize: "13px", color: T.inkM, fontFamily: F.body }}><span style={{ color: T.inkF, flexShrink: 0 }}>{"\u2713"}</span>{f}</div>
              ))}
            </div>
            <button disabled style={{ width: "100%", padding: "10px", borderRadius: 8, border: `1.5px solid ${T.bdr}`, background: "transparent", color: T.inkF, fontSize: "13px", fontFamily: F.body, fontWeight: 600, cursor: "default" }}>Coming soon</button>
          </div>
          {/* Team */}
          <div style={{ background: T.surface, border: `1px solid ${T.bdr}`, borderRadius: 14, padding: "24px 20px", minWidth: 260, flex: "1 0 260px", scrollSnapAlign: "start", position: "relative", opacity: 0.65 }}>
            <div style={{ position: "absolute", top: 0, left: "50%", transform: "translate(-50%,-50%)", background: T.bdr, color: T.inkM, fontSize: "10px", fontWeight: 700, padding: "4px 14px", borderRadius: 20, fontFamily: F.mono, whiteSpace: "nowrap" }}>COMING SOON</div>
            <p style={{ fontSize: "12px", fontWeight: 700, color: T.inkF, fontFamily: F.mono, marginBottom: 4 }}>TEAM</p>
            <div style={{ fontFamily: F.display, fontSize: "32px", color: T.ink, marginBottom: 4 }}>$6<span style={{ fontSize: "14px", color: T.inkM }}>/user/mo</span></div>
            <p style={{ fontSize: "12px", color: T.inkF, fontFamily: F.body, marginBottom: 16 }}>min 3 users · annual</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 20 }}>
              {["Everything in Pro", "Shared collections", "Team activity feed", "Shared tags", "Admin dashboard", "SSO (coming soon)", "API access", "Slack integration", "Notion integration"].map(f => (
                <div key={f} style={{ display: "flex", gap: 6, fontSize: "13px", color: T.inkM, fontFamily: F.body }}><span style={{ color: T.inkF, flexShrink: 0 }}>{"\u2713"}</span>{f}</div>
              ))}
            </div>
            <button disabled style={{ width: "100%", padding: "10px", borderRadius: 8, border: `1.5px solid ${T.bdr}`, background: "transparent", color: T.inkF, fontSize: "13px", fontFamily: F.body, fontWeight: 600, cursor: "default" }}>Coming soon</button>
          </div>
        </div>
      </section>

      <footer style={{ borderTop: `1px solid ${T.bdr}`, padding: "28px 20px", position: "relative", zIndex: 1 }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 2 }}>
            <span style={{ fontFamily: F.display, fontSize: "16px", color: T.inkF }}>Repo</span>
            <span style={{ fontFamily: F.display, fontSize: "16px", fontStyle: "italic", color: T.inkF }}>Vault</span>
          </div>
          <div style={{ display: "flex", gap: 16, fontSize: "12px", color: T.inkF, fontFamily: F.body }}><span>Privacy</span><span>Terms</span><span>GitHub</span></div>
        </div>
      </footer>
    </div>
  );
}
