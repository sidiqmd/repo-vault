import { useState, useEffect, useMemo, useRef } from "react";
import { PDark, PLight, F } from "./theme";
import { ThemeContext } from "./ThemeContext";
import useLocalStorage from "./hooks/useLocalStorage";
import { useSession, signOut } from "./services/auth-client";
import { createStorageService } from "./services/storage";
import LandingPage from "./components/landing/LandingPage";
import AuthPage from "./components/auth/AuthPage";
import VaultApp from "./components/vault/VaultApp";

export default function App() {
  const [page, setPage] = useState("landing");
  const [guestMode, setGuestMode] = useState(false);
  const [dark, setDark] = useLocalStorage("rv_dark", true);
  const T = dark ? PDark : PLight;

  // Better Auth session
  const { data: session, isPending } = useSession();
  const isSignedIn = !!session?.user;
  const isGuest = !isSignedIn;

  // Build user object from session or guest
  const appUser = isSignedIn ? {
    name: session.user.name || "User",
    avatar: session.user.name?.[0] || "?",
    avatarUrl: session.user.image || null,
    isGuest: false,
  } : guestMode ? {
    name: "Guest",
    avatar: "?",
    isGuest: true,
  } : null;

  // Auto-navigate to vault when signed in
  useEffect(() => {
    if (isSignedIn && page !== "vault") {
      setTimeout(() => setPage("vault"), 0);
    }
  }, [isSignedIn, page]);

  // Redirect to landing when signed out and not in guest mode
  useEffect(() => {
    if (!isPending && !isSignedIn && !guestMode && page === "vault") {
      setPage("landing");
    }
  }, [isPending, isSignedIn, guestMode, page]);

  // Storage service (switches between localStorage and API)
  const storage = useMemo(
    () => createStorageService(isGuest),
    [isGuest]
  );

  // Migrate guest data when user signs in
  const hasMigrated = useRef(false);
  useEffect(() => {
    if (isSignedIn && !hasMigrated.current) {
      hasMigrated.current = true;
      storage.migrateGuestData();
    }
  }, [isSignedIn, storage]);

  const handleLogout = async () => {
    await signOut();
    setGuestMode(false);
    setPage("landing");
  };

  const handleGuestStart = () => {
    setGuestMode(true);
    setPage("vault");
  };

  // Show nothing only on initial load while checking session
  if (isPending && page === "landing" && !guestMode) {
    return null;
  }

  return (
    <ThemeContext.Provider value={T}>
      <div>
        <style>{`
          *{box-sizing:border-box;margin:0;padding:0;}
          body{background:${T.bg};color:${T.ink};transition:background 0.3s,color 0.3s;}
          ::-webkit-scrollbar{width:5px;height:5px;}::-webkit-scrollbar-track{background:transparent;}::-webkit-scrollbar-thumb{background:${T.scrollThumb};border-radius:3px;}
          ::selection{background:${T.acc}22;}input::placeholder,textarea::placeholder{color:${T.inkF};}select option{background:${T.surface};color:${T.ink};}
          table{border-collapse:collapse;width:100%;}
          .feat-grid{grid-template-columns:1fr 1fr;}
          .card-grid{grid-template-columns:1fr;}
          .hide-mobile{display:none;}
          @media(min-width:640px){.card-grid{grid-template-columns:repeat(auto-fill,minmax(300px,1fr));}.hide-mobile{display:inline;}}
          @media(min-width:768px){.feat-grid{grid-template-columns:repeat(3,1fr);}}
          @media(max-width:768px){.hero-section{flex-direction:column !important;}}
        `}</style>
        {page === "landing" && <LandingPage T={T} dark={dark} setDark={setDark} onStart={handleGuestStart} onLogin={() => setPage("auth")} />}
        {page === "auth" && <AuthPage T={T} onSkip={handleGuestStart} />}
        {page === "vault" && appUser && <VaultApp T={T} dark={dark} setDark={setDark} user={appUser} isGuest={isGuest} storage={storage} onLogout={handleLogout} onLogin={() => setPage("auth")} />}
      </div>
    </ThemeContext.Provider>
  );
}
