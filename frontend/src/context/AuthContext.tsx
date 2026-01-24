import React, { createContext, useContext, useState, type ReactNode } from 'react';

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
  // Use sessionStorage for tab-specific authentication instead of localStorage
  // This ensures each tab maintains its own session independently
  const [accessToken, setAccessToken] = useState<string | null>(
    sessionStorage.getItem('accessToken')
  );
  const [role, setRole] = useState<string | null>(
    sessionStorage.getItem('role')
  );
  const [userEmail, setUserEmail] = useState<string | null>(
    sessionStorage.getItem('userEmail')
  );
  const [organizationName, setOrganizationName] = useState<string | null>(
    sessionStorage.getItem('organizationName')
  );
  const [subscriptionPlan, setSubscriptionPlan] = useState<string | null>(
    sessionStorage.getItem('subscriptionPlan')
  );
  const [userId, setUserId] = useState<string | null>(
    sessionStorage.getItem('userId')
  );

  const login = (token: string, userRole: string, email: string, org?: string, plan?: string, uid?: string) => {
    setAccessToken(token);
    setRole(userRole);
    setUserEmail(email);
    if (org) setOrganizationName(org);
    if (plan) setSubscriptionPlan(plan);
    if (uid) setUserId(uid);

    // Store in sessionStorage for tab-specific authentication
    sessionStorage.setItem('accessToken', token);
    sessionStorage.setItem('role', userRole);
    sessionStorage.setItem('userEmail', email);
    if (org) sessionStorage.setItem('organizationName', org);
    if (plan) sessionStorage.setItem('subscriptionPlan', plan);
    if (uid) sessionStorage.setItem('userId', uid);
  };

  const logout = () => {
    setAccessToken(null);
    setRole(null);
    setUserEmail(null);
    setOrganizationName(null);
    setSubscriptionPlan(null);
    setUserId(null);

    sessionStorage.removeItem('accessToken');
    sessionStorage.removeItem('role');
    sessionStorage.removeItem('userEmail');
    sessionStorage.removeItem('organizationName');
    sessionStorage.removeItem('subscriptionPlan');
    sessionStorage.removeItem('userId');
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
