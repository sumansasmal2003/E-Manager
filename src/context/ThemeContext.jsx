import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const ThemeContext = createContext();

// Helper: Hex to RGB array
const hexToRgb = (hex) => {
  const bigint = parseInt(hex.replace('#', ''), 16);
  return [(bigint >> 16) & 255, (bigint >> 8) & 255, bigint & 255];
};

// Helper: RGB array to Hex string
const rgbToHex = (r, g, b) => {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
};

// Helper: Mix two colors
const mix = (color1, color2, weight) => {
  const w = weight;
  const w1 = 1 - w;
  const r = Math.round(color1[0] * w1 + color2[0] * w);
  const g = Math.round(color1[1] * w1 + color2[1] * w);
  const b = Math.round(color1[2] * w1 + color2[2] * w);
  return [r, g, b];
};

export const ThemeProvider = ({ children }) => {
  const { user } = useAuth();

  // 1. Theme State (Light / Dark / System)
  // Default to 'system' so it adapts to the user's OS preference automatically
  const [theme, setThemeState] = useState(() => localStorage.getItem('theme') || 'system');

  // Wrapper to save to localStorage automatically
  const setTheme = (newTheme) => {
    setThemeState(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  // 2. Branding State
  const [branding, setBranding] = useState({
    logoUrl: '',
    primaryColor: '#111827' // Default Zinc-900
  });

  // --- TOGGLE (Keep for backwards compatibility if needed) ---
  const toggleTheme = () => {
    setTheme(prev => {
      if (prev === 'light') return 'dark';
      if (prev === 'dark') return 'system';
      return 'light';
    });
  };

  // --- APPLY THEME LOGIC ---
  useEffect(() => {
    const root = window.document.documentElement;
    const removeDark = () => root.classList.remove('dark');
    const addDark = () => root.classList.add('dark');

    if (theme === 'system') {
      // Check system preference
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

      // Apply immediately
      if (mediaQuery.matches) addDark();
      else removeDark();

      // Listen for system changes (e.g. sunset on Mac/Windows)
      const handler = (e) => {
        if (e.matches) addDark();
        else removeDark();
      };

      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);

    } else {
      // Manual Override
      if (theme === 'dark') addDark();
      else removeDark();
    }
  }, [theme]);

  // --- SYNC BRANDING ---
  useEffect(() => {
    if (user?.branding) {
      setBranding({
        logoUrl: user.branding.logoUrl || '',
        primaryColor: user.branding.primaryColor || '#111827'
      });
    } else {
      setBranding({ logoUrl: '', primaryColor: '#111827' });
    }
  }, [user]);

  // --- GENERATE PALETTE ---
  useEffect(() => {
    const root = document.documentElement;
    const base = hexToRgb(branding.primaryColor);
    const white = [255, 255, 255];
    const black = [0, 0, 0];

    // Set Main Primary Variable
    root.style.setProperty('--brand-primary', branding.primaryColor);

    // Generate Scale
    const shades = {
      50:  mix(base, white, 0.98),
      100: mix(base, white, 0.95),
      200: mix(base, white, 0.90),
      300: mix(base, white, 0.80),
      400: mix(base, white, 0.60),
      500: mix(base, white, 0.40),
      600: mix(base, white, 0.20),
      700: base,
      800: mix(base, black, 0.20),
      900: mix(base, black, 0.40),
      950: mix(base, black, 0.60)
    };

    // Apply Brand Variables
    Object.entries(shades).forEach(([key, rgb]) => {
      root.style.setProperty(`--brand-${key}`, rgbToHex(...rgb));
    });

  }, [branding.primaryColor]);

  const value = { theme, setTheme, toggleTheme, branding, setBranding };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
