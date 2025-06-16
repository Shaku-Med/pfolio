'use client';

import { useEffect } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeProps {
  theme: Theme;
}

export default function Theme({ theme }: ThemeProps) {
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }
  }, [theme]);

  return null;
} 