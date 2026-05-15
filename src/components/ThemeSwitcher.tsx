import { useTheme } from '../contexts/ThemeContext';
import { Language } from '../i18n';

export default function ThemeSwitcher({ language }: { language: Language }) {
  const { theme, setTheme, themes } = useTheme();

  return (
    <div className="flex flex-wrap gap-1.5">
      {themes.map((t) => (
        <button
          key={t.name}
          onClick={() => setTheme(t.name)}
          title={language === 'zh' ? t.labelZh : t.label}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all border ${
            theme === t.name
              ? 'border-[var(--t-accent)] text-[var(--t-accent)] bg-[var(--t-primary-subtle)]'
              : 'border-[var(--t-border)] text-[var(--t-muted)] hover:border-[var(--t-accent)] hover:text-[var(--t-accent)]'
          }`}
        >
          <span
            className="w-2 h-2 rounded-full shrink-0"
            style={{ backgroundColor: t.dot }}
          />
          {language === 'zh' ? t.labelZh : t.label}
        </button>
      ))}
    </div>
  );
}
