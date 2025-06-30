import React, { createContext, useContext, useState, useEffect } from 'react';
import { IMPROVED_THEMES } from '../themes/improvedThemes';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Available color schemes - now using improved themes
export const THEMES = IMPROVED_THEMES;

export const ThemeProvider = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState(() => {
    const saved = localStorage.getItem('app-theme');
    return saved || 'classic';
  });

  const theme = THEMES[currentTheme.toUpperCase()] || THEMES.CLASSIC;

  const changeTheme = (themeId) => {
    setCurrentTheme(themeId);
    localStorage.setItem('app-theme', themeId);
  };

  // Apply CSS custom properties when theme changes
  useEffect(() => {
    const root = document.documentElement;
    Object.entries(theme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`, value);
    });
  }, [theme]);

  const value = {
    currentTheme,
    theme,
    themes: Object.values(THEMES),
    changeTheme
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};
