"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Trophy, GitPullRequest, Zap, FileText, ExternalLink, Cloud, Gift } from "lucide-react";
import { research, openSourcePrograms, hackathons, arcade } from "@/config/Achievements";

type LeetCodeStats = {
  solved: number;
  easy: number;
  medium: number;
  hard: number;
  badges: { id: string; name: string; icon: string }[];
};

type OssResult = { name: string; mergedPRs: number | null };

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 },
};

function Tile({
  className = "",
  children,
  delay = 0,
  featured = false,
}: {
  className?: string;
  children: React.ReactNode;
  delay?: number;
  featured?: boolean;
}) {
  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.4, delay }}
      className={`rounded-xl border bg-card p-5 ${
        featured ? "border-l-[3px] border-l-primary border-border" : "border-border"
      } ${className}`}
    >
      {children}
    </motion.div>
  );
}

function SectionLabel({ icon: Icon, children }: { icon: React.ElementType; children: React.ReactNode }) {
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

  useEffect(() => {
    fetch("/api/leetcode")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then(setStats)
      .catch(() => setFailed(true));
  }, []);

  const total = stats ? stats.easy + stats.medium + stats.hard : 0;

  return (
    <Tile className="col-span-6 md:col-span-3">
      <div className="mb-3 flex items-center justify-between">
        <SectionLabel icon={Zap}>LeetCode</SectionLabel>
        {stats && !failed && (
          <span className="rounded-md bg-green-500/10 px-2 py-0.5 text-[10px] font-medium text-green-500">
            Live
          </span>
        )}
      </div>

      {failed && <p className="text-sm text-muted-foreground">Stats unavailable</p>}

      {!failed && stats && (
        <>
          <p className="text-2xl font-medium tabular-nums">{stats.solved}</p>
          <p className="mb-3 text-xs text-muted-foreground">problems solved</p>

          {total > 0 && (
            <div className="mb-1 flex h-1.5 gap-0.5 overflow-hidden rounded-full">
              <div className="bg-green-500" style={{ width: `${(stats.easy / total) * 100}%` }} />
              <div className="bg-amber-500" style={{ width: `${(stats.medium / total) * 100}%` }} />
              <div className="bg-red-500" style={{ width: `${(stats.hard / total) * 100}%` }} />
            </div>
          )}

          {stats.badges.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {stats.badges.slice(0, 6).map((b) => (
                <img
                  key={b.id}
                  src={b.icon}
                  alt={b.name}
                  title={b.name}
                  className="h-8 w-8 rounded-md border border-border object-contain"
                />
              ))}
            </div>
          )}
        </>
      )}
    </Tile>
  );
}

function OpenSourceTiles() {
  const [live, setLive] = useState<OssResult[]>([]);

  useEffect(() => {
    fetch("/api/github-oss")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => setLive(d.programs ?? []))
      .catch(() => {});
  }, []);

  return (
    <>
      {openSourcePrograms.map((program, i) => {
        const liveResult = live.find((l) => l.name === program.name);
        return (
          <Tile key={program.name} delay={0.1 + i * 0.05} className="col-span-6 md:col-span-3">
            <div className="mb-2 flex items-center justify-between">
              <SectionLabel icon={GitPullRequest}>Open source</SectionLabel>
              {program.live && liveResult?.mergedPRs !== null && liveResult?.mergedPRs !== undefined && (
                <span className="rounded-md bg-green-500/10 px-2 py-0.5 text-[10px] font-medium text-green-500">
                  Live
                </span>
              )}
            </div>
            <p className="mb-1 font-medium">{program.name}</p>
            <p className="mb-3 text-sm text-muted-foreground">{program.description}</p>
            <div className="flex flex-col gap-3">
              {liveResult?.mergedPRs !== null && liveResult?.mergedPRs !== undefined && (
                <div>
                  <p className="text-lg font-medium tabular-nums">{liveResult.mergedPRs}</p>
                  <p className="text-xs text-muted-foreground">PRs merged</p>
                </div>
              )}
              {program.link && (
                <a
                  href={program.link}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                >
                  View profile <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
          </Tile>
        );
      })}
    </>
  );
}

export function Achievements() {
  const [selectedSwagImage, setSelectedSwagImage] = useState<string | null>(null);

  return (
    <section id="achievements" className="mx-auto max-w-4xl px-4 py-20">
      <h2 className="mb-8 text-xl font-medium">Achievements</h2>

      <div className="grid grid-cols-6 gap-3">
        {research.map((item, i) => (
          <Tile key={item.title} delay={i * 0.05} featured={i === 0} className="col-span-6 md:col-span-4">
            <SectionLabel icon={Trophy}>Research and recognition</SectionLabel>
            <p className="mb-1 font-medium">{item.title}</p>
            <p className="mb-3 text-sm leading-relaxed text-muted-foreground">{item.description}</p>
            <div className="mb-3 flex flex-wrap gap-2">
              {item.tags.map((tag) => (
                <span key={tag} className="rounded-md bg-muted px-2.5 py-1 text-xs text-muted-foreground">
                  {tag}
                </span>
              ))}
            </div>
            <div className="flex gap-4">
              {item.link && (
                <a href={item.link} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
                  View source <ExternalLink className="h-3 w-3" />
                </a>
              )}
              {item.pdfPath && (
                <a href={item.pdfPath} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
                  <FileText className="h-3 w-3" /> Read PDF
                </a>
              )}
            </div>
          </Tile>
        ))}

        <LeetCodeTile />
        <OpenSourceTiles />

        <Tile delay={0.2} className="col-span-6 md:col-span-3">
          <SectionLabel icon={Zap}>Hackathons</SectionLabel>
          <ul className="space-y-2">
            {hackathons.map((h) => (
              <li key={h.name} className="flex items-start gap-2 text-sm">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                <span>
                  <span className="font-medium">{h.name}</span>
                  <span className="text-muted-foreground"> — {h.track}</span>
                </span>
              </li>
            ))}
          </ul>
        </Tile>

        {/* Google Cloud Arcade */}
        {arcade.map((item, i) => (
          <Tile key={item.name} delay={0.25 + i * 0.05} className="col-span-6 md:col-span-3 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <SectionLabel icon={Cloud}>Google Cloud Arcade</SectionLabel>
                <span className="rounded-md bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium text-amber-500">
                  {item.tier}
                </span>
              </div>
              <p className="mb-1 font-medium">{item.name}</p>
              <p className="mb-3 text-sm leading-relaxed text-muted-foreground">
                {item.description}
              </p>
            </div>
            {item.imagePath && (
              <div className="mt-2">
                <button
                  onClick={() => setSelectedSwagImage(item.imagePath || null)}
                  className="group relative flex items-center gap-2 rounded-lg border border-border bg-muted/40 p-2 text-xs font-medium text-primary hover:bg-muted/80 transition-colors"
                >
                  <Gift className="h-3.5 w-3.5" />
                  <span>View Swag Goodies</span>
                </button>
              </div>
            )}
          </Tile>
        ))}
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedSwagImage && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedSwagImage(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm cursor-pointer"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative max-w-3xl w-full rounded-2xl overflow-hidden bg-card border border-border shadow-2xl z-10 p-2"
            >
              <img
                src={selectedSwagImage}
                alt="Google Cloud Swag Goodies"
                className="w-full h-auto max-h-[75vh] object-contain rounded-lg"
              />
              <div className="flex justify-between items-center p-4">
                <p className="text-xs text-muted-foreground">Google Cloud Arcade — Legend Tier Goodies Swag</p>
                <button
                  onClick={() => setSelectedSwagImage(null)}
                  className="rounded-md bg-muted px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted/80"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
export default Achievements;
