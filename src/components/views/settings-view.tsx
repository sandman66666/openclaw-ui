"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Moon,
  Sun,
  Monitor,
  Server,
  Key,
  Bell,
  Shield,
  HelpCircle,
  ChevronRight,
  Check,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/stores/app-store";

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
      className={cn(
        "w-full flex items-center gap-4 p-4 text-left",
        "transition-colors duration-200",
        onClick && "hover:bg-gray-50 dark:hover:bg-gray-800/50 active:bg-gray-100 dark:active:bg-gray-800"
      )}
    >
      <div
        className={cn(
          "w-10 h-10 rounded-xl flex items-center justify-center",
          "bg-gray-100 dark:bg-gray-800",
          "text-gray-600 dark:text-gray-400"
        )}
      >
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-gray-900 dark:text-white">{title}</h3>
        {description && (
          <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
            {description}
          </p>
        )}
      </div>
      {trailing || (onClick && <ChevronRight className="w-5 h-5 text-gray-400" />)}
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
      <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-4 py-2">
        {title}
      </h3>
      <div
        className={cn(
          "rounded-2xl overflow-hidden",
          "bg-white dark:bg-gray-800/50",
          "border border-gray-200/50 dark:border-gray-700/50",
          "divide-y divide-gray-100 dark:divide-gray-700/50"
        )}
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
    <div className="flex gap-2 p-1 rounded-xl bg-gray-100 dark:bg-gray-800">
      {themes.map((t) => {
        const isActive = theme === t.id;
        const Icon = t.icon;
        return (
          <button
            key={t.id}
            onClick={() => setTheme(t.id)}
            className={cn(
              "relative flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg",
              "text-sm font-medium transition-colors duration-200",
              isActive
                ? "text-gray-900 dark:text-white"
                : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            )}
          >
            {isActive && (
              <motion.div
                layoutId="themeSelector"
                className="absolute inset-0 bg-white dark:bg-gray-700 rounded-lg shadow-sm"
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
  const { gatewayUrl, gatewayToken, setGatewayConfig, connected, setConnected } =
    useAppStore();
  const [url, setUrl] = useState(gatewayUrl);
  const [token, setToken] = useState(gatewayToken);
  const [isEditing, setIsEditing] = useState(!gatewayUrl);

  const handleSave = () => {
    setGatewayConfig(url, token);
    setIsEditing(false);
    // Simulate connection
    if (url && token) {
      setConnected(true);
    }
  };

  if (!isEditing && gatewayUrl) {
    return (
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Gateway URL</p>
            <p className="font-medium text-gray-900 dark:text-white truncate">
              {gatewayUrl}
            </p>
          </div>
          {connected && (
            <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 text-xs font-medium">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              Connected
            </span>
          )}
        </div>
        <Button variant="secondary" size="sm" onClick={() => setIsEditing(true)}>
          Change Connection
        </Button>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <div className="space-y-3">
        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Gateway URL
          </label>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://your-gateway.railway.app"
            className={cn(
              "mt-1 w-full px-4 py-3 rounded-xl",
              "bg-gray-100 dark:bg-gray-900",
              "border border-gray-200 dark:border-gray-700",
              "text-gray-900 dark:text-white",
              "placeholder-gray-400",
              "focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            )}
          />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Gateway Token
          </label>
          <input
            type="password"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="Your gateway token"
            className={cn(
              "mt-1 w-full px-4 py-3 rounded-xl",
              "bg-gray-100 dark:bg-gray-900",
              "border border-gray-200 dark:border-gray-700",
              "text-gray-900 dark:text-white",
              "placeholder-gray-400",
              "focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            )}
          />
        </div>
      </div>
      <div className="flex gap-2">
        <Button onClick={handleSave} disabled={!url || !token}>
          <Check className="w-4 h-4 mr-2" />
          Connect
        </Button>
        {gatewayUrl && (
          <Button variant="ghost" onClick={() => setIsEditing(false)}>
            Cancel
          </Button>
        )}
      </div>
    </div>
  );
}

export function SettingsView() {
  return (
    <div className="px-4 py-6 space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Settings
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Configure your OpenClaw experience
        </p>
      </div>

      {/* Appearance */}
      <SettingSection title="Appearance">
        <div className="p-4">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 block">
            Theme
          </label>
          <ThemeSelector />
        </div>
      </SettingSection>

      {/* Connection */}
      <SettingSection title="Connection">
        <GatewayConfig />
      </SettingSection>

      {/* Notifications */}
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

      {/* Help */}
      <SettingSection title="Support">
        <SettingRow
          icon={HelpCircle}
          title="Help & Documentation"
          description="Learn how to use OpenClaw"
          onClick={() => {}}
          trailing={<ExternalLink className="w-4 h-4 text-gray-400" />}
        />
      </SettingSection>

      {/* Version */}
      <div className="text-center pt-4">
        <p className="text-sm text-gray-400">OpenClaw UI v1.0.0</p>
        <p className="text-xs text-gray-400 mt-1">Made with ❤️ for simplicity</p>
      </div>
    </div>
  );
}
