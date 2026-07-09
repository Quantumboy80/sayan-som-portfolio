import { NextResponse } from "next/server";
import { leetcodeUsername } from "@/config/Achievements";

export const revalidate = 3600;

const QUERY = `
  query userStats($username: String!) {
    matchedUser(username: $username) {
      profile {
        ranking
      }
      submitStatsGlobal {
        acSubmissionNum {
          difficulty
          count
        }
      }
      badges {
        id
        displayName
        icon
      }
    }
    userContestRankingHistory(username: $username) {
      attended
      rating
    }
  }
`;

export async function GET() {
  try {
    const res = await fetch("https://leetcode.com/graphql", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: QUERY,
        variables: { username: leetcodeUsername },
      }),
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: "LeetCode API unavailable" },
        { status: 502 },
      );
    }

    const json = await res.json();
    const user = json?.data?.matchedUser;

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const byDifficulty: Record<string, number> = {};
    for (const d of user.submitStatsGlobal?.acSubmissionNum ?? []) {
      byDifficulty[d.difficulty] = d.count;
    }

    const history = (json?.data?.userContestRankingHistory ?? []).filter(
      (h: { attended: boolean }) => h.attended,
    );
    const ratingHistory = history
      .slice(-15)
      .map((h: { rating: number }) => Math.round(h.rating));

    return NextResponse.json({
      solved: byDifficulty.All ?? 0,
      easy: byDifficulty.Easy ?? 0,
      medium: byDifficulty.Medium ?? 0,
      hard: byDifficulty.Hard ?? 0,
      ranking: user.profile?.ranking ?? null,
      ratingHistory,
      badges: (user.badges ?? []).map(
        (b: { id: string; displayName: string; icon: string }) => ({
          id: b.id,
          name: b.displayName,
          icon: b.icon.startsWith("http") ? b.icon : `https://leetcode.com${b.icon}`,
        }),
      ),
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch LeetCode stats" },
      { status: 500 },
    );
  }
}
