'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { Search, X, Command } from 'lucide-react';

interface SearchBarProps {
  onSearch?: (query: string) => void;
  placeholder?: string;
}

export function SearchBar({ onSearch, placeholder = '검색...' }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    onSearch?.(value);
  }, [onSearch]);

  const handleClear = useCallback(() => {
    setQuery('');
    onSearch?.('');
    inputRef.current?.focus();
  }, [onSearch]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === 'Escape' && document.activeElement === inputRef.current) {
        inputRef.current?.blur();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div
      className={`
        relative flex items-center gap-2 px-3 py-1.5 rounded-lg
        bg-[var(--bg-tertiary)] border transition-all duration-150
        ${isFocused
          ? 'border-[var(--accent)] ring-2 ring-[var(--ring-color)] bg-[var(--bg-primary)]'
          : 'border-transparent hover:border-[var(--border)]'
        }
      `}
    >
      <Search className={`w-4 h-4 shrink-0 transition-colors ${isFocused ? 'text-[var(--accent)]' : 'text-[var(--text-tertiary)]'}`} />
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={handleChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={placeholder}
        className="flex-1 bg-transparent outline-none text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] min-w-0"
      />
      {query ? (
        <button
          onClick={handleClear}
          className="p-0.5 rounded hover:bg-[var(--bg-hover)] text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-colors"
          aria-label="검색어 지우기"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      ) : (
        <kbd className="hidden sm:flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] text-[var(--text-tertiary)] bg-[var(--bg-secondary)] rounded border border-[var(--border-light)]">
          <Command className="w-2.5 h-2.5" />
          <span>K</span>
        </kbd>
      )}
    </div>
  );
}
