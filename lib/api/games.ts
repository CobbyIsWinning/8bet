import apiClient from "@/lib/apiClient";
import { ENDPOINTS } from "@/lib/endpoints";

export const fetchSports = async () => {
  const response = await apiClient.get(ENDPOINTS.GAMES.SPORTS);
  return response.data;
};

export const fetchLeagues = async ({ sportId, limit = 10, skip = 0 }: {
  sportId?: string;
  limit?: number;
  skip?: number;
} = {}) => {
  const params: any = { limit, skip };
  if (sportId) params.sportId = sportId;
  const response = await apiClient.get(ENDPOINTS.GAMES.LEAGUES, { params });
  return response.data;
};

export const fetchMatches = async ({ leagueId, sportId, status, startDate, endDate, search, limit = 10, skip = 0 }: {
  leagueId?: string;
  sportId?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
  limit?: number;
  skip?: number;
} = {}) => {
  const params: any = { limit, skip };
  if (leagueId) params.leagueId = leagueId;
  if (sportId) params.sportId = sportId;
  if (status && status !== "all") params.status = status;
  if (startDate) params.startDate = startDate;
  if (endDate) params.endDate = endDate;
  if (search) params.search = search;
  const response = await apiClient.get(ENDPOINTS.GAMES.MATCHES, { params });
  return response.data;
};

export const fetchOdds = async ({ leagueId, limit = 10, skip = 0 }: {
  leagueId?: string;
  limit?: number;
  skip?: number;
} = {}) => {
  const params: any = { limit, skip };
  if (leagueId) params.leagueId = leagueId;
  const response = await apiClient.get(ENDPOINTS.GAMES.ODDS, { params });
  return response.data;
};

export const fetchLeagueMatches = async (leagueId: string) => {
  const response = await apiClient.get(ENDPOINTS.GAMES.LEAGUE_MATCHES(leagueId));
  return response.data;
};

export const fetchMatchDetails = async (matchId: string) => {
  const response = await apiClient.get(ENDPOINTS.GAMES.MATCH_DETAILS(matchId));
  return response.data;
};

export const fetchLiveMatches = async ({ limit = 50, skip = 0 }: { limit?: number; skip?: number } = {}) => {
  const params = { limit, skip };
  const response = await apiClient.get(ENDPOINTS.GAMES.LIVE, { params });
  return response.data;
};
