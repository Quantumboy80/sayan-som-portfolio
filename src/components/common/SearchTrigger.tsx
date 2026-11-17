'use client';

import React, { useEffect, useState } from 'react';
import { Search } from 'lucide-react';

export function SearchTrigger() {
  const [isMac, setIsMac] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsMac(navigator.userAgent.indexOf('Mac') !== -1);
    }
  }, []);

  const handleOpenSearch = () => {
    window.dispatchEvent(new CustomEvent('open-global-search'));
  };

  return (
    <button
      onClick={handleOpenSearch}
      type="button"
      aria-label="Search"
      className="group flex h-9 shrink-0 items-center gap-2 rounded-lg border border-neutral-200/90 bg-neutral-100/60 px-2.5 sm:px-3 text-xs text-neutral-500 transition-all duration-200 hover:border-neutral-300 hover:bg-neutral-100 hover:text-neutral-900 dark:border-white/10 dark:bg-white/5 dark:text-neutral-400 dark:hover:border-white/20 dark:hover:bg-white/10 dark:hover:text-white cursor-pointer active:scale-95"
    >
      <Search className="h-4 w-4 shrink-0 transition-transform duration-200 group-hover:scale-110" />
      <span className="hidden sm:inline font-medium">Search</span>
      <kbd className="hidden sm:inline-flex items-center rounded border border-neutral-200 bg-neutral-200/60 px-1.5 py-0.5 font-mono text-[10px] text-neutral-500 select-none dark:border-white/10 dark:bg-white/10 dark:text-neutral-400">
        {isMac ? '⌘K' : 'Ctrl+K'}
      </kbd>
    </button>
  );
}
