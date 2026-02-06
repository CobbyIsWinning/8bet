"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Flame, Receipt, User } from "lucide-react";
import { cn } from "@/lib/cn";

const items = [
  { href: "/home", label: "Home", icon: Home },
  { href: "/live", label: "Live", icon: Flame },
  { href: "/bets", label: "Bets", icon: Receipt },
  { href: "/more", label: "More", icon: User },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-(--line) bg-(--surface) md:hidden">
      <div className="grid grid-cols-4 gap-2 px-2 py-2">
        {items.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || (item.href !== "/home" && pathname?.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 rounded-xl py-2 text-xs font-medium transition-colors",
                active ? "bg-(--accent) text-[#171717]" : "text-muted hover:bg-(--surface-2)"
              )}
            >
              <Icon size={20} strokeWidth={active ? 2.5 : 2} />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
