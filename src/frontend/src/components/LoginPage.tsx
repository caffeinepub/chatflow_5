import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, MessageCircle } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { useActor } from "../hooks/useActor";

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

interface LoginPageProps {
  onLogin: (username: string, displayName: string) => void;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { actor, isFetching } = useActor();
  const autoLoginAttempted = useRef(false);

  // Auto-login if session exists, re-register for discoverability
  useEffect(() => {
    if (isFetching || autoLoginAttempted.current) return;
    const session = readSession();
    if (!session) return;
    autoLoginAttempted.current = true;
    if (actor) {
      actor.registerUser(session.username, session.displayName).catch(() => {});
    }
    onLogin(session.username, session.displayName);
  }, [actor, isFetching, onLogin]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const name = displayName.trim();
    if (!name) {
      setError("Please enter a display name.");
      return;
    }
    if (name.length < 2) {
      setError("Name must be at least 2 characters.");
      return;
    }
    setError("");
    setIsLoading(true);
    const username = name.toLowerCase().replace(/\s+/g, "_");
    try {
      if (actor) {
        await actor.registerUser(username, name);
      }
      onLogin(username, name);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ background: "#000" }}
    >
      {/* Ambient glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 70% 50% at 50% 50%, oklch(0.25 0.1 240 / 0.25) 0%, transparent 70%)",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 32, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-sm mx-4 z-10"
      >
        <div
          className="rounded-3xl p-8"
          style={{
            background: "#111",
            border: "1px solid #222",
            boxShadow: "0 8px 48px rgba(0,0,0,0.8)",
          }}
        >
          {/* Logo */}
          <div className="flex flex-col items-center mb-10">
            <motion.div
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.4, ease: "backOut" }}
              className="rounded-2xl flex items-center justify-center mb-4"
              style={{
                width: 72,
                height: 72,
                background:
                  "linear-gradient(135deg, oklch(0.52 0.22 240), oklch(0.48 0.24 260))",
                boxShadow: "0 0 32px oklch(0.52 0.22 240 / 0.4)",
              }}
            >
              <MessageCircle className="w-9 h-9 text-white" />
            </motion.div>
            <h1 className="text-3xl font-bold text-white tracking-tight">
              ChatFlow
            </h1>
            <p className="text-sm mt-1" style={{ color: "#888" }}>
              Connect. Chat. Flow.
            </p>
          </div>

          <div className="mb-6 text-center">
            <h2 className="text-lg font-semibold text-white">Get Started</h2>
            <p className="text-xs mt-1" style={{ color: "#666" }}>
              Your name will be visible to others in search
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Input
                type="text"
                placeholder="Enter your display name\u2026"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                disabled={isLoading}
                autoFocus
                className="h-12 rounded-xl text-sm text-white placeholder:text-gray-600 pr-4"
                style={{
                  background: "#1a1a1a",
                  border: "1px solid #333",
                  outline: "none",
                }}
                data-ocid="login.input"
              />
            </div>

            {error && (
              <p
                className="text-xs"
                style={{ color: "#f87171" }}
                data-ocid="login.error_state"
              >
                {error}
              </p>
            )}

            <Button
              type="submit"
              disabled={isLoading || !displayName.trim()}
              className="w-full h-12 rounded-xl font-semibold text-sm text-white transition-all"
              style={{
                background: displayName.trim()
                  ? "linear-gradient(135deg, oklch(0.52 0.22 240), oklch(0.48 0.24 260))"
                  : "#222",
                border: "none",
                boxShadow: displayName.trim()
                  ? "0 0 20px oklch(0.52 0.22 240 / 0.3)"
                  : "none",
              }}
              data-ocid="login.submit_button"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2 inline" />
                  Setting up\u2026
                </>
              ) : (
                "Get Started \u2192"
              )}
            </Button>
          </form>

          <p className="text-center text-xs mt-6" style={{ color: "#444" }}>
            By continuing you agree to our{" "}
            <button
              type="button"
              className="underline hover:text-gray-300 cursor-pointer"
              onClick={() => {}}
            >
              Terms
            </button>{" "}
            &amp;{" "}
            <button
              type="button"
              className="underline hover:text-gray-300 cursor-pointer"
              onClick={() => {}}
            >
              Privacy
            </button>
          </p>
        </div>

        <p className="text-center text-xs mt-5" style={{ color: "#333" }}>
          \u00a9 {new Date().getFullYear()}. Built with \u2764\ufe0f using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-gray-400 underline"
          >
            caffeine.ai
          </a>
        </p>
      </motion.div>
    </div>
  );
}
