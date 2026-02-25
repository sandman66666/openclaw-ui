"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Lock, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { setStoredToken } from "@/lib/auth";

interface LoginScreenProps {
  onSuccess: (token: string) => void;
}

export function LoginScreen({ onSuccess }: LoginScreenProps) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isSetup, setIsSetup] = useState<boolean | null>(null); // null = loading
  const inputRef = useRef<HTMLInputElement>(null);

  // Check if password is configured
  useEffect(() => {
    fetch("/api/auth")
      .then((r) => r.json())
      .then((data) => setIsSetup(!data.configured))
      .catch(() => setIsSetup(false)); // assume configured on error
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim() || loading) return;

    // Setup mode: require confirmation
    if (isSetup && password !== confirm) {
      setError("Passwords don't match");
      return;
    }
    if (isSetup && password.length < 4) {
      setError("At least 4 characters");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Authentication failed");
        setPassword("");
        setConfirm("");
        inputRef.current?.focus();
        return;
      }

      setStoredToken(data.token as string);
      onSuccess(data.token as string);
    } catch {
      setError("Network error — please try again");
    } finally {
      setLoading(false);
    }
  };

  // Still checking server status
  if (isSetup === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-3xl shadow-xl animate-pulse">
          🦞
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "min-h-screen flex items-center justify-center",
        "bg-gray-950",
        "px-4"
      )}
    >
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="w-full max-w-sm"
      >
        {/* Logo */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-4xl shadow-2xl mb-5">
            🦞
          </div>
          <h1 className="text-2xl font-semibold text-white tracking-tight">
            OpenClaw
          </h1>
          <p className="mt-1 text-sm text-gray-400">
            {isSetup
              ? "Create a password to secure your dashboard"
              : "Enter your password to continue"}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Password field */}
          <div className="relative">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <Lock className="w-4 h-4 text-gray-500" />
            </div>
            <input
              ref={inputRef}
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (error) setError(null);
              }}
              placeholder={isSetup ? "Choose a password" : "Password"}
              autoFocus
              autoComplete={isSetup ? "new-password" : "current-password"}
              className={cn(
                "w-full pl-11 pr-4 py-3.5 rounded-xl",
                "bg-gray-800 text-white placeholder-gray-500",
                "border transition-colors duration-200",
                error
                  ? "border-red-500/70 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                  : "border-gray-700 focus:border-orange-400/70 focus:ring-2 focus:ring-orange-400/20",
                "focus:outline-none"
              )}
            />
          </div>

          {/* Confirm field (setup only) */}
          {isSetup && (
            <div className="relative">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                <ShieldCheck className="w-4 h-4 text-gray-500" />
              </div>
              <input
                type="password"
                value={confirm}
                onChange={(e) => {
                  setConfirm(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="Confirm password"
                autoComplete="new-password"
                className={cn(
                  "w-full pl-11 pr-4 py-3.5 rounded-xl",
                  "bg-gray-800 text-white placeholder-gray-500",
                  "border transition-colors duration-200",
                  error
                    ? "border-red-500/70 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                    : "border-gray-700 focus:border-orange-400/70 focus:ring-2 focus:ring-orange-400/20",
                  "focus:outline-none"
                )}
              />
            </div>
          )}

          {/* Error */}
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm text-red-400 text-center"
            >
              {error}
            </motion.p>
          )}

          <button
            type="submit"
            disabled={
              !password.trim() ||
              loading ||
              (isSetup && !confirm.trim())
            }
            className={cn(
              "w-full py-3.5 rounded-xl font-semibold text-white",
              "bg-gradient-to-r from-orange-400 to-red-500",
              "shadow-lg shadow-red-500/20",
              "hover:from-orange-500 hover:to-red-600",
              "active:scale-[0.98] transition-all duration-200",
              "disabled:opacity-40 disabled:cursor-not-allowed disabled:scale-100"
            )}
          >
            {loading
              ? isSetup
                ? "Setting up..."
                : "Signing in..."
              : isSetup
                ? "Set Password"
                : "Sign in"}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
