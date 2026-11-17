import { navbarConfig } from '@/config/Navbar';
import { getSettings } from '@/lib/content';
import { Link } from 'next-view-transitions';
import Image from 'next/image';
import React from 'react';

import Container from './Container';
import { ThemeToggleButton } from './ThemeSwitch';
import { SearchTrigger } from './SearchTrigger';

export default async function Navbar() {
  const settings = await getSettings();
  const { sections } = settings;

  const filteredNavItems = navbarConfig.navItems.filter((item) => {
    if (item.label === 'Work' && !sections.experience) return false;
    if (item.label === 'Certificates' && !sections.certificates) return false;
    if (item.label === 'Projects' && !sections.projects) return false;
    return true;
  });

  return (
    <Container className="sticky top-0 z-20 max-w-4xl rounded-md py-3 backdrop-blur-sm">
      <div className="flex items-center justify-between gap-3 px-3 sm:px-6">
        <div className="flex items-center gap-3 sm:gap-6 min-w-0">
          <Link href="/" className="shrink-0 flex items-center">
            <Image
              className="h-10 w-10 sm:h-11 sm:w-11 shrink-0 aspect-square rounded-lg border border-gray-200 object-cover bg-blue-300 transition-all duration-300 ease-in-out hover:scale-95 dark:border-neutral-800 dark:bg-yellow-300"
              src={navbarConfig.logo.src}
              alt={navbarConfig.logo.alt}
              width={navbarConfig.logo.width}
              height={navbarConfig.logo.height}
              priority
            />
          </Link>
          <div className="flex items-center gap-3 sm:gap-4 overflow-x-auto no-scrollbar py-1">
            {filteredNavItems.map((item) => (
              <Link
                className="text-sm font-medium whitespace-nowrap text-neutral-600 hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-white transition-all duration-300 ease-in-out hover:underline hover:decoration-2 hover:underline-offset-4"
                key={item.label}
                href={item.href}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <SearchTrigger />
          <ThemeToggleButton variant="circle" start="top-right" blur className="size-9 rounded-lg" />
        </div>
      </div>
    </Container>
  );
}
