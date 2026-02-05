import React from "react";
import { cn } from "@/lib/cn";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "ghost" | "outline" | "soft";
  size?: "sm" | "md" | "lg";
}

export default function Button({
  className,
  variant = "primary",
  size = "md",
  ...props
}: ButtonProps) {
  const variants: Record<string, string> = {
    primary: "bg-[color:var(--accent)] text-[#171717] hover:bg-[color:var(--accent-2)]",
    ghost: "bg-transparent text-[color:var(--text)] hover:bg-white/10",
    outline: "border border-[color:var(--line)] text-[color:var(--text)] hover:bg-white/5",
    soft: "bg-[color:var(--surface-2)] text-[color:var(--text)] border border-[color:var(--line)]",
  };

  const sizes: Record<string, string> = {
    sm: "px-3 py-2 text-sm",
    md: "px-4 py-2.5 text-sm",
    lg: "px-5 py-3 text-base",
  };

  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-xl font-semibold transition",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  );
}
