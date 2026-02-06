"use client";

import React from "react";
import TopBar from "@/components/layout/TopBar";
import BottomNav from "@/components/layout/BottomNav";
import BetSlipButton from "@/components/bets/BetSlipButton";
import BetSlipDrawer from "@/components/bets/BetSlipDrawer";
import { useBetSlip } from "@/contexts/BetSlipContext";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  const { bets } = useBetSlip();

  return (
    <div className="min-h-screen pb-20 md:pb-10">
      <TopBar />
      <main className="mx-auto w-full max-w-6xl px-4 py-6 md:px-6">
        {children}
      </main>
      <BetSlipButton onClick={() => setOpen(true)} count={bets.length} />
      <BetSlipDrawer open={open} onClose={() => setOpen(false)} />
      <BottomNav />
    </div>
  );
}
