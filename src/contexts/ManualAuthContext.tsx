import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { manualAuthService } from '../services/manualAuth';

interface ManualUser {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string;
  points: number;
  level: string;
}

interface ManualAuthContextType {
  user: ManualUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (updates: any) => Promise<void>;
  requireAuth: (action: () => void) => void;
}

const ManualAuthContext = createContext<ManualAuthContextType | undefined>(undefined);

export const useManualAuth = () => {
  const context = useContext(ManualAuthContext);
  if (!context) {
    throw new Error('useManualAuth must be used within a ManualAuthProvider');
  }
  return context;
};

interface ManualAuthProviderProps {
  children: ReactNode;
  onRequireLogin: () => void;
}

export const ManualAuthProvider = ({ children, onRequireLogin }: ManualAuthProviderProps) => {
  const [user, setUser] = useState<ManualUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Kiểm tra session khi load app
    const currentUser = manualAuthService.getCurrentUser();
    setUser(currentUser);
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const session = await manualAuthService.signIn(email, password);
    setUser(session.user);
  };

  const register = async (email: string, password: string, fullName: string) => {
    await manualAuthService.signUp(email, password, fullName);
    // Tự động đăng nhập sau khi đăng ký
    await login(email, password);
  };

  const logout = async () => {
    await manualAuthService.signOut();
    setUser(null);
  };

  const updateProfile = async (updates: any) => {
    if (!user) return;
    await manualAuthService.updateProfile(user.id, updates);
    setUser(prev => prev ? { ...prev, ...updates } : null);
  };

  const requireAuth = (action: () => void) => {
    if (user) {
      action();
    } else {
      onRequireLogin();
    }
  };

  const value: ManualAuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    updateProfile,
    requireAuth
  };

  return (
    <ManualAuthContext.Provider value={value}>
      {children}
    </ManualAuthContext.Provider>
  );
};