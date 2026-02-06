"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import { fetchMatchDetails } from "@/lib/api/games";
import { useBetSlip } from "@/contexts/BetSlipContext";
import { useFavorites } from "@/contexts/FavoritesContext";
import { getScore, getStatusColor, getStatusLabel } from "@/lib/utils";

export default function MatchDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const matchId = params.id as string;
  const { addBet, removeBet, bets } = useBetSlip();
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();

  const [match, setMatch] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMarketKey, setSelectedMarketKey] = useState("all");

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
    const list = oddsMarkets
      .filter((market: any) => market.items?.length > 0)
      .map((market: any) => ({ key: market.key, label: market.label }));
    return [{ key: "all", label: "All" }, ...list];
  }, [oddsMarkets]);

  const toggleBet = (odd: any, marketType: string) => {
    const betId = `${match._id}_${odd._id}`;
    const existing = bets.find((b) => b.id === betId);
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
    return <div className="rounded-2xl border border-(--line) bg-(--surface-2) p-6 text-sm text-muted">Loading match...</div>;
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

  return (
    <div className="space-y-4">
      <div className="surface-card rounded-2xl p-4">
        <div className="flex items-center justify-between">
          <div className="flex w-1/3 flex-col items-center text-center">
            {match.homeTeamRef?.logo && (
              <Image src={match.homeTeamRef.logo} alt={match.homeTeam} width={48} height={48} className="h-12 w-12 object-contain" />
            )}
            <span className="mt-2 text-sm font-semibold">{match.homeTeam}</span>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold" style={{ fontFamily: "var(--font-display)" }}>
              {score ? `${score.home} - ${score.away}` : "VS"}
            </div>
            {match.status && (
              <div className="mt-1 text-xs font-semibold" style={{ color: getStatusColor(match.status) }}>
                {getStatusLabel(match.status)}
              </div>
            )}
          </div>
          <div className="flex w-1/3 flex-col items-center text-center">
            {match.awayTeamRef?.logo && (
              <Image src={match.awayTeamRef.logo} alt={match.awayTeam} width={48} height={48} className="h-12 w-12 object-contain" />
            )}
            <span className="mt-2 text-sm font-semibold">{match.awayTeam}</span>
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between border-t border-(--line) pt-4">
          <div className="text-xs text-muted">{match.league?.title}</div>
          <Button
            variant={isFavorite(match._id) ? "primary" : "outline"}
            size="sm"
            onClick={() => (isFavorite(match._id) ? removeFavorite(match._id) : addFavorite(match._id))}
          >
            {isFavorite(match._id) ? "Favorited" : "Favorite"}
          </Button>
        </div>
      </div>

      <div className="sticky top-16.25 z-20 bg-(--background)">
        <div className="overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex space-x-2 border-b border-(--line)">
            {availableMarkets.map((market) => (
              <button
                key={market.key}
                onClick={() => setSelectedMarketKey(market.key)}
                className={`whitespace-nowrap px-4 py-3 text-sm font-semibold transition-colors ${
                  selectedMarketKey === market.key
                    ? "border-b-2 border-accent text-accent"
                    : "text-muted hover:text-white"
                }`}
              >
                {market.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {oddsMarkets
          .filter((market: any) => selectedMarketKey === "all" || selectedMarketKey === market.key)
          .map((market: any) => {
            const isOverUnder = market.label === "Goals Over/Under";
            const gridClasses = () => {
              if (isOverUnder) return "grid-cols-2";
              if (market.items.length === 2) return "grid-cols-2";
              if (market.items.length === 3) return "grid-cols-3";
              return "grid-cols-2 md:grid-cols-3";
            };

            return (
              <div key={market.key} className="surface-card rounded-2xl p-4">
                <h2 className="text-md font-semibold" style={{ fontFamily: "var(--font-display)" }}>
                  {market.label}
                </h2>
                <div className={`mt-2 grid gap-2 ${gridClasses()}`}>
                  {market.items.map((odd: any) => (
                    <button
                      key={odd._id}
                      onClick={() => toggleBet(odd, market.key)}
                      className={`flex h-full rounded-lg border p-2 text-xs transition-colors ${
                        isOverUnder
                          ? "items-center justify-between px-4"
                          : "flex-col items-center justify-center text-center"
                      } ${
                        bets.some((b) => b.id === `${match._id}_${odd._id}`)
                          ? "border-accent bg-accent text-black"
                          : "border-(--line) bg-(--surface-2) hover:bg-(--surface-3)"
                      }`}
                    >
                      <span className={isOverUnder ? "" : "text-muted"}>{odd.name}</span>
                      <span className="text-sm font-bold">{odd.price?.toFixed?.(2) ?? "--"}</span>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}

        {availableMarkets.length <= 1 && !loading && (
          <div className="rounded-2xl border border-(--line) bg-(--surface-2) p-6 text-center text-sm text-muted">
            No markets available for this match yet.
          </div>
        )}
      </div>
    </div>
  );
}
