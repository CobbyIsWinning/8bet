"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { ChevronDown } from "lucide-react";
import socketService from "@/lib/socket";
import SearchBar from "@/components/common/SearchBar";
import FilterModal, { Filters } from "@/components/common/FilterModal";
import MatchCard from "@/components/matches/MatchCard";
import Button from "@/components/ui/Button";
import { LoadingIndicator } from "@/components/application/loading-indicator/loading-indicator";
import { fetchMatches, fetchSports } from "@/lib/api/games";
import { extractMatches } from "@/lib/utils";
import { useFavorites } from "@/contexts/FavoritesContext";

export default function HomePage() {
  const [sports, setSports] = useState<any[]>([]);
  const [selectedSport, setSelectedSport] = useState<string>("all");
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [openFilter, setOpenFilter] = useState(false);
  const [filters, setFilters] = useState<Filters>({ dateRange: "all", status: "all", startDate: null, endDate: null });
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [quickAction, setQuickAction] = useState<"popular" | "favorites" | "upcoming" | "bonuses">("popular");
  const { isFavorite } = useFavorites();
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const [collapsedLeagues, setCollapsedLeagues] = useState<Set<string>>(new Set());

  const pageSize = 20;

  useEffect(() => {
    (async () => {
      try {
        const response = await fetchSports();
        if (response?.success && response?.data) {
          setSports(response.data);
        }
      } catch (err) {
        // ignore
      }
    })();
  }, []);

  const buildDateParams = () => {
    if (filters.dateRange === "all") return {} as any;
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    let start = today;
    let end: Date | null = null;

    switch (filters.dateRange) {
      case "today":
        end = new Date(today);
        end.setDate(end.getDate() + 1);
        break;
      case "tomorrow":
        start = new Date(today);
        start.setDate(start.getDate() + 1);
        end = new Date(start);
        end.setDate(end.getDate() + 1);
        break;
      case "week":
        end = new Date(today);
        end.setDate(end.getDate() + 7);
        break;
      case "month":
        end = new Date(today);
        end.setMonth(end.getMonth() + 1);
        break;
      case "custom":
        return {
          startDate: filters.startDate ? new Date(filters.startDate).toISOString() : undefined,
          endDate: filters.endDate ? new Date(filters.endDate).toISOString() : undefined,
        };
      default:
        return {};
    }

    return {
      startDate: start.toISOString(),
      endDate: end?.toISOString(),
    };
  };

  const loadMatches = async (nextPage = 1, append = false) => {
    try {
      append ? setLoadingMore(true) : setLoading(true);
      setError(null);

      const dateParams = buildDateParams();
      const response = await fetchMatches({
        limit: pageSize,
        skip: (nextPage - 1) * pageSize,
        status: filters.status,
        search: search.trim() || undefined,
        sportId: selectedSport !== "all" ? selectedSport : undefined,
        ...dateParams,
      });

      const data = extractMatches(response?.data || response);
      if (append) {
        setMatches((prev) => {
          const ids = new Set(prev.map((m) => m._id));
          return [...prev, ...data.filter((m) => !ids.has(m._id))];
        });
      } else {
        setMatches(data);
      }
      const total = response?.total || response?.data?.total || response?.count || response?.data?.count;
      if (typeof total === "number") {
        const currentCount = (append ? matches.length : 0) + data.length;
        setHasMore(currentCount < total);
      } else {
        setHasMore(data.length === pageSize);
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Failed to load matches");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    setPage(1);
    setHasMore(true);
    loadMatches(1, false);
  }, [selectedSport, search, filters]);

  useEffect(() => {
    const socket = socketService.connect();
    const unsubUpdate = socket ? socketService.on("live:match:update", (match: any) => {
      setMatches((prev) => prev.map((m) => (m._id === match._id ? { ...m, ...match } : m)));
    }) : () => {};

    const unsubOdds = socket ? socketService.on("live:odds:update", ({ matchId, odds }: any) => {
      setMatches((prev) => prev.map((m) => (m._id === matchId ? { ...m, markets: { ...m.markets, h2h: odds } } : m)));
    }) : () => {};

    return () => {
      unsubUpdate();
      unsubOdds();
    };
  }, []);

  const loadNextPage = useCallback(async () => {
    if (loading || loadingMore || !hasMore) return;
    const next = page + 1;
    setPage(next);
    await loadMatches(next, true);
  }, [loading, loadingMore, hasMore, page]);

  useEffect(() => {
    if (!sentinelRef.current) return;
    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          loadNextPage();
        }
      },
      { rootMargin: "300px" }
    );

    observerRef.current.observe(sentinelRef.current);
    return () => observerRef.current?.disconnect();
  }, [loadNextPage]);

  const filteredMatches = useMemo(() => {
    let result = [...matches];

    switch (quickAction) {
      case "favorites":
        result = result.filter((match) => isFavorite(match._id));
        break;
      case "upcoming":
        result = result.filter((match) => {
          const matchDate = new Date(match.matchTime);
          const now = new Date();
          const weekEnd = new Date(now);
          weekEnd.setDate(weekEnd.getDate() + 7);
          return matchDate >= now && matchDate <= weekEnd;
        });
        break;
      case "bonuses":
        result = [];
        break;
    }

    result.sort((a, b) => {
      if (a.status === "in_play" && b.status !== "in_play") return -1;
      if (a.status !== "in_play" && b.status === "in_play") return 1;
      return new Date(a.matchTime).getTime() - new Date(b.matchTime).getTime();
    });

    return result;
  }, [matches, quickAction, isFavorite]);

  const groupedMatches = useMemo(() => {
    const groups: { league: any; matches: any[] }[] = [];
    const leagueMap = new Map<string, number>();

    filteredMatches.forEach((match) => {
      const leagueId = match.league?._id || "other";
      if (!leagueMap.has(leagueId)) {
        leagueMap.set(leagueId, groups.length);
        groups.push({
          league: match.league,
          matches: [],
        });
      }
      groups[leagueMap.get(leagueId)!].matches.push(match);
    });

    return groups;
  }, [filteredMatches]);

  const toggleLeague = (id: string) => {
    setCollapsedLeagues((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="text-sm text-muted">Welcome back</div>
          <h1 className="text-2xl font-semibold" style={{ fontFamily: "var(--font-display)" }}>Browse & Place Bets</h1>
        </div>
        <SearchBar
          value={search}
          onChange={setSearch}
          onFilter={() => setOpenFilter(true)}
          hasActiveFilters={filters.dateRange !== "all" || filters.status !== "all"}
        />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { key: "popular", label: "Popular" },
          { key: "favorites", label: "Favorites" },
          { key: "upcoming", label: "Upcoming" },
          { key: "bonuses", label: "Bonuses" },
        ].map((action) => (
          <button
            key={action.key}
            onClick={() => setQuickAction(action.key as any)}
            className={`rounded-2xl border px-4 py-3 text-sm font-semibold ${
              quickAction === action.key
                ? "bg-(--accent) text-[#171717]"
                : "border-(--line) bg-(--surface-2) text-muted"
            }`}
          >
            {action.label}
          </button>
        ))}
      </div>

      {sports.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedSport("all")}
            className={`rounded-full border px-4 py-2 text-xs font-semibold ${
              selectedSport === "all"
                ? "bg-(--accent) text-[#171717]"
                : "border-(--line) bg-(--surface-2) text-muted"
            }`}
          >
            All
          </button>
          {sports.map((sport) => (
            <button
              key={sport._id}
              onClick={() => setSelectedSport(sport._id)}
              className={`rounded-full border px-4 py-2 text-xs font-semibold ${
                selectedSport === sport._id
                  ? "bg-(--accent) text-[#171717]"
                  : "border-(--line) bg-(--surface-2) text-muted"
              }`}
            >
              {sport.name}
            </button>
          ))}
        </div>
      )}

      {loading && (
        <div className="rounded-2xl border border-[color:var(--line)] bg-[color:var(--surface-2)] p-6">
          <LoadingIndicator type="dot-circle" size="md" label="Loading matches..." />
        </div>
      )}

      {!loading && error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          {error}
        </div>
      )}

      {!loading && !error && filteredMatches.length === 0 && (
        <div className="rounded-2xl border border-(--line) bg-(--surface-2) p-6 text-sm text-muted">
          No matches available.
        </div>
      )}

      <div className="space-y-6">
        {groupedMatches.map((group) => (
          <div key={group.league?._id || "other"} className="rounded-2xl bg-(--surface-2)/20 p-2 overflow-hidden">
            <div
              onClick={() => toggleLeague(group.league?._id || "other")}
              className="mb-3 flex cursor-pointer items-center justify-between border-l-4 border-(--accent) pl-3 py-1 transition-colors hover:bg-(--surface-2)/50"
            >
              <div className="flex items-center gap-2">
                {group.league?.logo && group.league.logo.startsWith("http") && (
                  <Image src={group.league.logo} alt={group.league.title} width={20} height={20} className="h-5 w-5 object-contain" />
                )}
                <div>
                  {group.league?.country?.name && (
                    <div className="text-xs font-bold text-muted uppercase tracking-wider">
                      {group.league.country.name}
                    </div>
                  )}
                  <div className="text-sm font-bold text-foreground">{group.league?.title || "Other Matches"}</div>
                </div>
              </div>
              <ChevronDown className={`mr-2 h-5 w-5 text-muted transition-transform ${collapsedLeagues.has(group.league?._id || "other") ? "-rotate-90" : ""}`} />
            </div>
            {!collapsedLeagues.has(group.league?._id || "other") && (
              <div className="grid gap-2">
              {group.matches.map((match, index) => {
                const isNewDate =
                  index === 0 ||
                  new Date(match.matchTime).toDateString() !== new Date(group.matches[index - 1].matchTime).toDateString();
                return (
                  <React.Fragment key={match._id}>
                    {isNewDate && match.status !== "in_play" && (
                      <div className="mt-2 mb-1 px-1 text-xs font-bold text-muted/80 uppercase">
                        {new Date(match.matchTime).toLocaleDateString(undefined, {
                          weekday: "long",
                          month: "short",
                          day: "numeric",
                        })}
                      </div>
                    )}
                    <MatchCard match={match} />
                  </React.Fragment>
                );
              })}
              </div>
            )}
          </div>
        ))}
      </div>

      <div ref={sentinelRef} />
      {loadingMore && (
        <div className="flex justify-center">
          <LoadingIndicator type="dot-circle" size="sm" label="Loading more..." />
        </div>
      )}

      <FilterModal
        open={openFilter}
        onClose={() => setOpenFilter(false)}
        onApply={(next) => setFilters(next)}
        initial={filters}
      />
    </div>
  );
}
