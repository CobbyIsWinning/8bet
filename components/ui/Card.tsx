import React from "react";
import { cn } from "@/lib/cn";

export default function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("surface-card rounded-2xl p-5", className)}>{children}</div>;
}
