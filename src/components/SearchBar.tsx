import { Search, Globe } from 'lucide-react';

interface SearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  placeholder: string;
}

export default function SearchBar({ searchQuery, onSearchChange, placeholder }: SearchBarProps) {
  return (
    <div className="relative w-full max-w-md">
      <Search size={16} className="absolute left-3 top-2.5 text-zinc-500" />
      <input
        type="text"
        placeholder={placeholder}
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        className="w-full bg-zinc-800/50 border border-zinc-700/50 rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500/50 placeholder-zinc-500 text-zinc-200 transition-all"
      />
    </div>
  );
}
