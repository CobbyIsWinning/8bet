"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Moon, Sun, Wallet } from "lucide-react";
import Button from "@/components/ui/Button";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useWallet } from "@/contexts/WalletContext";
import { cn } from "@/lib/cn";

export default function TopBar() {
  const pathname = usePathname();
  const { isAuthenticated, user, logout } = useAuth();
  const { mode, toggleTheme } = useTheme();
  const { balance } = useWallet();

  return (
    <header className="sticky top-0 z-30 w-full border-b border-(--line) bg-(--surface)">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 md:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-(--accent) text-[#171717] font-extrabold" style={{ fontFamily: "var(--font-display)" }}>
            8
          </div>
          <div>
            <div className="text-lg font-semibold" style={{ fontFamily: "var(--font-display)" }}>8BET</div>
            <div className="text-xs text-muted">Live Sportsbook</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-2 rounded-full border border-(--line) bg-(--surface-2) px-3 py-2 text-sm md:flex">
            <Wallet size={16} className="text-accent" />
            <span className="text-muted">Balance</span>
            <span className="font-semibold">GH₵{balance.toFixed(2)}</span>
          </div>

          <button
            onClick={toggleTheme}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-(--line) bg-(--surface-2)"
            aria-label="Toggle theme"
          >
            {mode === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {isAuthenticated ? (
            <div className="hidden items-center gap-2 md:flex">
              <span className="text-sm text-muted">{user?.phoneNumber || user?.email || "Account"}</span>
              <Button variant="outline" size="sm" onClick={logout}>Logout</Button>
            </div>
          ) : (
            <div className="hidden items-center gap-2 md:flex">
              <Link href="/login"><Button variant="outline" size="sm">Sign In</Button></Link>
              <Link href="/register"><Button size="sm">Register</Button></Link>
            </div>
          )}
        </div>
      </div>
      <nav className="mx-auto hidden w-full max-w-6xl gap-4 px-6 pb-4 md:flex">
        {[
          { href: "/home", label: "Home" },
          { href: "/live", label: "Live" },
          { href: "/bets", label: "My Bets" },
          { href: "/more", label: "More" },
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-semibold transition",
              pathname === item.href ? "bg-(--accent) text-[#171717]" : "text-muted hover:bg-(--surface-2)"
            )}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
