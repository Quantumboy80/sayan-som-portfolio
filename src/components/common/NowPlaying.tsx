"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Music, ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";

type SongData = {
  isPlaying: boolean;
  title: string;
  artist: string;
  album: string;
  albumArt: string;
  songUrl: string;
};

export default function NowPlaying() {
  const [data, setData] = useState<SongData>({
    isPlaying: false,
    title: "Not Listening",
    artist: "YouTube Music",
    album: "",
    albumArt: "",
    songUrl: "https://music.youtube.com",
  });
  const [isExpanded, setIsExpanded] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    const fetchNowPlaying = async () => {
      try {
        const res = await fetch("/api/now-playing");
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (err) {
        console.error("Error fetching now playing:", err);
      }
    };

    fetchNowPlaying();
    const interval = setInterval(fetchNowPlaying, 30000); // poll every 30s
    return () => clearInterval(interval);
  }, []);

  if (!mounted) return null;

  return (
    <div className="fixed bottom-4 left-4 z-40 flex items-center">
      <AnimatePresence mode="wait">
        {isExpanded ? (
          <motion.div
            key="expanded"
            initial={{ opacity: 0, x: -20, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="flex items-center gap-3 rounded-xl border border-border bg-background/80 p-2.5 pr-4 shadow-lg backdrop-blur-md max-w-[280px]"
          >
            {/* Album Art / Music Icon */}
            <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-muted border border-border flex items-center justify-center">
              {data.albumArt ? (
                <img
                  src={data.albumArt}
                  alt={data.album || "Album Art"}
                  className={`h-full w-full object-cover ${data.isPlaying ? "animate-[spin_12s_linear_infinite]" : ""}`}
                />
              ) : (
                <Music className="h-5 w-5 text-muted-foreground" />
              )}
              {data.isPlaying && (
                <div className="absolute inset-0 bg-black/25 flex items-center justify-center">
                  <div className="flex items-end gap-0.5 h-3">
                    <motion.span
                      animate={{ height: [3, 10, 3] }}
                      transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut", delay: 0 }}
                      className="w-0.5 bg-white rounded-full"
                    />
                    <motion.span
                      animate={{ height: [3, 10, 3] }}
                      transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
                      className="w-0.5 bg-white rounded-full"
                    />
                    <motion.span
                      animate={{ height: [3, 10, 3] }}
                      transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
                      className="w-0.5 bg-white rounded-full"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Song Text details */}
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-[9px] uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-1">
                {data.isPlaying ? (
                  <>
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-500"></span>
                    </span>
                    Now Playing
                  </>
                ) : (
                  "Last Played"
                )}
              </span>
              <a
                href={data.songUrl}
                target="_blank"
                rel="noreferrer"
                className="group inline-flex items-center gap-0.5 text-xs font-semibold text-foreground hover:text-primary transition-colors truncate"
              >
                <span className="truncate">{data.title}</span>
                <ExternalLink className="h-2.5 w-2.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
              </a>
              <span className="text-[11px] text-muted-foreground truncate leading-none">
                {data.artist}
              </span>
            </div>

            {/* Collapse Toggle Button */}
            <button
              onClick={() => setIsExpanded(false)}
              className="ml-1 rounded-md p-1 text-muted-foreground hover:bg-muted transition-colors"
              aria-label="Collapse music widget"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          </motion.div>
        ) : (
          <motion.button
            key="collapsed"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => setIsExpanded(true)}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background/80 shadow-lg backdrop-blur-md text-muted-foreground hover:text-foreground transition-colors hover:scale-105"
            aria-label="Expand music widget"
          >
            <Music className={`h-4 w-4 ${data.isPlaying ? "text-primary animate-pulse" : ""}`} />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
