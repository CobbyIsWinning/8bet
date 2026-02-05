"use client";

import React, { useEffect } from "react";
import { cn } from "@/lib/cn";

export default function Modal({
  open,
  onClose,
  title,
  children,
  className,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-10">
      <div className={cn("surface-card w-full max-w-lg rounded-2xl", className)}>
        <div className="flex items-center justify-between border-b border-(--line) px-5 py-4">
          <h3 className="text-lg font-semibold" style={{ fontFamily: "var(--font-display)" }}>
            {title}
          </h3>
          <button onClick={onClose} className="text-sm text-muted">
            Close
          </button>
        </div>
        <div className="px-5 py-4">{children}</div>
      </div>
    </div>
  );
}
