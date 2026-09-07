import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { AuthResponse } from '../types';
import { authService } from '../services/authService';

interface AuthContextType {
  user: AuthResponse | null;
  isAuthenticated: boolean;
  isManager: boolean;
  isAdmin: boolean;
  isTeamMember: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (fullName: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthResponse | null>(authService.getCurrentUser());

  useEffect(() => {
    const stored = authService.getCurrentUser();
    if (stored) setUser(stored);
  }, []);

  const login = async (email: string, password: string) => {
    const response = await authService.login(email, password);
    setUser(response);
  };

  const register = async (fullName: string, email: string, password: string) => {
    await authService.register(fullName, email, password);
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const isManager = user?.role === 'MANAGER' || user?.role === 'ADMIN';
  const isAdmin = user?.role === 'ADMIN';
  const isTeamMember = user?.role === 'TEAM_MEMBER';

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isManager,
      isAdmin,
      isTeamMember,
      login,
      register,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
