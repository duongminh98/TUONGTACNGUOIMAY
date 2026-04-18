"use client";

import { useEffect, useMemo, useState } from "react";
import { Footer } from "@/components/Footer";
import { signlearnoTheme as theme, signlearnoText } from "@/components/signlearno/theme";
import { Flame, TrendingUp, BookOpen, Target, Trophy } from "lucide-react";
import { getDashboard, getLearningHistory, getProfile } from "@/lib/api";
import type { DashboardData, LearningHistoryItem } from "@/lib/api/backend";

export default function DashboardPage() {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [history, setHistory] = useState<LearningHistoryItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(() => new Date());

  useEffect(() => {
    const load = async () => {
      try {
        const [dashboardData, historyData] = await Promise.all([
          getDashboard(),
          getLearningHistory(),
          getProfile(),
        ]);
        setDashboard(dashboardData);
        setHistory(historyData);
      } catch (nextError) {
        setError(nextError instanceof Error ? nextError.message : "Failed to load dashboard.");
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  useEffect(() => {
    let midnightTimer: ReturnType<typeof setTimeout> | null = null;

    const scheduleMidnightRefresh = () => {
      const now = new Date();
      const nextMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
      const delay = Math.max(1000, nextMidnight.getTime() - now.getTime() + 1000);

      midnightTimer = setTimeout(() => {
        setCurrentDate(new Date());
        scheduleMidnightRefresh();
      }, delay);
    };

    scheduleMidnightRefresh();

    return () => {
      if (midnightTimer) clearTimeout(midnightTimer);
    };
  }, []);

  const stats = [
    {
      label: "Total XP",
      value: `${dashboard?.stats?.totalScore ?? 0}`,
      change: "From completed lessons",
      icon: Flame,
      color: theme.colors.orange,
      bgColor: "rgba(255, 150, 0, 0.12)",
    },
    {
      label: "Streak",
      value: `${dashboard?.stats?.streak ?? 0} days`,
      change: "Keep it up!",
      icon: Trophy,
      color: theme.colors.yellow,
      bgColor: "rgba(255, 200, 0, 0.12)",
    },
    {
      label: "Lessons Done",
      value: `${dashboard?.stats?.totalLessonsCompleted ?? 0}`,
      change: "Total completed",
      icon: BookOpen,
      color: theme.colors.blue,
      bgColor: "rgba(28, 176, 246, 0.12)",
    },
    {
      label: "Recent Activity",
      value: `${dashboard?.stats?.recentActivities ?? 0}`,
      change: "Last 3 days",
      icon: Target,
      color: theme.colors.green,
      bgColor: "rgba(88, 204, 2, 0.12)",
    },
  ];

  const weeklyProgress = useMemo(() => {
    const heights = [78, 72, 88, 98, 84, 104, 112];
    const formatter = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" });
    const today = currentDate;

    return heights.map((height, index) => {
      const date = new Date(today);
      date.setDate(today.getDate() - (heights.length - 1 - index));
      return {
        height,
        label: index === heights.length - 1 ? "Today" : formatter.format(date),
      };
    });
  }, [currentDate]);

  const getActivityLabel = (item: LearningHistoryItem): string => {
    if (typeof item.lessonId === "string") {
      return `Completed activity: ${item.lessonId}`;
    }

    const title = item.lessonId.title;
    if (item.lessonId.type === "practice") {
      return `Completed practice: ${title}`;
    }

    return `Completed lesson: ${title}`;
  };

  const formatActivityDate = (value: string): string => {
    const target = new Date(value);
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfTarget = new Date(target.getFullYear(), target.getMonth(), target.getDate());
    const diffDays = Math.floor((startOfToday.getTime() - startOfTarget.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    return target.toLocaleDateString();
  };

  return (
    <>
      <main className="min-h-screen pt-[70px] md:pt-0" style={{ background: theme.colors.surface }}>
        <div
          className="flex min-h-[calc(100vh-70px)] flex-col md:min-h-screen"
          style={{
            maxWidth: "100%",
            margin: "0",
            padding: "20px 24px 24px",
          }}
        >
          {loading ? (
            <div style={{ ...signlearnoText, color: theme.colors.textMuted, marginBottom: 20 }}>
              Loading dashboard...
            </div>
          ) : null}
          {error ? (
            <div style={{ ...signlearnoText, color: theme.colors.red, marginBottom: 20 }}>{error}</div>
          ) : null}
          {/* Stats Grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: 20,
              marginBottom: 18,
            }}
          >
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.label}
                  style={{
                    borderRadius: 20,
                    border: `2px solid ${theme.colors.border}`,
                    background: theme.colors.surface,
                    padding: 24,
                    minHeight: 160,
                    display: "flex",
                    flexDirection: "column",
                    gap: 16,
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.04)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: "50%",
                        background: stat.bgColor,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: stat.color,
                      }}
                    >
                      <Icon size={22} />
                    </div>
                    <span
                      style={{
                        color: theme.colors.textMuted,
                        fontSize: 14,
                        fontWeight: 600,
                        textTransform: "uppercase",
                        letterSpacing: 0.5,
                        ...signlearnoText,
                      }}
                    >
                      {stat.label}
                    </span>
                  </div>

                  <div>
                    <div
                      style={{
                        color: theme.colors.textStrong,
                        fontSize: 28,
                        fontWeight: 800,
                        lineHeight: "34px",
                        ...signlearnoText,
                      }}
                    >
                      {stat.value}
                    </div>
                    <div
                      style={{
                        marginTop: 8,
                        color: theme.colors.green,
                        fontSize: 13,
                        fontWeight: 600,
                        ...signlearnoText,
                      }}
                    >
                      {stat.change}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Main Content Grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
              gap: 20,
              flex: 1,
              minHeight: 0,
              alignItems: "stretch",
              gridAutoRows: "minmax(0, 1fr)",
              paddingBottom: 20,
            }}
          >
            {/* Progress Chart */}
            <div
              style={{
                borderRadius: 20,
                border: `2px solid ${theme.colors.border}`,
                background: theme.colors.surface,
                padding: 18,
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.04)",
                minHeight: 0,
                height: "100%",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  marginBottom: 24,
                }}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    background: "rgba(88, 204, 2, 0.12)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: theme.colors.green,
                  }}
                >
                  <TrendingUp size={20} />
                </div>
                <h2
                  style={{
                    color: theme.colors.textStrong,
                    fontSize: 20,
                    fontWeight: 700,
                    ...signlearnoText,
                  }}
                >
                  Weekly Progress
                </h2>
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(7, 1fr)",
                  gap: 6,
                  marginTop: "auto",
                  alignItems: "end",
                }}
              >
                {weeklyProgress.map((item) => {
                  return (
                    <div key={item.label} style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "center" }}>
                      <div style={{ width: "100%", height: 116, display: "flex", alignItems: "flex-end" }}>
                        <div
                          style={{
                            width: "100%",
                            height: `${item.height}px`,
                            borderRadius: 12,
                            background: `linear-gradient(180deg, ${theme.colors.greenSoft} 0%, ${theme.colors.green} 100%)`,
                          }}
                        />
                      </div>
                      <div
                        style={{
                          textAlign: "center",
                          color: theme.colors.textMuted,
                          fontSize: 12,
                          fontWeight: 600,
                          ...signlearnoText,
                        }}
                      >
                        {item.label}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recent Activity */}
            <div
              style={{
                borderRadius: 20,
                border: `2px solid ${theme.colors.border}`,
                background: theme.colors.surface,
                padding: 18,
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.04)",
                minHeight: 0,
                height: "100%",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <h2
                style={{
                  color: theme.colors.textStrong,
                  fontSize: 20,
                  fontWeight: 700,
                  marginBottom: 24,
                  ...signlearnoText,
                }}
              >
                Recent Activity
              </h2>

              <div style={{ display: "flex", flexDirection: "column", gap: 16, minHeight: 0, overflowY: "auto", paddingRight: 4 }}>
                {history.slice(0, 4).map((item, idx, recentItems) => (
                  <div
                    key={item._id}
                    style={{
                      paddingBottom: idx < recentItems.length - 1 ? 16 : 0,
                      borderBottom: idx < recentItems.length - 1 ? `1px solid ${theme.colors.border}` : "none",
                    }}
                  >
                    <div
                      style={{
                        padding: "10px 12px",
                        borderRadius: 14,
                        background: theme.colors.greenSoft,
                        color: theme.colors.textStrong,
                        fontSize: 14,
                        fontWeight: 600,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 12,
                        ...signlearnoText,
                      }}
                    >
                      <span>
                        <span style={{ color: theme.colors.green, fontWeight: 800 }}>✓</span> {getActivityLabel(item)}
                      </span>
                      <span style={{ ...signlearnoText, color: theme.colors.textMuted, fontSize: 13, fontWeight: 600 }}>
                        {formatActivityDate(item.date)}
                      </span>
                    </div>
                  </div>
                ))}
                {!loading && history.length === 0 ? (
                  <div style={{ ...signlearnoText, color: theme.colors.textMuted }}>No learning history yet.</div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
