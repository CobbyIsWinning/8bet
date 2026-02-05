import apiClient from "@/lib/apiClient";
import { ENDPOINTS } from "@/lib/endpoints";

export const placeBet = async ({ stake, selections }: { stake: number; selections: Array<{ oddId: string; selectionLabel: string }> }) => {
  const response = await apiClient.post(ENDPOINTS.BETS.PLACE_BET, { stake, selections });
  return response.data;
};

export const fetchMyBets = async ({ limit = 10, skip = 0 }: { limit?: number; skip?: number } = {}) => {
  const params = { limit, skip };
  const response = await apiClient.get(ENDPOINTS.BETS.MY_BETS, { params });
  return response.data;
};

export const fetchBetDetails = async (betId: string) => {
  const response = await apiClient.get(ENDPOINTS.BETS.BET_DETAILS(betId));
  return response.data;
};
