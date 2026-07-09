"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Trophy,
  ExternalLink,
  Award,
  GitPullRequest,
  Calendar,
  Flame,
  User,
  ArrowRight,
  TrendingUp
} from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface LeetCodeBadge {
  name: string;
  icon: string;
  earnedDate: string;
}

interface PullRequest {
  repo: string;
  title: string;
  url: string;
  status: string;
}

interface Highlight {
  title: string;
  description: string;
  badge: string;
}

interface Hackathon {
  name: string;
  project: string;
  placement: string;
  role: string;
  description: string;
  certificate: string;
}

interface ProfileLink {
  platform: string;
  url: string;
  username: string;
  color: string;
}

interface AchievementsData {
  leetcode: {
    username: string;
    solved: number;
    totalQuestionCount: number;
    easySolved: number;
    easyTotal: number;
    mediumSolved: number;
    mediumTotal: number;
    hardSolved: number;
    hardTotal: number;
    streak: number;
    rating: number;
    rank: string;
    badges: LeetCodeBadge[];
  };
  openSource: {
    contributions: number;
    pullRequests: PullRequest[];
    highlights: Highlight[];
  };
  hackathons: Hackathon[];
  profileLinks: ProfileLink[];
}

interface AchievementsPageClientProps {
  data: AchievementsData;
}

export default function AchievementsPageClient({ data }: AchievementsPageClientProps) {
  const [selectedHackathon, setSelectedHackathon] = useState<Hackathon | null>(null);
  const [hoveredBadge, setHoveredBadge] = useState<string | null>(null);

  const { leetcode, openSource, hackathons, profileLinks } = data;

  // Concentric Progress Circle Calculations
  const radiusEasy = 65;
  const radiusMedium = 50;
  const radiusHard = 35;

  const circumferenceEasy = 2 * Math.PI * radiusEasy;
  const circumferenceMedium = 2 * Math.PI * radiusMedium;
  const circumferenceHard = 2 * Math.PI * radiusHard;

  const strokeDashoffsetEasy = circumferenceEasy - (leetcode.easySolved / leetcode.easyTotal) * circumferenceEasy;
  const strokeDashoffsetMedium = circumferenceMedium - (leetcode.mediumSolved / leetcode.mediumTotal) * circumferenceMedium;
  const strokeDashoffsetHard = circumferenceHard - (leetcode.hardSolved / leetcode.hardTotal) * circumferenceHard;

  return (
    <div className="min-h-screen py-10 px-4 md:px-8 max-w-7xl mx-auto space-y-12">
      {/* Page Header */}
      <div className="space-y-4 text-center">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-orange-500 to-amber-500 dark:from-orange-400 dark:to-amber-400"
        >
          Credentials & Achievements
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-muted-foreground max-w-2xl mx-auto text-base md:text-lg"
        >
          A real-time overview of my open-source contributions, LeetCode data, hackathon victories, and developer credentials.
        </motion.p>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[minmax(180px,auto)]">
        
        {/* 1. LeetCode Stats Tile (Col-Span 2) */}
        <motion.div
          whileHover={{ y: -4 }}
          className="md:col-span-2 bg-card/30 dark:bg-card/20 backdrop-blur-md border border-border/50 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row gap-8 items-center justify-between shadow-sm relative overflow-hidden group"
        >
          {/* Subtle back glowing effect */}
          <div className="absolute -right-16 -top-16 size-48 rounded-full bg-amber-500/10 blur-3xl group-hover:bg-amber-500/20 transition-all duration-300" />
          
          <div className="space-y-6 flex-1 w-full">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-xs font-semibold tracking-wider uppercase text-amber-500 dark:text-amber-400">Platform Performance</span>
                <h2 className="text-2xl font-bold tracking-tight">LeetCode Solver</h2>
              </div>
              <div className="flex items-center gap-1.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 px-3 py-1 rounded-full text-xs font-semibold">
                <Flame className="size-4 animate-pulse" />
                <span>{leetcode.streak} Day Streak</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 text-center md:text-left">
              <div className="bg-muted/30 dark:bg-muted/10 p-3.5 rounded-2xl border border-border/20">
                <div className="text-xs text-muted-foreground font-medium">Solved Questions</div>
                <div className="text-2xl font-bold tracking-tight mt-1">{leetcode.solved} <span className="text-xs text-muted-foreground font-normal">/ {leetcode.totalQuestionCount}</span></div>
              </div>
              <div className="bg-muted/30 dark:bg-muted/10 p-3.5 rounded-2xl border border-border/20">
                <div className="text-xs text-muted-foreground font-medium">Contest Rating</div>
                <div className="text-2xl font-bold tracking-tight mt-1">{leetcode.rating}</div>
              </div>
              <div className="bg-muted/30 dark:bg-muted/10 p-3.5 rounded-2xl border border-border/20">
                <div className="text-xs text-muted-foreground font-medium">Global Ranking</div>
                <div className="text-2xl font-bold tracking-tight mt-1">{leetcode.rank}</div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold text-muted-foreground">
                <span>QUESTION DIFFICULTY BREAKDOWN</span>
              </div>
              <div className="grid grid-cols-3 gap-3 text-xs">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-medium">
                  <span className="size-2 rounded-full bg-emerald-500" />
                  <span>Easy: {leetcode.easySolved}</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 font-medium">
                  <span className="size-2 rounded-full bg-amber-500" />
                  <span>Med: {leetcode.mediumSolved}</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 font-medium">
                  <span className="size-2 rounded-full bg-rose-500" />
                  <span>Hard: {leetcode.hardSolved}</span>
                </div>
              </div>
            </div>
          </div>

          {/* SVG Concentric Ring Visualizer */}
          <div className="relative size-40 flex items-center justify-center shrink-0">
            <svg className="size-full -rotate-90">
              {/* Easy Progress Circle */}
              <circle
                cx="80"
                cy="80"
                r={radiusEasy}
                className="stroke-muted/40 dark:stroke-muted/10 fill-none"
                strokeWidth="7"
              />
              <motion.circle
                cx="80"
                cy="80"
                r={radiusEasy}
                className="stroke-emerald-500 fill-none"
                strokeWidth="7"
                strokeLinecap="round"
                initial={{ strokeDashoffset: circumferenceEasy }}
                animate={{ strokeDashoffset: strokeDashoffsetEasy }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                strokeDasharray={circumferenceEasy}
              />

              {/* Medium Progress Circle */}
              <circle
                cx="80"
                cy="80"
                r={radiusMedium}
                className="stroke-muted/40 dark:stroke-muted/10 fill-none"
                strokeWidth="7"
              />
              <motion.circle
                cx="80"
                cy="80"
                r={radiusMedium}
                className="stroke-amber-500 fill-none"
                strokeWidth="7"
                strokeLinecap="round"
                initial={{ strokeDashoffset: circumferenceMedium }}
                animate={{ strokeDashoffset: strokeDashoffsetMedium }}
                transition={{ duration: 1.2, ease: "easeOut", delay: 0.1 }}
                strokeDasharray={circumferenceMedium}
              />

              {/* Hard Progress Circle */}
              <circle
                cx="80"
                cy="80"
                r={radiusHard}
                className="stroke-muted/40 dark:stroke-muted/10 fill-none"
                strokeWidth="7"
              />
              <motion.circle
                cx="80"
                cy="80"
                r={radiusHard}
                className="stroke-rose-500 fill-none"
                strokeWidth="7"
                strokeLinecap="round"
                initial={{ strokeDashoffset: circumferenceHard }}
                animate={{ strokeDashoffset: strokeDashoffsetHard }}
                transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
                strokeDasharray={circumferenceHard}
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-3xl font-black tracking-tight">{leetcode.solved}</span>
              <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Solved</span>
            </div>
          </div>
        </motion.div>

        {/* 2. Open Source PRs Tile (Col-Span 1) */}
        <motion.div
          whileHover={{ y: -4 }}
          className="bg-card/30 dark:bg-card/20 backdrop-blur-md border border-border/50 rounded-3xl p-6 flex flex-col justify-between shadow-sm relative overflow-hidden group min-h-[340px]"
        >
          <div className="absolute -left-16 -bottom-16 size-48 rounded-full bg-violet-500/10 blur-3xl group-hover:bg-violet-500/20 transition-all duration-300" />

          <div className="space-y-4 w-full z-10">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-xs font-semibold tracking-wider uppercase text-violet-500 dark:text-violet-400">GitHub contributions</span>
                <h2 className="text-2xl font-bold tracking-tight">Open Source</h2>
              </div>
              <GitPullRequest className="size-6 text-violet-500 dark:text-violet-400" />
            </div>

            <p className="text-sm text-muted-foreground">
              Direct code contributions merged into production-scale repositories.
            </p>

            <div className="space-y-3 pt-2">
              {openSource.pullRequests.map((pr, i) => (
                <a
                  key={i}
                  href={pr.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 rounded-2xl bg-muted/40 dark:bg-muted/10 border border-border/20 hover:border-violet-500/30 hover:bg-muted/60 dark:hover:bg-muted/20 transition-all duration-200 group/pr"
                >
                  <div className="space-y-0.5 flex-1 min-w-0 pr-4">
                    <div className="text-xs font-bold text-violet-500 dark:text-violet-400 uppercase tracking-wide">{pr.repo}</div>
                    <div className="text-xs font-medium truncate text-foreground/90">{pr.title}</div>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                      {pr.status}
                    </span>
                    <ExternalLink className="size-3 text-muted-foreground opacity-0 group-hover/pr:opacity-100 transition-opacity" />
                  </div>
                </a>
              ))}
            </div>
          </div>
        </motion.div>

        {/* 3. Hackathons Cabinet Tile (Col-Span 1, Row-Span 2) */}
        <motion.div
          whileHover={{ y: -4 }}
          className="bg-card/30 dark:bg-card/20 backdrop-blur-md border border-border/50 rounded-3xl p-6 flex flex-col justify-between shadow-sm relative overflow-hidden group min-h-[380px]"
        >
          <div className="absolute -right-16 -bottom-16 size-48 rounded-full bg-rose-500/10 blur-3xl group-hover:bg-rose-500/20 transition-all duration-300" />

          <div className="space-y-4 w-full z-10">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-xs font-semibold tracking-wider uppercase text-rose-500 dark:text-rose-400">Competitive coding</span>
                <h2 className="text-2xl font-bold tracking-tight">Hackathons</h2>
              </div>
              <Trophy className="size-6 text-rose-500 dark:text-rose-400" />
            </div>

            <p className="text-sm text-muted-foreground">
              Building minimum viable products under tight deadlines, competing nationally.
            </p>

            <div className="space-y-3 pt-2">
              {hackathons.map((hack, i) => (
                <div
                  key={i}
                  onClick={() => setSelectedHackathon(hack)}
                  className="p-4.5 rounded-2xl bg-muted/40 dark:bg-muted/10 border border-border/20 cursor-pointer hover:border-rose-500/30 hover:bg-muted/60 dark:hover:bg-muted/20 transition-all duration-200 group/hack space-y-2 relative"
                >
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-bold text-rose-500 dark:text-rose-400 uppercase tracking-wide">{hack.name}</div>
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full uppercase tracking-wider">
                      <Award className="size-3" />
                      <span>{hack.placement}</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm font-bold text-foreground/90">{hack.project}</div>
                    <div className="text-xs text-muted-foreground font-medium">{hack.role}</div>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2 pt-1">
                    {hack.description}
                  </p>
                  <div className="flex items-center gap-1 text-[10px] text-rose-500 dark:text-rose-400 font-bold uppercase tracking-wider pt-2 opacity-0 group-hover/hack:opacity-100 transition-opacity">
                    <span>View Certificate</span>
                    <ArrowRight className="size-3" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* 4. Platform Badges Tile (Col-Span 2) */}
        <motion.div
          whileHover={{ y: -4 }}
          className="md:col-span-2 bg-card/30 dark:bg-card/20 backdrop-blur-md border border-border/50 rounded-3xl p-6 md:p-8 flex flex-col justify-between shadow-sm relative overflow-hidden group min-h-[260px]"
        >
          <div className="absolute -left-16 -top-16 size-48 rounded-full bg-emerald-500/10 blur-3xl group-hover:bg-emerald-500/20 transition-all duration-300" />

          <div className="space-y-6 w-full z-10 flex-1 flex flex-col justify-between">
            <div className="space-y-1">
              <span className="text-xs font-semibold tracking-wider uppercase text-emerald-500 dark:text-emerald-400">Developer Credentials</span>
              <h2 className="text-2xl font-bold tracking-tight">Earned Badges & Stars</h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4">
              {/* LeetCode Knight Badge */}
              <div
                className="relative bg-muted/40 dark:bg-muted/10 p-4 rounded-2xl border border-border/20 hover:border-emerald-500/30 flex flex-col items-center text-center justify-center gap-2 group/badge cursor-default"
                onMouseEnter={() => setHoveredBadge("knight")}
                onMouseLeave={() => setHoveredBadge(null)}
              >
                <div className="text-3xl filter drop-shadow-[0_4px_6px_rgba(245,158,11,0.2)] group-hover/badge:scale-110 transition-transform duration-200">
                  🛡️
                </div>
                <div className="space-y-0.5">
                  <div className="text-xs font-bold text-foreground">Knight</div>
                  <div className="text-[10px] text-muted-foreground font-semibold">LeetCode rating &gt; 1600</div>
                </div>
              </div>

              {/* Summer of Code Badge */}
              <div
                className="relative bg-muted/40 dark:bg-muted/10 p-4 rounded-2xl border border-border/20 hover:border-emerald-500/30 flex flex-col items-center text-center justify-center gap-2 group/badge cursor-default"
                onMouseEnter={() => setHoveredBadge("ssoc")}
                onMouseLeave={() => setHoveredBadge(null)}
              >
                <div className="text-3xl filter drop-shadow-[0_4px_6px_rgba(16,185,129,0.2)] group-hover/badge:scale-110 transition-transform duration-200">
                  🚀
                </div>
                <div className="space-y-0.5">
                  <div className="text-xs font-bold text-foreground">SSoC Contributor</div>
                  <div className="text-[10px] text-muted-foreground font-semibold">Summer of Code Season 4</div>
                </div>
              </div>

              {/* 50 Days Coding Streak */}
              <div
                className="relative bg-muted/40 dark:bg-muted/10 p-4 rounded-2xl border border-border/20 hover:border-emerald-500/30 flex flex-col items-center text-center justify-center gap-2 group/badge cursor-default"
                onMouseEnter={() => setHoveredBadge("streak")}
                onMouseLeave={() => setHoveredBadge(null)}
              >
                <div className="text-3xl filter drop-shadow-[0_4px_6px_rgba(239,68,68,0.2)] group-hover/badge:scale-110 transition-transform duration-200">
                  🔥
                </div>
                <div className="space-y-0.5">
                  <div className="text-xs font-bold text-foreground">50 Days Streak</div>
                  <div className="text-[10px] text-muted-foreground font-semibold">LeetCode consistency</div>
                </div>
              </div>

              {/* GitHub Star */}
              <div
                className="relative bg-muted/40 dark:bg-muted/10 p-4 rounded-2xl border border-border/20 hover:border-emerald-500/30 flex flex-col items-center text-center justify-center gap-2 group/badge cursor-default"
                onMouseEnter={() => setHoveredBadge("github")}
                onMouseLeave={() => setHoveredBadge(null)}
              >
                <div className="text-3xl filter drop-shadow-[0_4px_6px_rgba(59,130,246,0.2)] group-hover/badge:scale-110 transition-transform duration-200">
                  ⭐
                </div>
                <div className="space-y-0.5">
                  <div className="text-xs font-bold text-foreground">Active PRs</div>
                  <div className="text-[10px] text-muted-foreground font-semibold">GitHub core contributor</div>
                </div>
              </div>
            </div>

            <p className="text-xs text-muted-foreground italic text-center sm:text-left">
              *Badges and certifications verified across official developer profiles. Hover to view requirements.
            </p>
          </div>
        </motion.div>

        {/* 5. RPG Profile Quick-links (Col-Span 2) */}
        <motion.div
          whileHover={{ y: -4 }}
          className="md:col-span-2 bg-card/30 dark:bg-card/20 backdrop-blur-md border border-border/50 rounded-3xl p-6 md:p-8 flex flex-col justify-between shadow-sm relative overflow-hidden group min-h-[220px]"
        >
          <div className="absolute -right-16 -top-16 size-48 rounded-full bg-cyan-500/10 blur-3xl group-hover:bg-cyan-500/20 transition-all duration-300" />

          <div className="space-y-6 w-full z-10">
            <div className="space-y-1">
              <span className="text-xs font-semibold tracking-wider uppercase text-cyan-500 dark:text-cyan-400">Direct Profiles</span>
              <h2 className="text-2xl font-bold tracking-tight">Technical Profile Hub</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {profileLinks.map((link, i) => (
                <a
                  key={i}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    "flex flex-col justify-between p-4 rounded-2xl border border-border/30 hover:border-transparent text-white transition-all duration-300 relative overflow-hidden group/link bg-gradient-to-br shadow-sm hover:shadow-lg",
                    link.color
                  )}
                >
                  <div className="space-y-1">
                    <div className="text-xs font-black uppercase tracking-wider opacity-85">{link.platform}</div>
                    <div className="text-sm font-bold truncate opacity-95">{link.username}</div>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider pt-4 group-hover/link:translate-x-1 transition-transform">
                    <span>Visit Profile</span>
                    <ExternalLink className="size-3" />
                  </div>
                </a>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* 6. Hackathon Certificate Lightbox Modal */}
      <AnimatePresence>
        {selectedHackathon && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedHackathon(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm cursor-pointer"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 350 }}
              className="relative bg-card dark:bg-[#121214] border border-border/50 max-w-3xl w-full rounded-3xl overflow-hidden shadow-2xl z-10 flex flex-col"
            >
              <div className="relative aspect-video w-full bg-zinc-950 flex items-center justify-center border-b border-border/20">
                <Image
                  src={selectedHackathon.certificate}
                  alt={`${selectedHackathon.name} Certificate`}
                  fill
                  className="object-contain p-4"
                  sizes="(max-width: 768px) 100vw, 768px"
                  priority
                />
              </div>
              <div className="p-6 md:p-8 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-rose-500 uppercase tracking-wide">{selectedHackathon.name}</span>
                    <h3 className="text-xl md:text-2xl font-bold tracking-tight">{selectedHackathon.project}</h3>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-500 bg-amber-500/10 px-3 py-1 rounded-full uppercase tracking-wider">
                    <Award className="size-4" />
                    <span>{selectedHackathon.placement}</span>
                  </div>
                </div>
                <div className="text-sm font-semibold text-muted-foreground">
                  Role: <span className="text-foreground">{selectedHackathon.role}</span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {selectedHackathon.description}
                </p>
                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => setSelectedHackathon(null)}
                    className="px-5 py-2 text-xs font-bold uppercase tracking-wider rounded-xl bg-muted hover:bg-muted/80 text-foreground transition-all"
                  >
                    Close Preview
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
