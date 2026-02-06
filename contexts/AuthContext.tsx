"use client";

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { login as apiLogin, register as apiRegister, logout as apiLogout, getCurrentUser } from "@/lib/api/auth";

export interface User {
  id?: string;
  _id?: string;
  email?: string;
  phone?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  createdAt?: string;
  wallet?: { balance?: number };
  [key: string]: any;
}

interface AuthContextValue {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  login: (identifier: string, password: string) => Promise<void>;
  register: (payload: {
    phone?: string;
    email?: string;
    dob?: string;
    password: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (partial: Partial<User>) => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const TOKEN_KEY = "authToken";
const USER_KEY = "user";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const storedToken = typeof window !== "undefined" ? localStorage.getItem(TOKEN_KEY) : null;
    const storedUser = typeof window !== "undefined" ? localStorage.getItem(USER_KEY) : null;
    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
      }
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (identifier: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiLogin({ identifier, password });
      if (response?.token) {
        localStorage.setItem(TOKEN_KEY, response.token);
        setToken(response.token);
      }
      if (response?.user) {
        localStorage.setItem(USER_KEY, JSON.stringify(response.user));
        setUser(response.user);
      } else {
        try {
          const me = await getCurrentUser();
          if (me?.success && me?.user) {
            localStorage.setItem(USER_KEY, JSON.stringify(me.user));
            setUser(me.user);
          }
        } catch {
          // ignore
        }
      }
    } catch (err: any) {
      const message = err?.response?.data?.message || err?.message || "Login failed";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (payload: {
    phone?: string;
    email?: string;
    dob?: string;
    password: string;
  }) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiRegister(payload);
      if (response?.token) {
        localStorage.setItem(TOKEN_KEY, response.token);
        setToken(response.token);
      }
      if (response?.user) {
        localStorage.setItem(USER_KEY, JSON.stringify(response.user));
        setUser(response.user);
      }
    } catch (err: any) {
      const message = err?.response?.data?.message || err?.message || "Registration failed";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await apiLogout();
    } catch {
      // ignore
    } finally {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      setToken(null);
      setUser(null);
      setLoading(false);
    }
  }, []);

  const updateUser = useCallback(async (partial: Partial<User>) => {
    setUser((prev) => {
      const next = { ...(prev || {}), ...partial } as User;
      localStorage.setItem(USER_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        error,
        login,
        register,
        logout,
        updateUser,
        isAuthenticated: !!token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
