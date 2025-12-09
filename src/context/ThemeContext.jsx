import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const ThemeContext = createContext();

// --- COLOR UTILITIES ---

// Convert Hex to RGB Array
const hexToRgb = (hex) => {
  const bigint = parseInt(hex.replace('#', ''), 16);
  return [(bigint >> 16) & 255, (bigint >> 8) & 255, bigint & 255];
};

// Convert RGB Array to Hex String
const rgbToHex = (r, g, b) => {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
};

// Mix two colors (Standard weighted mix)
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

  const [branding, setBranding] = useState({
    logoUrl: '',
    primaryColor: '#111827' // Default: Zinc-900
  });

  // 1. SYNC WITH USER STATE
  useEffect(() => {
    if (user?.branding) {
      // Apply User Branding
      setBranding({
        logoUrl: user.branding.logoUrl || '',
        primaryColor: user.branding.primaryColor || '#111827'
      });
    } else {
      // Reset to Defaults (Logout)
      setBranding({
        logoUrl: '',
        primaryColor: '#111827'
      });
    }
  }, [user]);

  // 2. GENERATE & INJECT CSS VARIABLES
  useEffect(() => {
    const root = document.documentElement;
    const base = hexToRgb(branding.primaryColor);
    const white = [255, 255, 255];
    const black = [0, 0, 0];

    // Set the main primary variable (used by text-primary, bg-primary)
    root.style.setProperty('--brand-primary', branding.primaryColor);

    // Generate gradients based on the primary color (treated as the '900' shade)
    const shades = {
      50:  mix(base, white, 0.98), // 98% White
      100: mix(base, white, 0.96), // 96% White
      200: mix(base, white, 0.90), // 90% White
      300: mix(base, white, 0.80),
      400: mix(base, white, 0.60),
      500: mix(base, white, 0.40),
      600: mix(base, white, 0.25),
      700: mix(base, white, 0.15),
      800: mix(base, white, 0.05), // 5% White (Dark)
      900: base,                   // The selected color
      950: mix(base, black, 0.20)  // 20% Black (Darker)
    };

    // Inject all shades as CSS variables
    Object.entries(shades).forEach(([key, rgb]) => {
      root.style.setProperty(`--brand-${key}`, rgbToHex(...rgb));
    });

  }, [branding.primaryColor]);

  // Provide setter so Settings Page can update it immediately
  const value = { branding, setBranding };

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
