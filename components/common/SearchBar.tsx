"use client";

import React from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { cn } from "@/lib/cn";

export default function SearchBar({
  value,
  onChange,
  onFilter,
  hasActiveFilters,
  placeholder = "Search matches...",
}: {
  value: string;
  onChange: (value: string) => void;
  onFilter: () => void;
  hasActiveFilters?: boolean;
  placeholder?: string;
}) {
  return (
    <div className="flex w-full items-center gap-3">
      <div className="flex flex-1 items-center gap-2 rounded-2xl border border-[color:var(--line)] bg-[color:var(--surface-2)] px-4 py-3">
        <Search size={18} className="text-muted" />
        <input
          className="w-full bg-transparent text-sm outline-none placeholder:text-muted"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        {value.length > 0 && (
          <button onClick={() => onChange("")}
            className="text-muted">
            <X size={16} />
          </button>
        )}
      </div>
      <button
        onClick={onFilter}
        className={cn(
          "relative flex h-12 w-12 items-center justify-center rounded-2xl border border-[color:var(--line)]",
          hasActiveFilters ? "bg-[color:var(--accent)] text-[#171717]" : "bg-[color:var(--surface-2)] text-muted"
        )}
      >
        <SlidersHorizontal size={18} />
        {hasActiveFilters && <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[#171717]" />}
      </button>
    </div>
  );
}
