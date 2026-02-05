"use client";

import React, { createContext, useContext, useMemo, useState } from "react";

export interface BetSlipItem {
  id: string;
  matchId: string;
  oddId: string;
  homeTeam: string;
  awayTeam: string;
  league?: string;
  selection: string;
  selectionLabel?: string;
  marketType?: string;
  odds: number;
  stake?: string;
}

type BetType = "single" | "multiple";

interface BetSlipContextValue {
  bets: BetSlipItem[];
  betType: BetType;
  stake: string;
  setStake: (value: string) => void;
  setBetType: (type: BetType) => void;
  addBet: (bet: BetSlipItem) => void;
  removeBet: (id: string) => void;
  clearBetSlip: () => void;
  updateBetStake: (id: string, stake: string) => void;
  getTotalOdds: () => number;
  getTotalStake: () => number;
  getPotentialWinnings: () => number;
}

const BetSlipContext = createContext<BetSlipContextValue | undefined>(undefined);

export function BetSlipProvider({ children }: { children: React.ReactNode }) {
  const [bets, setBets] = useState<BetSlipItem[]>([]);
  const [betType, setBetType] = useState<BetType>("single");
  const [stake, setStake] = useState<string>("");

  const addBet = (bet: BetSlipItem) => {
    setBets((prev) => {
      if (prev.some((b) => b.id === bet.id)) return prev;
      return [...prev, bet];
    });
  };

  const removeBet = (id: string) => {
    setBets((prev) => prev.filter((b) => b.id !== id));
  };

  const clearBetSlip = () => {
    setBets([]);
    setStake("");
  };

  const updateBetStake = (id: string, value: string) => {
    setBets((prev) => prev.map((b) => (b.id === id ? { ...b, stake: value } : b)));
  };

  const getTotalOdds = () => {
    if (!bets.length) return 0;
    if (betType === "single") return bets.reduce((sum, b) => sum + (b.odds || 0), 0);
    return bets.reduce((prod, b) => prod * (b.odds || 1), 1);
  };

  const getTotalStake = () => {
    if (betType === "single") {
      return bets.reduce((sum, b) => sum + (parseFloat(b.stake || "0") || 0), 0);
    }
    return parseFloat(stake || "0") || 0;
  };

  const getPotentialWinnings = () => {
    if (!bets.length) return 0;
    if (betType === "single") {
      return bets.reduce((sum, b) => sum + (parseFloat(b.stake || "0") || 0) * (b.odds || 0), 0);
    }
    const totalStake = parseFloat(stake || "0") || 0;
    return totalStake * getTotalOdds();
  };

  const value = useMemo(
    () => ({
      bets,
      betType,
      stake,
      setStake,
      setBetType,
      addBet,
      removeBet,
      clearBetSlip,
      updateBetStake,
      getTotalOdds,
      getTotalStake,
      getPotentialWinnings,
    }),
    [bets, betType, stake]
  );

  return <BetSlipContext.Provider value={value}>{children}</BetSlipContext.Provider>;
}

export function useBetSlip() {
  const ctx = useContext(BetSlipContext);
  if (!ctx) throw new Error("useBetSlip must be used within BetSlipProvider");
  return ctx;
}
