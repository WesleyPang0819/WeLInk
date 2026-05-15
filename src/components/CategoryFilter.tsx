import { Category } from '../types';
import { CATEGORIES } from '../constants';
import { motion } from 'motion/react';
import { Language, getCategoryName } from '../i18n';

interface CategoryFilterProps {
  selectedCategory: Category;
  onSelectCategory: (category: Category) => void;
  language: Language;
}

const DOT_COLORS: Record<Category, string> = {
  'All': 'bg-indigo-400',
  'Design': 'bg-blue-400',
  'AI Tools': 'bg-purple-400',
  'Client Work': 'bg-emerald-400',
  'Inspiration': 'bg-amber-400',
  'Learning': 'bg-rose-400',
  'Other': 'bg-zinc-400'
};

export default function CategoryFilter({ selectedCategory, onSelectCategory, language }: CategoryFilterProps) {
  return (
    <nav className="flex flex-col gap-1">
      {CATEGORIES.map((category) => (
        <button
          key={category}
          onClick={() => onSelectCategory(category)}
          className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all relative group ${
            selectedCategory === category
              ? 'bg-[var(--t-surface-2)] text-[var(--t-accent)] shadow-sm'
              : 'text-[var(--t-muted)] hover:bg-[var(--t-surface-2)] hover:text-[var(--t-text)]'
          }`}
        >
          <div className={`w-1.5 h-1.5 rounded-full ${DOT_COLORS[category]}`}></div>
          {getCategoryName(category, language)}

          {selectedCategory === category && (
            <motion.div
              layoutId="active-nav"
              className="absolute left-0 w-0.5 h-4 bg-[var(--t-primary)] rounded-full"
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            />
          )}
        </button>
      ))}
    </nav>
  );
}
