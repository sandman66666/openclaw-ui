import { create } from "zustand";
import { persist } from "zustand/middleware";

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
  requiresApiKey?: boolean;
  apiKey?: string;
}

export interface Channel {
  id: string;
  name: string;
  icon: string;
  connected: boolean;
  status?: string;
}

interface AppState {
  // Theme
  theme: "light" | "dark" | "system";
  setTheme: (theme: "light" | "dark" | "system") => void;

  // Gateway connection
  gatewayUrl: string;
  gatewayToken: string;
  connected: boolean;
  setGatewayConfig: (url: string, token: string) => void;
  setConnected: (connected: boolean) => void;

  // Chat
  messages: Message[];
  isTyping: boolean;
  addMessage: (message: Message) => void;
  setIsTyping: (typing: boolean) => void;
  clearMessages: () => void;

  // Skills
  skills: Skill[];
  setSkills: (skills: Skill[]) => void;
  toggleSkill: (id: string) => void;
  setSkillApiKey: (id: string, apiKey: string) => void;

  // Channels
  channels: Channel[];
  setChannels: (channels: Channel[]) => void;

  // Navigation
  activeTab: "chat" | "skills" | "channels" | "settings";
  setActiveTab: (tab: "chat" | "skills" | "channels" | "settings") => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // Theme
      theme: "system",
      setTheme: (theme) => set({ theme }),

      // Gateway
      gatewayUrl: "",
      gatewayToken: "",
      connected: false,
      setGatewayConfig: (url, token) => set({ gatewayUrl: url, gatewayToken: token }),
      setConnected: (connected) => set({ connected }),

      // Chat
      messages: [],
      isTyping: false,
      addMessage: (message) =>
        set((state) => ({ messages: [...state.messages, message] })),
      setIsTyping: (isTyping) => set({ isTyping }),
      clearMessages: () => set({ messages: [] }),

      // Skills
      skills: [
        {
          id: "image-gen",
          name: "Image Generation",
          description: "Create images with AI",
          icon: "🎨",
          enabled: true,
          requiresApiKey: true,
        },
        {
          id: "voice-transcription",
          name: "Voice Transcription",
          description: "Convert speech to text",
          icon: "🎤",
          enabled: true,
          requiresApiKey: true,
        },
        {
          id: "web-search",
          name: "Web Search",
          description: "Search the internet",
          icon: "🌐",
          enabled: false,
        },
        {
          id: "calendar",
          name: "Calendar",
          description: "Manage your schedule",
          icon: "📅",
          enabled: true,
        },
        {
          id: "reminders",
          name: "Reminders",
          description: "Set reminders and alerts",
          icon: "🔔",
          enabled: true,
        },
        {
          id: "voice-calls",
          name: "Voice Calls",
          description: "Make and receive calls",
          icon: "📞",
          enabled: false,
          requiresApiKey: true,
        },
      ],
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

      // Channels
      channels: [
        { id: "whatsapp", name: "WhatsApp", icon: "📱", connected: false },
        { id: "telegram", name: "Telegram", icon: "✈️", connected: false },
        { id: "discord", name: "Discord", icon: "🎮", connected: false },
      ],
      setChannels: (channels) => set({ channels }),

      // Navigation
      activeTab: "chat",
      setActiveTab: (activeTab) => set({ activeTab }),
    }),
    {
      name: "openclaw-storage",
      partialize: (state) => ({
        theme: state.theme,
        gatewayUrl: state.gatewayUrl,
        gatewayToken: state.gatewayToken,
        skills: state.skills,
      }),
    }
  )
);
