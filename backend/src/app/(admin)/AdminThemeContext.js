'use client';

import { createContext, useContext, useState, useEffect } from 'react';

const AdminThemeContext = createContext({
  theme: 'light',
  toggleTheme: () => {},
  setTheme: () => {},
  mounted: false,
});

export function AdminThemeProvider({ children }) {
  // Default to light mode (white & gold), seamlessly toggleable to dark mode (black & gold)
  const [theme, setTheme] = useState('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('hopefairy_admin_theme');
      if (saved === 'dark' || saved === 'light') {
        setTheme(saved);
      }
    } catch (e) {}
    setMounted(true);
  }, []);

  // Synchronize document.documentElement so Tailwind's dark: variant strictly matches active admin theme
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
      root.style.colorScheme = 'light';
    }

    return () => {
      // Restore public site theme preference when navigating away from admin
      try {
        const publicTheme = localStorage.getItem('hf-theme');
        if (publicTheme === 'dark') {
          root.classList.add('dark');
          root.classList.remove('light');
          root.style.colorScheme = 'dark';
        } else {
          root.classList.remove('dark');
          root.classList.add('light');
          root.style.colorScheme = 'light';
        }
      } catch (e) {}
    };
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      try {
        localStorage.setItem('hopefairy_admin_theme', next);
      } catch (e) {}
      return next;
    });
  };

  const setExplicitTheme = (newTheme) => {
    setTheme(newTheme);
    try {
      localStorage.setItem('hopefairy_admin_theme', newTheme);
    } catch (e) {}
  };

  return (
    <AdminThemeContext.Provider value={{ theme, toggleTheme, setTheme: setExplicitTheme, mounted }}>
      <div className={`admin-root min-h-screen ${theme === 'dark' ? 'admin-dark' : 'admin-light'}`}>
        {children}
      </div>
    </AdminThemeContext.Provider>
  );
}

export const useAdminTheme = () => useContext(AdminThemeContext);
