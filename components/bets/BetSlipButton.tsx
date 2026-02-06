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
      {count > 0 && (
        <span className="absolute -right-2 -top-2 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white">
          {count}
        </span>
      )}
      <Receipt size={20} />
    </button>
  );
}
