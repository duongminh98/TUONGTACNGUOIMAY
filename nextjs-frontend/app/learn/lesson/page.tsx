"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { signlearnoTheme as theme, signlearnoText } from "@/components/signlearno/theme";
import { completeLesson, getLearningHistory, getLessonById, getLessons, getStoredToken } from "@/lib/api";
import type { Lesson } from "@/lib/api/backend";
import { FlashcardView } from "@/components/sign-translator/learn";
import type { Unit } from "@/components/sign-translator/types";

export default function LessonPage() {
  const storedToken = getStoredToken();
  const LESSON_PROGRESS_STORAGE_KEY = `lesson_progress_v1:${storedToken ?? "guest"}`;
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
  const [selectedInitialCardIndex, setSelectedInitialCardIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [completing, setCompleting] = useState(false);
  const [completedLessonIds, setCompletedLessonIds] = useState<Record<string, boolean>>({});
  const [lessonProgressById, setLessonProgressById] = useState<Record<string, { index: number; total: number; percent: number }>>({});
  const [xpPopup, setXpPopup] = useState<{ lessonId: string; xp: number } | null>(null);

  const loadStoredLessonProgress = (): Record<string, { index: number; total: number; percent: number }> => {
    if (typeof window === "undefined") return {};
    try {
      const raw = window.localStorage.getItem(LESSON_PROGRESS_STORAGE_KEY);
      if (!raw) return {};
      const parsed = JSON.parse(raw) as Record<string, { index: number; total: number; percent: number }>;
      return parsed && typeof parsed === "object" ? parsed : {};
    } catch {
      return {};
    }
  };

  const saveStoredLessonProgress = (nextProgress: Record<string, { index: number; total: number; percent: number }>) => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(LESSON_PROGRESS_STORAGE_KEY, JSON.stringify(nextProgress));
  };

  const handleProgressChange = useCallback(
    (payload: { index: number; total: number; percent: number }) => {
      if (!selectedLessonId) return;
      setLessonProgressById((current) => {
        const previous = current[selectedLessonId];
        if (
          previous &&
          previous.index === payload.index &&
          previous.total === payload.total &&
          previous.percent === payload.percent
        ) {
          return current;
        }
        const next = { ...current, [selectedLessonId]: payload };
        saveStoredLessonProgress(next);
        return next;
      });
    },
    [selectedLessonId],
  );

  useEffect(() => {
    setLessonProgressById(loadStoredLessonProgress());
  }, []);

  useEffect(() => {
    if (!xpPopup) return;
    const timer = window.setTimeout(() => setXpPopup(null), 2200);
    return () => window.clearTimeout(timer);
  }, [xpPopup]);

  const loadLessons = useCallback(async () => {
    try {
      const data = await getLessons("lesson");
      setLessons(data);
      try {
        const histories = await getLearningHistory();
        const completedMap: Record<string, boolean> = {};
        histories.forEach((item) => {
          const lessonId = typeof item.lessonId === "string" ? item.lessonId : item.lessonId._id;
          if (lessonId) completedMap[lessonId] = true;
        });
        setCompletedLessonIds(completedMap);
      } catch {
        // ignore history in guest mode
      }
    } catch (nextError) {
      setStatusMessage(nextError instanceof Error ? nextError.message : "Failed to load lessons.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadLessons();
  }, [loadLessons]);

  useEffect(() => {
    const refreshLessons = () => {
      setLoading(true);
      void loadLessons();
    };

    window.addEventListener("admin-content-created", refreshLessons);
    return () => window.removeEventListener("admin-content-created", refreshLessons);
  }, [loadLessons]);

  const mapLessonToUnit = (lesson: Lesson): Unit => {
    const flashcards =
      lesson.resources?.map((resource) => ({
        word: resource.title,
        videoUrl: resource.url,
      })) ?? [];

    return {
      id: lesson._id,
      title: lesson.title,
      subtitle: lesson.content || "Sign language lesson",
      completed: !!completedLessonIds[lesson._id],
      color: theme.colors.green,
      levelsHeight: 1,
      nodes: [],
      flashcards,
    };
  };

  const openLesson = async (lessonId: string) => {
    try {
      const detail = await getLessonById(lessonId);
      setSelectedLessonId(lessonId);
      setSelectedUnit(mapLessonToUnit(detail));
      const stored = lessonProgressById[lessonId];
      const resourcesCount = Array.isArray(detail.resources) ? detail.resources.length : 0;
      const safeIndex = resourcesCount > 0 ? Math.min(Math.max(stored?.index ?? 0, 0), resourcesCount - 1) : 0;
      setSelectedInitialCardIndex(safeIndex);
      setStatusMessage(null);
    } catch (nextError) {
      setStatusMessage(nextError instanceof Error ? nextError.message : "Failed to load lesson detail.");
    }
  };

  const handleDone = async () => {
    if (!selectedLessonId) return;
    if (completedLessonIds[selectedLessonId]) {
      setStatusMessage(null);
      setSelectedUnit(null);
      setSelectedLessonId(null);
      return;
    }

    const selectedLesson = lessons.find((item) => item._id === selectedLessonId);
    if (!selectedLesson) return;

    setCompleting(true);
    try {
      await completeLesson(selectedLessonId);
      setStatusMessage(null);
      setCompletedLessonIds((current) => ({ ...current, [selectedLessonId]: true }));
      setLessonProgressById((current) => {
        const total = selectedLesson.resources?.length ?? current[selectedLessonId]?.total ?? 1;
        const next = {
          ...current,
          [selectedLessonId]: { index: Math.max(0, total - 1), total: Math.max(1, total), percent: 100 },
        };
        saveStoredLessonProgress(next);
        return next;
      });
      setXpPopup({ lessonId: selectedLessonId, xp: selectedLesson.scoreReward });
      setSelectedUnit(null);
      setSelectedLessonId(null);
    } catch (nextError) {
      setStatusMessage(nextError instanceof Error ? nextError.message : "Complete failed.");
    } finally {
      setCompleting(false);
    }
  };

  const lessonStyles = [
    { bg: "linear-gradient(180deg, #D7F7C7 0%, #BEEFA7 100%)", emoji: "🦁🐘" },
    { bg: "linear-gradient(180deg, #D8F3FF 0%, #BFEAFB 100%)", emoji: "👋" },
    { bg: "linear-gradient(180deg, #FFF6C7 0%, #F7ECA7 100%)", emoji: "🔢" },
    { bg: "linear-gradient(180deg, #FFE6C7 0%, #FFD7A7 100%)", emoji: "☕⏰" },
    { bg: "linear-gradient(180deg, #F1E2FF 0%, #E6CCFF 100%)", emoji: "😀😯" },
  ];

  const orderedLessons = useMemo(
    () => [...lessons].sort((a, b) => (a.order ?? Number.MAX_SAFE_INTEGER) - (b.order ?? Number.MAX_SAFE_INTEGER)),
    [lessons],
  );

  const lessonIsFinished = (lessonId: string) => {
    if (completedLessonIds[lessonId]) return true;
    const p = lessonProgressById[lessonId]?.percent ?? 0;
    return p >= 100;
  };

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: "20px 24px 40px" }}>
      {loading ? <p style={{ ...signlearnoText, color: theme.colors.textMuted }}>Loading lessons...</p> : null}
      {statusMessage ? (
        <p
          style={{
            ...signlearnoText,
            color: statusMessage.startsWith("Completed") ? theme.colors.green : theme.colors.red,
          }}
        >
          {statusMessage}
        </p>
      ) : null}
      {selectedUnit ? (
        <div style={{ marginTop: 24 }}>
          <FlashcardView
            unit={selectedUnit}
            initialIndex={selectedInitialCardIndex}
            onProgressChange={handleProgressChange}
            onBack={() => {
              setSelectedUnit(null);
              setSelectedLessonId(null);
            }}
            onDone={() => {
              if (completing) return;
              void handleDone();
            }}
          />
        </div>
      ) : (
        <div style={{ marginTop: 16, display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16 }}>
          {orderedLessons.map((lesson, index) => {
            const card = lessonStyles[index % lessonStyles.length];
            const finished = lessonIsFinished(lesson._id);
            const lessonProgress = lessonProgressById[lesson._id];
            const percentForLesson = finished ? 100 : lessonProgress?.percent ?? 0;
            const visiblePercentForLesson = percentForLesson <= 0 ? 0 : Math.max(percentForLesson, 8);

            return (
              <div key={lesson._id} style={{ position: "relative" }}>
                <button
                  type="button"
                  onClick={() => void openLesson(lesson._id)}
                  style={{
                    borderRadius: 16,
                    border: `2px solid ${theme.colors.border}`,
                    background: card.bg,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "stretch",
                    padding: "12px 12px 14px",
                    gap: 8,
                    height: 250,
                    width: "100%",
                    textAlign: "left",
                    cursor: "pointer",
                    transition: "transform 220ms ease, box-shadow 220ms ease, filter 220ms ease",
                    boxShadow: "0 4px 0 rgba(0, 0, 0, 0.12)",
                  }}
                  onMouseEnter={(event) => {
                    event.currentTarget.style.transform = "translateY(-3px)";
                    event.currentTarget.style.boxShadow = "0 10px 0 rgba(0, 0, 0, 0.16)";
                    event.currentTarget.style.filter = "brightness(1.01)";
                  }}
                  onMouseLeave={(event) => {
                    event.currentTarget.style.transform = "translateY(0)";
                    event.currentTarget.style.boxShadow = "0 4px 0 rgba(0, 0, 0, 0.12)";
                    event.currentTarget.style.filter = "none";
                  }}
                >
                  <div style={{ ...signlearnoText, color: "#111", fontSize: 32, lineHeight: 1, height: 34 }}>{card.emoji}</div>
                  <div
                    style={{
                      ...signlearnoText,
                      color: "#111",
                      fontSize: 30,
                      fontWeight: 800,
                      lineHeight: "32px",
                      minHeight: 64,
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {lesson.title}
                  </div>
                  <div
                    style={{
                      ...signlearnoText,
                      color: "#2F2F2F",
                      fontSize: 14,
                      fontWeight: 600,
                      lineHeight: "20px",
                      minHeight: 40,
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {lesson.content || "Learn with interactive sign language cards."}
                  </div>

                  <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: 8, paddingBottom: 2 }}>
                    <div style={{ width: "100%", height: 28, borderRadius: 999, background: "#fff", border: `1.5px solid ${theme.colors.border}`, overflow: "hidden" }}>
                      <div style={{ width: `${visiblePercentForLesson}%`, height: "100%", minWidth: percentForLesson > 0 ? 8 : 0, borderRadius: 999, background: "linear-gradient(180deg, #7BEA2D 0%, #58CC02 100%)" }} />
                    </div>
                    <div style={{ fontSize: 12, fontWeight: 800, ...signlearnoText }}>
                      <span style={{ color: theme.colors.textStrong }}>{percentForLesson}% Completed</span>
                    </div>
                  </div>
                </button>
                {xpPopup?.lessonId === lesson._id ? (
                  <div
                    style={{
                      position: "absolute",
                      top: "50%",
                      right: -8,
                      transform: "translate(100%, -50%)",
                      background: "linear-gradient(180deg, #7BEA2D 0%, #58CC02 100%)",
                      color: "#fff",
                      borderRadius: 999,
                      padding: "8px 12px",
                      fontWeight: 900,
                      fontSize: 13,
                      letterSpacing: 0.2,
                      boxShadow: "0 8px 16px rgba(0, 0, 0, 0.16)",
                      whiteSpace: "nowrap",
                      ...signlearnoText,
                    }}
                  >
                    +{xpPopup.xp} XP
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
