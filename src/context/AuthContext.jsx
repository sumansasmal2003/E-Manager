import React, { createContext, useContext, useState, useEffect } from 'react';

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

        // ... (existing backwards compatibility checks)
        if (parsedUser.connecteamAccounts === undefined) {
          parsedUser.connecteamAccounts = [];
        }
        if (parsedUser.googleCalendarConnected === undefined) {
          parsedUser.googleCalendarConnected = false;
        }
        if (parsedUser.companyName === undefined) parsedUser.companyName = '';
        if (parsedUser.companyAddress === undefined) parsedUser.companyAddress = '';
        if (parsedUser.companyWebsite === undefined) parsedUser.companyWebsite = '';
        if (parsedUser.ceoName === undefined) parsedUser.ceoName = '';
        if (parsedUser.hrName === undefined) parsedUser.hrName = '';
        if (parsedUser.hrEmail === undefined) parsedUser.hrEmail = '';

        // --- ADD DEFAULT FOR createdAt ---
        if (parsedUser.createdAt === undefined) {
          parsedUser.createdAt = null; // Use null as a fallback
        }
        // --- END DEFAULT ---

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

  const login = (userData) => {
    const hasBeenOnboarded = localStorage.getItem('eManagerOnboarded') === 'true';
    if (!hasBeenOnboarded) {
      setIsFirstLogin(true);
      localStorage.setItem('eManagerOnboarded', 'true');
    }
    // Store user data in state and local storage
    localStorage.setItem('eManagerUser', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    // Remove user data
    localStorage.removeItem('eManagerUser');
    setUser(null);
  };

  const value = {
    user,
    token: user?.token,
    connecteamAccounts: user?.connecteamAccounts || [],
    isLoggedIn: !!user,
    loading,
    login,
    logout,
    isFirstLogin,
    companyName: user?.companyName || '',
    companyAddress: user?.companyAddress || '',
    companyWebsite: user?.companyWebsite || '',
    ceoName: user?.ceoName || '',
    hrName: user?.hrName || '',
    hrEmail: user?.hrEmail || '',
    // No need to expose createdAt here, components can get it from the 'user' object
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
