import { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';
import { themeChange } from 'theme-change';

// IMPORTANT: Ensure these theme names EXACTLY match your DaisyUI/theme setup
const THEME_LIGHT = 'bumblebee';
const THEME_DARK = 'business';

const ThemeSwitcher = () => {
  const [currentTheme, setCurrentTheme] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    let themeToInitializeWith: string;
    const storedTheme = localStorage.getItem('theme');

    if (storedTheme && (storedTheme === THEME_LIGHT || storedTheme === THEME_DARK)) {
      themeToInitializeWith = storedTheme;
    } else {
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      themeToInitializeWith = systemPrefersDark ? THEME_DARK : THEME_LIGHT;
      localStorage.setItem('theme', themeToInitializeWith);
    }

    // Initialize theme-change
    themeChange(false);

    let initialThemeForState: string;
    const themeOnDocument = document.documentElement.getAttribute('data-theme');

    if (themeOnDocument && (themeOnDocument === THEME_LIGHT || themeOnDocument === THEME_DARK)) {
      initialThemeForState = themeOnDocument;
    } else {
      document.documentElement.setAttribute('data-theme', themeToInitializeWith);
      initialThemeForState = themeToInitializeWith;
    }

    setCurrentTheme(initialThemeForState);

    // Re-initialize theme-change after buttons are rendered
    themeChange();

    const handleThemeChange = (event: Event) => {
      const customEvent = event as CustomEvent<{ theme: string }>;
      if (customEvent.detail && customEvent.detail.theme) {
        setCurrentTheme(customEvent.detail.theme);
      }
    };

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'theme' && event.newValue) {
        if (event.newValue === THEME_LIGHT || event.newValue === THEME_DARK) {
          document.documentElement.setAttribute('data-theme', event.newValue);
          setCurrentTheme(event.newValue);
        }
      }
    };

    document.documentElement.addEventListener('data-theme-changed', handleThemeChange);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      document.documentElement.removeEventListener('data-theme-changed', handleThemeChange);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  if (typeof window === 'undefined' || !currentTheme) {
    return null;
  }

  const showSunButton = currentTheme === THEME_DARK;
  const showMoonButton = currentTheme === THEME_LIGHT;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {showSunButton && (
        <button
          className="btn btn-circle btn-ghost inline-flex"
          data-set-theme={THEME_LIGHT}
          data-act-class="btn-active"
          aria-label={`Switch to ${THEME_LIGHT} (light) theme`}
          title={`Switch to ${THEME_LIGHT} (light) theme`}
        >
          <Sun className="w-5 h-5" />
        </button>
      )}
      {showMoonButton && (
        <button
          className="btn btn-circle btn-ghost inline-flex"
          data-set-theme={THEME_DARK}
          data-act-class="btn-active"
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
