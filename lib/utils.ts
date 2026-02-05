import { Match } from "@/lib/types";

export const formatMatchTime = (dateString: string) => {
  const matchDate = new Date(dateString);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const matchDay = new Date(matchDate.getFullYear(), matchDate.getMonth(), matchDate.getDate());
  const hours = String(matchDate.getHours()).padStart(2, "0");
  const minutes = String(matchDate.getMinutes()).padStart(2, "0");
  const time = `${hours}:${minutes}`;

  if (matchDay.getTime() === today.getTime()) return `Today, ${time}`;
  if (matchDay.getTime() === tomorrow.getTime()) return `Tomorrow, ${time}`;
  const day = String(matchDate.getDate()).padStart(2, "0");
  const month = String(matchDate.getMonth() + 1).padStart(2, "0");
  return `${day}/${month}, ${time}`;
};

export const getStatusLabel = (status?: string) => {
  switch (status) {
    case "in_play":
      return "LIVE";
    case "finished":
      return "FINISHED";
    case "postponed":
      return "POSTPONED";
    case "cancelled":
      return "CANCELLED";
    default:
      return "SCHEDULED";
  }
};

export const getStatusColor = (status?: string) => {
  switch (status) {
    case "in_play":
      return "#4CAF50";
    case "finished":
      return "#9E9E9E";
    case "postponed":
    case "cancelled":
      return "#F44336";
    default:
      return "#FFA726";
  }
};

export const getScore = (match: Match) => {
  if (match?.status === "scheduled") return null;
  const home = match?.goals?.home ?? match?.homeScore;
  const away = match?.goals?.away ?? match?.awayScore;
  if (home === undefined && away === undefined) return null;
  return { home: home ?? 0, away: away ?? 0 };
};

export const extractMatches = (response: any): Match[] => {
  if (!response) return [];
  if (Array.isArray(response)) return response;
  if (Array.isArray(response.matches)) return response.matches;
  if (Array.isArray(response.data)) return response.data;
  if (Array.isArray(response.data?.matches)) return response.data.matches;
  if (response.data && typeof response.data === "object") {
    if (Array.isArray(response.data?.matches)) return response.data.matches;
    const values = Object.values(response.data);
    if (values.length && values.every((v: any) => v?.homeTeam || v?.matchTime)) return values as Match[];
  }
  return [];
};

export const getH2HOdds = (match: any) => {
  if (match?.markets?.h2h?.length) {
    const h2h = match.markets.h2h;
    const selections = h2h.map((odd: any, index: number) => {
      const rawLabel = odd?.label ?? odd?.name;
      const normalizedName =
        rawLabel === "Home"
          ? match.homeTeam
          : rawLabel === "Away"
          ? match.awayTeam
          : rawLabel === "Draw" || rawLabel === "X"
          ? "Draw"
          : rawLabel;
      const fallbackKey = rawLabel || normalizedName || index;
      return {
        ...odd,
        _id: odd._id || `${match._id}_h2h_${fallbackKey}`,
        name: normalizedName,
        selectionLabel: odd.selectionLabel || rawLabel || normalizedName,
      };
    });

    return {
      home: selections.find((odd: any) => odd.name === match.homeTeam),
      draw: selections.find((odd: any) => odd.name === "Draw"),
      away: selections.find((odd: any) => odd.name === match.awayTeam),
    };
  }

  if (Array.isArray(match?.odds) && match.odds.length) {
    const matchWinner = match.odds.find((market: any) => market.marketId === 1 || market.name === "Match Winner");
    if (!matchWinner?.selections?.length) return null;

    const selections = matchWinner.selections.map((selection: any) => ({
      _id: selection._id || `${match._id}_${matchWinner.marketId || "mw"}_${selection.label}`,
      realOddId: matchWinner._id,
      name:
        selection.label === "Home"
          ? match.homeTeam
          : selection.label === "Away"
          ? match.awayTeam
          : "Draw",
      selectionLabel: selection.label,
      price: selection.odd,
    }));

    return {
      home: selections.find((odd: any) => odd.name === match.homeTeam),
      draw: selections.find((odd: any) => odd.name === "Draw"),
      away: selections.find((odd: any) => odd.name === match.awayTeam),
    };
  }

  return null;
};

export const countMarkets = (match: any) => {
  const h2hCount = match?.markets?.h2h?.length || 0;
  const totalsCount = match?.markets?.totals?.length || 0;
  const spreadsCount = match?.markets?.spreads?.length || 0;
  const oddsCount = Array.isArray(match?.odds) ? match.odds.length : 0;
  return h2hCount + totalsCount + spreadsCount + oddsCount;
};
