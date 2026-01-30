import React, { createContext, useContext, useEffect, useState } from 'react';
import { AuthResponse, User, UserRole } from '../types/api';
import { fetchProfile, signIn as apiSignIn, signOut as apiSignOut, signUp as apiSignUp } from '../api/auth';
import { getToken, saveToken } from '../api/client';

type AuthContextValue = {
  user: User | null;
  token: string | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<User>;
  signUp: (payload: { email: string; password: string; full_name?: string; role?: 'member' | 'admin' }) => Promise<User>;
  signOut: () => Promise<void>;
};

export const getDashboardPath = (role: UserRole): '/admin' | '/member' => (role === 'admin' ? '/admin' : '/member');

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(getToken());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const bootstrap = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const profile = await fetchProfile();
        setUser(profile);
      } catch (err) {
        saveToken(null);
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    bootstrap();
  }, [token]);

  const handleAuthSuccess = (data: AuthResponse): User => {
    const authedUser: User = { ...data.user, role: data.user.role };
    if (data.access_token) {
      saveToken(data.access_token);
      setToken(data.access_token);
      setUser(authedUser);
    }
    return authedUser;
  };

  const signIn = async (email: string, password: string) => {
    const data = await apiSignIn({ email, password });
    return handleAuthSuccess(data);
  };

  const signUp = async (payload: { email: string; password: string; full_name?: string; role?: 'member' | 'admin' }) => {
    const data = await apiSignUp(payload);
    return handleAuthSuccess(data);
  };

  const signOut = async () => {
    await apiSignOut();
    saveToken(null);
    setToken(null);
    setUser(null);
  };

  const value: AuthContextValue = {
    user,
    token,
    loading,
    signIn,
    signUp,
    signOut
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
