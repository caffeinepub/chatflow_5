import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MessageCircle } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { useActor } from "../hooks/useActor";

const ACCOUNTS_KEY = "chatflow_accounts";

type Accounts = Record<string, string>; // username -> password

function getAccounts(): Accounts {
  try {
    return JSON.parse(localStorage.getItem(ACCOUNTS_KEY) || "{}");
  } catch {
    return {};
  }
}

function saveAccount(username: string, password: string) {
  const accounts = getAccounts();
  accounts[username] = password;
  try {
    localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
  } catch {}
}

interface LoginPageProps {
  onLogin: (username: string) => void;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState("");
  const { actor } = useActor();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError("Please enter both username and password.");
      return;
    }
    const accounts = getAccounts();
    if (isRegister) {
      if (accounts[username.trim()]) {
        setError("Username already taken. Please choose another.");
        return;
      }
      saveAccount(username.trim(), password);
      setError("");
      if (actor) {
        actor
          .registerUser(username.trim(), fullName.trim() || username.trim())
          .catch(() => {});
      }
      onLogin(username.trim());
    } else {
      if (!accounts[username.trim()]) {
        setError("No account found. Please register first.");
        return;
      }
      if (accounts[username.trim()] !== password) {
        setError("Incorrect password.");
        return;
      }
      setError("");
      if (actor) {
        actor
          .registerUser(username.trim(), fullName.trim() || username.trim())
          .catch(() => {});
      }
      onLogin(username.trim());
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-black">
      {/* Subtle background tint */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 50%, oklch(0.25 0.08 240 / 0.3) 0%, transparent 70%)",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="w-full max-w-sm mx-4 z-10"
      >
        {/* Card */}
        <div
          className="rounded-3xl p-8 bg-gray-900 border border-gray-700"
          style={{ boxShadow: "0 4px 32px rgba(0,0,0,0.6)" }}
        >
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 neon-glow"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.52 0.22 240), oklch(0.48 0.24 250))",
              }}
            >
              <MessageCircle className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              ChatFlow
            </h1>
            <p className="text-sm text-gray-400 mt-1">Connect. Chat. Flow.</p>
          </div>

          <h2 className="text-base font-semibold text-gray-100 mb-6 text-center">
            {isRegister ? "Create an account" : "Welcome back"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <div className="space-y-1.5">
                <Label className="text-gray-300 text-sm" htmlFor="fullname">
                  Full Name
                </Label>
                <Input
                  id="fullname"
                  type="text"
                  placeholder="Your full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="glass-input rounded-xl h-11"
                  data-ocid="login.input"
                />
              </div>
            )}
            <div className="space-y-1.5">
              <Label className="text-gray-300 text-sm" htmlFor="username">
                Username
              </Label>
              <Input
                id="username"
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="glass-input rounded-xl h-11"
                autoComplete="username"
                data-ocid="login.input"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-gray-300 text-sm" htmlFor="password">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="glass-input rounded-xl h-11"
                autoComplete="current-password"
                data-ocid="login.input"
              />
            </div>

            {error && (
              <p
                className="text-sm text-destructive"
                data-ocid="login.error_state"
              >
                {error}
              </p>
            )}

            <Button
              type="submit"
              className="w-full rounded-xl font-semibold h-11 mt-2"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.52 0.22 240), oklch(0.48 0.24 250))",
                color: "white",
                border: "none",
              }}
              data-ocid="login.submit_button"
            >
              {isRegister ? "Create Account" : "Sign In"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-400">
              {isRegister
                ? "Already have an account?"
                : "Don't have an account?"}{" "}
              <button
                type="button"
                onClick={() => {
                  setIsRegister(!isRegister);
                  setError("");
                }}
                className="text-primary font-semibold hover:underline"
                data-ocid="login.secondary_button"
              >
                {isRegister ? "Sign In" : "Register"}
              </button>
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-gray-500 mt-6">
          © {new Date().getFullYear()}. Built with ❤️ using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline text-primary"
          >
            caffeine.ai
          </a>
        </p>
      </motion.div>
    </div>
  );
}
