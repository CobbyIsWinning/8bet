import React from "react";
import { cn } from "@/lib/cn";

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {}

export default function Select({ className, children, ...props }: SelectProps) {
  return (
    <select
      className={cn(
        "w-full rounded-xl border border-(--line) bg-(--surface-2) px-4 py-3 text-sm text-(--text) focus:outline-none focus:ring-2 focus:ring-(--accent)",
        className
      )}
      {...props}
    >
      {children}
    </select>
  );
}
