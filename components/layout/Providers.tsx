"use client";

import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { FavoritesProvider } from "@/contexts/FavoritesContext";
import { BetSlipProvider } from "@/contexts/BetSlipContext";
import { WalletProvider } from "@/contexts/WalletContext";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <FavoritesProvider>
          <BetSlipProvider>
            <WalletProvider>{children}</WalletProvider>
          </BetSlipProvider>
        </FavoritesProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
