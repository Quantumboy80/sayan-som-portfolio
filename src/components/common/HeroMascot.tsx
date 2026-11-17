'use client';

import React, { useEffect, useRef, useState } from 'react';

const DIRECTIONS = [
  'up-left',
  'up',
  'up-right',
  'left',
  'center',
  'right',
  'down-left',
  'down',
  'down-right',
] as const;

const REACTIONS = [
  'blink',
  'heart',
  'sparkle',
  'surprised',
  'wink',
  'bashful',
  'sleepy',
  'dizzy',
  'delighted',
] as const;

const ANGLE_DIRECTIONS = [
  'right',
  'down-right',
  'down',
  'down-left',
  'left',
  'up-left',
  'up',
  'up-right',
] as const;

const STEP_ANGLE = (2 * Math.PI) / ANGLE_DIRECTIONS.length;
const RANDOM_REACTIONS = ['heart', 'sparkle', 'delighted'] as const;

// Keyframes for the squash-and-stretch boop animation
const SQUISH_KEYFRAMES: Keyframe[] = [
  { transform: 'scale(1, 1)', easing: 'ease-in' },
  { transform: 'scale(1.10, 0.86)', offset: 0.18, easing: 'ease-out' },
  { transform: 'scale(0.95, 1.08)', offset: 0.45, easing: 'ease-in-out' },
  { transform: 'scale(1.03, 0.97)', offset: 0.72, easing: 'ease-in-out' },
  { transform: 'scale(1, 1)' },
];

function getSpritePosition(index: number) {
  const col = index % 3;
  const row = Math.floor(index / 3);
  return {
    backgroundPosition: `${col * 50}% ${row * 50}%`,
  };
}

const SPRITE_BASE_STYLE: React.CSSProperties = {
  position: 'absolute',
  inset: 0,
  backgroundSize: '300% 300%',
  backgroundRepeat: 'no-repeat',
  imageRendering: 'pixelated',
  transition: 'opacity 0.08s ease-out',
};

interface HeroMascotProps {
  directions?: string;
  reactions?: string;
  size?: number;
  className?: string;
  label?: string;
  fallbackSrc?: string;
}

export default function HeroMascot({
  directions = '/mascots/ram-directions.webp',
  reactions = '/mascots/ram-reactions.webp',
  size = 96,
  className = '',
  label = 'mascot',
}: HeroMascotProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const spanRef = useRef<HTMLSpanElement>(null);
  const timeoutsRef = useRef<number[]>([]);
  const clickTrackerRef = useRef({ count: 0, at: 0 });

  const [direction, setDirection] = useState<string>('center');
  const [reaction, setReaction] = useState<string | null>(null);

  // Track cursor movement and update gaze direction
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

    let currentDirIdx = -1;
    let coords: { x: number; y: number } | null = null;

    const handleCalculate = () => {
      const btn = buttonRef.current;
      if (!btn || !coords) return;

      const rect = btn.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const dx = coords.x - centerX;
      const dy = coords.y - centerY;

      // Within 70px dead zone: look straight at screen
      if (Math.hypot(dx, dy) < 70) {
        currentDirIdx = -1;
        setDirection('center');
        return;
      }

      const angle = Math.atan2(dy, dx);
      let diff: number;

      // Avoid jitter when close to boundary
      if (
        currentDirIdx !== -1 &&
        Math.abs(
          Math.atan2(Math.sin((diff = angle - currentDirIdx * STEP_ANGLE)), Math.cos(diff))
        ) <
          STEP_ANGLE / 2 + 0.12
      ) {
        return;
      }

      currentDirIdx =
        (Math.round(angle / STEP_ANGLE) + ANGLE_DIRECTIONS.length) % ANGLE_DIRECTIONS.length;
      setDirection(ANGLE_DIRECTIONS[currentDirIdx]);
    };

    const handlePointerMove = (e: PointerEvent) => {
      coords = { x: e.clientX, y: e.clientY };
      handleCalculate();
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('scroll', handleCalculate, { passive: true });

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('scroll', handleCalculate);
    };
  }, []);

  // Clear pending timers on unmount
  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach((t) => window.clearTimeout(t));
    };
  }, []);

  const handleClick = () => {
    timeoutsRef.current.forEach((t) => window.clearTimeout(t));
    timeoutsRef.current = [];

    const schedule = (delay: number, nextReaction: string | null) => {
      const timeoutId = window.setTimeout(() => setReaction(nextReaction), delay);
      timeoutsRef.current.push(timeoutId);
    };

    const now = Date.now();
    const tracker = clickTrackerRef.current;
    tracker.count = now - tracker.at < 1600 ? tracker.count + 1 : 1;
    tracker.at = now;

    // 4+ rapid clicks trigger dizzy mode
    if (tracker.count >= 4) {
      tracker.count = 0;
      setReaction('dizzy');
      schedule(1100, null);
    } else {
      setReaction('blink');
      schedule(120, RANDOM_REACTIONS[(tracker.count - 1) % RANDOM_REACTIONS.length]);
      schedule(560, null);
    }

    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      spanRef.current?.animate(SQUISH_KEYFRAMES, { duration: 420, easing: 'linear' });
    }
  };

  const directionIdx = DIRECTIONS.indexOf(direction as any);
  const reactionIdx = REACTIONS.indexOf((reaction ?? 'blink') as any);

  return (
    <button
      ref={buttonRef}
      type="button"
      onClick={handleClick}
      aria-label={`Boop the ${label}`}
      className={`group relative select-none cursor-pointer outline-none transition-transform hover:scale-105 active:scale-95 ${className}`}
      style={{
        position: 'relative',
        display: 'block',
        flexShrink: 0,
        width: size,
        height: size,
        padding: 0,
        border: 0,
        background: 'transparent',
        appearance: 'none',
      }}
    >
      <span
        ref={spanRef}
        style={{
          position: 'relative',
          display: 'block',
          width: '100%',
          height: '100%',
          transformOrigin: '50% 78%',
        }}
      >
        {/* Direction Sprite (Gaze Tracking) */}
        <span
          style={{
            ...SPRITE_BASE_STYLE,
            backgroundImage: `url(${directions})`,
            ...getSpritePosition(directionIdx !== -1 ? directionIdx : 4),
            opacity: reaction ? 0 : 1,
          }}
        />

        {/* Reaction Sprite (Emotion on Click) */}
        <span
          style={{
            ...SPRITE_BASE_STYLE,
            backgroundImage: `url(${reactions})`,
            ...getSpritePosition(reactionIdx !== -1 ? reactionIdx : 0),
            opacity: reaction ? 1 : 0,
          }}
        />
      </span>
    </button>
  );
}
