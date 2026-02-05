import React from "react";
import { cn } from "@/lib/cn";

export default function Badge({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-[color:var(--line)] bg-[color:var(--surface-2)] px-3 py-1 text-xs font-semibold text-[color:var(--text)]",
        className
      )}
    >
      {children}
    </span>
  );
}
