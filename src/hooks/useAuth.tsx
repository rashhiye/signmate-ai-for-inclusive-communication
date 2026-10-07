import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { User, AuthStatus, LoginCredentials, RegisterCredentials } from '../types/auth';
import { authService } from '../services/AuthService';
import { isFirebaseConfigured } from '../firebase/config';

interface AuthContextType {
  user: User | null;
  status: AuthStatus;
  error: string | null;
  isBackendConnected: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ACTIVE_USER_STORAGE_KEY = 'signmate_active_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<AuthStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [isBackendConnected, setIsBackendConnected] = useState<boolean>(false);

  useEffect(() => {
    const configured = isFirebaseConfigured();
    setIsBackendConnected(configured);

    // 1. Instantly restore cached session to prevent flash on mobile browsers
    const storedActive = localStorage.getItem(ACTIVE_USER_STORAGE_KEY);
    if (storedActive) {
      try {
        const parsed = JSON.parse(storedActive);
        setUser(parsed);
        setStatus('authenticated');
      } catch {
        localStorage.removeItem(ACTIVE_USER_STORAGE_KEY);
        setStatus('unauthenticated');
      }
    } else {
      setStatus('unauthenticated');
    }

    // 2. Handle mobile Google OAuth redirect resolution
    authService.handleRedirectResult().then((redirectUser) => {
      if (redirectUser) {
        setUser(redirectUser);
        setStatus('authenticated');
        localStorage.setItem(ACTIVE_USER_STORAGE_KEY, JSON.stringify(redirectUser));
      }
    }).catch((err) => {
      console.warn('Redirect sign-in resolution check:', err);
    });

    // 3. Sync real-time Firebase Auth state across all platforms
    const unsubscribe = authService.onAuthStateChanged((currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setStatus('authenticated');
        localStorage.setItem(ACTIVE_USER_STORAGE_KEY, JSON.stringify(currentUser));
      } else {
        localStorage.removeItem(ACTIVE_USER_STORAGE_KEY);
        setUser(null);
        setStatus('unauthenticated');
      }
    });

    return () => unsubscribe();
  }, []);

  const login = useCallback(async (credentials: LoginCredentials) => {
    setStatus('loading');
    setError(null);
    try {
      const authenticatedUser = await authService.signIn(credentials);
      setUser(authenticatedUser);
      setStatus('authenticated');
      localStorage.setItem(ACTIVE_USER_STORAGE_KEY, JSON.stringify(authenticatedUser));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Authentication failed';
      setError(message);
      setStatus('error');
      throw err;
    }
  }, []);

  const register = useCallback(async (credentials: RegisterCredentials) => {
    setStatus('loading');
    setError(null);
    try {
      const newUser = await authService.signUp(credentials);
      setUser(newUser);
      setStatus('authenticated');
      localStorage.setItem(ACTIVE_USER_STORAGE_KEY, JSON.stringify(newUser));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Registration failed';
      setError(message);
      setStatus('error');
      throw err;
    }
  }, []);

  const loginWithGoogle = useCallback(async () => {
    setStatus('loading');
    setError(null);
    try {
      const googleUser = await authService.signInWithGoogle();
      if (googleUser) {
        setUser(googleUser);
        setStatus('authenticated');
        localStorage.setItem(ACTIVE_USER_STORAGE_KEY, JSON.stringify(googleUser));
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Google authentication failed';
      setError(message);
      setStatus('error');
      throw err;
    }
  }, []);

  const logout = useCallback(async () => {
    setStatus('loading');
    try {
      await authService.signOut();
    } catch {
      // Ignore if unconfigured
    } finally {
      localStorage.removeItem(ACTIVE_USER_STORAGE_KEY);
      setUser(null);
      setStatus('unauthenticated');
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        status,
        error,
        isBackendConnected,
        login,
        register,
        loginWithGoogle,
        logout,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
