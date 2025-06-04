// components/ThemeSwitcher.tsx
import { useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';
import { themeChange } from 'theme-change';

const ThemeSwitcher = () => {
  useEffect(() => {
    themeChange(false); // false means we'll manually initialize the theme
    
    // Set initial theme based on system preference or saved preference
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (!savedTheme) {
      // If no saved preference, use system preference
      document.documentElement.setAttribute('data-theme', systemPrefersDark ? 'business' : 'bumblebee');
    }
  }, []);

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        className="btn btn-circle btn-ghost"
        data-set-theme="business"
        data-act-class="hidden"
        data-toggle-theme="business"
      >
        <Sun className="w-5 h-5" />
      </button>
      <button
        className="btn btn-circle btn-ghost hidden"
        data-set-theme="bumblebee"
        data-act-class="hidden"
        data-toggle-theme="bumblebee"
      >
        <Moon className="w-5 h-5" />
      </button>
    </div>
  );
};

export default ThemeSwitcher;

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
