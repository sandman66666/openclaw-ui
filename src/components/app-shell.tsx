"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useAppStore, hydrateAuthFromStorage } from "@/stores/app-store";
import { useDataLoader } from "@/hooks/use-data";
import { LoginScreen } from "./auth/login-screen";
import { Header } from "./layout/header";
import { Sidebar } from "./layout/sidebar";
import { BottomNav } from "./layout/bottom-nav";
import { ChatView } from "./views/chat-view";
import { SkillsView } from "./views/skills-view";
import { ChannelsView } from "./views/channels-view";
import { SettingsView } from "./views/settings-view";
import { CronView } from "./views/cron-view";
import { AgentsView } from "./views/agents-view";
import { TasksView } from "./views/tasks-view";
import { SessionsView } from "./views/sessions-view";
import { WhatsAppView } from "./views/whatsapp-view";
import { MemoryView } from "./views/memory-view";
import { MerlinView } from "./views/merlin-view";
import { NodesView } from "./views/nodes-view";
import { ChatsView } from "./views/chats-view";

const pageVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
};

export function AppShell() {
  const { activeTab, theme, isAuthenticated, login } = useAppStore();

  // Sync auth token from localStorage into zustand on first render
  useEffect(() => {
    hydrateAuthFromStorage();
  }, []);

  // Load real data from API
  useDataLoader();

  // Apply theme
  useEffect(() => {
    const root = document.documentElement;

    if (theme === "system") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      root.classList.toggle("dark", mediaQuery.matches);

      const handler = (e: MediaQueryListEvent) => {
        root.classList.toggle("dark", e.matches);
      };
      mediaQuery.addEventListener("change", handler);
      return () => mediaQuery.removeEventListener("change", handler);
    } else {
      root.classList.toggle("dark", theme === "dark");
    }
  }, [theme]);

  // Show login gate if not authenticated
  if (!isAuthenticated) {
    return <LoginScreen onSuccess={(token) => login(token)} />;
  }

  const renderView = () => {
    switch (activeTab) {
      case "chat":
        return <ChatView />;
      case "skills":
        return <SkillsView />;
      case "channels":
        return <ChannelsView />;
      case "cron":
        return <CronView />;
      case "agents":
        return <AgentsView />;
      case "tasks":
        return <TasksView />;
      case "sessions":
        return <SessionsView />;
      case "whatsapp":
        return <WhatsAppView />;
      case "memory":
        return <MemoryView />;
      case "merlin":
        return <MerlinView />;
      case "nodes":
        return <NodesView />;
      case "chats":
        return <ChatsView />;
      case "settings":
        return <SettingsView />;
      default:
        return <ChatView />;
    }
  };

  return (
    <div
      className="min-h-screen text-[var(--text-primary)]"
      style={{ background: "var(--bg-base)" }}
    >
      {/* Desktop layout */}
      <div className="hidden md:flex h-screen">
        <Sidebar />
        <main className="flex-1 flex flex-col overflow-hidden" style={{ background: "var(--bg-surface)" }}>
          <div className="flex-1 overflow-y-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.2 }}
                className="h-full"
              >
                {renderView()}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>

      {/* Mobile layout */}
      <div className="md:hidden flex flex-col h-screen">
        <Header />
        <main className="flex-1 overflow-y-auto pb-20">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.2 }}
              className={cn(activeTab === "chat" && "h-full")}
            >
              {renderView()}
            </motion.div>
          </AnimatePresence>
        </main>
        <BottomNav />
      </div>
    </div>
  );
}
