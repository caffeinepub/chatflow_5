import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MessageCircle } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";

interface LoginPageProps {
  onLogin: (username: string) => void;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError("Please enter both username and password.");
      return;
    }
    setError("");
    onLogin(username.trim());
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Background ambient glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 50%, oklch(0.65 0.25 240 / 0.08) 0%, transparent 70%)",
        }}
      />
      {/* Corner glow accents */}
      <div
        className="absolute top-0 left-0 w-96 h-96 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, oklch(0.65 0.25 240 / 0.07) 0%, transparent 70%)",
        }}
      />
      <div
        className="absolute bottom-0 right-0 w-96 h-96 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, oklch(0.65 0.25 240 / 0.06) 0%, transparent 70%)",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="w-full max-w-sm mx-4 z-10"
      >
        {/* Glass card */}
        <div
          className="glass-card rounded-3xl p-8 shadow-neon-container"
          style={{
            background: "rgba(255,255,255,0.06)",
          }}
        >
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 neon-glow"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.65 0.25 240 / 0.8), oklch(0.55 0.28 250 / 0.9))",
              }}
            >
              <MessageCircle className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">
              ChatFlow
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Connect. Chat. Flow.
            </p>
          </div>

          <h2 className="text-base font-semibold text-foreground mb-6 text-center">
            {isRegister ? "Create an account" : "Welcome back"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <div className="space-y-1.5">
                <Label
                  className="text-foreground/80 text-sm"
                  htmlFor="fullname"
                >
                  Full Name
                </Label>
                <Input
                  id="fullname"
                  type="text"
                  placeholder="Your full name"
                  className="glass-input rounded-xl h-11"
                  data-ocid="login.input"
                />
              </div>
            )}
            <div className="space-y-1.5">
              <Label className="text-foreground/80 text-sm" htmlFor="username">
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
              <Label className="text-foreground/80 text-sm" htmlFor="password">
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
              className="w-full rounded-xl font-semibold h-11 mt-2 shadow-neon-btn"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.65 0.25 240), oklch(0.60 0.27 250))",
                color: "white",
                border: "none",
              }}
              data-ocid="login.submit_button"
            >
              {isRegister ? "Create Account" : "Sign In"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
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

        <p className="text-center text-xs text-muted-foreground mt-6">
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
