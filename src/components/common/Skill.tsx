import { Link } from 'next-view-transitions';
import React from 'react';

interface SkillProps {
  name: string;
  href: string;
  children: React.ReactNode;
}

export default function Skill({ name, href, children }: SkillProps) {
  return (
    <Link
      href={href ?? ''}
      target="_blank"
      className="skill-inner-shadow group inline-flex h-9 items-center justify-center rounded-md border border-dashed border-black/20 bg-black/5 px-2.5 text-sm text-black transition-all duration-300 ease-in-out dark:border-white/30 dark:bg-white/15 dark:text-white hover:px-3"
    >
      <div className="size-4 flex-shrink-0 flex items-center justify-center">
        {children}
      </div>
      <span className="max-w-0 overflow-hidden opacity-0 transition-all duration-300 ease-in-out group-hover:ml-2 group-hover:max-w-xs group-hover:opacity-100 text-sm font-bold whitespace-nowrap">
        {name}
      </span>
    </Link>
  );
}

