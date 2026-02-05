import apiClient from "@/lib/apiClient";
import { ENDPOINTS } from "@/lib/endpoints";

export const processMobileMoneyDeposit = async (depositData: {
  amount: number;
  provider?: string;
  phoneNumber: string;
  walletProvider: string;
  customerName?: string;
}) => {
  const { amount, provider = "orange_money", phoneNumber, walletProvider, customerName } = depositData;
  const response = await apiClient.post(ENDPOINTS.PAYMENTS.DEPOSIT_MOBILE_MONEY, {
    amount,
    provider,
    phoneNumber,
    walletProvider,
    customerName,
  });
  return response.data;
};

export const processMobileMoneyWithdrawal = async (withdrawalData: {
  amount: number;
  provider?: string;
  phoneNumber: string;
  walletProvider: string;
  customerName?: string;
}) => {
  const { amount, provider = "orange_money", phoneNumber, walletProvider, customerName } = withdrawalData;
  const response = await apiClient.post(ENDPOINTS.PAYMENTS.WITHDRAW_MOBILE_MONEY, {
    amount,
    provider,
    phoneNumber,
    walletProvider,
    customerName,
  });
  return response.data;
};

export const processBankTransfer = async (transferData: {
  amount: number;
  accountNumber: string;
  sortCode: string;
  customerName: string;
  provider?: string;
  narration?: string;
}) => {
  const { amount, accountNumber, sortCode, customerName, provider = "bank", narration } = transferData;
  const response = await apiClient.post(ENDPOINTS.PAYMENTS.WITHDRAW_BANK_TRANSFER, {
    amount,
    accountNumber,
    sortCode,
    customerName,
    provider,
    narration,
  });
  return response.data;
};

export const checkTransactionStatus = async (transactionId: string) => {
  const response = await apiClient.get(ENDPOINTS.PAYMENTS.TRANSACTION_STATUS(transactionId));
  return response.data;
};

export const verifyMobileWallet = async (phoneNumber: string, walletProvider: string) => {
  const response = await apiClient.post(ENDPOINTS.PAYMENTS.VERIFY_WALLET, { phoneNumber, walletProvider });
  return response.data;
};

export const verifyBankAccount = async (accountNumber: string, sortCode: string) => {
  const response = await apiClient.post(ENDPOINTS.PAYMENTS.VERIFY_BANK_ACCOUNT, { accountNumber, sortCode });
  return response.data;
};

export const getSupportedBanks = async () => {
  const response = await apiClient.get(ENDPOINTS.PAYMENTS.BANKS);
  return response.data;
};

export const detectWalletProvider = (phoneNumber: string) => {
  const cleanNumber = phoneNumber.replace(/\s+/g, "");
  if (/^0(24|54|55|59)/.test(cleanNumber)) return "MTN";
  if (/^0(20|50)/.test(cleanNumber)) return "TELECEL";
  if (/^0(27|57|26|56)/.test(cleanNumber)) return "AIRTELTIGO";
  return null;
};
