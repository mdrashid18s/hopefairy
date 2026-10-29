'use client';

import { createContext, useCallback, useContext, useMemo, useSyncExternalStore } from 'react';

const ThemeContext = createContext({ theme: 'light', toggle: () => {}, setTheme: () => {} });
// Renamed from 'hf_theme' when light became the default, so an older
// auto-saved 'dark' value doesn't pin returning visitors to dark.
const STORAGE_KEY = 'hf-theme';

/*
 * The `.dark` class on <html> is the single source of truth. Light is the
 * default (server-rendered without `.dark` in app/layout.js); the inline
 * script there adds it before hydration for returning dark-theme visitors,
 * so there's no flash and nothing to sync in an effect.
 */
const listeners = new Set();
const subscribe = (cb) => {
  listeners.add(cb);
  return () => listeners.delete(cb);
};
const getSnapshot = () =>
  document.documentElement.classList.contains('dark') ? 'dark' : 'light';
const getServerSnapshot = () => 'light';

function applyTheme(theme) {
  const root = document.documentElement;
  root.classList.toggle('dark', theme === 'dark');
  root.style.colorScheme = theme;
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    /* ignore */
  }
  listeners.forEach((cb) => cb());
}

export function ThemeProvider({ children }) {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const toggle = useCallback(() => applyTheme(getSnapshot() === 'dark' ? 'light' : 'dark'), []);
  const value = useMemo(() => ({ theme, setTheme: applyTheme, toggle }), [theme, toggle]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => useContext(ThemeContext);
