import { createContext, useContext, useState, useCallback}from 'react';
import type {ReactNode} from 'react'
import type { User, AuthTokens, TokenPayload } from '../types';

interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
}

interface AuthContextValue extends AuthState {
  login: (tokens: AuthTokens) => void;
  logout: () => void;
  updateTokens: (tokens: AuthTokens) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function parseJwt(token: string): TokenPayload | null {
  try {
    const base64 = token.split('.')[1];
    const decoded = JSON.parse(atob(base64));
    return decoded as TokenPayload;
  } catch {
    return null;
  }
}

function getStoredAuth(): AuthState {
  try {
    const tokens = localStorage.getItem('pf_tokens');
    if (tokens) {
      const parsed = JSON.parse(tokens) as AuthTokens;
      const payload = parseJwt(parsed.access_token);
      if (payload) {
        return {
          tokens: parsed,
          user: { id: payload.userId, email: payload.email, rol: payload.rol, activo: true },
          isAuthenticated: true,
        };
      }
    }
  } catch {
    // ignore
  }
  return { user: null, tokens: null, isAuthenticated: false };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(getStoredAuth);

  const login = useCallback((tokens: AuthTokens) => {
    const payload = parseJwt(tokens.access_token);
    localStorage.setItem('pf_tokens', JSON.stringify(tokens));
    setState({
      tokens,
      user: payload
        ? { id: payload.userId, email: payload.email, rol: payload.rol, activo: true }
        : null,
      isAuthenticated: true,
    });
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('pf_tokens');
    setState({ user: null, tokens: null, isAuthenticated: false });
  }, []);

  const updateTokens = useCallback((tokens: AuthTokens) => {
    const payload = parseJwt(tokens.access_token);
    localStorage.setItem('pf_tokens', JSON.stringify(tokens));
    setState((prev) => ({
      ...prev,
      tokens,
      user: payload
        ? { id: payload.userId, email: payload.email, rol: payload.rol, activo: true }
        : prev.user,
    }));
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, logout, updateTokens }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}