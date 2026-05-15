import { createContext, useContext, useEffect, useState } from 'react';

export type ThemeName = 'dark-tech' | 'cream' | 'cute' | 'minimal' | 'cyber-blue';

export interface ThemePreset {
  name: ThemeName;
  label: string;
  labelZh: string;
  dot: string;
  metaColor: string;
}

export const THEMES: ThemePreset[] = [
  { name: 'dark-tech',  label: 'Dark Tech',   labelZh: '科技暗黑', dot: '#818cf8', metaColor: '#09090b' },
  { name: 'cream',      label: 'Cream',        labelZh: '奶油风',   dot: '#8b6914', metaColor: '#faf7f2' },
  { name: 'cute',       label: 'Cute',         labelZh: '可爱风',   dot: '#d4479e', metaColor: '#fdf0f8' },
  { name: 'minimal',    label: 'Minimal',      labelZh: '极简',     dot: '#374151', metaColor: '#ffffff' },
  { name: 'cyber-blue', label: 'Cyber Blue',   labelZh: '赛博蓝',   dot: '#00aaff', metaColor: '#020b18' },
];

const STORAGE_KEY = 'welink-theme';
const DEFAULT_THEME: ThemeName = 'dark-tech';

interface ThemeContextValue {
  theme: ThemeName;
  setTheme: (name: ThemeName) => void;
  themes: ThemePreset[];
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: DEFAULT_THEME,
  setTheme: () => {},
  themes: THEMES,
});

function applyTheme(name: ThemeName) {
  document.documentElement.setAttribute('data-theme', name);
  const preset = THEMES.find(t => t.name === name);
  if (preset) {
    const meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
    if (meta) meta.content = preset.metaColor;
  }
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeName>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as ThemeName;
      return THEMES.some(t => t.name === saved) ? saved : DEFAULT_THEME;
    } catch {
      return DEFAULT_THEME;
    }
  });

  useEffect(() => {
    applyTheme(theme);
  }, []);

  const setTheme = (name: ThemeName) => {
    setThemeState(name);
    applyTheme(name);
    try { localStorage.setItem(STORAGE_KEY, name); } catch {}
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, themes: THEMES }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
