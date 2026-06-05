import { User, Sport, Event, Bet, Transaction } from '../types';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1';

const getHeaders = () => {
  const token = localStorage.getItem('zimbet_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

export const apiService = {
  // Auth
  async login(credentials: any): Promise<{ token: string; user: User }> {
    const response = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(credentials)
    });
    if (!response.ok) throw new Error('Login failed');
    return response.json();
  },

  async register(data: any): Promise<void> {
    const response = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Registration failed');
  },

  async getMe(): Promise<User> {
    const response = await fetch(`${BASE_URL}/auth/me`, {
      headers: getHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch user');
    const data = await response.json();
    return data.user || data;
  },

  // Sports & Events
  async getSports(): Promise<Sport[]> {
    const response = await fetch(`${BASE_URL}/sports`, {
      headers: getHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch sports');
    return response.json();
  },

  async getEvents(sportId?: string): Promise<Event[]> {
    const url = sportId ? `${BASE_URL}/sports/events?sport=${sportId}` : `${BASE_URL}/sports/events`;
    const response = await fetch(url, {
      headers: getHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch events');
    return response.json();
  },

  // Betting
  async placeBet(betData: any): Promise<Bet> {
    const response = await fetch(`${BASE_URL}/bets`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(betData)
    });
    if (!response.ok) throw new Error('Failed to place bet');
    return response.json();
  },

  async getMyBets(): Promise<Bet[]> {
    const response = await fetch(`${BASE_URL}/bets`, {
      headers: getHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch bets');
    return response.json();
  },

  // Wallet
  async deposit(data: any): Promise<{ transaction_id: string; status: string }> {
    const response = await fetch(`${BASE_URL}/wallet/deposit`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Deposit failed');
    return response.json();
  },

  async withdraw(data: any): Promise<{ transaction_id: string }> {
    const response = await fetch(`${BASE_URL}/wallet/withdraw`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Withdrawal failed');
    return response.json();
  },

  async getTransactions(): Promise<Transaction[]> {
    const response = await fetch(`${BASE_URL}/wallet/transactions`, {
      headers: getHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch transactions');
    return response.json();
  }
};
