'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Link } from 'next-view-transitions';
import { Search, X, Loader2, ChevronDown } from 'lucide-react';

interface MatchSnippet {
  line: string;
  matchIndex: number;
  matchLength: number;
}

interface SearchItem {
  title: string;
  description: string;
  slug: string;
  type: 'Blog' | 'Project' | 'Creativity';
  href: string;
  matches: MatchSnippet[];
}

export function SearchDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [results, setResults] = useState<SearchItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Listen for Cmd+K or Ctrl+K and Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Listen for trigger events from other components
  useEffect(() => {
    const handleOpenSearch = () => setIsOpen(true);
    window.addEventListener('open-global-search', handleOpenSearch);
    return () => window.removeEventListener('open-global-search', handleOpenSearch);
  }, []);

  // Auto-focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      document.body.style.overflow = '';
      setQuery('');
      setResults([]);
    }
  }, [isOpen]);

  // Click outside filter dropdown to close it
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced API call
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const delayDebounceFn = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}&type=${filterType}`);
        const data = await res.json();
        setResults(data.results || []);
      } catch (err) {
        console.error('Search error:', err);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 250);

    return () => clearTimeout(delayDebounceFn);
  }, [query, filterType]);

  if (!isOpen) return null;

  const escapeRegExp = (str: string) => {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  };

  const HighlightText = ({ text, highlight }: { text: string; highlight: string }) => {
    if (!highlight.trim()) return <>{text}</>;
    const regex = new RegExp(`(${escapeRegExp(highlight)})`, 'gi');
    const parts = text.split(regex);
    return (
      <>
        {parts.map((part, i) =>
          regex.test(part) ? (
            <mark
              key={i}
              className="mx-0.5 rounded bg-amber-500/90 px-1 py-0.2 text-black font-semibold inline-block leading-none text-sm align-middle"
            >
              {part}
            </mark>
          ) : (
            part
          )
        )}
      </>
    );
  };

  const getFilterLabel = (type: string) => {
    switch (type) {
      case 'blog':
        return 'Blog';
      case 'projects':
        return 'Projects';
      case 'creativities':
        return 'Creativities';
      default:
        return 'All';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 pt-[15vh] backdrop-blur-sm animate-in fade-in duration-200">
      {/* Click outside overlay to close */}
      <div className="fixed inset-0 cursor-default" onClick={() => setIsOpen(false)} />

      {/* Search Card */}
      <div className="relative w-full max-w-2xl overflow-hidden rounded-xl border border-white/10 bg-neutral-900 shadow-2xl transition-all max-h-[60vh] flex flex-col">
        {/* Search Input Area */}
        <div className="flex items-center px-4 py-4">
          <Search className="mr-3 h-5 w-5 text-neutral-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search posts, projects and content..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-white placeholder-neutral-500 outline-none text-base"
          />
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin text-neutral-400 mr-2 shrink-0" />
          ) : null}
          <div className="flex items-center gap-1 text-[10px] text-neutral-400 border border-white/15 bg-white/5 rounded px-1.5 py-0.5 font-mono select-none">
            ESC
          </div>
        </div>

        {/* Separator */}
        <div className="h-px bg-white/10 w-full" />

        {/* Filter Area */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-white/5 bg-neutral-900/50 shrink-0">
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white transition-colors"
            >
              <span>Filter</span>
              <span className="font-semibold text-white">{getFilterLabel(filterType)}</span>
              <ChevronDown className="h-3 w-3" />
            </button>

            {showDropdown && (
              <div className="absolute left-0 mt-1 z-10 w-36 rounded-md border border-white/10 bg-neutral-950 p-1 shadow-lg animate-in slide-in-from-top-1 duration-150">
                {['all', 'blog', 'projects', 'creativities'].map((type) => (
                  <button
                    key={type}
                    onClick={() => {
                      setFilterType(type);
                      setShowDropdown(false);
                    }}
                    className={`w-full text-left rounded px-2 py-1 text-xs transition-colors hover:bg-white/10 ${
                      filterType === type ? 'text-amber-400 font-medium' : 'text-neutral-300'
                    }`}
                  >
                    {getFilterLabel(type)}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Search Results Area */}
        <div className="overflow-y-auto flex-1 p-2 space-y-4">
          {query.trim() === '' ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Search className="h-8 w-8 text-neutral-500 mb-2" />
              <p className="text-sm text-neutral-400">Type to start searching...</p>
              <p className="text-xs text-neutral-600 mt-1">Press ⌘ K or Ctrl+K anytime</p>
            </div>
          ) : results.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-sm text-neutral-400">No results found for &quot;{query}&quot;</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Grouping results by type */}
              {['Blog', 'Project', 'Creativity'].map((groupType) => {
                const groupResults = results.filter((r) => r.type === groupType);
                if (groupResults.length === 0) return null;

                return (
                  <div key={groupType} className="space-y-2">
                    <div className="px-2 text-[10px] font-bold tracking-wider text-neutral-500 uppercase select-none">
                      {groupType}
                    </div>
                    <div className="space-y-1">
                      {groupResults.map((item) => (
                        <div key={item.slug} className="rounded-lg hover:bg-white/5 transition-colors p-2">
                          <Link
                            href={item.href}
                            onClick={() => setIsOpen(false)}
                            className="block"
                          >
                            {/* Result Title */}
                            <div className="font-medium text-sm text-neutral-100 hover:text-white transition-colors">
                              <HighlightText text={item.title} highlight={query} />
                            </div>

                            {/* Match Snippets */}
                            <div className="mt-1.5 space-y-1 pl-2 border-l border-white/5">
                              {item.matches.map((match, idx) => (
                                <div
                                  key={idx}
                                  className="text-xs text-neutral-400 leading-relaxed font-light"
                                >
                                  <HighlightText text={match.line} highlight={query} />
                                </div>
                              ))}
                            </div>
                          </Link>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
