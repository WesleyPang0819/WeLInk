import { Category } from './types';

export const CATEGORIES: Category[] = [
  'All',
  'Design',
  'AI Tools',
  'Client Work',
  'Inspiration',
  'Learning',
  'Other'
];

export const CATEGORY_COLORS: Record<Exclude<Category, 'All'>, string> = {
  'Design': 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  'AI Tools': 'text-purple-400 bg-purple-500/10 border-purple-500/20',
  'Client Work': 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  'Inspiration': 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  'Learning': 'text-rose-400 bg-rose-500/10 border-rose-500/20',
  'Other': 'text-zinc-400 bg-zinc-500/10 border-zinc-500/20'
};
