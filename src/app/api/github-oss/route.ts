import { NextResponse } from "next/server";
import { openSourcePrograms } from "@/config/Achievements";

export const dynamic = "force-dynamic";

async function countMergedPRs(username: string, repos?: { owner: string; repo: string }[]) {
  const repoFilter = repos?.length
    ? repos.map((r) => `repo:${r.owner}/${r.repo}`).join(" ")
    : "";

  const q = encodeURIComponent(
    `author:${username} is:pr is:merged ${repoFilter}`.trim(),
  );

  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
  };
  if (process.env.GITHUB_TOKEN) {
    headers["Authorization"] = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  const res = await fetch(
    `https://api.github.com/search/issues?q=${q}&per_page=1`,
    {
      headers,
      cache: "no-store",
    },
  );

  if (!res.ok) return null;
  const json = await res.json();
  return json.total_count ?? 0;
}

export async function GET() {
  try {
    const results = await Promise.all(
      openSourcePrograms.map(async (program) => {
        if (!program.live || !program.githubUsername) {
          return { name: program.name, mergedPRs: null };
        }
        const mergedPRs = await countMergedPRs(
          program.githubUsername,
          program.repos,
        );
        return { name: program.name, mergedPRs };
      }),
    );

    return NextResponse.json({ programs: results });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch GitHub stats" },
      { status: 500 },
    );
  }
}
