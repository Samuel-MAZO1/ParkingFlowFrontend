import { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { User, AuthTokens } from '../types';

interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
}

interface AuthContextValue extends AuthState {
  login: (tokens: any) => void;
  logout: () => void;
  updateTokens: (tokens: any) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// Decodificador seguro para Claims de Spring Boot (sub, email, roles)
function parseJwt(token: string): any {
  try {
    const base64 = token.split('.')[1];
    const decoded = JSON.parse(atob(base64));
    return decoded;
  } catch {
    return null;
  }
}

// Mapeador para transformar las Claims del JWT al modelo User de React
function mapPayloadToUser(payload: any): User | null {
  if (!payload) return null;
  
  // Extrae el rol quitando el prefijo "ROLE_" (Ej: ROLE_ADMIN -> ADMIN)
  const rawRol = payload.roles && payload.roles.length > 0 
    ? payload.roles[0].replace('ROLE_', '') 
    : 'ABONADO';

  return {
    id: payload.sub ? parseInt(payload.sub, 10) : 0,
    email: payload.email || '',
    rol: rawRol,
    activo: true
  };
}

// Normaliza el DTO del backend hacia el formato estándar del Front
function normalizeTokens(tokens: any): AuthTokens {
  return {
    access_token: tokens.access_token || tokens.accesToken, // Resuelve el typo de Spring 'accesToken'
    refresh_token: tokens.refresh_token || tokens.refreshToken
  };
}

function getStoredAuth(): AuthState {
  try {
    const tokensStr = localStorage.getItem('pf_tokens');
    if (tokensStr) {
      const parsed = JSON.parse(tokensStr);
      const normalized = normalizeTokens(parsed);
      const payload = parseJwt(normalized.access_token);
      
      if (payload) {
        return {
          tokens: normalized,
          user: mapPayloadToUser(payload),
          isAuthenticated: true,
        };
      }
    }
  } catch {
    // Ignore context errors
  }
  return { user: null, tokens: null, isAuthenticated: false };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(getStoredAuth);

  const login = useCallback((rawTokens: any) => {
    const normalized = normalizeTokens(rawTokens);
    const payload = parseJwt(normalized.access_token);
    
    localStorage.setItem('pf_tokens', JSON.stringify(normalized));
    setState({
      tokens: normalized,
      user: mapPayloadToUser(payload),
      isAuthenticated: true,
    });
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('pf_tokens');
    setState({ user: null, tokens: null, isAuthenticated: false });
  }, []);

  const updateTokens = useCallback((rawTokens: any) => {
    const normalized = normalizeTokens(rawTokens);
    const payload = parseJwt(normalized.access_token);
    
    localStorage.setItem('pf_tokens', JSON.stringify(normalized));
    setState((prev) => ({
      ...prev,
      tokens: normalized,
      user: payload ? mapPayloadToUser(payload) : prev.user,
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