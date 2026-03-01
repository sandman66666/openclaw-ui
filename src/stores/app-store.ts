import { create } from "zustand";
import { persist } from "zustand/middleware";
import { getStoredToken, setStoredToken, clearStoredToken } from "@/lib/auth";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export interface Skill {
  id: string;
  name: string;
  description: string;
  icon: string;
  enabled: boolean;
  eligible: boolean;
  source: string;
  requiresApiKey?: boolean;
  apiKey?: string;
  missing?: {
    bins: string[];
    anyBins: string[];
    env: string[];
    config: string[];
    os: string[];
  };
}

export interface Channel {
  id: string;
  name: string;
  icon: string;
  connected: boolean;
  status?: string;
  config?: Record<string, any>;
}

export interface CronJob {
  id: string;
  agentId: string;
  name: string;
  enabled: boolean;
  createdAtMs: number;
  updatedAtMs: number;
  schedule: {
    kind: string;
    expr?: string;
    tz?: string;
    everyMs?: number;
    anchorMs?: number;
  };
  sessionTarget: string;
  wakeMode: string;
  payload: {
    kind: string;
    message: string;
    timeoutSeconds: number;
  };
  delivery: { mode: string };
  state: {
    nextRunAtMs: number;
    lastRunAtMs: number;
    lastStatus: string;
    lastDurationMs: number;
    consecutiveErrors: number;
    runningAtMs?: number;
  };
}

export interface Agent {
  id: string;
  model: string;
  workspace: string;
  heartbeat: Record<string, any>;
}

export interface ChatThread {
  id: string;
  agentId: string;
  agentModel: string;
  name: string;
  messages: Message[];
  skills: string[];
  systemPrompt?: string;
  isTyping: boolean;
  input: string;
}

export type TabId = "chat" | "skills" | "channels" | "cron" | "agents" | "settings" | "tasks" | "sessions" | "whatsapp" | "memory" | "merlin" | "nodes" | "chats";

interface AppState {
  // Auth
  isAuthenticated: boolean;
  authToken: string | null;
  login: (token: string) => void;
  logout: () => void;

  // Theme
  theme: "light" | "dark" | "system";
  setTheme: (theme: "light" | "dark" | "system") => void;

  // Gateway connection
  gatewayUrl: string;
  gatewayToken: string;
  gatewayPassword: string;
  connected: boolean;
  setGatewayConfig: (url: string, token: string, password?: string) => void;
  setConnected: (connected: boolean) => void;

  // Chat
  messages: Message[];
  isTyping: boolean;
  addMessage: (message: Message) => void;
  setIsTyping: (typing: boolean) => void;
  clearMessages: () => void;

  // Chat Threads
  threads: ChatThread[];
  activeThreadId: string | null;
  addThread: (thread: ChatThread) => void;
  updateThread: (id: string, updates: Partial<ChatThread>) => void;
  removeThread: (id: string) => void;
  setActiveThread: (id: string) => void;

  // Skills
  skills: Skill[];
  setSkills: (skills: Skill[]) => void;
  toggleSkill: (id: string) => void;
  setSkillApiKey: (id: string, apiKey: string) => void;

  // Channels
  channels: Channel[];
  setChannels: (channels: Channel[]) => void;

  // Cron Jobs
  cronJobs: CronJob[];
  setCronJobs: (jobs: CronJob[]) => void;

  // Agents
  agents: Agent[];
  setAgents: (agents: Agent[]) => void;

  // Navigation
  activeTab: TabId;
  setActiveTab: (tab: TabId) => void;

  // Loading states
  loading: Record<string, boolean>;
  setLoading: (key: string, value: boolean) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // Auth — token is kept in localStorage via getStoredToken/setStoredToken,
      // but we mirror the authenticated state in the store for reactive rendering.
      isAuthenticated: false,
      authToken: null,
      login: (token: string) => {
        setStoredToken(token);
        set({ isAuthenticated: true, authToken: token });
      },
      logout: () => {
        clearStoredToken();
        set({ isAuthenticated: false, authToken: null });
      },

      // Theme
      theme: "system",
      setTheme: (theme) => set({ theme }),

      // Gateway
      gatewayUrl: "ws://127.0.0.1:18789",
      gatewayToken: "8f8afc3342e722fa01c4876e8be98ab6cd849ec0c62be140",
      gatewayPassword: "Ponmje=5040",
      connected: false,
      setGatewayConfig: (url, token, password) =>
        set({ gatewayUrl: url, gatewayToken: token, ...(password !== undefined && { gatewayPassword: password }) }),
      setConnected: (connected) => set({ connected }),

      // Chat
      messages: [],
      isTyping: false,
      addMessage: (message) =>
        set((state) => ({ messages: [...state.messages, message] })),
      setIsTyping: (isTyping) => set({ isTyping }),
      clearMessages: () => set({ messages: [] }),

      // Chat Threads
      threads: [],
      activeThreadId: null,
      addThread: (thread) =>
        set((state) => ({ threads: [...state.threads, thread], activeThreadId: thread.id })),
      updateThread: (id, updates) =>
        set((state) => ({
          threads: state.threads.map((t) => (t.id === id ? { ...t, ...updates } : t)),
        })),
      removeThread: (id) =>
        set((state) => {
          const remaining = state.threads.filter((t) => t.id !== id);
          return {
            threads: remaining,
            activeThreadId: state.activeThreadId === id
              ? (remaining[0]?.id ?? null)
              : state.activeThreadId,
          };
        }),
      setActiveThread: (id) => set({ activeThreadId: id }),

      // Skills (start empty, load from API)
      skills: [],
      setSkills: (skills) => set({ skills }),
      toggleSkill: (id) =>
        set((state) => ({
          skills: state.skills.map((s) =>
            s.id === id ? { ...s, enabled: !s.enabled } : s
          ),
        })),
      setSkillApiKey: (id, apiKey) =>
        set((state) => ({
          skills: state.skills.map((s) =>
            s.id === id ? { ...s, apiKey } : s
          ),
        })),

      // Channels (start empty, load from API)
      channels: [],
      setChannels: (channels) => set({ channels }),

      // Cron Jobs
      cronJobs: [],
      setCronJobs: (cronJobs) => set({ cronJobs }),

      // Agents
      agents: [],
      setAgents: (agents) => set({ agents }),

      // Navigation
      activeTab: "chat",
      setActiveTab: (activeTab) => set({ activeTab }),

      // Loading
      loading: {},
      setLoading: (key, value) =>
        set((state) => ({ loading: { ...state.loading, [key]: value } })),
    }),
    {
      name: "openclaw-storage",
      partialize: (state) => ({
        theme: state.theme,
        gatewayUrl: state.gatewayUrl,
        gatewayToken: state.gatewayToken,
        gatewayPassword: state.gatewayPassword,
        activeTab: state.activeTab,
        // Do NOT persist isAuthenticated or authToken here —
        // we re-derive auth from localStorage on mount in AppShell.
      }),
    }
  )
);

/**
 * Call this once on client mount to sync the auth token from localStorage
 * into the store. Used in AppShell after hydration.
 */
export function hydrateAuthFromStorage(): void {
  const token = getStoredToken();
  if (token) {
    useAppStore.setState({ isAuthenticated: true, authToken: token });
  }
}
