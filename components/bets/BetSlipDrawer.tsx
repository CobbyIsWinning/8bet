"use client";

import React, { useState } from "react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { useBetSlip } from "@/contexts/BetSlipContext";
import { useAuth } from "@/contexts/AuthContext";
import { placeBet } from "@/lib/api/bets";

export default function BetSlipDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const {
    bets,
    betType,
    stake,
    setStake,
    setBetType,
    updateBetStake,
    removeBet,
    clearBetSlip,
    getTotalOdds,
    getPotentialWinnings,
    getTotalStake,
  } = useBetSlip();
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePlaceBets = async () => {
    if (!isAuthenticated) {
      setError("Please sign in to place bets.");
      return;
    }
    if (!bets.length) return;

    if (betType === "single") {
      const missing = bets.some((b) => !b.stake || parseFloat(b.stake) <= 0);
      if (missing && (!stake || parseFloat(stake) <= 0)) {
        setError("Enter stake for all bets.");
        return;
      }
    } else {
      if (!stake || parseFloat(stake) <= 0) {
        setError("Enter a total stake.");
        return;
      }
    }

    setLoading(true);
    setError(null);
    try {
      if (betType === "single") {
        await Promise.all(
          bets.map((bet) =>
            placeBet({
              stake: parseFloat(bet.stake || stake),
              selections: [
                {
                  oddId: bet.oddId,
                  selectionLabel: bet.selectionLabel || bet.selection,
                },
              ],
            })
          )
        );
      } else {
        await placeBet({
          stake: parseFloat(stake),
          selections: bets.map((bet) => ({
            oddId: bet.oddId,
            selectionLabel: bet.selectionLabel || bet.selection,
          })),
        });
      }

      clearBetSlip();
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Failed to place bet");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={`Bet Slip (${bets.length})`} className="max-w-2xl">
      <div className="space-y-4">
        <div className="flex gap-2">
          <Button variant={betType === "single" ? "primary" : "soft"} onClick={() => setBetType("single")}>
            Single
          </Button>
          <Button
            variant={betType === "multiple" ? "primary" : "soft"}
            onClick={() => setBetType("multiple")}
            disabled={bets.length < 2}
          >
            Multiple ({bets.length})
          </Button>
        </div>

        {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">{error}</div>}

        {bets.length === 0 ? (
          <div className="rounded-2xl border border-[color:var(--line)] bg-[color:var(--surface-2)] p-6 text-center text-sm text-muted">
            Your bet slip is empty. Tap odds to add selections.
          </div>
        ) : (
          <div className="space-y-3">
            {bets.map((bet) => (
              <div key={bet.id} className="surface-card rounded-2xl p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-sm font-semibold">{bet.homeTeam} vs {bet.awayTeam}</div>
                    <div className="text-xs text-muted">{bet.selection}</div>
                  </div>
                  <button onClick={() => removeBet(bet.id)} className="text-xs text-red-500">Remove</button>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <div className="text-xs text-muted">Odds</div>
                    <div className="font-semibold">{bet.odds?.toFixed?.(2) ?? "--"}</div>
                  </div>
                  {betType === "single" && (
                    <div>
                      <div className="text-xs text-muted">Stake</div>
                      <Input
                        value={bet.stake || ""}
                        onChange={(e) => updateBetStake(bet.id, e.target.value)}
                        placeholder="0.00"
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {bets.length > 0 && (
          <div className="space-y-3 border-t border-[color:var(--line)] pt-4">
            {betType === "multiple" && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted">Total Odds</span>
                <span className="text-sm font-semibold">{getTotalOdds().toFixed(2)}</span>
              </div>
            )}

            {betType === "multiple" && (
              <div>
                <div className="text-xs text-muted">Total Stake</div>
                <Input value={stake} onChange={(e) => setStake(e.target.value)} placeholder="0.00" />
              </div>
            )}

            <div className="flex items-center justify-between">
              <span className="text-sm text-muted">Total Stake</span>
              <span className="text-sm font-semibold">GH₵{getTotalStake().toFixed(2)}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-muted">Potential Win</span>
              <span className="text-sm font-semibold text-[color:var(--success)]">GH₵{getPotentialWinnings().toFixed(2)}</span>
            </div>

            <Button onClick={handlePlaceBets} disabled={loading}>
              {loading ? "Placing..." : `Place Bet${betType === "single" ? "s" : ""}`}
            </Button>
            <button onClick={clearBetSlip} className="text-sm text-muted">Clear All</button>
          </div>
        )}
      </div>
    </Modal>
  );
}
