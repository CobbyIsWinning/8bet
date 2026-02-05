export interface Sport {
  _id: string;
  name: string;
}

export interface League {
  _id: string;
  title: string;
  sport?: Sport | string;
  country?: any;
  [key: string]: any;
}

export interface Match {
  _id: string;
  eventName?: string;
  homeTeam: string;
  awayTeam: string;
  league?: League;
  matchTime: string;
  status?: string;
  goals?: { home?: number; away?: number };
  homeScore?: number;
  awayScore?: number;
  markets?: any;
  odds?: any[];
  [key: string]: any;
}

export interface Bet {
  _id?: string;
  selections?: any[];
  stake?: number;
  totalOdds?: number;
  potentialWinnings?: number;
  status?: string;
  result?: string;
  createdAt?: string;
  [key: string]: any;
}

export interface Transaction {
  _id?: string;
  type: string;
  amount: number;
  status?: string;
  provider?: string;
  note?: string;
  createdAt?: string;
  [key: string]: any;
}
