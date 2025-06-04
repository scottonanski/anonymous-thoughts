// components/ThemeSwitcher.tsx
import { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

const THEME_LIGHT = 'bumblebee';
const THEME_DARK = 'business';
const LOCAL_STORAGE_KEY = 'theme'; // Consistent key for localStorage

const ThemeSwitcher = () => {
  const [currentTheme, setCurrentTheme] = useState<string | null>(null);

  // Effect to initialize theme from localStorage or system preference
  useEffect(() => {
    if (typeof window === 'undefined') {
      return; // Don't run on server
    }

    let initialTheme: string;
    const storedTheme = localStorage.getItem(LOCAL_STORAGE_KEY);

    if (storedTheme === THEME_LIGHT || storedTheme === THEME_DARK) {
      initialTheme = storedTheme;
    } else {
      // No valid theme in localStorage, use system preference
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      initialTheme = systemPrefersDark ? THEME_DARK : THEME_LIGHT;
    }
    
    // Apply the determined theme
    document.documentElement.setAttribute('data-theme', initialTheme);
    localStorage.setItem(LOCAL_STORAGE_KEY, initialTheme); // Ensure localStorage is up to date
    setCurrentTheme(initialTheme); // Update React state

    // Optional: Listen for changes from other tabs
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === LOCAL_STORAGE_KEY && event.newValue) {
        if (event.newValue === THEME_LIGHT || event.newValue === THEME_DARK) {
          document.documentElement.setAttribute('data-theme', event.newValue);
          setCurrentTheme(event.newValue);
        }
      }
    };
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []); // Empty dependency array: runs once on mount

  // Function to change the theme
  const setTheme = (themeToSet: string) => {
    if (themeToSet !== THEME_LIGHT && themeToSet !== THEME_DARK) {
      console.warn(`Attempted to set invalid theme: ${themeToSet}`);
      return;
    }
    document.documentElement.setAttribute('data-theme', themeToSet);
    localStorage.setItem(LOCAL_STORAGE_KEY, themeToSet);
    setCurrentTheme(themeToSet);
  };

  // Don't render anything until the theme is determined client-side
  if (!currentTheme) {
    return null;
  }

  const showSunButton = currentTheme === THEME_DARK;
  const showMoonButton = currentTheme === THEME_LIGHT;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {showSunButton && (
        <button
          className="btn btn-circle btn-ghost inline-flex"
          onClick={() => setTheme(THEME_LIGHT)} // Directly call setTheme
          aria-label={`Switch to ${THEME_LIGHT} (light) theme`}
          title={`Switch to ${THEME_LIGHT} (light) theme`}
        >
          <Sun className="w-5 h-5" />
        </button>
      )}

      {showMoonButton && (
        <button
          className="btn btn-circle btn-ghost inline-flex"
          onClick={() => setTheme(THEME_DARK)} // Directly call setTheme
          aria-label={`Switch to ${THEME_DARK} (dark) theme`}
          title={`Switch to ${THEME_DARK} (dark) theme`}
        >
          <Moon className="w-5 h-5" />
        </button>
      )}
    </div>
  );
};

export default ThemeSwitcher;
