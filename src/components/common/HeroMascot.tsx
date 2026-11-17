'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import Image from 'next/image';

interface EmotionParticle {
  id: number;
  emoji: string;
  x: number;
  y: number;
}

const SINGLE_CLICK_EMOJIS = ['❤️', '✨', '🍖', '😄', '🔥'];

// Squish-and-stretch bounce keyframes
const SQUISH_KEYFRAMES: Keyframe[] = [
  { transform: 'scale(1, 1)', easing: 'ease-in' },
  { transform: 'scale(1.18, 0.82)', offset: 0.18, easing: 'ease-out' },
  { transform: 'scale(0.92, 1.12)', offset: 0.45, easing: 'ease-in-out' },
  { transform: 'scale(1.05, 0.96)', offset: 0.72, easing: 'ease-in-out' },
  { transform: 'scale(1, 1)' },
];

interface HeroMascotProps {
  src?: string;
  size?: number;
  className?: string;
  label?: string;
}

export default function HeroMascot({
  src = '/assets/luffy_avatar.jpg',
  size = 96,
  className = '',
  label = "Sayan's avatar",
}: HeroMascotProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const avatarRef = useRef<HTMLDivElement>(null);
  const clickTrackerRef = useRef({ count: 0, at: 0 });
  const timersRef = useRef<number[]>([]);

  const [tilt, setTilt] = useState({ x: 0, y: 0, glareX: 50, glareY: 50 });
  const [isDizzy, setIsDizzy] = useState(false);
  const [particles, setParticles] = useState<EmotionParticle[]>([]);

  // Smooth mouse tracking with 3D perspective tilt
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

    const handlePointerMove = (e: PointerEvent) => {
      const container = containerRef.current;
      if (!container || isDizzy) return;

      const rect = container.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const dx = e.clientX - centerX;
      const dy = e.clientY - centerY;
      const dist = Math.hypot(dx, dy);

      // Dead-zone: looking straight ahead when mouse is within 40px
      if (dist < 40) {
        setTilt({ x: 0, y: 0, glareX: 50, glareY: 50 });
        return;
      }

      // Max tilt degrees: +/- 18 deg
      const maxTilt = 18;
      const rotY = Math.max(-maxTilt, Math.min(maxTilt, (dx / (window.innerWidth / 2)) * maxTilt));
      const rotX = Math.max(-maxTilt, Math.min(maxTilt, -(dy / (window.innerHeight / 2)) * maxTilt));

      // Glare reflection position (0% - 100%)
      const glareX = Math.max(0, Math.min(100, 50 + (dx / window.innerWidth) * 50));
      const glareY = Math.max(0, Math.min(100, 50 + (dy / window.innerHeight) * 50));

      setTilt({ x: rotX, y: rotY, glareX, glareY });
    };

    const handlePointerLeave = () => {
      setTilt({ x: 0, y: 0, glareX: 50, glareY: 50 });
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    document.addEventListener('mouseleave', handlePointerLeave);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('mouseleave', handlePointerLeave);
    };
  }, [isDizzy]);

  // Clean up timers
  useEffect(() => {
    return () => {
      timersRef.current.forEach((t) => window.clearTimeout(t));
    };
  }, []);

  const handleClick = useCallback(() => {
    timersRef.current.forEach((t) => window.clearTimeout(t));
    timersRef.current = [];

    const now = Date.now();
    const tracker = clickTrackerRef.current;
    tracker.count = now - tracker.at < 1600 ? tracker.count + 1 : 1;
    tracker.at = now;

    // Bounce squash & stretch
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches && avatarRef.current) {
      avatarRef.current.animate(SQUISH_KEYFRAMES, { duration: 420, easing: 'ease-out' });
    }

    // 4+ rapid clicks: DIZZY MODE!
    if (tracker.count >= 4) {
      tracker.count = 0;
      setIsDizzy(true);

      // Spawn dizzy stars
      const dizzyId = Date.now();
      setParticles((prev) => [
        ...prev,
        { id: dizzyId, emoji: '💫', x: 20, y: -25 },
        { id: dizzyId + 1, emoji: '😵‍💫', x: 55, y: -20 },
      ]);

      const t1 = window.setTimeout(() => {
        setIsDizzy(false);
        setParticles((prev) => prev.filter((p) => p.id !== dizzyId && p.id !== dizzyId + 1));
      }, 1400);
      timersRef.current.push(t1);
    } else {
      // Normal click: spawn floating emotion particle
      const emoji = SINGLE_CLICK_EMOJIS[(tracker.count - 1) % SINGLE_CLICK_EMOJIS.length];
      const pId = Date.now() + Math.random();
      const offsetX = 15 + Math.random() * 40;
      const offsetY = -15 - Math.random() * 15;

      setParticles((prev) => [...prev, { id: pId, emoji, x: offsetX, y: offsetY }]);

      const t = window.setTimeout(() => {
        setParticles((prev) => prev.filter((p) => p.id !== pId));
      }, 900);
      timersRef.current.push(t);
    }
  }, []);

  return (
    <div
      ref={containerRef}
      data-oneko-dodge="true"
      className={`relative inline-block select-none ${className}`}
      style={{ width: size, height: size, perspective: 1000 }}
    >
      {/* Floating Emotion Particles */}
      {particles.map((p) => (
        <span
          key={p.id}
          className="pointer-events-none absolute z-30 select-none text-2xl animate-in fade-in zoom-in-75 duration-200"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            animation: 'heroParticleFloat 0.9s ease-out forwards',
          }}
        >
          {p.emoji}
        </span>
      ))}

      {/* Interactive Avatar Button */}
      <button
        type="button"
        onClick={handleClick}
        aria-label={`Boop ${label}`}
        className="relative block h-full w-full cursor-pointer rounded-full p-0 border-0 bg-transparent outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
      >
        <div
          ref={avatarRef}
          className={`relative h-full w-full overflow-hidden rounded-full border-2 border-neutral-200/90 shadow-md transition-shadow duration-300 hover:shadow-xl dark:border-white/20 ${
            isDizzy ? 'animate-dizzy-shake' : ''
          }`}
          style={{
            transformStyle: 'preserve-3d',
            transform: isDizzy
              ? undefined
              : `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale3d(1, 1, 1)`,
            transition: isDizzy ? 'none' : 'transform 0.12s ease-out',
          }}
        >
          {/* Avatar Image */}
          <Image
            src={src}
            alt={label}
            width={size}
            height={size}
            priority
            className="h-full w-full object-cover transition-transform duration-300 pointer-events-none"
          />

          {/* Dynamic 3D Glare Lighting Overlay */}
          <div
            className="pointer-events-none absolute inset-0 rounded-full mix-blend-overlay transition-opacity duration-300"
            style={{
              background: `radial-gradient(circle at ${tilt.glareX}% ${tilt.glareY}%, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0) 70%)`,
              opacity: isDizzy ? 0 : 0.8,
            }}
          />
        </div>
      </button>

      {/* Embedded CSS for custom particle float and dizzy shake */}
      <style jsx global>{`
        @keyframes heroParticleFloat {
          0% {
            opacity: 1;
            transform: translateY(0) scale(0.8);
          }
          50% {
            opacity: 1;
            transform: translateY(-20px) scale(1.2);
          }
          100% {
            opacity: 0;
            transform: translateY(-40px) scale(0.9);
          }
        }

        @keyframes dizzyShake {
          0%,
          100% {
            transform: rotate(0deg) scale(0.96);
          }
          20% {
            transform: rotate(-12deg) scale(0.96);
          }
          40% {
            transform: rotate(10deg) scale(0.96);
          }
          60% {
            transform: rotate(-8deg) scale(0.96);
          }
          80% {
            transform: rotate(8deg) scale(0.96);
          }
        }

        .animate-dizzy-shake {
          animation: dizzyShake 0.28s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
