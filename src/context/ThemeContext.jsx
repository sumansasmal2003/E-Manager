import React, { createContext, useContext, useState, useEffect } from 'react';

// 1. Create the context
const ThemeContext = createContext();

// 2. Create the provider component
export const ThemeProvider = ({ children }) => {
  // Get theme from localStorage or default to 'light'
  const [theme, setTheme] = useState(
    () => localStorage.getItem('theme') || 'light'
  );

  useEffect(() => {
    const root = window.document.documentElement; // <html> tag

    // 1. Remove the old theme class
    const oldTheme = theme === 'dark' ? 'light' : 'dark';
    root.classList.remove(oldTheme);

    // 2. Add the new theme class
    root.classList.add(theme);

    // 3. Save the new theme to localStorage
    localStorage.setItem('theme', theme);
  }, [theme]); // Run this effect whenever 'theme' changes

  // Function to toggle the theme
  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// 3. Create a custom hook to use the context
export const useTheme = () => {
  return useContext(ThemeContext);
};
