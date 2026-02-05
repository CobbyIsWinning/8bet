import apiClient from "@/lib/apiClient";
import { ENDPOINTS } from "@/lib/endpoints";

export const fetchBalance = async () => {
  const response = await apiClient.get(ENDPOINTS.WALLET.BALANCE);
  return response.data;
};

export const depositFunds = async (amount: number) => {
  const response = await apiClient.post(ENDPOINTS.WALLET.DEPOSIT, { amount });
  return response.data;
};

export const withdrawFunds = async (amount: number) => {
  const response = await apiClient.post(ENDPOINTS.WALLET.WITHDRAW, { amount });
  return response.data;
};

export const fetchTransactions = async ({ limit = 10, skip = 0 }: { limit?: number; skip?: number } = {}) => {
  const params = { limit, skip };
  const response = await apiClient.get(ENDPOINTS.WALLET.TRANSACTIONS, { params });
  return response.data;
};
