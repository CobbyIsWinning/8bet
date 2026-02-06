"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { Lock } from "lucide-react";
import { useBetSlip } from "@/contexts/BetSlipContext";
import { formatMatchTime, getH2HOdds, getScore, getStatusColor, getStatusLabel } from "@/lib/utils";
import { cn } from "@/lib/cn";

export default function MatchCard({ match }: { match: any }) {
  const router = useRouter();
  const { addBet, removeBet, bets } = useBetSlip();
  const h2hOdds = getH2HOdds(match);
  const score = getScore(match);
  type H2HKey = "home" | "draw" | "away";
  const h2hKeys: H2HKey[] = ["home", "draw", "away"];

  const getInitials = (name: string) => name?.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

  const homeLogo = match.homeTeamRef?.logo || (match.homeTeamId ? `https://media.api-sports.io/football/teams/${match.homeTeamId}.png` : null);
  const awayLogo = match.awayTeamRef?.logo || (match.awayTeamId ? `https://media.api-sports.io/football/teams/${match.awayTeamId}.png` : null);

  const toggleBet = (e: React.MouseEvent, odd: any) => {
    e.stopPropagation();
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

  return (
    <div
      onClick={() => router.push(`/match/${match._id}`)}
      className="surface-card relative cursor-pointer rounded-xl p-3 transition hover:bg-(--surface-2)"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="mb-2 flex items-center gap-2 text-xs text-muted">
            <span>{formatMatchTime(match.matchTime)}</span>
            {match.status && match.status !== "scheduled" && (
              <span style={{ color: getStatusColor(match.status) }} className="font-bold">
                {getStatusLabel(match.status)}
              </span>
            )}
          </div>
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 overflow-hidden">
                {homeLogo && homeLogo.startsWith("http") ? (
                  <Image src={homeLogo} alt={match.homeTeam} width={16} height={16} className="h-4 w-4 object-contain" />
                ) : (
                  <div className="flex h-4 w-4 items-center justify-center rounded-full bg-(--surface-2) text-[8px] font-bold text-muted">
                    {getInitials(match.homeTeam)}
                  </div>
                )}
                <span className="truncate text-sm font-medium">{match.homeTeam}</span>
              </div>
              {score && <span className="text-sm font-bold">{score.home}</span>}
            </div>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 overflow-hidden">
                {awayLogo && awayLogo.startsWith("http") ? (
                  <Image src={awayLogo} alt={match.awayTeam} width={16} height={16} className="h-4 w-4 object-contain" />
                ) : (
                  <div className="flex h-4 w-4 items-center justify-center rounded-full bg-(--surface-2) text-[8px] font-bold text-muted">
                    {getInitials(match.awayTeam)}
                  </div>
                )}
                <span className="truncate text-sm font-medium">{match.awayTeam}</span>
              </div>
              {score && <span className="text-sm font-bold">{score.away}</span>}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {h2hKeys.map((key) => {
            const odd = h2hOdds?.[key];
            const active = odd && bets.some((b) => b.id === `${match._id}_${odd._id}`);
            return (
              <button
                key={key}
                onClick={(e) => odd && toggleBet(e, odd)}
                disabled={!odd}
                className={cn(
                  "flex h-12 w-16 flex-col items-center justify-center rounded-lg border text-xs font-semibold transition-colors",
                  odd ? "border-(--line) bg-(--surface-2)" : "border-dashed border-(--line) bg-(--surface-2)/50",
                  active ? "border-(--accent) bg-(--accent) text-[#171717]" : "hover:bg-(--surface-3)"
                )}
              >
                <span className="mb-0.5 text-[10px] opacity-70">{key === "home" ? "1" : key === "draw" ? "X" : "2"}</span>
                <span>{odd ? odd.price?.toFixed?.(2) ?? <Lock size={12} /> : <Lock size={12} className="opacity-50" />}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
