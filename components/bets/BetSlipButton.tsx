"use client";

import { Receipt } from "lucide-react";

export default function BetSlipButton({
  onClick,
  count,
}: {
  onClick: () => void;
  count: number;
}) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-20 right-4 z-40 flex h-12 w-12 items-center justify-center rounded-2xl bg-[color:var(--accent)] text-[#171717] shadow-lg md:bottom-8 md:right-8"
      aria-label="Open bet slip"
    >
      <span className="flex h-7 min-w-[28px] items-center justify-center rounded-lg bg-white px-2 text-[12px] font-bold text-[#171717]">
        {count}
      </span>
    </button>
  );
}
