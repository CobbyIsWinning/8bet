"use client";

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { fetchBalance } from "@/lib/api/wallet";
import { useAuth } from "@/contexts/AuthContext";
import socketService from "@/lib/socket";

interface WalletContextValue {
  balance: number;
  currency: string;
  loading: boolean;
  refreshBalance: () => Promise<void>;
}

const WalletContext = createContext<WalletContextValue | undefined>(undefined);

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [balance, setBalance] = useState(0);
  const [currency, setCurrency] = useState("GHS");
  const [loading, setLoading] = useState(false);

  const refreshBalance = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      setLoading(true);
      const response = await fetchBalance();
      if (response?.success && response?.data) {
        setBalance(response.data.balance || 0);
        setCurrency(response.data.currency || "GHS");
      }
    } catch (error) {
      // Keep last known balance on transient network failures.
      if (process.env.NODE_ENV !== "production") {
        console.warn("Wallet balance refresh failed:", error);
      }
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      refreshBalance();
      const socket = socketService.connect();
      const unsubWallet = socket ? socketService.on("wallet:update", (data: any) => {
        if (typeof data?.balance === "number") {
          setBalance(data.balance);
        }
        if (data?.currency) {
          setCurrency(data.currency);
        }
      }) : () => {};

      const unsubTxn = socket ? socketService.on("transaction:update", () => {
        // Best-effort refresh to keep balance accurate
        refreshBalance();
      }) : () => {};

      return () => {
        unsubWallet();
        unsubTxn();
      };
    } else {
      socketService.disconnect();
      setBalance(0);
    }
  }, [isAuthenticated, refreshBalance]);

  return (
    <WalletContext.Provider value={{ balance, currency, loading, refreshBalance }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error("useWallet must be used within WalletProvider");
  return ctx;
}
