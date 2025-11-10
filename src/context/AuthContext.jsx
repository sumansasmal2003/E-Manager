import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // To check if user is logged in on load

  useEffect(() => {
    // Check local storage for user data on initial app load
    try {
      const storedUser = localStorage.getItem('eManagerUser');
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);

        // --- ADD THIS BLOCK ---
        // For backwards compatibility
        if (parsedUser.connecteamAccounts === undefined) {
          parsedUser.connecteamAccounts = [];
        }
        // --- END BLOCK ---

        setUser(parsedUser);
      }
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
      localStorage.removeItem('eManagerUser');
    }
    setLoading(false);
  }, []);

  const login = (userData) => {
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
    token: user?.token, // Easy access to token
    connecteamAccounts: user?.connecteamAccounts || [],
    isLoggedIn: !!user,
    loading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
