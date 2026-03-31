import { Toaster } from "@/components/ui/sonner";
import { useState } from "react";
import { ChatLayout } from "./components/ChatLayout";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { LoginPage } from "./components/LoginPage";

const SESSION_KEY = "chatflow_session";

function AppInner() {
  const [username, setUsername] = useState<string | null>(() => {
    try {
      return localStorage.getItem(SESSION_KEY) || null;
    } catch {
      return null;
    }
  });

  function handleLogin(name: string) {
    try {
      localStorage.setItem(SESSION_KEY, name);
    } catch {}
    setUsername(name);
  }

  function handleLogout() {
    try {
      localStorage.removeItem(SESSION_KEY);
    } catch {}
    setUsername(null);
  }

  return (
    <>
      {username ? (
        <ChatLayout username={username} onLogout={handleLogout} />
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
