'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Subscription } from '@mss/shared';
import { apiClient } from '../lib/api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  activeSubscription: Subscription | null;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
    age?: number;
  }) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  refreshSubscription: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'mss_access_token';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [activeSubscription, setActiveSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = async () => {
    try {
      const userData = await apiClient.auth.getCurrentUser();
      setUser(userData);
    } catch (error) {
      throw error;
    }
  };

  const refreshSubscription = async () => {
    try {
      const subscription = await apiClient.users.getActiveSubscription();
      setActiveSubscription(subscription);
    } catch (error) {
      // Не критично, если нет активного абонемента
      setActiveSubscription(null);
    }
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    apiClient.clearToken();
    setUser(null);
    setActiveSubscription(null);
  };

  // Загрузить пользователя из токена при монтировании
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem(TOKEN_KEY);
      if (token) {
        apiClient.setToken(token);
        try {
          await refreshUser();
          await refreshSubscription();
        } catch (error: any) {
          console.error('Ошибка при загрузке пользователя:', error);
          // Только удаляем токен если это 401 ошибка (неавторизован) или 403
          if (error?.response?.status === 401 || error?.response?.status === 403) {
            logout();
          }
        }
      }
      setIsLoading(false);
    };

    initAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await apiClient.auth.login(email, password);

      // Сохраняем токен
      localStorage.setItem(TOKEN_KEY, response.accessToken);
      apiClient.setToken(response.accessToken);

      // Устанавливаем пользователя
      setUser(response.user);

      // Загружаем активный абонемент
      await refreshSubscription();
    } catch (error: any) {
      console.error('Ошибка входа:', error);
      throw new Error(error.response?.data?.message || 'Не удалось войти в систему');
    }
  };

  const register = async (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
    age?: number;
  }) => {
    try {
      const response = await apiClient.auth.register(data);

      // Сохраняем токен
      localStorage.setItem(TOKEN_KEY, response.accessToken);
      apiClient.setToken(response.accessToken);

      // Устанавливаем пользователя
      setUser(response.user);

      // При регистрации абонементов еще нет
      setActiveSubscription(null);
    } catch (error: any) {
      console.error('Ошибка регистрации:', error);
      throw new Error(error.response?.data?.message || 'Не удалось зарегистрироваться');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        activeSubscription,
        login,
        register,
        logout,
        refreshUser,
        refreshSubscription,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth должен использоваться внутри AuthProvider');
  }
  return context;
}
