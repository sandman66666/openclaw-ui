"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check, ChevronRight, QrCode, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/stores/app-store";

const channelDetails = {
  whatsapp: {
    color: "from-green-400 to-green-600",
    description: "Connect your WhatsApp account to send and receive messages",
    setupSteps: ["Scan QR code with WhatsApp", "Confirm on your phone"],
  },
  telegram: {
    color: "from-blue-400 to-blue-600",
    description: "Connect your Telegram bot to interact via Telegram",
    setupSteps: ["Create a bot with @BotFather", "Enter your bot token"],
  },
  discord: {
    color: "from-indigo-400 to-purple-600",
    description: "Add OpenClaw to your Discord server",
    setupSteps: ["Create a Discord application", "Add bot to your server"],
  },
};

function ChannelCard({
  id,
  name,
  icon,
  connected,
}: {
  id: string;
  name: string;
  icon: string;
  connected: boolean;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const details = channelDetails[id as keyof typeof channelDetails];

  const handleConnect = () => {
    setIsConnecting(true);
    // Simulate connection process
    setTimeout(() => {
      setIsConnecting(false);
    }, 3000);
  };

  return (
    <motion.div
      layout
      className={cn(
        "rounded-2xl overflow-hidden",
        "bg-white dark:bg-gray-800/50",
        "border border-gray-200/50 dark:border-gray-700/50",
        "shadow-sm"
      )}
    >
      {/* Main row */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center gap-4 p-4 text-left"
      >
        {/* Icon with gradient background */}
        <div
          className={cn(
            "w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-lg",
            `bg-gradient-to-br ${details?.color || "from-gray-400 to-gray-600"}`
          )}
        >
          {icon}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {name}
            </h3>
            {connected && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 text-xs font-medium">
                <Check className="w-3 h-3" />
                Connected
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {details?.description}
          </p>
        </div>

        {/* Arrow */}
        <ChevronRight
          className={cn(
            "w-5 h-5 text-gray-400 transition-transform duration-200",
            isExpanded && "rotate-90"
          )}
        />
      </button>

      {/* Expanded content */}
      {isExpanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="border-t border-gray-100 dark:border-gray-700"
        >
          <div className="p-4 space-y-4">
            {/* QR Code for WhatsApp */}
            {id === "whatsapp" && !connected && (
              <div className="flex flex-col items-center py-4">
                {isConnecting ? (
                  <>
                    <div
                      className={cn(
                        "w-48 h-48 rounded-2xl",
                        "bg-white dark:bg-gray-900",
                        "flex items-center justify-center",
                        "border-2 border-dashed border-gray-200 dark:border-gray-700"
                      )}
                    >
                      {/* Placeholder for actual QR code */}
                      <div className="text-center">
                        <QrCode className="w-24 h-24 text-gray-300 dark:text-gray-600 mx-auto" />
                        <p className="text-sm text-gray-500 mt-2">
                          Scan with WhatsApp
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-4"
                      onClick={handleConnect}
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Refresh QR Code
                    </Button>
                  </>
                ) : (
                  <Button onClick={handleConnect}>
                    <QrCode className="w-5 h-5 mr-2" />
                    Show QR Code
                  </Button>
                )}
              </div>
            )}

            {/* Setup steps */}
            {!connected && details && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Setup steps:
                </h4>
                <ol className="space-y-2">
                  {details.setupSteps.map((step, i) => (
                    <li
                      key={i}
                      className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400"
                    >
                      <span
                        className={cn(
                          "w-6 h-6 rounded-full flex items-center justify-center",
                          "bg-gray-100 dark:bg-gray-700",
                          "text-gray-500 dark:text-gray-400",
                          "font-medium text-xs"
                        )}
                      >
                        {i + 1}
                      </span>
                      {step}
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {/* Connected state */}
            {connected && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                  <Check className="w-5 h-5" />
                  <span className="font-medium">Connected and ready</span>
                </div>
                <Button variant="danger" size="sm">
                  Disconnect
                </Button>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

export function ChannelsView() {
  const { channels } = useAppStore();
  const connectedCount = channels.filter((c) => c.connected).length;

  return (
    <div className="px-4 py-6 space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Channels
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          {connectedCount === 0
            ? "Connect a channel to start using OpenClaw"
            : `${connectedCount} channel${connectedCount > 1 ? "s" : ""} connected`}
        </p>
      </div>

      {/* Channels list */}
      <div className="space-y-3">
        {channels.map((channel) => (
          <ChannelCard
            key={channel.id}
            id={channel.id}
            name={channel.name}
            icon={channel.icon}
            connected={channel.connected}
          />
        ))}
      </div>

      {/* Help text */}
      <div className="text-center pt-4">
        <p className="text-sm text-gray-400">
          Need help connecting? Check out our{" "}
          <a href="#" className="text-blue-500 hover:underline">
            setup guides
          </a>
        </p>
      </div>
    </div>
  );
}
