import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFirstLogin, setIsFirstLogin] = useState(false);

  useEffect(() => {
    // Check local storage for user data on initial app load
    try {
      const storedUser = localStorage.getItem('eManagerUser');
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);

        // Backwards compatibility: Ensure specific fields exist
        if (parsedUser.connecteamAccounts === undefined) parsedUser.connecteamAccounts = [];
        if (parsedUser.googleCalendarConnected === undefined) parsedUser.googleCalendarConnected = false;
        if (parsedUser.companyName === undefined) parsedUser.companyName = '';
        if (parsedUser.createdAt === undefined) parsedUser.createdAt = null;
        if (parsedUser.isTwoFactorEnabled === undefined) parsedUser.isTwoFactorEnabled = false;

        // Branding fallback
        if (!parsedUser.branding) {
           parsedUser.branding = { logoUrl: '', primaryColor: '#111827' };
        }

        setUser(parsedUser);

        const hasBeenOnboarded = localStorage.getItem('eManagerOnboarded') === 'true';
        if (!hasBeenOnboarded) {
          setIsFirstLogin(true);
          localStorage.setItem('eManagerOnboarded', 'true');
        }
      }
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
      localStorage.removeItem('eManagerUser');
    }
    setLoading(false);
  }, []);

  // --- LOGIN (Wrapped in useCallback to prevent infinite loops) ---
  const login = useCallback((userData) => {
    // Check onboarding status
    const hasBeenOnboarded = localStorage.getItem('eManagerOnboarded') === 'true';
    if (!hasBeenOnboarded) {
      setIsFirstLogin(true);
      localStorage.setItem('eManagerOnboarded', 'true');
    }

    // Ensure critical objects exist
    if (!userData.branding) {
      userData.branding = { logoUrl: '', primaryColor: '#111827' };
    }

    // Save to Storage & State
    localStorage.setItem('eManagerUser', JSON.stringify(userData));
    setUser(userData);
  }, []);

  // --- LOGOUT (Wrapped in useCallback) ---
  const logout = useCallback(() => {
    localStorage.removeItem('eManagerUser');
    setUser(null);
    // Note: ThemeContext listens to 'user' changing to null and will reset branding automatically
  }, []);

  const value = {
    user,
    token: user?.token,
    isLoggedIn: !!user,
    loading,
    login,
    logout,
    isFirstLogin,

    // Quick accessors (Optional, but helpful)
    companyName: user?.companyName || '',
    isTwoFactorEnabled: user?.isTwoFactorEnabled || false,
    branding: user?.branding || { logoUrl: '', primaryColor: '#111827' },
    role: user?.role || 'owner',
    permissions: user?.permissions || {},
    connecteamAccounts: user?.connecteamAccounts || [],
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
