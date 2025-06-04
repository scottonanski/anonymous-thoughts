// components/ThemeSwitcher.tsx
import { useEffect, useState } from 'react'; // Make sure useState is imported
import { Sun, Moon } from 'lucide-react';
import { themeChange } from 'theme-change';

// IMPORTANT: Ensure these theme names EXACTLY match your DaisyUI/theme setup
const THEME_LIGHT = 'bumblebee';
const THEME_DARK = 'business';

const ThemeSwitcher = () => {
  const [currentTheme, setCurrentTheme] = useState<string | null>(null);
  // To debug, you can uncomment the console.logs
  // console.log(`ThemeSwitcher rendering. currentTheme: "${currentTheme}"`);

  useEffect(() => {
    // This effect runs once on component mount (client-side only).
    // console.log('ThemeSwitcher useEffect running.');

    // Ensure this code only runs on the client-side
    if (typeof window === 'undefined') {
      return;
    }

    let themeToInitializeWith: string;

    // 1. Determine the theme that should be active.
    const storedTheme = localStorage.getItem('theme');

    if (storedTheme && (storedTheme === THEME_LIGHT || storedTheme === THEME_DARK)) {
      themeToInitializeWith = storedTheme;
      // console.log(`Using stored theme: "${themeToInitializeWith}"`);
    } else {
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      themeToInitializeWith = systemPrefersDark ? THEME_DARK : THEME_LIGHT;
      // console.log(`No valid stored theme. Using system preference: "${themeToInitializeWith}"`);
      localStorage.setItem('theme', themeToInitializeWith);
    }

    // 2. Initialize `theme-change`.
    themeChange(false);
    // console.log('themeChange(false) called.');

    // 3. Set the initial React state and ensure document.documentElement has data-theme
    let initialThemeForState: string;
    const themeOnDocument = document.documentElement.getAttribute('data-theme');

    if (themeOnDocument && (themeOnDocument === THEME_LIGHT || themeOnDocument === THEME_DARK)) {
      // console.log(`Initial data-theme on <html> after themeChange(): "${themeOnDocument}"`);
      initialThemeForState = themeOnDocument;
    } else {
      // Fallback: If theme-change didn't set data-theme correctly or it was an unexpected theme
      // console.warn(`data-theme on <html> was "${themeOnDocument}". Forcing to "${themeToInitializeWith}" and using for state.`);
      document.documentElement.setAttribute('data-theme', themeToInitializeWith);
      initialThemeForState = themeToInitializeWith;
    }
    
    setCurrentTheme(initialThemeForState);
    // console.log(`setCurrentTheme with: "${initialThemeForState}"`);
    
    // 4. Listen for theme changes.
    const handleThemeChange = (event: Event) => {
      const customEvent = event as CustomEvent<{ theme: string }>;
      if (customEvent.detail && customEvent.detail.theme) {
        // console.log(`'data-theme-changed' event. New theme: "${customEvent.detail.theme}"`);
        setCurrentTheme(customEvent.detail.theme);
      }
    };

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'theme' && event.newValue) {
        // console.log(`Storage event for 'theme'. New value: "${event.newValue}"`);
        if (event.newValue === THEME_LIGHT || event.newValue === THEME_DARK) {
            document.documentElement.setAttribute('data-theme', event.newValue);
            setCurrentTheme(event.newValue);
        }
      }
    };

    document.documentElement.addEventListener('data-theme-changed', handleThemeChange);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      // console.log('ThemeSwitcher cleanup.');
      document.documentElement.removeEventListener('data-theme-changed', handleThemeChange);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []); // Empty dependency array: runs once on mount.

  // Guard against rendering on server or before theme is determined.
  if (typeof window === 'undefined' || !currentTheme) {
    // console.log('currentTheme is null or window is undefined, rendering null.');
    return null;
  }

  const showSunButton = currentTheme === THEME_DARK;
  const showMoonButton = currentTheme === THEME_LIGHT; // Or currentTheme !== THEME_DARK if you want a default

  // console.log(`Button visibility: currentTheme="${currentTheme}", showSunButton=${showSunButton}, showMoonButton=${showMoonButton}`);

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Button to set Light Theme (Sun icon) */}
      {showSunButton && (
        <button
          className="btn btn-circle btn-ghost inline-flex" // Always inline-flex when shown
          data-set-theme={THEME_LIGHT}
          aria-label={`Switch to ${THEME_LIGHT} (light) theme`}
          title={`Switch to ${THEME_LIGHT} (light) theme`}
        >
          <Sun className="w-5 h-5" />
        </button>
      )}

      {/* Button to set Dark Theme (Moon icon) */}
      {showMoonButton && (
        <button
          className="btn btn-circle btn-ghost inline-flex" // Always inline-flex when shown
          data-set-theme={THEME_DARK}
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
