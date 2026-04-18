"use client";

import { useEffect, useMemo, useState } from "react";
import { signlearnoTheme as theme, signlearnoText, signlearnoUpperLabel } from "@/components/signlearno/theme";
import { Footer } from "@/components/Footer";
import { Trophy, Medal, Crown } from "lucide-react";
import { getLeaderboardTop10, getMyRank } from "@/lib/api";
import type { LeaderboardUser } from "@/lib/api/backend";

const rankColors = [theme.colors.yellow, "#8B9BB3", "#CD7F32"];
const rankIcons = [Crown, Medal, Trophy];

function getAvatarUrl(user: { name: string }): string {
  const stableSeed = encodeURIComponent(user.name.trim().toLowerCase());
  return `https://i.pravatar.cc/160?u=${stableSeed}`;
}

export default function LeaderboardPage() {
  type RankedUser = {
    id: string;
    rank: number;
    name: string;
    xp: number;
    streak: number;
    isMe: boolean;
  };
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [myRank, setMyRank] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const top10 = await getLeaderboardTop10();
        setUsers(top10);
        try {
          const rank = await getMyRank();
          setMyRank(rank.rank);
        } catch {
          setMyRank(null);
        }
      } catch (nextError) {
        setError(nextError instanceof Error ? nextError.message : "Failed to load leaderboard.");
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  const rankedUsers = useMemo<RankedUser[]>(
    () =>
      users.map((user, index) => ({
        id: user._id,
        rank: index + 1,
        name: user.username,
        xp: user.score,
        streak: user.streak,
        isMe: myRank !== null && myRank === index + 1,
      })),
    [myRank, users],
  );

  const podium: RankedUser[] = [
    rankedUsers[1],
    rankedUsers[0],
    rankedUsers[2],
  ].filter((item): item is RankedUser => Boolean(item));

  return (
    <>
      <main
        className="min-h-screen pt-[70px] md:pt-0"
        style={{ background: theme.colors.canvas, fontFamily: theme.fontFamily }}
      >
        <div style={{ maxWidth: 720, margin: "0 auto", padding: "8px 24px 80px" }}>
          {loading ? <p style={{ ...signlearnoText, color: theme.colors.textMuted }}>Loading leaderboard...</p> : null}
          {error ? <p style={{ ...signlearnoText, color: theme.colors.red }}>{error}</p> : null}

          {/* Top 3 podium */}
          <div style={{ display: "flex", gap: 16, justifyContent: "center", marginBottom: 40, alignItems: "flex-end" }}>
            {podium.map((user, i) => {
              const podiumOrder = [1, 0, 2]; // left=2nd, center=1st, right=3rd
              const height = [120, 148, 100][i];
              const color = rankColors[podiumOrder[i]];
              const Icon = rankIcons[podiumOrder[i]];
              const avatarUrl = getAvatarUrl(user);
              return (
                <div key={user.rank} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, overflow: "visible" }}>
                  <div
                    style={{
                      ...signlearnoText,
                      fontSize: 12,
                      fontWeight: 900,
                      color: "#fff",
                      background: color,
                      borderRadius: 999,
                      padding: "4px 10px",
                      border: "2px solid rgba(0, 0, 0, 0.08)",
                    }}
                  >
                    #{user.rank}
                  </div>
                  <div
                    style={{
                      width: 70,
                      height: 70,
                      borderRadius: "50%",
                      border: `4px solid ${color}`,
                      background: "#fff",
                      overflow: "hidden",
                      marginBottom: 6,
                      boxShadow: "0 8px 18px rgba(0,0,0,0.14)",
                      zIndex: 2,
                    }}
                  >
                    <img
                      src={avatarUrl}
                      alt={`${user.name} avatar`}
                      style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                    />
                  </div>
                  <div
                    style={{
                      ...signlearnoText,
                      fontWeight: 900,
                      fontSize: 16,
                      color: user.rank === 1 ? theme.colors.textStrong : color,
                      background: user.rank === 1 ? "rgba(255, 200, 0, 0.18)" : "rgba(255, 255, 255, 0.8)",
                      borderRadius: 999,
                      padding: "4px 12px",
                      border: `2px solid ${user.rank === 1 ? theme.colors.yellow : color}`,
                    }}
                  >
                    {user.name}
                  </div>
                  <div style={{ ...signlearnoText, fontSize: 13, color: theme.colors.textMuted }}>{user.xp.toLocaleString()} XP</div>
                  <div
                    style={{
                      width: 80,
                      height,
                      borderRadius: "10px 10px 0 0",
                      background: color,
                      display: "flex",
                      alignItems: "flex-start",
                      justifyContent: "center",
                      paddingTop: 12,
                      opacity: 0.9,
                    }}
                  >
                    <Icon size={24} color="#fff" />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Full list */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {rankedUsers.map((user) => {
              const isTop3 = user.rank <= 3;
              const avatarUrl = getAvatarUrl(user);
              return (
                <div
                  key={user.rank}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 16,
                    padding: "14px 20px",
                    borderRadius: theme.radius.card,
                    background: isTop3 ? "rgba(255, 255, 255, 0.92)" : user.isMe ? theme.colors.greenSoft : theme.colors.surface,
                    border: `2px solid ${isTop3 ? rankColors[user.rank - 1] : user.isMe ? theme.colors.green : theme.colors.border}`,
                    borderBottom: `4px solid ${isTop3 ? rankColors[user.rank - 1] : user.isMe ? theme.colors.greenDark : theme.colors.border}`,
                  }}
                >
                  {/* Rank */}
                  <div
                    style={{
                      minWidth: 44,
                      textAlign: "center",
                      ...signlearnoText,
                      fontWeight: 900,
                      fontSize: 16,
                      color: isTop3 ? "#fff" : theme.colors.textMuted,
                      background: isTop3 ? rankColors[user.rank - 1] : "transparent",
                      borderRadius: 999,
                      padding: isTop3 ? "4px 8px" : "0",
                    }}
                  >
                    {user.rank}
                  </div>
                  {/* Avatar */}
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: "50%",
                      border: `3px solid ${isTop3 ? rankColors[user.rank - 1] : theme.colors.border}`,
                      background: "#fff",
                      overflow: "hidden",
                      marginLeft: -6,
                      boxShadow: "0 6px 12px rgba(0,0,0,0.12)",
                    }}
                  >
                    <img
                      src={avatarUrl}
                      alt={`${user.name} avatar`}
                      style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                    />
                  </div>
                  {/* Name */}
                  <div
                    style={{
                      flex: 1,
                      ...signlearnoText,
                      fontWeight: isTop3 ? 900 : 700,
                      fontSize: isTop3 ? 18 : 16,
                      color: isTop3 ? rankColors[user.rank - 1] : theme.colors.textStrong,
                    }}
                  >
                    {user.name}
                    {user.isMe && (
                      <span style={{ marginLeft: 8, ...signlearnoUpperLabel, color: theme.colors.green, background: theme.colors.greenSoft, padding: "2px 8px", borderRadius: 20 }}>YOU</span>
                    )}
                  </div>
                  {/* Streak */}
                  <div style={{ display: "flex", alignItems: "center", gap: 4, ...signlearnoText, fontSize: 14, color: theme.colors.orange, fontWeight: 600 }}>
                    🔥 {user.streak}
                  </div>
                  {/* XP */}
                  <div style={{ ...signlearnoText, fontWeight: 700, fontSize: 15, color: theme.colors.textStrong, minWidth: 80, textAlign: "right" }}>
                    {user.xp.toLocaleString()} XP
                  </div>
                </div>
              );
            })}
            {!loading && rankedUsers.length === 0 ? (
              <div style={{ ...signlearnoText, color: theme.colors.textMuted }}>No leaderboard data available.</div>
            ) : null}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
