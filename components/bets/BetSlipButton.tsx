"use client";

import { Receipt } from "lucide-react";

export default function BetSlipButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-20 right-4 z-40 flex h-12 w-12 items-center justify-center rounded-2xl bg-[color:var(--accent)] text-[#171717] shadow-lg md:bottom-8 md:right-8"
      aria-label="Open bet slip"
    >
      <Receipt size={20} />
    </button>
  );
}
