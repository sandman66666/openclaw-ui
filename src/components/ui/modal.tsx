"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

const Modal = DialogPrimitive.Root;
const ModalTrigger = DialogPrimitive.Trigger;

const ModalContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & { title: string; description?: string }
>(({ className, children, title, description, ...props }, ref) => (
  <DialogPrimitive.Portal>
    <DialogPrimitive.Overlay
      className="fixed inset-0 z-50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
      style={{ background: "rgba(0, 0, 0, 0.6)", backdropFilter: "blur(4px)" }}
    />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2",
        "rounded-2xl shadow-2xl",
        "data-[state=open]:animate-in data-[state=closed]:animate-out",
        "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
        "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
        "data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%]",
        "data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]",
        "duration-200 max-h-[85vh] overflow-y-auto",
        className
      )}
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border-default)",
      }}
      {...props}
    >
      <div className="flex items-center justify-between p-6 pb-4">
        <div>
          <DialogPrimitive.Title
            className="text-lg font-semibold"
            style={{ color: "var(--text-primary)" }}
          >
            {title}
          </DialogPrimitive.Title>
          {description && (
            <DialogPrimitive.Description
              className="text-sm mt-1"
              style={{ color: "var(--text-secondary)" }}
            >
              {description}
            </DialogPrimitive.Description>
          )}
        </div>
        <DialogPrimitive.Close
          className="rounded-lg p-2 transition-colors"
          style={{ color: "var(--text-muted)" }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "var(--bg-elevated)";
            e.currentTarget.style.color = "var(--text-secondary)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color = "var(--text-muted)";
          }}
        >
          <X className="w-5 h-5" />
        </DialogPrimitive.Close>
      </div>
      <div className="px-6 pb-6">{children}</div>
    </DialogPrimitive.Content>
  </DialogPrimitive.Portal>
));
ModalContent.displayName = "ModalContent";

export { Modal, ModalTrigger, ModalContent };
