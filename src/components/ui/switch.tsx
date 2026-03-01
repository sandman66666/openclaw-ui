"use client";

import * as React from "react";
import * as SwitchPrimitives from "@radix-ui/react-switch";
import { cn } from "@/lib/utils";

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>
>(({ className, ...props }, ref) => {
  const [checked, setChecked] = React.useState(props.checked ?? props.defaultChecked ?? false);

  React.useEffect(() => {
    if (props.checked !== undefined) setChecked(props.checked);
  }, [props.checked]);

  return (
    <SwitchPrimitives.Root
      className={cn(
        "peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full",
        "border-2 border-transparent transition-all duration-200 ease-in-out",
        "focus-visible:outline-none focus-visible:ring-2",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "active:scale-95",
        className
      )}
      style={{
        background: checked ? "var(--accent-green)" : "var(--bg-elevated)",
        "--tw-ring-color": "rgba(232, 69, 60, 0.3)",
      } as React.CSSProperties}
      onCheckedChange={(val) => {
        setChecked(val);
        props.onCheckedChange?.(val);
      }}
      {...props}
      ref={ref}
    >
      <SwitchPrimitives.Thumb
        className={cn(
          "pointer-events-none block h-5 w-5 rounded-full shadow-md",
          "ring-0 transition-transform duration-200 ease-in-out",
          "data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0"
        )}
        style={{ background: "white" }}
      />
    </SwitchPrimitives.Root>
  );
});
Switch.displayName = "Switch";

export { Switch };
