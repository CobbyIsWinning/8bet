"use client";

import React, { useEffect, useState } from "react";
import socketService from "@/lib/socket";
import MatchCard from "@/components/matches/MatchCard";
import { LoadingIndicator } from "@/components/application/loading-indicator/loading-indicator";
import { fetchLiveMatches } from "@/lib/api/games";
import { extractMatches } from "@/lib/utils";

export default function LivePage() {
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetchLiveMatches({ limit: 50, skip: 0 });
      const data = extractMatches(response?.data || response);
      setMatches(data);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Failed to load live matches");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const interval = setInterval(load, 30000);

    const socket = socketService.connect();
    const unsubGoLive = socket ? socketService.on("live:match:started", (match: any) => {
      setMatches((prev) => {
        if (prev.find((m) => m._id === match._id)) return prev;
        return [...prev, match];
      });
    }) : () => {};

    const unsubEnded = socket ? socketService.on("live:match:ended", (match: any) => {
      setMatches((prev) => prev.filter((m) => m._id !== match._id));
    }) : () => {};

    const unsubUpdate = socket ? socketService.on("live:match:update", (match: any) => {
      setMatches((prev) => prev.map((m) => (m._id === match._id ? { ...m, ...match } : m)));
    }) : () => {};

    const unsubOdds = socket ? socketService.on("live:odds:update", ({ matchId, odds }: any) => {
      setMatches((prev) => prev.map((m) => (m._id === matchId ? { ...m, markets: { ...m.markets, h2h: odds } } : m)));
    }) : () => {};

    return () => {
      clearInterval(interval);
      unsubGoLive();
      unsubEnded();
      unsubUpdate();
      unsubOdds();
    };
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <div className="text-sm text-muted">Live betting</div>
        <h1 className="text-2xl font-semibold" style={{ fontFamily: "var(--font-display)" }}>Live Matches</h1>
        <p className="text-sm text-muted">Odds update every 30 seconds.</p>
      </div>

      {loading && (
        <div className="rounded-2xl border border-[color:var(--line)] bg-[color:var(--surface-2)] p-6">
          <LoadingIndicator type="dot-circle" size="md" label="Loading live matches..." />
        </div>
      )}

      {!loading && error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          {error}
        </div>
      )}

      {!loading && !error && matches.length === 0 && (
        <div className="rounded-2xl border border-[color:var(--line)] bg-[color:var(--surface-2)] p-6 text-sm text-muted">
          No live matches right now.
        </div>
      )}

      <div className="grid gap-4">
        {matches.map((match) => (
          <MatchCard key={match._id} match={match} />
        ))}
      </div>
    </div>
  );
}
