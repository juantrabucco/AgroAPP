'use client';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { api } from './api';

type Role = 'OWNER'|'ADMIN'|'FOREMAN'|'WORKER'|'ACCOUNTANT';
type RoleAssignment = { role: Role; companyId: string; fieldId?: string | null };
type UserPayload = { sub: string; email: string; defaultCompanyId?: string; roles: RoleAssignment[] };

type AuthState = {
  token?: string;
  user?: UserPayload;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  companyId?: string;
};

const AuthCtx = createContext<AuthState>({ login: async () => {}, logout: () => {} });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | undefined>();
  const [user, setUser] = useState<UserPayload | undefined>();

  useEffect(() => {
    const raw = localStorage.getItem('auth');
    if (raw) {
      const a = JSON.parse(raw);
      setToken(a.token);
      setUser(a.user);
    }
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.post('/auth/login', { email, password });
    const { access_token, user } = res.data;
    const auth = { token: access_token, user };
    localStorage.setItem('auth', JSON.stringify(auth));
    setToken(access_token);
    setUser(user);
  };
  const logout = () => {
    localStorage.removeItem('auth');
    setToken(undefined);
    setUser(undefined);
  };

  return <AuthCtx.Provider value={{ token, user, login, logout, companyId: user?.defaultCompanyId }}>{children}</AuthCtx.Provider>;
}
export function useAuth() { return useContext(AuthCtx); }

export function hasRole(user: UserPayload | undefined, roles: Role[]) {
  if (!user) return false;
  const rs = new Set(user.roles.map(r => r.role));
  return roles.some(r => rs.has(r));
}
