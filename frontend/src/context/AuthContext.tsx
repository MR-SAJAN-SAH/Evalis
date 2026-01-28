import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

interface AuthContextType {
  accessToken: string | null;
  role: string | null;
  userEmail: string | null;
  organizationName: string | null;
  subscriptionPlan: string | null;
  userId: string | null;
  login: (token: string, role: string, email: string, org?: string, plan?: string, userId?: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Use sessionStorage only for tab-specific sessions
  // This prevents cross-tab session conflicts
  const getInitialValue = (key: string): string | null => {
    try {
      return sessionStorage.getItem(key);
    } catch (e) {
      console.warn(`Failed to read from sessionStorage: ${key}`);
      return null;
    }
  };

  const [accessToken, setAccessToken] = useState<string | null>(
    getInitialValue('accessToken')
  );
  const [role, setRole] = useState<string | null>(
    getInitialValue('role')
  );
  const [userEmail, setUserEmail] = useState<string | null>(
    getInitialValue('userEmail')
  );
  const [organizationName, setOrganizationName] = useState<string | null>(
    getInitialValue('organizationName')
  );
  const [subscriptionPlan, setSubscriptionPlan] = useState<string | null>(
    getInitialValue('subscriptionPlan')
  );
  const [userId, setUserId] = useState<string | null>(
    getInitialValue('userId')
  );

  // Listen for storage events from other tabs (logout detection)
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'accessToken' && event.newValue === null) {
        // Another tab logged out, log out this tab too
        logout();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const login = (token: string, userRole: string, email: string, org?: string, plan?: string, uid?: string) => {
    setAccessToken(token);
    setRole(userRole);
    setUserEmail(email);
    if (org) setOrganizationName(org);
    if (plan) setSubscriptionPlan(plan);
    if (uid) setUserId(uid);

    // Store ONLY in sessionStorage (tab-specific)
    try {
      sessionStorage.setItem('accessToken', token);
      sessionStorage.setItem('role', userRole);
      sessionStorage.setItem('userEmail', email);
      if (org) sessionStorage.setItem('organizationName', org);
      if (plan) sessionStorage.setItem('subscriptionPlan', plan);
      if (uid) sessionStorage.setItem('userId', uid);
    } catch (e) {
      console.error('Failed to save auth data to sessionStorage:', e);
    }
  };

  const logout = () => {
    setAccessToken(null);
    setRole(null);
    setUserEmail(null);
    setOrganizationName(null);
    setSubscriptionPlan(null);
    setUserId(null);

    // Clear from sessionStorage only
    try {
      sessionStorage.removeItem('accessToken');
      sessionStorage.removeItem('role');
      sessionStorage.removeItem('userEmail');
      sessionStorage.removeItem('organizationName');
      sessionStorage.removeItem('subscriptionPlan');
      sessionStorage.removeItem('userId');
    } catch (e) {
      console.error('Failed to clear auth data from sessionStorage:', e);
    }
  };

  const isAuthenticated = !!accessToken;

  return (
    <AuthContext.Provider
      value={{
        accessToken,
        role,
        userEmail,
        organizationName,
        subscriptionPlan,
        userId,
        login,
        logout,
        isAuthenticated,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
