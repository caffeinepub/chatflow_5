import { Toaster } from "@/components/ui/sonner";
import { useState } from "react";
import { ChatLayout } from "./components/ChatLayout";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { LoginPage } from "./components/LoginPage";

const SESSION_KEY = "chatflow_session_v2";

interface Session {
  username: string;
  displayName: string;
}

function readSession(): Session | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Session;
    if (parsed.username && parsed.displayName) return parsed;
    return null;
  } catch {
    return null;
  }
}

function AppInner() {
  const [session, setSession] = useState<Session | null>(() => readSession());

  function handleLogin(username: string, displayName: string) {
    const s: Session = { username, displayName };
    try {
      localStorage.setItem(SESSION_KEY, JSON.stringify(s));
    } catch {}
    setSession(s);
  }

  function handleLogout() {
    try {
      localStorage.removeItem(SESSION_KEY);
    } catch {}
    setSession(null);
  }

  return (
    <>
      {session ? (
        <ChatLayout username={session.username} onLogout={handleLogout} />
      ) : (
        <LoginPage onLogin={handleLogin} />
      )}
      <Toaster />
    </>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AppInner />
    </ErrorBoundary>
  );
}
