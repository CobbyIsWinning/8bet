"use client";

import React from "react";
import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col items-center justify-center gap-10 px-4 py-16 md:flex-row">
        <div className="w-full max-w-md">
          {children}
        </div>
        <div className="hidden w-full max-w-md rounded-3xl border border-[color:var(--line)] bg-[color:var(--surface-2)] p-8 md:block">
          <div className="space-y-4">
            <div className="text-2xl font-semibold" style={{ fontFamily: "var(--font-display)" }}>
              8BET Sportsbook
            </div>
            <p className="text-sm text-muted">
              Live matches, fast markets, and secure payouts. Sign in to manage your wallet, place bets, and track wins.
            </p>
            <div className="rounded-2xl border border-dashed border-[color:var(--line)] p-5 text-sm text-muted">
              Tip: Keep your session active for quicker bet placement.
            </div>
            <Link href="/home" className="text-sm text-[color:var(--accent)]">Continue as guest →</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
