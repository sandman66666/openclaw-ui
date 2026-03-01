"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Smartphone, Users, Plus, Trash2, Loader2, Phone, MessageSquare, BellRing, VolumeX, Edit3,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { apiUrl } from "@/lib/config";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/toast";

interface Contact {
  phone: string;
  actionMode: string;
}

interface Group {
  jid: string;
  requireMention: boolean;
  actionMode: string;
  customInstructions: string;
}

const ACTION_MODES = [
  { id: "participate", label: "Participate", icon: MessageSquare, desc: "Respond automatically" },
  { id: "notify", label: "Notify only", icon: BellRing, desc: "Push alerts only" },
  { id: "silent", label: "Silent", icon: VolumeX, desc: "Ignore messages" },
  { id: "custom", label: "Custom", icon: Edit3, desc: "Custom instructions" },
];

function ActionModeSelector({
  value,
  onChange,
}: {
  value: string;
  onChange: (mode: string) => void;
}) {
  return (
    <div className="flex gap-1.5">
      {ACTION_MODES.map((mode) => {
        const Icon = mode.icon;
        const isActive = value === mode.id;
        return (
          <button
            key={mode.id}
            onClick={() => onChange(mode.id)}
            title={mode.desc}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors"
            style={{
              background: isActive ? "rgba(232, 69, 60, 0.08)" : "transparent",
              color: isActive ? "var(--accent-primary)" : "var(--text-muted)",
              ...(isActive ? { boxShadow: "inset 0 0 0 1px rgba(232, 69, 60, 0.3)" } : {}),
            }}
            onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = "var(--bg-elevated)"; }}
            onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = isActive ? "rgba(232, 69, 60, 0.08)" : "transparent"; }}
          >
            <Icon className="w-3.5 h-3.5" />
            {mode.label}
          </button>
        );
      })}
    </div>
  );
}

export function WhatsAppView() {
  const { toast } = useToast();
  const [contacts, setContacts] = useState<string[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newPhone, setNewPhone] = useState("");
  const [newPhoneMode, setNewPhoneMode] = useState("participate");

  const loadData = useCallback(async () => {
    try {
      const res = await fetch(apiUrl("/api/whatsapp"));
      const data = await res.json();
      setContacts(data.contacts || []);
      setGroups(data.groups || []);
    } catch (e) {
      console.error("Failed to load WhatsApp config:", e);
    }
    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const saveChanges = async (newContacts?: string[], newGroups?: Group[]) => {
    setSaving(true);
    try {
      const res = await fetch(apiUrl("/api/whatsapp"), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contacts: newContacts ?? contacts,
          groups: newGroups ?? groups,
        }),
      });
      const data = await res.json();
      if (data.ok) {
        toast("success", "WhatsApp config updated");
      } else {
        toast("error", data.error || "Failed to save");
      }
    } catch {
      toast("error", "Failed to save config");
    }
    setSaving(false);
  };

  const addContact = () => {
    if (!newPhone.trim()) return;
    const phone = newPhone.trim().replace(/[^0-9+]/g, "");
    if (contacts.includes(phone)) {
      toast("error", "Contact already exists");
      return;
    }
    const updated = [...contacts, phone];
    setContacts(updated);
    setNewPhone("");
    saveChanges(updated);
  };

  const removeContact = (phone: string) => {
    const updated = contacts.filter((c) => c !== phone);
    setContacts(updated);
    saveChanges(updated);
  };

  const toggleGroupMention = (jid: string) => {
    const updated = groups.map((g) =>
      g.jid === jid ? { ...g, requireMention: !g.requireMention } : g
    );
    setGroups(updated);
    saveChanges(undefined, updated);
  };

  const updateGroupMode = (jid: string, mode: string) => {
    const updated = groups.map((g) =>
      g.jid === jid ? { ...g, actionMode: mode } : g
    );
    setGroups(updated);
    saveChanges(undefined, updated);
  };

  return (
    <div className="max-w-[800px] mx-auto px-8 pt-6 pb-8 space-y-8">
      <div>
        <h2 className="text-2xl font-semibold" style={{ color: "var(--text-primary)" }}>WhatsApp</h2>
        <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
          {loading ? "Loading..." : `${contacts.length} contacts, ${groups.length} groups`}
        </p>
      </div>

      {/* Contacts section */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Phone className="w-4 h-4" style={{ color: "var(--accent-green)" }} />
          <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-secondary)" }}>Contacts</h3>
        </div>

        {/* Add contact */}
        <div
          className="flex items-center gap-2 p-3 rounded-lg border"
          style={{ background: "var(--bg-card)", borderColor: "var(--border-default)" }}
        >
          <input
            className="flex-1 px-3 py-2 rounded-lg text-sm border-0 focus:outline-none focus:ring-2"
            style={{
              background: "var(--bg-input)",
              color: "var(--text-primary)",
              "--tw-ring-color": "rgba(232, 69, 60, 0.15)",
            } as React.CSSProperties}
            value={newPhone}
            onChange={(e) => setNewPhone(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") addContact(); }}
            placeholder="+1234567890"
          />
          <button
            onClick={addContact}
            disabled={!newPhone.trim()}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold shrink-0 transition-colors disabled:opacity-40"
            style={{ background: "var(--accent-primary)", color: "var(--text-on-accent)" }}
          >
            <Plus className="w-4 h-4" />
            Add
          </button>
        </div>

        {/* Contact list */}
        <div className="space-y-2">
          <AnimatePresence mode="popLayout">
            {contacts.map((phone) => (
              <motion.div
                key={phone}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex items-center gap-3 px-4 py-3 rounded-lg border"
                style={{ background: "var(--bg-card)", borderColor: "var(--border-default)" }}
              >
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center"
                  style={{ background: "rgba(52, 211, 153, 0.1)" }}
                >
                  <Smartphone className="w-4 h-4" style={{ color: "var(--accent-green)" }} />
                </div>
                <span className="flex-1 font-mono text-sm" style={{ color: "var(--text-primary)" }}>{phone}</span>
                <button
                  onClick={() => removeContact(phone)}
                  className="p-1.5 rounded-lg transition-colors"
                  style={{ color: "var(--text-muted)" }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = "#EF4444"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = "var(--text-muted)"; }}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
          {!loading && contacts.length === 0 && (
            <p className="text-center text-sm py-4" style={{ color: "var(--text-muted)" }}>No contacts configured</p>
          )}
        </div>
      </div>

      {/* Groups section */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4" style={{ color: "var(--accent-green)" }} />
          <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-secondary)" }}>Groups</h3>
        </div>

        <div className="space-y-2">
          <AnimatePresence mode="popLayout">
            {groups.map((group) => (
              <motion.div
                key={group.jid}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="px-4 py-3 rounded-lg space-y-3 border"
                style={{ background: "var(--bg-card)", borderColor: "var(--border-default)" }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center"
                    style={{ background: "rgba(52, 211, 153, 0.1)" }}
                  >
                    <Users className="w-4 h-4" style={{ color: "var(--accent-green)" }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate font-mono" style={{ color: "var(--text-primary)" }}>
                      {group.jid}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs" style={{ color: "var(--text-muted)" }}>@mention</span>
                    <Switch
                      checked={group.requireMention}
                      onCheckedChange={() => toggleGroupMention(group.jid)}
                    />
                  </div>
                </div>
                <ActionModeSelector
                  value={group.actionMode}
                  onChange={(mode) => updateGroupMode(group.jid, mode)}
                />
              </motion.div>
            ))}
          </AnimatePresence>
          {!loading && groups.length === 0 && (
            <p className="text-center text-sm py-4" style={{ color: "var(--text-muted)" }}>No groups configured</p>
          )}
        </div>
      </div>

      {saving && (
        <div className="flex items-center justify-center gap-2 text-sm" style={{ color: "var(--text-muted)" }}>
          <Loader2 className="w-4 h-4 animate-spin" />
          Saving...
        </div>
      )}
    </div>
  );
}
