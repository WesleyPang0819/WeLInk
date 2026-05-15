import { Search } from 'lucide-react';

interface SearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  placeholder: string;
}

export default function SearchBar({ searchQuery, onSearchChange, placeholder }: SearchBarProps) {
  return (
    <div className="relative w-full max-w-md">
      <Search size={16} className="absolute left-3 top-2.5 text-[var(--t-faint)]" />
      <input
        type="text"
        placeholder={placeholder}
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        className="w-full bg-[var(--t-input)] border border-[var(--t-border)] rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--t-accent)] placeholder:text-[var(--t-faint)] text-[var(--t-text)] transition-all"
      />
    </div>
  );
}
