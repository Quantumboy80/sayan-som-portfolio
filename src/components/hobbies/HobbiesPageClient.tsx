"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronRight } from "lucide-react";
import Container from "@/components/common/Container";

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
      src: "https://images.unsplash.com/photo-1529699211952-734e80c4d42b?auto=format&fit=cover&w=400&q=80",
      offsetX: -440,
      offsetY: -150,
      rotate: -6,
    },
    {
      src: "https://images.unsplash.com/photo-1586165368502-1bad197a64e1?auto=format&fit=cover&w=400&q=80",
      offsetX: 10,
      offsetY: -280,
      rotate: 3,
    },
    {
      src: "https://images.unsplash.com/photo-1523821741446-edb2b68bb7a0?auto=format&fit=cover&w=400&q=80",
      offsetX: 420,
      offsetY: -120,
      rotate: -4,
    },
  ],
  audioStories: [
    {
      src: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=cover&w=400&q=80",
      offsetX: -460,
      offsetY: -80,
      rotate: 4,
    },
    {
      src: "https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=cover&w=400&q=80",
      offsetX: -20,
      offsetY: -250,
      rotate: -3,
    },
    {
      src: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=cover&w=400&q=80",
      offsetX: 380,
      offsetY: -60,
      rotate: 5,
    },
  ],
  readStories: [
    {
      src: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=cover&w=400&q=80",
      offsetX: -430,
      offsetY: -90,
      rotate: -5,
    },
    {
      src: "https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=cover&w=400&q=80",
      offsetX: 40,
      offsetY: -220,
      rotate: 6,
    },
    {
      src: "https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?auto=format&fit=cover&w=400&q=80",
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

  useEffect(() => {
    setMounted(true);
  }, []);

  const clearHover = useCallback(() => setHoveredText(null), []);
  const scenes = hoveredText ? data[hoveredText] : null;

  if (!mounted) return null;

  return (
    <Container className="min-h-[85vh] flex flex-col justify-center items-center py-16 overflow-hidden relative">
      <div className="absolute top-12 left-6 md:left-12 flex items-center gap-2 text-muted-foreground/60 text-xs uppercase tracking-wider font-semibold">
        <span>Free Time</span>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-foreground font-bold">Hobbies</span>
      </div>

      <div className="flex flex-col items-center justify-center gap-6 text-nowrap text-4xl font-black uppercase text-zinc-300/80 dark:text-zinc-800 *:cursor-default md:text-7xl select-none relative z-10">
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

      {/* Floating Scene Previews */}
      <AnimatePresence>
        {scenes?.map((item, index) => (
          <motion.div
            key={item.src}
            className="absolute pointer-events-none flex aspect-[3/2] w-48 md:w-64 items-center justify-center overflow-hidden rounded-xl shadow-2xl border border-white/10 dark:border-black/10 z-0 bg-muted"
            initial={{
              scale: 0,
              opacity: 0,
              x: item.offsetX,
              y: item.offsetY,
              rotate: item.rotate,
            }}
            animate={{
              scale: 1,
              opacity: 1,
              x: item.offsetX + (index === 1 ? mousePosition.x / 2 : mousePosition.x),
              y: item.offsetY + mousePosition.y,
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
        ))}
      </AnimatePresence>
    </Container>
  );
}
