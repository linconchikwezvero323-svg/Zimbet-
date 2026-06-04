import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { apiService } from '../services/api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: any) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = async () => {
    const token = localStorage.getItem('zimbet_token');
    if (token) {
      try {
        const userData = await apiService.getMe();
        setUser(userData);
      } catch (error) {
        console.error('Failed to refresh user:', error);
      }
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('zimbet_token');
      if (token) {
        try {
          const userData = await apiService.getMe();
          setUser(userData);
        } catch (error) {
          localStorage.removeItem('zimbet_token');
        }
      }
      setIsLoading(false);
    };
    checkAuth();
  }, []);

  const login = async (credentials: any) => {
    const { token, user } = await apiService.login(credentials);
    localStorage.setItem('zimbet_token', token);
    setUser(user);
  };

  const logout = () => {
    localStorage.removeItem('zimbet_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
