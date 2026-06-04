export interface User {
  id: string;
  username: string;
  phone_number: string;
  balance: number;
}

export interface Sport {
  id: string;
  name: string;
  slug: string;
}

export interface Market {
  id: string;
  name: string;
  outcomes: Outcome[];
}

export interface Outcome {
  id: string;
  name: string;
  odds: number;
}

export interface Event {
  id: string;
  home_team: string;
  away_team: string;
  start_time: string;
  sport_id: string;
  league: string;
  markets: Market[];
}

export interface Bet {
  id: string;
  stake: number;
  potential_payout: number;
  status: 'pending' | 'won' | 'lost';
  created_at: string;
  legs: BetLeg[];
}

export interface BetLeg {
  event_id: string;
  outcome_id: string;
  odds: number;
}

export interface Transaction {
  id: string;
  amount: number;
  type: 'deposit' | 'withdrawal';
  method: 'ecocash' | 'innbucks';
  status: 'pending' | 'completed' | 'failed';
  created_at: string;
}
