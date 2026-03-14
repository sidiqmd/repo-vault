import { useState } from "react";
import { F } from "../../theme";

export default function OnboardingGuide({ T, onClose }) {
  const [step, setStep] = useState(0);
  const steps = [
    { title: "Welcome to RepoVault", desc: "Your personal vault for GitHub repos. Let's take a quick tour.", icon: <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={T.acc} strokeWidth="1.5" strokeLinecap="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg> },
    { title: "Capture repos", desc: "Tap the orange + button to add any GitHub URL. Paste a link and press Enter \u2014 metadata and AI summary auto-generate.", icon: <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={T.acc} strokeWidth="1.5" strokeLinecap="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg> },
    { title: "Organize with status", desc: "Move repos through your pipeline: Inbox \u2192 To Read \u2192 Read \u2192 To Build \u2192 Built \u2192 Archived. Click any card to change status.", icon: <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#5B9EF5" strokeWidth="1.5" strokeLinecap="round"><rect x="3" y="3" width="5" height="18" rx="1" /><rect x="10" y="8" width="5" height="13" rx="1" /><rect x="17" y="5" width="5" height="16" rx="1" /></svg> },
    { title: "Search everything", desc: "Press / to focus search. Find repos by name, AI summary, your notes, or tags. Filter by status and category.", icon: <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg> },
    { title: "Track activity", desc: "Each repo shows a sparkline of recent commit activity. Green = trending up, red = declining, gray = stable.", icon: <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#4ADE80" strokeWidth="1.5" strokeLinecap="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg> },
    { title: "You're all set!", desc: "Start by adding a GitHub URL. You can replay this guide anytime from the ? button in the header.", icon: <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={T.acc} strokeWidth="1.5" strokeLinecap="round"><path d="M22 11.08V12a10 10 0 11-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg> },
  ];

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 2000, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ background: T.surface, borderRadius: 16, width: "100%", maxWidth: 400, boxShadow: T.modalShadow, overflow: "hidden" }}>
        <div style={{ padding: "20px 24px 0", display: "flex", justifyContent: "center", gap: 6 }}>
          {steps.map((_, i) => (
            <div key={i} style={{ width: i === step ? 20 : 6, height: 6, borderRadius: 3, background: i === step ? T.acc : i < step ? `${T.acc}66` : T.bdr, transition: "all 0.3s", cursor: "pointer" }} onClick={() => setStep(i)} />
          ))}
        </div>
        <div style={{ padding: "28px 28px 20px", textAlign: "center", minHeight: 220, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <div style={{ marginBottom: 16, opacity: 1, transition: "opacity 0.3s" }} key={step}>{steps[step].icon}</div>
          <h3 style={{ fontFamily: F.display, fontSize: "22px", fontWeight: 400, color: T.ink, marginBottom: 8 }} key={`t${step}`}>{steps[step].title}</h3>
          <p style={{ fontFamily: F.body, fontSize: "14px", color: T.inkM, lineHeight: 1.6, maxWidth: 320 }} key={`d${step}`}>{steps[step].desc}</p>
        </div>
        <div style={{ padding: "0 28px 24px", display: "flex", gap: 8, justifyContent: "center" }}>
          {step > 0 && (
            <button data-umami-event="Onboarding: Back" onClick={() => setStep(step - 1)} style={{ padding: "9px 20px", borderRadius: 8, border: `1.5px solid ${T.bdr}`, background: "transparent", color: T.inkM, fontSize: "13px", fontFamily: F.body, cursor: "pointer" }}>Back</button>
          )}
          {step < steps.length - 1 ? (
            <button data-umami-event="Onboarding: Next" onClick={() => setStep(step + 1)} style={{ padding: "9px 24px", borderRadius: 8, border: "none", background: T.acc, color: "#fff", fontSize: "13px", fontFamily: F.body, fontWeight: 600, cursor: "pointer" }}>Next</button>
          ) : (
            <button data-umami-event="Onboarding: Start" onClick={onClose} style={{ padding: "9px 24px", borderRadius: 8, border: "none", background: T.acc, color: "#fff", fontSize: "13px", fontFamily: F.body, fontWeight: 600, cursor: "pointer" }}>Start using RepoVault</button>
          )}
        </div>
        {step < steps.length - 1 && (
          <div style={{ textAlign: "center", paddingBottom: 16 }}>
            <button data-umami-event="Onboarding: Skip" onClick={onClose} style={{ background: "none", border: "none", color: T.inkF, fontSize: "12px", fontFamily: F.body, cursor: "pointer", padding: 4 }}>Skip tour</button>
          </div>
        )}
      </div>
    </div>
  );
}
