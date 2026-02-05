export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || "https://8bet-backend.nla-fidelity.org",
  TIMEOUT: 30000,
};

export const ENDPOINTS = {
  AUTH: {
    REGISTER: "/api/auth/register",
    LOGIN: "/api/auth/login",
    ME: "/api/auth/me",
    LOGOUT: "/api/auth/logout",
  },
  GAMES: {
    SPORTS: "/api/games/sports",
    LEAGUES: "/api/games/leagues",
    MATCHES: "/api/games/matches",
    LIVE: "/api/games/live",
    ODDS: "/api/games/odds",
    LEAGUE_MATCHES: (leagueId: string) => `/api/games/leagues/${leagueId}/matches`,
    MATCH_DETAILS: (matchId: string) => `/api/games/matches/${matchId}`,
  },
  BETS: {
    PLACE_BET: "/api/bets",
    MY_BETS: "/api/bets",
    BET_DETAILS: (betId: string) => `/api/bets/${betId}`,
  },
  WALLET: {
    BALANCE: "/api/wallet/balance",
    DEPOSIT: "/api/wallet/deposit",
    WITHDRAW: "/api/wallet/withdraw",
    TRANSACTIONS: "/api/wallet/transactions",
  },
  PAYMENTS: {
    DEPOSIT_MOBILE_MONEY: "/api/payments/deposit/mobile-money",
    WITHDRAW_MOBILE_MONEY: "/api/payments/withdraw/mobile-money",
    WITHDRAW_BANK_TRANSFER: "/api/payments/withdraw/bank-transfer",
    TRANSACTION_STATUS: (transactionId: string) => `/api/payments/transactions/${transactionId}/status`,
    VERIFY_WALLET: "/api/payments/verify/wallet",
    VERIFY_BANK_ACCOUNT: "/api/payments/verify/bank-account",
    BANKS: "/api/payments/banks",
  },
};
