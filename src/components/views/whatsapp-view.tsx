"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Smartphone, Users, Plus, Trash2, Loader2, Phone, MessageSquare, BellRing, VolumeX, Edit3,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
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

const inputClasses = cn(
  "w-full px-3 py-2.5 rounded-xl text-sm",
  "bg-gray-50 dark:bg-gray-800",
  "border border-gray-200 dark:border-gray-700",
  "text-gray-900 dark:text-white placeholder-gray-400",
  "focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
);

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
            className={cn(
              "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors",
              isActive
                ? "bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 ring-1 ring-green-300 dark:ring-green-500/30"
                : "text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
            )}
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
      const res = await fetch("/api/whatsapp");
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
      const res = await fetch("/api/whatsapp", {
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
    <div className="px-4 py-6 space-y-8 max-w-2xl mx-auto">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">WhatsApp</h2>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          {loading ? "Loading..." : `${contacts.length} contacts, ${groups.length} groups`}
        </p>
      </div>

      {/* Contacts section */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Phone className="w-4 h-4 text-green-500" />
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">Contacts</h3>
        </div>

        {/* Add contact */}
        <div className="flex items-center gap-2">
          <input
            className={cn(inputClasses, "flex-1")}
            value={newPhone}
            onChange={(e) => setNewPhone(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") addContact(); }}
            placeholder="+1234567890"
          />
          <Button
            size="sm"
            onClick={addContact}
            disabled={!newPhone.trim()}
            className="gap-1.5 shrink-0 bg-green-500 hover:bg-green-600 text-white"
          >
            <Plus className="w-4 h-4" />
            Add
          </Button>
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
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl",
                  "bg-white dark:bg-gray-800/50",
                  "border border-gray-200/50 dark:border-gray-700/50"
                )}
              >
                <div className="w-9 h-9 rounded-lg bg-green-50 dark:bg-green-500/10 flex items-center justify-center">
                  <Smartphone className="w-4 h-4 text-green-500" />
                </div>
                <span className="flex-1 font-mono text-sm text-gray-900 dark:text-white">{phone}</span>
                <button
                  onClick={() => removeContact(phone)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
          {!loading && contacts.length === 0 && (
            <p className="text-center text-gray-500 text-sm py-4">No contacts configured</p>
          )}
        </div>
      </div>

      {/* Groups section */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-green-500" />
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">Groups</h3>
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
                className={cn(
                  "px-4 py-3 rounded-xl space-y-3",
                  "bg-white dark:bg-gray-800/50",
                  "border border-gray-200/50 dark:border-gray-700/50"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-green-50 dark:bg-green-500/10 flex items-center justify-center">
                    <Users className="w-4 h-4 text-green-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate font-mono">
                      {group.jid}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs text-gray-500">@mention</span>
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
            <p className="text-center text-gray-500 text-sm py-4">No groups configured</p>
          )}
        </div>
      </div>

      {saving && (
        <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
          <Loader2 className="w-4 h-4 animate-spin" />
          Saving...
        </div>
      )}
    </div>
  );
}
