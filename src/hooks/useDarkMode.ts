import { useState, useEffect } from 'react';
import { readStorage, writeStorage } from '../lib/storage';

export function useDarkMode() {
  const [isDark, setIsDark] = useState(() => {
    const saved = readStorage('ml-lab-dark-mode');
    if (saved !== null) return saved === 'true';
    return true;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    writeStorage('ml-lab-dark-mode', String(isDark));
  }, [isDark]);

  const toggle = () => setIsDark(prev => !prev);

  return { isDark, toggle };
}
