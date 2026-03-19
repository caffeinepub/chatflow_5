import { Toaster } from "@/components/ui/sonner";
import { useState } from "react";
import { ChatLayout } from "./components/ChatLayout";
import { LoginPage } from "./components/LoginPage";

export default function App() {
  const [username, setUsername] = useState<string | null>(null);

  function handleLogin(name: string) {
    setUsername(name);
  }

  function handleLogout() {
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
