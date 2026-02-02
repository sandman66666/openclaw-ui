"use client";

import dynamic from "next/dynamic";

// Dynamic import to avoid SSR issues with zustand persist
const AppShell = dynamic(
  () => import("@/components/app-shell").then((mod) => mod.AppShell),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-3xl shadow-xl mx-auto animate-pulse">
            🦞
          </div>
          <p className="mt-4 text-gray-500 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    ),
  }
);

export default function Home() {
  return <AppShell />;
}
