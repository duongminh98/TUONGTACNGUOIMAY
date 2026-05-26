"use client";

import { useEffect, useMemo, useState } from "react";
import { signlearnoTheme as theme, signlearnoText } from "@/components/signlearno/theme";
import { completeLesson, getLearningHistory, getLessonById, getLessons, getStoredToken } from "@/lib/api";
import type { Lesson } from "@/lib/api/backend";

function isDirectVideoUrl(url: string): boolean {
  const normalized = String(url || "").trim().toLowerCase();
  return /\.(mp4|webm|ogg)(\?|#|$)/.test(normalized) || normalized.includes("/video/upload/");
}

function getEmbedUrl(url: string): string {
  let embedUrl = String(url || "").trim();

  try {
    const parsed = new URL(embedUrl);
    const hostname = parsed.hostname.replace(/^www\./, "");
    if (hostname === "youtube.com" || hostname === "m.youtube.com") {
      const watchId = parsed.searchParams.get("v");
      const shortsId = parsed.pathname.startsWith("/shorts/") ? parsed.pathname.split("/")[2] : "";
      const videoId = watchId || shortsId;
      if (videoId) {
        embedUrl = `https://www.youtube.com/embed/${videoId}`;
      }
    }
    if (hostname === "youtu.be") {
      const videoId = parsed.pathname.split("/").filter(Boolean)[0];
      if (videoId) {
        embedUrl = `https://www.youtube.com/embed/${videoId}`;
      }
    }
  } catch {
    embedUrl = url;
  }

  const separator = embedUrl.includes("?") ? "&" : "?";
  return `${embedUrl}${separator}autoplay=1&mute=1&rel=0&modestbranding=1`;
}

export default function PracticePage() {
  const storedToken = getStoredToken();
  const PRACTICE_PROGRESS_STORAGE_KEY = `practice_progress_v1:${storedToken ?? "guest"}`;
  const [practices, setPractices] = useState<Lesson[]>([]);
  const [selectedPractice, setSelectedPractice] = useState<Lesson | null>(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<"A" | "B" | "C" | "D" | null>(null);
  const [answers, setAnswers] = useState<Record<number, "A" | "B" | "C" | "D">>({});
  const [completedPracticeIds, setCompletedPracticeIds] = useState<Record<string, boolean>>({});
  const [practiceProgressById, setPracticeProgressById] = useState<Record<string, { index: number; total: number; percent: number }>>({});
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [completing, setCompleting] = useState(false);
  const [practiceResult, setPracticeResult] = useState<{ correctCount: number; totalCount: number } | null>(null);

  const loadStoredPracticeProgress = (): Record<string, { index: number; total: number; percent: number }> => {
    if (typeof window === "undefined") return {};
    try {
      const raw = window.localStorage.getItem(PRACTICE_PROGRESS_STORAGE_KEY);
      if (!raw) return {};
      const parsed = JSON.parse(raw) as Record<string, { index: number; total: number; percent: number }>;
      return parsed && typeof parsed === "object" ? parsed : {};
    } catch {
      return {};
    }
  };

  const saveStoredPracticeProgress = (nextProgress: Record<string, { index: number; total: number; percent: number }>) => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(PRACTICE_PROGRESS_STORAGE_KEY, JSON.stringify(nextProgress));
  };

  useEffect(() => {
    setPracticeProgressById(loadStoredPracticeProgress());
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getLessons("practice");
        setPractices(data);
        try {
          const histories = await getLearningHistory();
          const completedMap: Record<string, boolean> = {};
          histories.forEach((item) => {
            const lessonId = typeof item.lessonId === "string" ? item.lessonId : item.lessonId._id;
            if (lessonId) completedMap[lessonId] = true;
          });
          setCompletedPracticeIds(completedMap);
        } catch {
          // guest mode
        }
      } catch (nextError) {
        setStatusMessage(nextError instanceof Error ? nextError.message : "Failed to load practices.");
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  useEffect(() => {
    const refreshPractices = async () => {
      setLoading(true);
      try {
        const data = await getLessons("practice");
        setPractices(data);
      } finally {
        setLoading(false);
      }
    };

    window.addEventListener("admin-content-created", refreshPractices);
    return () => window.removeEventListener("admin-content-created", refreshPractices);
  }, []);

  const practiceStyles = [
    { bg: "linear-gradient(180deg, #D7F7C7 0%, #BEEFA7 100%)", emoji: "🦁🐘" },
    { bg: "linear-gradient(180deg, #D8F3FF 0%, #BFEAFB 100%)", emoji: "👋" },
    { bg: "linear-gradient(180deg, #FFF6C7 0%, #F7ECA7 100%)", emoji: "🔢" },
    { bg: "linear-gradient(180deg, #FFE6C7 0%, #FFD7A7 100%)", emoji: "☕⏰" },
    { bg: "linear-gradient(180deg, #F1E2FF 0%, #E6CCFF 100%)", emoji: "😀😯" },
  ];

  const orderedPractices = useMemo(
    () => [...practices].sort((a, b) => (a.order ?? Number.MAX_SAFE_INTEGER) - (b.order ?? Number.MAX_SAFE_INTEGER)),
    [practices],
  );

  const practiceIsFinished = (practiceId: string) => {
    if (completedPracticeIds[practiceId]) return true;
    const p = practiceProgressById[practiceId]?.percent ?? 0;
    return p >= 100;
  };

  const openPractice = async (practiceId: string) => {
    try {
      const detail = await getLessonById(practiceId);
      setSelectedPractice(detail);
      const stored = practiceProgressById[practiceId];
      const questionsCount = Array.isArray(detail.practiceQuestions) ? detail.practiceQuestions.length : 0;
      const safeIndex = questionsCount > 0 ? Math.min(Math.max(stored?.index ?? 0, 0), questionsCount - 1) : 0;
      setQuestionIndex(safeIndex);
      setSelectedOption(null);
      setAnswers({});
      setStatusMessage(null);
    } catch (nextError) {
      setStatusMessage(nextError instanceof Error ? nextError.message : "Failed to load practice detail.");
    }
  };

  const questions = selectedPractice?.practiceQuestions ?? [];
  const currentQuestion = questions[questionIndex];
  const isLast = questions.length > 0 && questionIndex === questions.length - 1;

  useEffect(() => {
    if (!selectedPractice || questions.length === 0) return;
    const nextPayload = {
      index: questionIndex,
      total: questions.length,
      percent: Math.round(((questionIndex + 1) / questions.length) * 100),
    };
    setPracticeProgressById((current) => {
      const previous = current[selectedPractice._id];
      if (
        previous &&
        previous.index === nextPayload.index &&
        previous.total === nextPayload.total &&
        previous.percent === nextPayload.percent
      ) {
        return current;
      }
      const next = { ...current, [selectedPractice._id]: nextPayload };
      saveStoredPracticeProgress(next);
      return next;
    });
  }, [selectedPractice, questionIndex, questions.length]);

  useEffect(() => {
    if (!practiceResult) return;
    const timer = setTimeout(() => {
      setPracticeResult(null);
      setSelectedPractice(null);
    }, 2000);
    return () => clearTimeout(timer);
  }, [practiceResult]);

  const goPrev = () => {
    if (questionIndex === 0) return;
    const nextIndex = questionIndex - 1;
    setQuestionIndex(nextIndex);
    setSelectedOption(answers[nextIndex] || null);
  };

  const goNextOrDone = async () => {
    if (!selectedPractice || !selectedOption) return;

    const updatedAnswers = { ...answers, [questionIndex]: selectedOption };
    setAnswers(updatedAnswers);

    if (!isLast) {
      const nextIndex = questionIndex + 1;
      setQuestionIndex(nextIndex);
      setSelectedOption(updatedAnswers[nextIndex] || null);
      return;
    }

    if (completedPracticeIds[selectedPractice._id]) {
      setStatusMessage(null);
      setPracticeResult(null);
      setSelectedPractice(null);
      return;
    }

    setCompleting(true);
    try {
      // Calculate correct answers
      let correctCount = 0;
      questions.forEach((question, index) => {
        if (updatedAnswers[index] === question.correct) {
          correctCount++;
        }
      });

      await completeLesson(selectedPractice._id);
      setCompletedPracticeIds((current) => ({ ...current, [selectedPractice._id]: true }));
      setPracticeProgressById((current) => {
        const total = questions.length || current[selectedPractice._id]?.total || 1;
        const next = {
          ...current,
          [selectedPractice._id]: { index: Math.max(0, total - 1), total: Math.max(1, total), percent: 100 },
        };
        saveStoredPracticeProgress(next);
        return next;
      });
      setStatusMessage(null);
      
      // Show result instead of closing immediately
      setPracticeResult({
        correctCount,
        totalCount: questions.length,
      });
    } catch (nextError) {
      setStatusMessage(nextError instanceof Error ? nextError.message : "Failed to submit practice.");
    } finally {
      setCompleting(false);
    }
  };

  return (
    <div style={{ maxWidth: selectedPractice ? 1220 : 1000, margin: "0 auto", padding: "20px 24px 40px" }}>
      {loading ? <p style={{ ...signlearnoText, color: theme.colors.textMuted }}>Loading practices...</p> : null}
      {statusMessage ? (
        <p
          style={{
            ...signlearnoText,
            color: statusMessage.startsWith("Done!") ? theme.colors.green : theme.colors.red,
          }}
        >
          {statusMessage}
        </p>
      ) : null}

      {practiceResult ? (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "60vh",
            gap: 24,
            marginTop: 24,
          }}
        >
          <div
            style={{
              borderRadius: 30,
              border: `2px solid ${theme.colors.border}`,
              background: theme.colors.surface,
              padding: 40,
              textAlign: "center",
              boxShadow: "0 24px 48px rgba(15, 23, 42, 0.08)",
              maxWidth: 400,
            }}
          >
            <div
              style={{
                ...signlearnoText,
                fontSize: 48,
                fontWeight: 800,
                color: theme.colors.green,
                marginBottom: 16,
              }}
            >
              ✓
            </div>
            <div
              style={{
                ...signlearnoText,
                fontSize: 24,
                fontWeight: 800,
                color: theme.colors.textStrong,
                marginBottom: 24,
              }}
            >
              Hoàn thành!
            </div>
            <div
              style={{
                ...signlearnoText,
                fontSize: 18,
                fontWeight: 700,
                color: theme.colors.textMuted,
                marginBottom: 32,
              }}
            >
              Bạn trả lời đúng
            </div>
            <div
              style={{
                ...signlearnoText,
                fontSize: 56,
                fontWeight: 800,
                color: theme.colors.green,
                marginBottom: 8,
              }}
            >
              {practiceResult.correctCount}/{practiceResult.totalCount}
            </div>
            <div
              style={{
                ...signlearnoText,
                fontSize: 14,
                fontWeight: 600,
                color: theme.colors.textMuted,
                marginBottom: 32,
              }}
            >
              câu hỏi
            </div>
            <button
              type="button"
              onClick={() => {
                setPracticeResult(null);
                setSelectedPractice(null);
              }}
              style={{
                padding: "12px 32px",
                borderRadius: 10,
                border: "none",
                borderBottom: `4px solid ${theme.colors.greenDark}`,
                background: theme.colors.green,
                cursor: "pointer",
                fontWeight: 700,
                fontSize: 15,
                color: "#fff",
                ...signlearnoText,
              }}
            >
              OK
            </button>
          </div>
        </div>
      ) : selectedPractice ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 24, marginTop: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <button
              type="button"
              onClick={() => {
                setPracticeResult(null);
                setSelectedPractice(null);
              }}
              style={{
                padding: "8px 16px",
                borderRadius: 10,
                border: `2px solid ${theme.colors.border}`,
                background: theme.colors.surface,
                cursor: "pointer",
                fontWeight: 700,
                fontSize: 13,
                color: theme.colors.textStrong,
                ...signlearnoText,
                display: "flex",
                alignItems: "center",
                gap: 5,
              }}
            >
              ← Back
            </button>
            <div style={{ ...signlearnoText, fontWeight: 700, fontSize: 18, color: theme.colors.textStrong }}>{selectedPractice.title}</div>
            <div style={{ marginLeft: "auto", color: theme.colors.textMuted, ...signlearnoText }}>
              {questions.length ? questionIndex + 1 : 0} / {questions.length}
            </div>
          </div>

          <div style={{ width: "100%", height: 8, borderRadius: 4, background: theme.colors.border, overflow: "hidden" }}>
            <div style={{ width: `${questions.length ? ((questionIndex + 1) / questions.length) * 100 : 0}%`, height: 8, borderRadius: 4, background: theme.colors.green, transition: "width 300ms ease" }} />
          </div>

          {currentQuestion ? (
            <div
              className="practice-question-shell"
              style={{
                display: "grid",
                alignItems: "stretch",
                minHeight: 430,
                borderRadius: 30,
                overflow: "hidden",
                border: `2px solid ${theme.colors.border}`,
                background: theme.colors.surface,
                boxShadow: "0 24px 48px rgba(15, 23, 42, 0.08)",
              }}
            >
              <div className="practice-answer-panel" style={{ background: theme.colors.surface, display: "flex", flexDirection: "column", justifyContent: "center", padding: 28 }}>
                <div style={{ ...signlearnoText, fontSize: 20, fontWeight: 800, color: theme.colors.textStrong, marginBottom: 16 }}>
                  Choose the correct answer
                </div>
                {(["A", "B", "C", "D"] as const).map((optionKey) => {
                  const optionValue = currentQuestion[optionKey];
                  const isActive = selectedOption === optionKey;
                  return (
                    <button
                      key={optionKey}
                      onClick={() => setSelectedOption(optionKey)}
                      style={{
                        textAlign: "left",
                        marginBottom: 10,
                        padding: "12px 14px",
                        borderRadius: 10,
                        border: `2px solid ${isActive ? theme.colors.green : theme.colors.border}`,
                        background: isActive ? theme.colors.greenSoft : theme.colors.surface,
                        cursor: "pointer",
                        ...signlearnoText,
                        fontWeight: 700,
                      }}
                    >
                      {optionKey}. {optionValue}
                    </button>
                  );
                })}
              </div>

              <div className="practice-video-frame" style={{ overflow: "hidden", background: "#000", minHeight: 430, position: "relative" }}>
                {isDirectVideoUrl(currentQuestion.url) ? (
                  <video
                    key={currentQuestion.url}
                    src={currentQuestion.url}
                    controls
                    autoPlay
                    muted
                    playsInline
                    className="practice-video-fill"
                  />
                ) : (
                  <iframe
                    key={currentQuestion.url}
                    src={getEmbedUrl(currentQuestion.url)}
                    title={`Practice question ${questionIndex + 1}`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="practice-embed-fill"
                  />
                )}
              </div>
            </div>
          ) : (
            <div style={{ ...signlearnoText, color: theme.colors.textMuted }}>Practice này chưa có câu hỏi.</div>
          )}

          <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
            <button
              onClick={goPrev}
              disabled={questionIndex === 0}
              style={{ padding: "12px 28px", borderRadius: 10, border: `2px solid ${theme.colors.border}`, background: theme.colors.surface, cursor: questionIndex === 0 ? "not-allowed" : "pointer", fontWeight: 700, fontSize: 15, color: questionIndex === 0 ? theme.colors.textMuted : theme.colors.textStrong, ...signlearnoText, opacity: questionIndex === 0 ? 0.5 : 1 }}
            >
              ← Prev
            </button>
            <button
              onClick={() => void goNextOrDone()}
              disabled={!selectedOption || completing}
              style={{ padding: "12px 28px", borderRadius: 10, border: "none", borderBottom: `4px solid ${theme.colors.greenDark}`, background: theme.colors.green, cursor: !selectedOption || completing ? "not-allowed" : "pointer", fontWeight: 700, fontSize: 15, color: "#fff", ...signlearnoText, opacity: !selectedOption || completing ? 0.7 : 1 }}
            >
              {isLast ? (completing ? "Saving..." : "✓ Done") : "Next →"}
            </button>
          </div>
        </div>
      ) : (
        <div style={{ marginTop: 16, display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16 }}>
          {orderedPractices.map((practice, index) => {
            const card = practiceStyles[index % practiceStyles.length];
            const finished = practiceIsFinished(practice._id);
            const practiceProgress = practiceProgressById[practice._id];
            const percentForPractice = finished ? 100 : practiceProgress?.percent ?? 0;
            const visiblePercentForPractice = percentForPractice <= 0 ? 0 : Math.max(percentForPractice, 8);

            return (
              <button
                key={practice._id}
                type="button"
                onClick={() => void openPractice(practice._id)}
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
                  {practice.title}
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
                  {practice.content || "Practice with interactive sign language quizzes."}
                </div>
                <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: 8, paddingBottom: 2 }}>
                  <div style={{ width: "100%", height: 28, borderRadius: 999, background: "#fff", border: `1.5px solid ${theme.colors.border}`, overflow: "hidden" }}>
                    <div style={{ width: `${visiblePercentForPractice}%`, height: "100%", minWidth: percentForPractice > 0 ? 8 : 0, borderRadius: 999, background: "linear-gradient(180deg, #7BEA2D 0%, #58CC02 100%)" }} />
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 800, ...signlearnoText }}>
                    <span style={{ color: theme.colors.textStrong }}>{percentForPractice}% Completed</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
