"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Moon,
  Sun,
  Monitor,
  Bell,
  Shield,
  HelpCircle,
  ChevronRight,
  Check,
  ExternalLink,
  Wifi,
  WifiOff,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/stores/app-store";
import { apiUrl } from "@/lib/config";

function SettingRow({
  icon: Icon,
  title,
  description,
  onClick,
  trailing,
}: {
  icon: React.ElementType;
  title: string;
  description?: string;
  onClick?: () => void;
  trailing?: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      disabled={!onClick}
      className="w-full flex items-center gap-4 p-4 text-left transition-colors duration-150"
      onMouseEnter={(e) => { if (onClick) e.currentTarget.style.background = "var(--bg-card-hover)"; }}
      onMouseLeave={(e) => { if (onClick) e.currentTarget.style.background = "transparent"; }}
    >
      <div
        className="w-10 h-10 rounded-lg flex items-center justify-center"
        style={{ background: "var(--bg-elevated)", color: "var(--text-secondary)" }}
      >
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-sm" style={{ color: "var(--text-primary)" }}>{title}</h3>
        {description && (
          <p className="text-sm truncate" style={{ color: "var(--text-secondary)" }}>
            {description}
          </p>
        )}
      </div>
      {trailing ||
        (onClick && <ChevronRight className="w-5 h-5" style={{ color: "var(--text-muted)" }} />)}
    </button>
  );
}

function SettingSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <h3
        className="text-xs font-semibold uppercase tracking-wider px-4 py-2"
        style={{ color: "var(--text-muted)" }}
      >
        {title}
      </h3>
      <div
        className="rounded-lg overflow-hidden border divide-y"
        style={{
          background: "var(--bg-card)",
          borderColor: "var(--border-default)",
          "--tw-divide-color": "var(--border-subtle)",
        } as React.CSSProperties}
      >
        {children}
      </div>
    </div>
  );
}

function ThemeSelector() {
  const { theme, setTheme } = useAppStore();

  const themes = [
    { id: "light" as const, icon: Sun, label: "Light" },
    { id: "dark" as const, icon: Moon, label: "Dark" },
    { id: "system" as const, icon: Monitor, label: "System" },
  ];

  return (
    <div className="flex gap-2 p-1 rounded-lg" style={{ background: "var(--bg-elevated)" }}>
      {themes.map((t) => {
        const isActive = theme === t.id;
        const Icon = t.icon;
        return (
          <button
            key={t.id}
            onClick={() => setTheme(t.id)}
            className="relative flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
            style={{ color: isActive ? "var(--text-primary)" : "var(--text-muted)" }}
          >
            {isActive && (
              <motion.div
                layoutId="themeSelector"
                className="absolute inset-0 rounded-md"
                style={{ background: "var(--bg-card)" }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            )}
            <Icon className="relative w-4 h-4" />
            <span className="relative">{t.label}</span>
          </button>
        );
      })}
    </div>
  );
}

function GatewayConfig() {
  const {
    gatewayUrl,
    gatewayToken,
    gatewayPassword,
    setGatewayConfig,
    connected,
    setConnected,
  } = useAppStore();
  const [url, setUrl] = useState(gatewayUrl);
  const [token, setToken] = useState(gatewayToken);
  const [password, setPassword] = useState(gatewayPassword);
  const [isEditing, setIsEditing] = useState(!gatewayUrl);
  const [testing, setTesting] = useState(false);

  const handleSave = async () => {
    setGatewayConfig(url, token, password);
    setTesting(true);
    try {
      const res = await fetch(apiUrl("/api/skills"));
      if (res.ok) {
        setConnected(true);
      }
    } catch {}
    setTesting(false);
    setIsEditing(false);
  };

  if (!isEditing && gatewayUrl) {
    return (
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Gateway URL</p>
            <p className="font-medium truncate" style={{ color: "var(--text-primary)" }}>{gatewayUrl}</p>
          </div>
          {connected ? (
            <span
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium shrink-0"
              style={{ background: "rgba(52, 211, 153, 0.1)", color: "var(--accent-green)" }}
            >
              <Wifi className="w-3 h-3" />
              Connected
            </span>
          ) : (
            <span
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium shrink-0"
              style={{ background: "rgba(239, 68, 68, 0.1)", color: "#EF4444" }}
            >
              <WifiOff className="w-3 h-3" />
              Disconnected
            </span>
          )}
        </div>
        <div className="flex gap-3 text-sm" style={{ color: "var(--text-muted)" }}>
          <span>Token: ••••{gatewayToken.slice(-8)}</span>
          <span>Password: ••••••</span>
        </div>
        <button
          onClick={() => setIsEditing(true)}
          className="px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors"
          style={{ borderColor: "var(--border-default)", color: "var(--text-secondary)" }}
        >
          Change Connection
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <div className="space-y-3">
        <div>
          <label className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
            Gateway URL
          </label>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="ws://127.0.0.1:18789"
            className="mt-1 w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 text-sm"
            style={{
              background: "var(--bg-input)",
              borderColor: "var(--border-default)",
              color: "var(--text-primary)",
              "--tw-ring-color": "rgba(232, 69, 60, 0.15)",
            } as React.CSSProperties}
          />
        </div>
        <div>
          <label className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
            Gateway Token
          </label>
          <input
            type="password"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="Your gateway token"
            className="mt-1 w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 text-sm"
            style={{
              background: "var(--bg-input)",
              borderColor: "var(--border-default)",
              color: "var(--text-primary)",
              "--tw-ring-color": "rgba(232, 69, 60, 0.15)",
            } as React.CSSProperties}
          />
        </div>
        <div>
          <label className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
            Gateway Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Your gateway password"
            className="mt-1 w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 text-sm"
            style={{
              background: "var(--bg-input)",
              borderColor: "var(--border-default)",
              color: "var(--text-primary)",
              "--tw-ring-color": "rgba(232, 69, 60, 0.15)",
            } as React.CSSProperties}
          />
          <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
            Used for WebSocket challenge-response authentication
          </p>
        </div>
      </div>
      <div className="flex gap-2">
        <button
          onClick={handleSave}
          disabled={!url || testing}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors disabled:opacity-40"
          style={{ background: "var(--accent-primary)", color: "var(--text-on-accent)" }}
        >
          {testing ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                className="w-4 h-4 border-2 rounded-full"
                style={{ borderColor: "var(--text-on-accent)", borderTopColor: "transparent" }}
              />
              Testing…
            </>
          ) : (
            <>
              <Check className="w-4 h-4" />
              Save & Connect
            </>
          )}
        </button>
        {gatewayUrl && (
          <button
            onClick={() => setIsEditing(false)}
            className="px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
            style={{ color: "var(--text-secondary)" }}
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}

function LogoutRow() {
  const { logout } = useAppStore();

  const handleLogout = async () => {
    try {
      await fetch(apiUrl("/api/auth"), { method: "DELETE" });
    } catch {}
    logout();
  };

  return (
    <button
      onClick={handleLogout}
      className="w-full flex items-center gap-4 p-4 text-left transition-colors duration-150"
      onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(239, 68, 68, 0.06)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
    >
      <div
        className="w-10 h-10 rounded-lg flex items-center justify-center"
        style={{ background: "rgba(239, 68, 68, 0.1)", color: "#EF4444" }}
      >
        <LogOut className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-sm" style={{ color: "#EF4444" }}>Sign Out</h3>
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
          Remove saved credentials from this device
        </p>
      </div>
    </button>
  );
}

export function SettingsView() {
  return (
    <div className="max-w-[800px] mx-auto px-8 pt-6 pb-8 space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold" style={{ color: "var(--text-primary)" }}>
          Settings
        </h2>
        <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
          Configure your OpenClaw experience
        </p>
      </div>

      {/* Appearance */}
      <SettingSection title="Appearance">
        <div className="p-4">
          <label className="text-sm font-medium mb-3 block" style={{ color: "var(--text-secondary)" }}>
            Theme
          </label>
          <ThemeSelector />
        </div>
      </SettingSection>

      {/* Connection */}
      <SettingSection title="Gateway Connection">
        <GatewayConfig />
      </SettingSection>

      {/* Preferences */}
      <SettingSection title="Preferences">
        <SettingRow
          icon={Bell}
          title="Notifications"
          description="Manage notification preferences"
          onClick={() => {}}
        />
        <SettingRow
          icon={Shield}
          title="Privacy & Security"
          description="Control your data and security settings"
          onClick={() => {}}
        />
      </SettingSection>

      {/* Support */}
      <SettingSection title="Support">
        <SettingRow
          icon={HelpCircle}
          title="Help & Documentation"
          description="Learn how to use OpenClaw"
          onClick={() => window.open("https://docs.openclaw.ai", "_blank")}
          trailing={<ExternalLink className="w-4 h-4" style={{ color: "var(--text-muted)" }} />}
        />
      </SettingSection>

      {/* Account */}
      <SettingSection title="Account">
        <LogoutRow />
      </SettingSection>

      {/* Version */}
      <div className="text-center pt-4">
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>OpenClaw UI v1.0.0</p>
        <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>Made with love for simplicity</p>
      </div>
    </div>
  );
}
