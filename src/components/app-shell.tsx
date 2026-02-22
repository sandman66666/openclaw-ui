"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/stores/app-store";
import { useDataLoader } from "@/hooks/use-data";
import { ToastProvider } from "@/components/ui/toast";
import { Header } from "./layout/header";
import { Sidebar } from "./layout/sidebar";
import { BottomNav } from "./layout/bottom-nav";
import { ChatsView } from "./views/chats-view";
import { TasksView } from "./views/tasks-view";
import { CronView } from "./views/cron-view";
import { WhatsAppView } from "./views/whatsapp-view";
import { ChannelsView } from "./views/channels-view";
import { MemoryView } from "./views/memory-view";
import { MerlinView } from "./views/merlin-view";
import { BrowserHomeView } from "./views/browser-home-view";
import { useBrowserMode } from "@/hooks/use-browser-mode";

const pageVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
};

export function AppShell() {
  const { activeTab, theme, setActiveTab } = useAppStore();
  const { isBrowser } = useBrowserMode();

  // Auto-switch to browser tab when running inside Navigator
  useEffect(() => {
    if (isBrowser && activeTab === "chats") {
      setActiveTab("browser");
    }
  }, [isBrowser]); // eslint-disable-line react-hooks/exhaustive-deps

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

  const renderView = () => {
    switch (activeTab) {
      case "chats":
        return <ChatsView />;
      case "tasks":
        return <TasksView />;
      case "cron":
        return <CronView />;
      case "whatsapp":
        return <WhatsAppView />;
      case "channels":
        return <ChannelsView />;
      case "memory":
        return <MemoryView />;
      case "merlin":
        return <MerlinView />;
      case "browser":
        return <BrowserHomeView />;
      default:
        return <ChatsView />;
    }
  };

  return (
    <ToastProvider>
      <div
        className={cn(
          "min-h-screen bg-gray-50 dark:bg-gray-950",
          "text-gray-900 dark:text-white",
          "transition-colors duration-300"
        )}
      >
        {/* Desktop layout */}
        <div className="hidden md:flex h-screen">
          <Sidebar />
          <main className="flex-1 flex flex-col overflow-hidden">
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
                className={cn(activeTab === "chats" && "h-full")}
              >
                {renderView()}
              </motion.div>
            </AnimatePresence>
          </main>
          <BottomNav />
        </div>
      </div>
    </ToastProvider>
  );
}
