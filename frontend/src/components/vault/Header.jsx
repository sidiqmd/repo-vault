import { useState, useEffect, useRef, forwardRef } from "react";
import { F } from "../../theme";

const Header = forwardRef(function Header({ T, dark, setDark, user, isGuest, search, setSearch, stats, onLogin, onLogout, onShowSettings, onShowGuide }, searchRef) {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    if (!showMenu) return;
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setShowMenu(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showMenu]);

  return (
    <header style={{ position: "sticky", top: 0, zIndex: 100, background: T.headerBg, backdropFilter: "blur(16px)", borderBottom: `1px solid ${T.bdr}` }}>
      <div style={{ maxWidth: 1360, margin: "0 auto", padding: "0 16px", display: "flex", alignItems: "center", height: 48, gap: 10 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 2, flexShrink: 0 }}>
          <span style={{ fontFamily: F.display, fontSize: "18px", color: T.ink }}>Repo</span>
          <span style={{ fontFamily: F.display, fontSize: "18px", fontStyle: "italic", color: T.acc }}>Vault</span>
        </div>

        <div style={{ flex: 1, maxWidth: 360, position: "relative" }}>
          <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: T.inkF, fontSize: 12 }}>{"\u2315"}</span>
          <input ref={searchRef} value={search} onChange={e => setSearch(e.target.value)} placeholder="Search\u2026 /" style={{ width: "100%", padding: "6px 10px 6px 28px", borderRadius: 7, border: `1.5px solid ${T.bdr}`, background: T.surface, color: T.ink, fontSize: "12px", fontFamily: F.body, outline: "none" }} onFocus={e => e.target.style.borderColor = T.acc} onBlur={e => e.target.style.borderColor = T.bdr} />
        </div>

        <span className="hide-mobile" style={{ fontSize: "11px", fontFamily: F.body, color: T.inkF }}><strong style={{ color: T.ink }}>{stats.total}</strong> repos</span>
        <span className="hide-mobile" style={{ fontSize: "11px", fontFamily: F.body, color: T.inkF }}><strong style={{ color: "#D97706" }}>{stats.inbox}</strong> inbox</span>

        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: "10px", fontFamily: F.mono, color: T.inkF }} title={isGuest ? "Local storage" : "Cloud synced"}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: isGuest ? T.inkF : "#4ADE80" }} />
            <span className="hide-mobile">{isGuest ? "Local" : "Synced"}</span>
          </div>

          <div ref={menuRef} style={{ position: "relative" }}>
            <button data-umami-event="Header: Open User Menu" onClick={() => setShowMenu(!showMenu)} style={{ display: "flex", alignItems: "center", gap: 5, padding: "3px 8px", borderRadius: 7, border: `1px solid ${showMenu ? T.acc : T.bdr}`, background: T.bg, cursor: "pointer", fontSize: "11px", color: T.inkM, fontFamily: F.body, transition: "border-color 0.15s" }}>
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt="" style={{ width: 22, height: 22, borderRadius: "50%", objectFit: "cover" }} referrerPolicy="no-referrer" />
              ) : (
                <div style={{ width: 22, height: 22, borderRadius: "50%", background: T.acc, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", fontWeight: 700, color: "#fff" }}>{user?.avatar || "?"}</div>
              )}
              <span className="hide-mobile">{user?.name || "Guest"}</span>
              <span style={{ fontSize: "10px", color: T.inkF, marginLeft: 2, transition: "transform 0.2s", transform: showMenu ? "rotate(180deg)" : "rotate(0)" }}>{"\u25BE"}</span>
            </button>

            {showMenu && (
              <div style={{ position: "absolute", top: "calc(100% + 6px)", right: 0, background: T.surface, border: `1px solid ${T.bdr}`, borderRadius: 10, padding: 6, minWidth: 200, boxShadow: T.modalShadow, zIndex: 200 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 10px", borderRadius: 6 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={T.inkF} strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" /></svg>
                    <span style={{ fontSize: "13px", color: T.ink, fontFamily: F.body }}>{dark ? "Dark" : "Light"} mode</span>
                  </div>
                  <button data-umami-event="Header: Toggle Dark Mode" onClick={(e) => { e.stopPropagation(); setDark(!dark); }} style={{ width: 36, height: 20, borderRadius: 10, border: "none", cursor: "pointer", background: dark ? T.acc : T.bdr, position: "relative", transition: "background 0.3s", display: "flex", alignItems: "center", padding: 2 }}>
                    <div style={{ width: 16, height: 16, borderRadius: "50%", background: T.surface, transition: "transform 0.3s", transform: dark ? "translateX(16px)" : "translateX(0)" }} />
                  </button>
                </div>

                <div style={{ height: 1, background: T.bdrLt, margin: "4px 0" }} />

                <button data-umami-event="Header: Open Settings" onClick={() => { onShowSettings(); setShowMenu(false); }} style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "8px 10px", borderRadius: 6, border: "none", background: "transparent", color: T.ink, fontSize: "13px", fontFamily: F.body, cursor: "pointer", textAlign: "left", transition: "background 0.12s" }}
                  onMouseEnter={e => e.currentTarget.style.background = T.surfHov}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={T.inkF} strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" /></svg>
                  Settings
                </button>

                <button data-umami-event="Header: Open Guide" onClick={() => { onShowGuide(); setShowMenu(false); }} style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "8px 10px", borderRadius: 6, border: "none", background: "transparent", color: T.ink, fontSize: "13px", fontFamily: F.body, cursor: "pointer", textAlign: "left", transition: "background 0.12s" }}
                  onMouseEnter={e => e.currentTarget.style.background = T.surfHov}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={T.inkF} strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
                  How to use
                </button>

                <div style={{ height: 1, background: T.bdrLt, margin: "4px 0" }} />

                <div style={{ padding: "8px 10px", display: "flex", alignItems: "center", gap: 8 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={isGuest ? T.inkF : "#4ADE80"} strokeWidth="2" strokeLinecap="round"><polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" /><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" /></svg>
                  <span style={{ fontSize: "12px", color: T.inkF, fontFamily: F.body }}>{isGuest ? "Browser storage only" : "Cloud synced"}</span>
                </div>

                {isGuest && (
                  <button data-umami-event="Header: Sign In Sync" onClick={() => { onLogin(); setShowMenu(false); }} style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "8px 10px", borderRadius: 6, border: "none", background: T.accLt, color: T.acc, fontSize: "13px", fontFamily: F.body, cursor: "pointer", fontWeight: 600, textAlign: "left" }}
                    onMouseEnter={e => e.currentTarget.style.background = T.accBdr}
                    onMouseLeave={e => e.currentTarget.style.background = T.accLt}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={T.acc} strokeWidth="2" strokeLinecap="round"><path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4" /><polyline points="10 17 15 12 10 7" /><line x1="15" y1="12" x2="3" y2="12" /></svg>
                    Sign in to sync
                  </button>
                )}

                <div style={{ height: 1, background: T.bdrLt, margin: "4px 0" }} />

                <button data-umami-event="Header: Log Out" onClick={() => { onLogout(); setShowMenu(false); }} style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "8px 10px", borderRadius: 6, border: "none", background: "transparent", color: "#EF4444", fontSize: "13px", fontFamily: F.body, cursor: "pointer", textAlign: "left", transition: "background 0.12s" }}
                  onMouseEnter={e => e.currentTarget.style.background = "#EF444410"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
                  Log out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
});

export default Header;
