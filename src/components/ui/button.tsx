"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          // Base styles
          "inline-flex items-center justify-center font-medium",
          "rounded-xl transition-all duration-200 ease-out",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
          "disabled:pointer-events-none disabled:opacity-50",
          "active:scale-[0.98]",

          // Variants
          variant === "primary" && [
            "bg-blue-500 text-white shadow-md",
            "hover:bg-blue-600 hover:shadow-lg",
            "focus-visible:ring-blue-500",
          ],
          variant === "secondary" && [
            "bg-gray-100 text-gray-900",
            "hover:bg-gray-200",
            "dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700",
            "focus-visible:ring-gray-500",
          ],
          variant === "ghost" && [
            "text-gray-600 hover:text-gray-900",
            "hover:bg-gray-100",
            "dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-800",
            "focus-visible:ring-gray-500",
          ],
          variant === "danger" && [
            "bg-red-500 text-white shadow-md",
            "hover:bg-red-600 hover:shadow-lg",
            "focus-visible:ring-red-500",
          ],

          // Sizes
          size === "sm" && "h-9 px-4 text-sm",
          size === "md" && "h-11 px-6 text-base",
          size === "lg" && "h-14 px-8 text-lg",

          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };
