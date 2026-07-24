'use client';

import { motion, AnimatePresence } from 'motion/react';
import React, { useEffect, useState } from 'react';

export function FloatingTOC() {
  const [activeHeading, setActiveHeading] = useState<string>('');
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // 1. Scroll listener to calculate overall page scroll progress
    const handleScroll = () => {
      const totalHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const progress = (window.scrollY / totalHeight) * 100;
        setScrollProgress(progress);

        // Only show floating tracker if user has scrolled down a bit (e.g. 150px)
        setIsVisible(window.scrollY > 150);
      }
    };

    // 2. IntersectionObserver to detect active h2 / h3 headings
    const headings = Array.from(
      document.querySelectorAll('article h2, article h3'),
    );

    // Set first heading as active initially if available
    if (headings.length > 0) {
      setActiveHeading(headings[0].textContent || '');
    }

    const observerOptions = {
      root: null,
      rootMargin: '-80px 0px -60% 0px', // Trigger when heading is in top portion of viewport
      threshold: 0,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveHeading(entry.target.textContent || '');
        }
      });
    }, observerOptions);

    headings.forEach((heading) => observer.observe(heading));
    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial call

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // SVG parameters for the progress circle
  const radius = 10;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset =
    circumference - (scrollProgress / 100) * circumference;

  return (
    <AnimatePresence>
      {isVisible && activeHeading && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          transition={{ type: 'spring', damping: 20, stiffness: 200 }}
          className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-full border border-muted/50 bg-background/85 px-4 py-1.5 shadow-lg backdrop-blur-md"
        >
          <span className="flex h-1.5 w-1.5 rounded-full bg-primary" />
          <span className="text-sm font-medium max-w-[200px] truncate sm:max-w-[300px]">
            {activeHeading}
          </span>
          <div className="relative flex items-center justify-center h-6 w-6">
            <svg
              className="absolute transform -rotate-90"
              width="24"
              height="24"
            >
              <circle
                className="text-muted/40"
                strokeWidth="2"
                stroke="currentColor"
                fill="transparent"
                r={radius}
                cx="12"
                cy="12"
              />
              <circle
                className="text-primary transition-all duration-75"
                strokeWidth="2"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                stroke="currentColor"
                fill="transparent"
                r={radius}
                cx="12"
                cy="12"
              />
            </svg>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
