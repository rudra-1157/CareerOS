import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const ThemeContext = createContext(null);

export const THEMES = [
  {
    id: 'teal-aqua',
    name: 'Deep Teal + Aqua',
    paletteName: 'Theme 1: Deep Teal + Aqua',
    description: 'Fresh, modern and vibrant with deep teal contrast and energetic aqua accents.',
    colors: ['#E6F7F6', '#D1FAE5', '#0D9488', '#5EEAD4', '#134E4A'],
    swatches: {
      bg: '#E6F7F6',
      surface: '#D1FAE5',
      primary: '#0D9488',
      accent: '#5EEAD4',
      text: '#134E4A'
    },
    isDark: false
  },
  {
    id: 'mist-steel',
    name: 'Mist Blue + Steel Blue',
    paletteName: 'Theme 2: Mist Blue + Steel Blue',
    description: 'Professional, clean, calm and trustworthy with warm neutral balance.',
    colors: ['#E9EFF5', '#D5E0E7', '#42647B', '#71899A', '#F5F3EE'],
    swatches: {
      bg: '#E9EFF5',
      surface: '#D5E0E7',
      primary: '#42647B',
      accent: '#71899A',
      neutral: '#F5F3EE'
    },
    isDark: false
  },
  {
    id: 'midnight-dark',
    name: 'Midnight Dark',
    paletteName: 'Theme 3: Midnight Dark',
    description: 'Sophisticated low-light workspace with slate surfaces and crisp blue accents.',
    colors: ['#171C24', '#202936', '#283443', '#5B8DEF', '#45B8A5', '#F1F5F9', '#AAB7C5', '#394656'],
    swatches: {
      bg: '#171C24',
      surface: '#202936',
      card: '#283443',
      primary: '#5B8DEF',
      accent: '#45B8A5',
      text: '#F1F5F9',
      border: '#394656'
    },
    isDark: true
  }
];

export const ThemeProvider = ({ children }) => {
  const [theme, setThemeState] = useState(() => {
    try {
      const saved = localStorage.getItem('careeros_theme');
      if (saved === 'teal-aqua' || saved === 'mist-steel' || saved === 'midnight-dark') {
        return saved;
      }
      // Migrate legacy 'dark' / 'light'
      if (saved === 'dark') return 'midnight-dark';
      if (saved === 'light') return 'teal-aqua';
      return 'teal-aqua';
    } catch {
      return 'teal-aqua';
    }
  });

  const applyThemeToDOM = useCallback((themeId) => {
    const root = document.documentElement;
    root.setAttribute('data-theme', themeId);
    
    if (themeId === 'midnight-dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, []);

  useEffect(() => {
    applyThemeToDOM(theme);
    try {
      localStorage.setItem('careeros_theme', theme);
    } catch {
      // Ignore localStorage errors
    }
  }, [theme, applyThemeToDOM]);

  const setTheme = (newTheme) => {
    if (newTheme === 'teal-aqua' || newTheme === 'mist-steel' || newTheme === 'midnight-dark') {
      setThemeState(newTheme);
      // Optional async sync to backend if token exists
      const token = localStorage.getItem('careeros_token') || sessionStorage.getItem('careeros_token');
      if (token) {
        try {
          const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';
          const formData = new FormData();
          formData.append('theme', newTheme);
          fetch(`${apiBase}/student/theme`, {
            method: 'PUT',
            headers: { Authorization: `Bearer ${token}` },
            body: formData
          }).catch(() => {});
        } catch {}
      }
    }
  };

  const cycleTheme = () => {
    setThemeState(current => {
      if (current === 'teal-aqua') return 'mist-steel';
      if (current === 'mist-steel') return 'midnight-dark';
      return 'teal-aqua';
    });
  };

  const isDark = theme === 'midnight-dark';

  return (
    <ThemeContext.Provider value={{ theme, setTheme, cycleTheme, toggleTheme: cycleTheme, isDark, availableThemes: THEMES }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export default ThemeContext;
