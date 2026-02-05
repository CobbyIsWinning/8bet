import React from "react";
import { cn } from "@/lib/cn";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export default function Input({ className, ...props }: InputProps) {
  return (
    <input
      className={cn(
        "w-full rounded-xl border border-(--line) bg-(--surface-2) px-4 py-3 text-sm text-(--text) placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-(--accent)",
        className
      )}
      {...props}
    />
  );
}
