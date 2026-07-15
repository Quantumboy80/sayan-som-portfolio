"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronRight } from "lucide-react";

type HobbyId = "chess" | "audioStories" | "readStories" | "anime" | "drawing";

interface HobbyTitle {
  id: HobbyId;
  displayName: string;
}

interface HobbySceneEntry {
  src: string;
  offsetX: number;
  offsetY: number;
  rotate: number;
}

const HOBBY_TITLES: HobbyTitle[] = [
  { id: "chess", displayName: "chess" },
  { id: "audioStories", displayName: "audio stories" },
  { id: "readStories", displayName: "read stories" },
  { id: "anime", displayName: "watching anime" },
  { id: "drawing", displayName: "drawing" },
];

const data: Record<HobbyId, HobbySceneEntry[]> = {
  chess: [
    {
      src: "/assets/hobbies/chess-1.jpg",
      offsetX: -440,
      offsetY: -150,
      rotate: -6,
    },
    {
      src: "/assets/hobbies/chess-2.jpg",
      offsetX: 10,
      offsetY: -280,
      rotate: 3,
    },
    {
      src: "/assets/hobbies/chess-3.jpg",
      offsetX: 420,
      offsetY: -120,
      rotate: -4,
    },
  ],
  audioStories: [
    {
      src: "/assets/hobbies/audio-1.jpg",
      offsetX: -460,
      offsetY: -80,
      rotate: 4,
    },
    {
      src: "/assets/hobbies/audio-2.jpg",
      offsetX: -20,
      offsetY: -250,
      rotate: -3,
    },
    {
      src: "/assets/hobbies/audio-3.jpg",
      offsetX: 380,
      offsetY: -60,
      rotate: 5,
    },
  ],
  readStories: [
    {
      src: "/assets/hobbies/reading-1.jpg",
      offsetX: -430,
      offsetY: -90,
      rotate: -5,
    },
    {
      src: "/assets/hobbies/reading-2.jpg",
      offsetX: 40,
      offsetY: -220,
      rotate: 6,
    },
    {
      src: "/assets/hobbies/reading-3.jpg",
      offsetX: 440,
      offsetY: 40,
      rotate: -7,
    },
  ],
  anime: [
    {
      src: "/assets/hobbies/anime-1.gif",
      offsetX: -480,
      offsetY: -110,
      rotate: -8,
    },
    {
      src: "/assets/hobbies/anime-2.gif",
      offsetX: -10,
      offsetY: -290,
      rotate: 2,
    },
    {
      src: "/assets/hobbies/anime-3.gif",
      offsetX: 410,
      offsetY: -80,
      rotate: -4,
    },
  ],
  drawing: [
    {
      src: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=cover&w=400&q=80",
      offsetX: -450,
      offsetY: 60,
      rotate: -3,
    },
    {
      src: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=cover&w=400&q=80",
      offsetX: -80,
      offsetY: -30,
      rotate: -4,
    },
    {
      src: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=cover&w=400&q=80",
      offsetX: 360,
      offsetY: 180,
      rotate: 5,
    },
  ],
};

const ANIMATION_CONFIG = {
  initial: {
    scaleY: 1.15,
  },
  hover: {
    scaleY: 1.3,
  },
  transition: {
    type: "spring",
    stiffness: 300,
    damping: 10,
    mass: 0.8,
  },
} as const;

// Mouse tracking hook
const useMousePosition = (normalizer = 5) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const rafId = useRef(0);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      cancelAnimationFrame(rafId.current);
      rafId.current = requestAnimationFrame(() => {
        setPosition({
          x: (e.clientX - window.innerWidth / 2) / normalizer,
          y: (e.clientY - window.innerHeight / 2) / normalizer,
        });
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(rafId.current);
    };
  }, [normalizer]);

  return position;
};

export default function HobbiesPageClient() {
  const [hoveredText, setHoveredText] = useState<HobbyId | null>(null);
  const mousePosition = useMousePosition();
  const [mounted, setMounted] = useState(false);
  const [windowWidth, setWindowWidth] = useState(1200);

  useEffect(() => {
    setMounted(true);
    setWindowWidth(window.innerWidth);
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const clearHover = useCallback(() => setHoveredText(null), []);
  const scenes = hoveredText ? data[hoveredText] : null;

  // Responsive scale factor to keep images from going off-screen on smaller devices
  const getResponsiveScale = () => {
    if (windowWidth < 640) return 0.35;  // Mobile
    if (windowWidth < 1024) return 0.65; // Tablet
    return 1.0;                          // Desktop
  };

  if (!mounted) return null;

  const scale = getResponsiveScale();

  return (
    <div className="w-full min-h-[90vh] relative flex flex-col justify-center items-center py-16 overflow-x-hidden select-none">
      {/* Top Breadcrumb */}
      <div className="absolute top-12 left-6 md:left-12 flex items-center gap-2 text-muted-foreground/60 text-xs uppercase tracking-wider font-semibold z-30">
        <span>Free Time</span>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-foreground font-bold">Hobbies</span>
      </div>

      {/* Main Text List */}
      <div className="flex flex-col items-center justify-center gap-6 text-nowrap text-4xl font-black uppercase text-zinc-300/80 dark:text-zinc-800 *:cursor-default md:text-7xl relative z-10">
        {HOBBY_TITLES.map((title) => {
          const handleActivate = () => setHoveredText(title.id);
          
          return (
            <motion.span
              key={title.id}
              role="button"
              tabIndex={0}
              className="transition-colors duration-300 hover:text-zinc-800 focus-visible:text-zinc-800 dark:hover:text-zinc-100 dark:focus-visible:text-zinc-100 focus-visible:outline-none"
              animate={ANIMATION_CONFIG.initial}
              whileHover={ANIMATION_CONFIG.hover}
              whileFocus={ANIMATION_CONFIG.hover}
              transition={ANIMATION_CONFIG.transition}
              onMouseEnter={handleActivate}
              onMouseMove={handleActivate}
              onMouseLeave={clearHover}
              onFocus={handleActivate}
              onBlur={clearHover}
            >
              {title.displayName}
            </motion.span>
          );
        })}
      </div>

      {/* Floating Previews */}
      <AnimatePresence>
        {scenes?.map((item, index) => {
          const xPos = (item.offsetX * scale) + (index === 1 ? mousePosition.x / 2 : mousePosition.x);
          const yPos = (item.offsetY * scale) + mousePosition.y;

          return (
            <motion.div
              key={item.src}
              className="absolute pointer-events-none flex aspect-[3/2] w-48 md:w-64 items-center justify-center overflow-hidden rounded-xl shadow-2xl border border-white/10 dark:border-black/10 z-20 bg-muted"
              initial={{
                scale: 0,
                opacity: 0,
                x: item.offsetX * scale,
                y: item.offsetY * scale,
                rotate: item.rotate,
              }}
              animate={{
                scale: 1,
                opacity: 1,
                x: xPos,
                y: yPos,
                rotate: item.rotate,
              }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{
                type: "spring",
                stiffness: 220,
                damping: 12,
                mass: 0.5,
              }}
            >
              <img
                src={item.src}
                alt="Hobby scene preview"
                className="h-full w-full object-cover"
              />
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
