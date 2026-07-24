'use client';

import { motion, AnimatePresence } from 'motion/react';
import Image from 'next/image';
import React, { useState, useRef } from 'react';

interface HoverPreviewProps {
  image: string;
  title: string;
  children: React.ReactNode;
}

export function HoverPreview({ image, title, children }: HoverPreviewProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setCoords({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <div
      ref={containerRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseMove={handleMouseMove}
      className="relative w-full"
    >
      {children}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 15 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="pointer-events-none absolute z-50 overflow-hidden rounded-xl border border-muted/50 bg-background p-1.5 shadow-2xl"
            style={{
              left: coords.x + 20,
              top: coords.y - 140, // position above the cursor
              width: '260px',
              aspectRatio: '16/10',
            }}
          >
            <div className="relative h-full w-full overflow-hidden rounded-lg">
              <Image
                src={image}
                alt={title}
                fill
                className="object-cover"
                sizes="260px"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
