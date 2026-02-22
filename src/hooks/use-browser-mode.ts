"use client";

import { useState, useEffect, useCallback } from "react";

/**
 * Navigator browser mode detection and bridge API.
 *
 * When openclaw-ui is running inside Navigator browser, window.NavigatorBridge
 * is available. This hook provides typed access to all bridge methods and
 * reactively tracks browser mode state.
 */

interface NavigatorBridge {
  isNavigator: boolean;
  version: string;
  openURL: (url: string, options?: { inNewTab?: boolean; missionId?: string }) => void;
  newMission: (goal: string) => void;
  focusTab: (tabId: string) => void;
  getActiveMissions: () => Promise<Mission[]>;
  startAgentTab: (goal: string) => void;
  sendToOC: (text: string, context?: Record<string, unknown>) => void;
  getCurrentTab: () => { url: string; title: string; favIconUrl?: string | null };
  startFocusMode: (durationMinutes?: number) => void;
  on: (event: string, callback: (data: unknown) => void) => void;
  off: (event: string, callback: (data: unknown) => void) => void;
}

export interface Mission {
  id: string;
  goal: string;
  tabCount: number;
  status: "active" | "paused" | "completed";
  createdAt: string;
}

export interface BrowserModeState {
  /** Whether running inside Navigator browser */
  isBrowser: boolean;
  /** Open a URL in Navigator */
  openURL: (url: string, options?: { inNewTab?: boolean; missionId?: string }) => void;
  /** Start a new research mission */
  newMission: (goal: string) => void;
  /** Focus a specific tab */
  focusTab: (tabId: string) => void;
  /** Get active missions from Navigator */
  getActiveMissions: () => Promise<Mission[]>;
  /** Start an agent tab with a goal */
  startAgentTab: (goal: string) => void;
  /** Send text to OC */
  sendToOC: (text: string, context?: Record<string, unknown>) => void;
  /** Get current tab info */
  getCurrentTab: () => { url: string; title: string } | null;
  /** Start focus mode */
  startFocusMode: (durationMinutes?: number) => void;
  /** Listen for Navigator events */
  onNavigatorEvent: (event: string, callback: (data: unknown) => void) => () => void;
}

function getNavigatorBridge(): NavigatorBridge | null {
  if (typeof window !== "undefined" && "NavigatorBridge" in window) {
    return (window as unknown as { NavigatorBridge: NavigatorBridge }).NavigatorBridge;
  }
  return null;
}

export function useBrowserMode(): BrowserModeState {
  const [isBrowser, setIsBrowser] = useState(false);

  useEffect(() => {
    const bridge = getNavigatorBridge();
    setIsBrowser(!!bridge?.isNavigator);

    // Also listen for late bridge initialization
    const handler = () => {
      const b = getNavigatorBridge();
      if (b?.isNavigator) setIsBrowser(true);
    };
    window.addEventListener("navigator-bridge-ready", handler);
    return () => window.removeEventListener("navigator-bridge-ready", handler);
  }, []);

  const openURL = useCallback(
    (url: string, options?: { inNewTab?: boolean; missionId?: string }) => {
      getNavigatorBridge()?.openURL(url, options);
    },
    []
  );

  const newMission = useCallback((goal: string) => {
    getNavigatorBridge()?.newMission(goal);
  }, []);

  const focusTab = useCallback((tabId: string) => {
    getNavigatorBridge()?.focusTab(tabId);
  }, []);

  const getActiveMissions = useCallback(async (): Promise<Mission[]> => {
    const bridge = getNavigatorBridge();
    if (!bridge) return [];
    try {
      return await bridge.getActiveMissions();
    } catch {
      return [];
    }
  }, []);

  const startAgentTab = useCallback((goal: string) => {
    getNavigatorBridge()?.startAgentTab(goal);
  }, []);

  const sendToOC = useCallback(
    (text: string, context?: Record<string, unknown>) => {
      getNavigatorBridge()?.sendToOC(text, context);
    },
    []
  );

  const getCurrentTab = useCallback(() => {
    const bridge = getNavigatorBridge();
    if (!bridge) return null;
    return bridge.getCurrentTab();
  }, []);

  const startFocusMode = useCallback((durationMinutes?: number) => {
    getNavigatorBridge()?.startFocusMode(durationMinutes);
  }, []);

  const onNavigatorEvent = useCallback(
    (event: string, callback: (data: unknown) => void) => {
      const bridge = getNavigatorBridge();
      if (!bridge) return () => {};
      bridge.on(event, callback);
      return () => bridge.off(event, callback);
    },
    []
  );

  return {
    isBrowser,
    openURL,
    newMission,
    focusTab,
    getActiveMissions,
    startAgentTab,
    sendToOC,
    getCurrentTab,
    startFocusMode,
    onNavigatorEvent,
  };
}
