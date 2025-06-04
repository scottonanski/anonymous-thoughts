// components/ThemeSwitcher.tsx
import { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';
import { themeChange } from 'theme-change';

const THEME_LIGHT = 'bumblebee';
const THEME_DARK = 'business'; 

const ThemeSwitcher = () => {

  const [currentTheme, setCurrentTheme] = useState<string | null>(null);

  useEffect(() => {

    if (typeof window !== 'undefined' && !localStorage.getItem('theme')) {
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      localStorage.setItem('theme', systemPrefersDark ? THEME_DARK : THEME_LIGHT);
    }


    themeChange(false);

    const initialThemeOnDocument = document.documentElement.getAttribute('data-theme') || THEME_LIGHT;
    setCurrentTheme(initialThemeOnDocument);
    

    const handleThemeChange = (event: CustomEvent) => {
      if (event.detail && event.detail.theme) {
        setCurrentTheme(event.detail.theme);
      }
    };
    document.documentElement.addEventListener('data-theme-changed', handleThemeChange as EventListener);

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'theme' && event.newValue) {

        document.documentElement.setAttribute('data-theme', event.newValue);
        setCurrentTheme(event.newValue);
      }
    };
    window.addEventListener('storage', handleStorageChange);

    return () => {
      document.documentElement.removeEventListener('data-theme-changed', handleThemeChange as EventListener);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  if (!currentTheme) {
    return null;
  }

  const showSunButton = currentTheme === THEME_DARK;
  const showMoonButton = currentTheme === THEME_LIGHT;

  return (
    <div className="fixed bottom-4 right-4 z-50">

      <button
        className={`btn btn-circle btn-ghost ${showSunButton ? 'inline-flex' : 'hidden'}`}
        data-set-theme={THEME_LIGHT}
        aria-label={`Switch to ${THEME_LIGHT} (light) theme`}
        title={`Switch to ${THEME_LIGHT} (light) theme`}
      >
        <Sun className="w-5 h-5" />
      </button>

      <button
        className={`btn btn-circle btn-ghost ${showMoonButton ? 'inline-flex' : 'hidden'}`}
        data-set-theme={THEME_DARK}
        aria-label={`Switch to ${THEME_DARK} (dark) theme`}
        title={`Switch to ${THEME_DARK} (dark) theme`}
      >
        <Moon className="w-5 h-5" />
      </button>
    </div>
  );
};

export default ThemeSwitcher;
