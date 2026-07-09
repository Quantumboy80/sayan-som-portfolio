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
    }
    userContestRankingHistory(username: $username) {
      attended
      rating
      contest {
        title
      }
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
    const history = (json?.data?.userContestRankingHistory ?? []).filter(
      (h: { attended: boolean }) => h.attended,
    );

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 },
      );
    }

    const solved =
      user.submitStatsGlobal?.acSubmissionNum?.reduce(
        (acc: number, d: { difficulty: string; count: number }) =>
          d.difficulty === "All" ? acc + d.count : acc,
        0,
      ) ?? 0;

    const ratingHistory = history
      .slice(-15)
      .map((h: { rating: number }) => Math.round(h.rating));

    return NextResponse.json({
      solved,
      ranking: user.profile?.ranking ?? null,
      ratingHistory,
      currentRating: ratingHistory.at(-1) ?? null,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch LeetCode stats" },
      { status: 500 },
    );
  }
}
