import React from "react";
import { cn } from "@/lib/cn";

export default function Badge({
  className,
  children,
  style,
}: {
  className?: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <span
    style={style}
      className={cn(
        "inline-flex items-center rounded-full border border-(--line) bg-(--surface-2) px-3 py-1 text-xs font-semibold text-(--text)",
        className
      )}
    >
      {children}
    </span>
  );
}
