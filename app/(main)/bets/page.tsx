"use client";

import React, { useEffect, useMemo, useState } from "react";
import Button from "@/components/ui/Button";
import { fetchMyBets } from "@/lib/api/bets";
import { useAuth } from "@/contexts/AuthContext";

const normalizeStatus = (value: any) => (value?.toLowerCase?.() || value);

const deriveStatusFromSelections = (selections: any[] = []) => {
  if (!selections.length) return null;
  const results = selections.map((s) => normalizeStatus(s?.result)).filter(Boolean);
  if (!results.length) return null;
  if (results.includes("lost")) return "lost";
  if (results.every((r) => r === "void")) return "void";
  if (results.every((r) => r === "won" || r === "void")) return "won";
  return "pending";
};

const getBetStatus = (bet: any) => {
  const status = normalizeStatus(bet?.status);
  const result = normalizeStatus(bet?.result);
  const derived = deriveStatusFromSelections(bet?.selections);
  if (["pending", "won", "lost", "void"].includes(status)) {
    if (status === "pending" && derived && derived !== "pending") return derived;
    return status;
  }
  if (["pending", "won", "lost", "void"].includes(result)) {
    if (result === "pending" && derived && derived !== "pending") return derived;
    return result;
  }
  return derived || "pending";
};

const formatDate = (dateString?: string) => {
  if (!dateString) return "--/--/----";
  const date = new Date(dateString);
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  return `${day}/${month}/${year} ${hours}:${minutes}`;
};

export default function BetsPage() {
  const { isAuthenticated } = useAuth();
  const [bets, setBets] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState("all");

  const load = async () => {
    if (!isAuthenticated) return;
    try {
      setLoading(true);
      setError(null);
      const response = await fetchMyBets({ limit: 50, skip: 0 });
      if (response?.success && response?.data) {
        setBets(response.data);
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Failed to load bets");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [isAuthenticated]);

  const filtered = useMemo(() => {
    if (filter === "all") return bets;
    return bets.filter((bet) => getBetStatus(bet) === filter);
  }, [bets, filter]);

  const stats = useMemo(() => {
    return {
      total: bets.length,
      pending: bets.filter((b) => getBetStatus(b) === "pending").length,
      won: bets.filter((b) => getBetStatus(b) === "won").length,
      lost: bets.filter((b) => getBetStatus(b) === "lost").length,
      totalStaked: bets.reduce((sum, b) => sum + (b.stake || 0), 0),
      totalWinnings: bets.filter((b) => getBetStatus(b) === "won").reduce((sum, b) => sum + (b.potentialWinnings || 0), 0),
    };
  }, [bets]);

  if (!isAuthenticated) {
    return (
      <div className="space-y-6">
        <div className="surface-card rounded-2xl p-6 text-center">
          <h1 className="text-xl font-semibold" style={{ fontFamily: "var(--font-display)" }}>Keep Track With Your Bets</h1>
          <p className="mt-2 text-sm text-muted">Sign in to view your betting history and track wins.</p>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Button onClick={() => window.location.href = "/login"}>Sign In / Register</Button>
            <Button variant="outline" onClick={() => window.location.href = "/home"}>Continue Browsing</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="text-sm text-muted">Your activity</div>
        <h1 className="text-2xl font-semibold" style={{ fontFamily: "var(--font-display)" }}>My Bets</h1>
      </div>

      {stats.total > 0 && (
        <div className="grid gap-3 md:grid-cols-3">
          <div className="surface-card rounded-2xl p-4">
            <div className="text-xs text-muted">Total Bets</div>
            <div className="text-xl font-semibold">{stats.total}</div>
          </div>
          <div className="surface-card rounded-2xl p-4">
            <div className="text-xs text-muted">Won</div>
            <div className="text-xl font-semibold">{stats.won}</div>
          </div>
          <div className="surface-card rounded-2xl p-4">
            <div className="text-xs text-muted">Lost</div>
            <div className="text-xl font-semibold">{stats.lost}</div>
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {["all", "pending", "won", "lost"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full border px-4 py-2 text-xs font-semibold ${
              filter === f
                ? "bg-[color:var(--accent)] text-[#171717]"
                : "border-[color:var(--line)] bg-[color:var(--surface-2)] text-muted"
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {loading && (
        <div className="rounded-2xl border border-[color:var(--line)] bg-[color:var(--surface-2)] p-6 text-sm text-muted">
          Loading bets...
        </div>
      )}

      {!loading && error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          {error}
        </div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <div className="rounded-2xl border border-[color:var(--line)] bg-[color:var(--surface-2)] p-6 text-sm text-muted">
          No bets found.
        </div>
      )}

      <div className="space-y-4">
        {filtered.map((bet) => (
          <div key={bet._id || bet.id} className="surface-card rounded-2xl p-5">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold">
                {bet.selections?.length > 1 ? `Accumulator (${bet.selections.length})` : "Single Bet"}
              </div>
              <div className="text-xs text-muted">{getBetStatus(bet).toUpperCase()}</div>
            </div>
            <div className="mt-3 space-y-3">
              {bet.selections?.map((selection: any, idx: number) => (
                <div key={selection._id || idx} className="rounded-xl border border-[color:var(--line)] bg-[color:var(--surface-2)] p-3">
                  <div className="text-sm font-semibold">{selection.eventName || `${selection.match?.homeTeam} vs ${selection.match?.awayTeam}`}</div>
                  <div className="text-xs text-muted">{selection.league || selection.match?.league?.title || "Unknown League"}</div>
                  <div className="text-xs text-[color:var(--accent)]">{selection.pick || selection.selectionLabel}</div>
                </div>
              ))}
            </div>
            <div className="mt-3 grid gap-2 text-sm md:grid-cols-3">
              <div>
                <div className="text-xs text-muted">Stake</div>
                <div className="font-semibold">GH₵{(bet.stake || 0).toFixed(2)}</div>
              </div>
              <div>
                <div className="text-xs text-muted">Total Odds</div>
                <div className="font-semibold">{(bet.totalOdds || bet.selections?.[0]?.odds || 0).toFixed(2)}</div>
              </div>
              <div>
                <div className="text-xs text-muted">Potential Win</div>
                <div className="font-semibold text-[color:var(--success)]">GH₵{(bet.potentialWinnings || 0).toFixed(2)}</div>
              </div>
            </div>
            <div className="mt-2 text-xs text-muted">Placed: {formatDate(bet.createdAt)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
