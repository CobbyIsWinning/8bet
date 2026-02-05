"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import { fetchMatchDetails } from "@/lib/api/games";
import { useBetSlip } from "@/contexts/BetSlipContext";
import { useFavorites } from "@/contexts/FavoritesContext";
import { getH2HOdds, getScore, getStatusColor, getStatusLabel } from "@/lib/utils";

export default function MatchDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const matchId = params.id as string;
  const { addBet, removeBet, bets } = useBetSlip();
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();

  const [match, setMatch] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetchMatchDetails(matchId);
        if (response?.success && response?.data) {
          setMatch(response.data);
        } else if (response?.data) {
          setMatch(response.data);
        } else {
          setMatch(response);
        }
      } catch (err: any) {
        setError(err?.response?.data?.message || err?.message || "Failed to load match details");
      } finally {
        setLoading(false);
      }
    })();
  }, [matchId]);

  const buildOddsId = (market: any, key: string) => `${match?._id}_${market.marketId || market._id || market.name}_${key}`;

  const normalizeOddsMarkets = (matchData: any) => {
    if (!Array.isArray(matchData?.odds) || !matchData.odds.length) return [];

    return matchData.odds.map((market: any) => {
      if (market.type === "grouped" && Array.isArray(market.selections)) {
        const items: any[] = [];
        if (market.name === "Goals Over/Under") {
          market.selections.forEach((selection: any) => {
            if (selection?.over) {
              items.push({
                _id: buildOddsId(market, `over_${selection.point}`),
                realOddId: market._id,
                name: selection.over.label || `Over ${selection.point}`,
                selectionLabel: selection.over.label || `Over ${selection.point}`,
                price: selection.over.odd || selection.over.price,
                point: selection.point,
              });
            }
            if (selection?.under) {
              items.push({
                _id: buildOddsId(market, `under_${selection.point}`),
                realOddId: market._id,
                name: selection.under.label || `Under ${selection.point}`,
                selectionLabel: selection.under.label || `Under ${selection.point}`,
                price: selection.under.odd || selection.under.price,
                point: selection.point,
              });
            }
          });
        } else {
          market.selections.forEach((selection: any, index: number) => {
            items.push({
              _id: buildOddsId(market, `${selection.label || "pick"}_${index}`),
              realOddId: market._id,
              name: selection.label || `Option ${index + 1}`,
              selectionLabel: selection.label,
              price: selection.odd,
              point: selection.point,
            });
          });
        }
        return { key: `odds_${market.marketId || market._id || market.name}`, label: market.name, items };
      }

      const items = Array.isArray(market.selections)
        ? market.selections.map((selection: any, index: number) => ({
            _id: buildOddsId(market, `${selection.label || "pick"}_${index}`),
            realOddId: market._id,
            name:
              selection.label === "Home"
                ? matchData.homeTeam
                : selection.label === "Away"
                ? matchData.awayTeam
                : selection.label || `Option ${index + 1}`,
            selectionLabel: selection.label,
            price: selection.odd,
          }))
        : [];

      return { key: `odds_${market.marketId || market._id || market.name}`, label: market.name, items };
    });
  };

  const oddsMarkets = useMemo(() => normalizeOddsMarkets(match), [match]);

  const availableMarkets = useMemo(() => {
    const list: any[] = [];
    if (match?.markets?.h2h?.length > 0) list.push({ key: "h2h", label: "Match Result" });
    if (match?.markets?.totals?.length > 0) list.push({ key: "totals", label: "Over/Under" });
    if (match?.markets?.spreads?.length > 0) list.push({ key: "spreads", label: "Handicap" });
    oddsMarkets.forEach((market: any) => {
      if (market.items?.length && market.label !== "Asian Handicap") {
        list.push({ key: market.key, label: market.label });
      }
    });
    return list;
  }, [match, oddsMarkets]);

  const toggleBet = (odd: any, marketType: string) => {
    const betId = `${match._id}_${odd._id}`;
    const existing = bets.find((b) => b.matchId === match._id && b.marketType === marketType && b.selection === odd.name);
    if (existing) {
      removeBet(existing.id);
    } else {
      addBet({
        id: betId,
        matchId: match._id,
        oddId: odd.realOddId || odd._id,
        homeTeam: match.homeTeam,
        awayTeam: match.awayTeam,
        league: match.league?.title,
        selection: odd.name,
        selectionLabel: odd.selectionLabel || odd.name,
        marketType,
        odds: odd.price,
      });
    }
  };

  if (loading) {
    return <div className="rounded-2xl border border-[color:var(--line)] bg-[color:var(--surface-2)] p-6 text-sm text-muted">Loading match...</div>;
  }

  if (error || !match) {
    return (
      <div className="space-y-4">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          {error || "Match not found"}
        </div>
        <Button variant="outline" onClick={() => router.back()}>Go Back</Button>
      </div>
    );
  }

  const score = getScore(match);
  const h2hOdds = getH2HOdds(match);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-muted">Match Details</div>
          <h1 className="text-2xl font-semibold" style={{ fontFamily: "var(--font-display)" }}>{match.eventName || `${match.homeTeam} vs ${match.awayTeam}`}</h1>
          <div className="text-sm text-muted">{match.league?.title}</div>
        </div>
        <Button
          variant={isFavorite(match._id) ? "primary" : "outline"}
          onClick={() => (isFavorite(match._id) ? removeFavorite(match._id) : addFavorite(match._id))}
        >
          {isFavorite(match._id) ? "Favorited" : "Favorite"}
        </Button>
      </div>

      {match.status && match.status !== "scheduled" && (
        <div className="rounded-full border px-3 py-1 text-xs font-semibold" style={{ borderColor: getStatusColor(match.status), color: getStatusColor(match.status) }}>
          {getStatusLabel(match.status)}
        </div>
      )}

      <div className="surface-card rounded-2xl p-6">
        <div className="grid gap-6 md:grid-cols-3">
          <div>
            <div className="text-xs text-muted">Home</div>
            <div className="text-lg font-semibold">{match.homeTeam}</div>
          </div>
          <div className="flex items-center justify-center">
            <div className="rounded-xl border border-[color:var(--line)] bg-[color:var(--surface-2)] px-4 py-2 text-sm font-semibold">
              {score ? `${score.home} - ${score.away}` : "VS"}
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-muted">Away</div>
            <div className="text-lg font-semibold">{match.awayTeam}</div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {h2hOdds && (
          <div className="surface-card rounded-2xl p-6">
            <h2 className="text-lg font-semibold" style={{ fontFamily: "var(--font-display)" }}>Match Result (1X2)</h2>
            <div className="mt-4 grid gap-2 sm:grid-cols-3">
              {[
                h2hOdds.home,
                h2hOdds.draw,
                h2hOdds.away,
              ].map((odd: any, idx: number) => (
                <button
                  key={idx}
                  onClick={() => odd && toggleBet(odd, "h2h")}
                  className="rounded-xl border border-[color:var(--line)] bg-[color:var(--surface-2)] px-4 py-3 text-sm font-semibold"
                >
                  {odd?.price?.toFixed?.(2) ?? "--"}
                </button>
              ))}
            </div>
          </div>
        )}

        {match.markets?.totals && (
          <div className="surface-card rounded-2xl p-6">
            <h2 className="text-lg font-semibold" style={{ fontFamily: "var(--font-display)" }}>Over/Under Goals</h2>
            <div className="mt-4 space-y-2">
              {match.markets.totals.map((odd: any) => (
                <button
                  key={odd._id}
                  onClick={() => toggleBet(odd, "totals")}
                  className="flex w-full items-center justify-between rounded-xl border border-[color:var(--line)] bg-[color:var(--surface-2)] px-4 py-3 text-sm"
                >
                  <span>{odd.name} {odd.point !== null ? `(${odd.point})` : ""}</span>
                  <span className="font-semibold">{odd.price?.toFixed?.(2) ?? "--"}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {oddsMarkets.map((market: any) => (
          <div key={market.key} className="surface-card rounded-2xl p-6">
            <h2 className="text-lg font-semibold" style={{ fontFamily: "var(--font-display)" }}>{market.label}</h2>
            <div className="mt-4 grid gap-2 sm:grid-cols-3">
              {market.items.map((odd: any) => (
                <button
                  key={odd._id}
                  onClick={() => toggleBet(odd, market.key)}
                  className="rounded-xl border border-[color:var(--line)] bg-[color:var(--surface-2)] px-4 py-3 text-sm font-semibold"
                >
                  {odd.name}: {odd.price?.toFixed?.(2) ?? "--"}
                </button>
              ))}
            </div>
          </div>
        ))}

        {availableMarkets.length === 0 && (
          <div className="rounded-2xl border border-[color:var(--line)] bg-[color:var(--surface-2)] p-6 text-sm text-muted">
            No markets available for this match.
          </div>
        )}
      </div>
    </div>
  );
}
