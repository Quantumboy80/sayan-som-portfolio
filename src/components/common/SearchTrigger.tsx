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
      className="flex items-center gap-2 rounded-full border border-neutral-200 bg-neutral-50 hover:bg-neutral-100 hover:border-neutral-300 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10 dark:hover:border-white/20 px-3 py-1.5 text-xs text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-all shadow-sm cursor-pointer"
    >
      <Search className="h-3.5 w-3.5" />
      <span>Search</span>
      <span className="text-[9px] text-neutral-400 dark:text-neutral-500 font-mono px-1 py-0.2 rounded border border-neutral-200 dark:border-white/10 bg-neutral-100 dark:bg-black/30 select-none">
        {isMac ? '⌘K' : 'Ctrl+K'}
      </span>
    </button>
  );
}
