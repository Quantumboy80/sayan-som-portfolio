"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import {
  Trophy,
  GitPullRequest,
  Zap,
  BadgeCheck,
  ExternalLink,
} from "lucide-react";
import { Line, LineChart, ResponsiveContainer } from "recharts";
import {
  research,
  openSource,
  hackathons,
  credentials,
} from "@/config/Achievements";

type LeetCodeStats = {
  solved: number;
  ranking: number | null;
  ratingHistory: number[];
  currentRating: number | null;
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 },
};

function Tile({
  className = "",
  children,
  delay = 0,
}: {
  className?: string;
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.4, delay }}
      className={`rounded-xl border border-border bg-card p-5 ${className}`}
    >
      {children}
    </motion.div>
  );
}

function SectionLabel({
  icon: Icon,
  children,
}: {
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-3 flex items-center gap-2 text-sm text-muted-foreground">
      <Icon className="h-4 w-4" />
      <span>{children}</span>
    </div>
  );
}

function LeetCodeTile() {
  const [stats, setStats] = useState<LeetCodeStats | null>(null);
  const [failed, setFailed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetch("/api/leetcode")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then(setStats)
      .catch(() => setFailed(true));
  }, []);

  return (
    <Tile className="col-span-6 flex flex-col justify-between md:col-span-2">
      <div className="flex items-center justify-between">
        <SectionLabel icon={Zap}>LeetCode</SectionLabel>
        {stats && !failed && (
          <span className="rounded-md bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
            Live
          </span>
        )}
      </div>

      {failed && (
        <p className="text-sm text-muted-foreground">Stats unavailable</p>
      )}

      {!failed && (
        <>
          <div>
            <p className="text-2xl font-medium tabular-nums">
              {stats?.solved ?? "—"}
            </p>
            <p className="text-xs text-muted-foreground">problems solved</p>
          </div>

          {mounted && stats?.ratingHistory && stats.ratingHistory.length > 1 && (
            <div className="mt-2 h-8 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={stats.ratingHistory.map((v, i) => ({ i, v }))}
                >
                  <Line
                    type="monotone"
                    dataKey="v"
                    stroke="currentColor"
                    className="text-primary"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </>
      )}
    </Tile>
  );
}

export function Achievements() {
  return (
    <section id="achievements" className="mx-auto max-w-4xl px-4 py-20">
      <h2 className="mb-8 text-xl font-medium">Achievements</h2>

      <div className="grid grid-cols-6 gap-3">
        {/* Research — largest tile, highest signal */}
        {research.map((item, i) => (
          <Tile
            key={item.title}
            delay={i * 0.05}
            className="col-span-6 md:col-span-4"
          >
            <SectionLabel icon={Trophy}>Research and recognition</SectionLabel>
            <p className="mb-1 font-medium">{item.title}</p>
            <p className="mb-3 text-sm leading-relaxed text-muted-foreground">
              {item.description}
            </p>
            <div className="flex flex-wrap gap-2">
              {item.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-md bg-muted px-2.5 py-1 text-xs text-muted-foreground"
                >
                  {tag}
                </span>
              ))}
            </div>
            {item.link && (
              <a
                href={item.link}
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-flex items-center gap-1 text-xs text-primary hover:underline"
              >
                View source <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </Tile>
        ))}

        <LeetCodeTile />

        {/* Open source */}
        {openSource.map((item, i) => (
          <Tile
            key={item.program}
            delay={0.1 + i * 0.05}
            className="col-span-6 md:col-span-3"
          >
            <SectionLabel icon={GitPullRequest}>Open source</SectionLabel>
            <p className="mb-2 font-medium">{item.program}</p>
            <p className="mb-3 text-sm text-muted-foreground">
              {item.description}
            </p>
            <div className="flex flex-col gap-3">
              <div className="flex gap-6">
                {typeof item.mergedPRs === "number" && (
                  <div>
                    <p className="text-lg font-medium tabular-nums">
                      {item.mergedPRs}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      PRs merged
                    </p>
                  </div>
                )}
                {typeof item.repos === "number" && (
                  <div>
                    <p className="text-lg font-medium tabular-nums">
                      {item.repos}
                    </p>
                    <p className="text-xs text-muted-foreground">repos</p>
                  </div>
                )}
              </div>
              {item.link && (
                <a
                  href={item.link}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                >
                  View profile <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
          </Tile>
        ))}

        {/* Hackathons */}
        <Tile delay={0.15} className="col-span-6 md:col-span-3">
          <SectionLabel icon={Zap}>Hackathons</SectionLabel>
          <ul className="space-y-2">
            {hackathons.map((h) => (
              <li key={h.name} className="flex items-start gap-2 text-sm">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                <span>
                  <span className="font-medium">{h.name}</span>
                  <span className="text-muted-foreground">
                    {" "}
                    — {h.track}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </Tile>

        {/* Credentials */}
        <Tile delay={0.2} className="col-span-6">
          <SectionLabel icon={BadgeCheck}>Credentials</SectionLabel>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {credentials.map((c) => (
              <div
                key={c.name}
                className="group relative h-20 [perspective:600px]"
              >
                <div className="relative h-full w-full rounded-lg border border-border transition-transform duration-500 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)]">
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 rounded-lg [backface-visibility:hidden]">
                    <BadgeCheck className="h-4 w-4 text-primary" />
                    <p className="text-center text-xs font-medium">
                      {c.name}
                    </p>
                  </div>
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5 rounded-lg bg-muted p-2 text-center [backface-visibility:hidden] [transform:rotateY(180deg)]">
                    <p className="text-xs font-medium">{c.issuer}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {c.date}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Tile>
      </div>
    </section>
  );
}
export default Achievements;
