"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import Button from "@/components/ui/Button";
import Toggle from "@/components/ui/Toggle";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useWallet } from "@/contexts/WalletContext";

export default function MorePage() {
  const { isAuthenticated, user, logout } = useAuth();
  const { mode, toggleTheme } = useTheme();
  const { balance, refreshBalance } = useWallet();

  useEffect(() => {
    if (isAuthenticated) refreshBalance();
  }, [isAuthenticated, refreshBalance]);

  if (!isAuthenticated) {
    return (
      <div className="space-y-6">
        <div className="surface-card rounded-2xl p-6 text-center">
          <h1 className="text-xl font-semibold" style={{ fontFamily: "var(--font-display)" }}>Sign In for More Features</h1>
          <p className="mt-2 text-sm text-muted">Access your wallet, track bets, and manage your account.</p>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Link href="/login"><Button>Sign In / Register</Button></Link>
            <Link href="/home"><Button variant="outline">Browse as Guest</Button></Link>
          </div>
        </div>

        <div className="surface-card rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-muted">Dark Mode</div>
              <div className="text-sm">{mode === "dark" ? "Enabled" : "Disabled"}</div>
            </div>
            <Toggle checked={mode === "dark"} onChange={toggleTheme} />
          </div>
        </div>

        <div className="surface-card rounded-2xl p-6 space-y-3">
          <Link href="/static/help" className="text-sm text-accent">Help & Support</Link>
          <Link href="/static/terms" className="text-sm text-accent">Terms & Conditions</Link>
          <Link href="/static/privacy" className="text-sm text-accent">Privacy Policy</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="text-sm text-muted">Account</div>
        <h1 className="text-2xl font-semibold" style={{ fontFamily: "var(--font-display)" }}>My Account</h1>
        <div className="text-sm text-muted">{user?.phoneNumber || user?.email}</div>
      </div>

      <div className="surface-card rounded-2xl p-6">
        <div className="text-sm text-muted">Wallet Balance</div>
        <div className="mt-2 text-3xl font-semibold">GH₵{balance.toFixed(2)}</div>
        <div className="mt-4 flex gap-2">
          <Link href="/deposit"><Button>Deposit</Button></Link>
          <Link href="/withdrawal"><Button variant="outline">Withdraw</Button></Link>
        </div>
      </div>

      <div className="surface-card rounded-2xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-muted">Dark Mode</div>
            <div className="text-sm">{mode === "dark" ? "Enabled" : "Disabled"}</div>
          </div>
          <Toggle checked={mode === "dark"} onChange={toggleTheme} />
        </div>
      </div>

      <div className="surface-card rounded-2xl p-6 space-y-3">
        <Link href="/profile" className="text-sm text-accent">Profile Settings</Link>
        <Link href="/transactions" className="text-sm text-accent">Transactions</Link>
        <Link href="/settings" className="text-sm text-accent">Settings</Link>
        <Link href="/static/help" className="text-sm text-accent">Help & Support</Link>
        <Link href="/static/terms" className="text-sm text-accent">Terms & Conditions</Link>
      </div>

      <Button variant="outline" onClick={logout}>Log Out</Button>
    </div>
  );
}
