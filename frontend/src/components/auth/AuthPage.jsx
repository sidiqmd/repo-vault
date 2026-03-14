import { F } from "../../theme";
import Icons from "../common/Icons";
import { signIn } from "../../services/auth-client";

export default function AuthPage({ T, onSkip }) {
  const handleSocial = async (provider) => {
    await signIn.social({
      provider,
      callbackURL: `${window.location.origin}/vault`,
    });
  };

  return (
    <div style={{ minHeight: "100vh", background: T.bg, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ width: "100%", maxWidth: 380 }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "center", gap: 2, marginBottom: 12 }}>
            <span style={{ fontFamily: F.display, fontSize: "26px", color: T.ink }}>Repo</span>
            <span style={{ fontFamily: F.display, fontSize: "26px", fontStyle: "italic", color: T.acc }}>Vault</span>
          </div>
          <h2 style={{ fontFamily: F.display, fontSize: "22px", color: T.ink, marginBottom: 4 }}>Welcome back</h2>
          <p style={{ fontSize: "14px", color: T.inkM, fontFamily: F.body }}>Sign in to sync across devices.</p>
        </div>
        <div style={{ background: T.surface, border: `1px solid ${T.bdr}`, borderRadius: 14, padding: 24 }}>
          {[
            { name: "GitHub", provider: "github", icon: Icons.github() },
            { name: "Google", provider: "google", icon: Icons.google() },
          ].map(p => (
            <button key={p.name} data-umami-event={`Auth: Login with ${p.name}`} onClick={() => handleSocial(p.provider)} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, width: "100%", padding: "11px", borderRadius: 10, border: `1.5px solid ${T.bdr}`, background: "transparent", color: T.ink, fontSize: "14px", fontWeight: 500, fontFamily: F.body, cursor: "pointer", marginBottom: 8, transition: "all 0.15s" }}
              onMouseEnter={e => { e.currentTarget.style.background = T.surfHov; e.currentTarget.style.borderColor = T.acc; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = T.bdr; }}>
              {p.icon}<span>Continue with {p.name}</span>
            </button>
          ))}
          <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "16px 0" }}>
            <div style={{ flex: 1, height: 1, background: T.bdr }} /><span style={{ fontSize: "11px", color: T.inkF, fontFamily: F.mono }}>or</span><div style={{ flex: 1, height: 1, background: T.bdr }} />
          </div>
          <button data-umami-event="Auth: Continue as Guest" onClick={onSkip} style={{ width: "100%", padding: "11px", borderRadius: 10, border: `1.5px solid ${T.bdr}`, background: "transparent", color: T.inkM, fontSize: "14px", fontFamily: F.body, cursor: "pointer" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = T.acc; e.currentTarget.style.color = T.ink; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = T.bdr; e.currentTarget.style.color = T.inkM; }}>
            Continue as guest
          </button>
          <p style={{ fontSize: "11px", color: T.inkF, fontFamily: F.body, textAlign: "center", marginTop: 10 }}>Guest data stored in browser only.</p>
        </div>
      </div>
    </div>
  );
}
