"use client";

import Link from "next/link";
import { Star, StarOff } from "lucide-react";
import { useBetSlip } from "@/contexts/BetSlipContext";
import { useFavorites } from "@/contexts/FavoritesContext";
import { countMarkets, formatMatchTime, getH2HOdds, getScore, getStatusColor, getStatusLabel } from "@/lib/utils";
import Badge from "@/components/ui/Badge";
import { cn } from "@/lib/cn";

export default function MatchCard({ match }: { match: any }) {
  const { addBet, removeBet, bets } = useBetSlip();
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();
  const h2hOdds = getH2HOdds(match);
  const score = getScore(match);
  const totalMarkets = countMarkets(match);

  const toggleBet = (odd: any) => {
    if (!odd) return;
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
        marketType: "h2h",
        odds: odd.price,
      });
    }
  };

  const favorited = isFavorite(match._id);

  return (
    <div className="surface-card rounded-2xl p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-xs text-muted">{formatMatchTime(match.matchTime)}</div>
          <div className="mt-1 text-sm text-muted">{match.league?.title || "Unknown League"}</div>
        </div>
        <button
          onClick={() => (favorited ? removeFavorite(match._id) : addFavorite(match._id))}
          className="text-[color:var(--accent)]"
          aria-label="Toggle favorite"
        >
          {favorited ? <Star size={18} /> : <StarOff size={18} />}
        </button>
      </div>

      {match.status && match.status !== "scheduled" && (
        <Badge className="mt-2" style={{ borderColor: getStatusColor(match.status), color: getStatusColor(match.status) }}>
          {getStatusLabel(match.status)}
        </Badge>
      )}

      <div className="mt-4 flex items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold">{match.homeTeam}</span>
            {score && <span className="text-sm font-semibold">{score.home}</span>}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold">{match.awayTeam}</span>
            {score && <span className="text-sm font-semibold">{score.away}</span>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {["home", "draw", "away"].map((key) => {
            const odd = h2hOdds?.[key];
            const active = odd && bets.some((b) => b.id === `${match._id}_${odd._id}`);
            return (
              <button
                key={key}
                onClick={() => odd && toggleBet(odd)}
                className={cn(
                  "rounded-xl border px-3 py-2 text-sm font-semibold",
                  odd ? "border-[color:var(--line)]" : "border-dashed border-[color:var(--line)] opacity-60",
                  active && "bg-[color:var(--accent)] text-[#171717]"
                )}
              >
                {odd ? odd.price?.toFixed?.(2) ?? "--" : "--"}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between text-xs text-muted">
        <Link href={`/match/${match._id}`} className="text-[color:var(--accent)]">View Match</Link>
        {totalMarkets > 0 && <span>{totalMarkets} markets</span>}
      </div>
    </div>
  );
}
