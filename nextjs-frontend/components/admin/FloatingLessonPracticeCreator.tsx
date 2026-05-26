"use client";

import { useEffect, useMemo, useState } from "react";
import { createLesson, getProfile } from "@/lib/api";
import { signlearnoTheme as theme, signlearnoText } from "@/components/signlearno/theme";

type CreatorType = "lesson" | "practice";

function parseResourcesInput(raw: string): Array<{ title: string; url: string }> {
  const lines = raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  return lines.map((line, index) => {
    const [title, url] = line.split("|").map((part) => part.trim());
    if (!title || !url) {
      throw new Error(`Dong tai nguyen ${index + 1} chua dung dinh dang title|url`);
    }
    return { title, url };
  });
}

function parsePracticeQuestionsInput(raw: string) {
  const lines = raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  return lines.map((line, index) => {
    const [url, A, B, C, D, correctRaw] = line.split("|").map((part) => part.trim());
    const correct = (correctRaw || "").toUpperCase();

    if (!url || !A || !B || !C || !D || !["A", "B", "C", "D"].includes(correct)) {
      throw new Error(`Dong cau hoi ${index + 1} chua dung dinh dang url|A|B|C|D|correct`);
    }

    return {
      url,
      A,
      B,
      C,
      D,
      correct: correct as "A" | "B" | "C" | "D",
    };
  });
}

export function FloatingLessonPracticeCreator() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const [contentType, setContentType] = useState<CreatorType>("lesson");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [scoreReward, setScoreReward] = useState("10");
  const [orderValue, setOrderValue] = useState("");
  const [resourcesInput, setResourcesInput] = useState("");
  const [questionsInput, setQuestionsInput] = useState("");

  useEffect(() => {
    const loadRole = async () => {
      try {
        const profile = await getProfile();
        setIsAdmin(profile.role === "admin");
      } catch {
        setIsAdmin(false);
      }
    };

    void loadRole();
  }, []);

  const isSuccess = useMemo(() => (statusMessage ? statusMessage.toLowerCase().includes("thanh cong") : false), [statusMessage]);

  const fieldLabelStyle = {
    ...signlearnoText,
    display: "block",
    fontSize: 12,
    fontWeight: 700,
    color: theme.colors.textMuted,
    marginBottom: 6,
    letterSpacing: 0.2,
  };

  const fieldBaseStyle = {
    width: "100%",
    boxSizing: "border-box" as const,
    border: `1px solid ${theme.colors.border}`,
    borderRadius: 10,
    padding: "10px 12px",
    color: theme.colors.textStrong,
    background: "#fff",
    ...signlearnoText,
  };

  const resetForm = () => {
    setTitle("");
    setContent("");
    setScoreReward("10");
    setOrderValue("");
    setResourcesInput("");
    setQuestionsInput("");
  };

  const handleCreate = async () => {
    try {
      const normalizedTitle = title.trim();
      const normalizedContent = content.trim();

      if (!normalizedTitle || !normalizedContent) {
        setStatusMessage("Vui long nhap day du title va content.");
        return;
      }

      setCreating(true);
      setStatusMessage(null);

      if (contentType === "lesson") {
        const resources = parseResourcesInput(resourcesInput);
        if (resources.length === 0) {
          setStatusMessage("Lesson can it nhat 1 resource.");
          return;
        }

        await createLesson({
          type: "lesson",
          title: normalizedTitle,
          content: normalizedContent,
          scoreReward: Number(scoreReward) || 10,
          order: orderValue.trim() ? Number(orderValue) : undefined,
          resources,
        });
      } else {
        const practiceQuestions = parsePracticeQuestionsInput(questionsInput);
        if (practiceQuestions.length === 0) {
          setStatusMessage("Practice can it nhat 1 cau hoi.");
          return;
        }

        await createLesson({
          type: "practice",
          title: normalizedTitle,
          content: normalizedContent,
          scoreReward: Number(scoreReward) || 10,
          order: orderValue.trim() ? Number(orderValue) : undefined,
          practiceQuestions,
        });
      }

      setStatusMessage("Tao noi dung thanh cong.");
      resetForm();
      window.dispatchEvent(new Event("admin-content-created"));
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "Tao noi dung that bai.");
    } finally {
      setCreating(false);
    }
  };

  if (!isAdmin) return null;

  return (
    <div style={{ position: "fixed", left: 20, bottom: 20, zIndex: 70 }}>
      {open ? (
        <div
          style={{
            width: "min(460px, calc(100vw - 24px))",
            marginBottom: 12,
            borderRadius: 16,
            border: `2px solid ${theme.colors.border}`,
            background: theme.colors.surface,
            boxShadow: "0 10px 24px rgba(0,0,0,0.14)",
            padding: 16,
            display: "grid",
            gap: 12,
            maxHeight: "min(78vh, 720px)",
            overflowY: "auto",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
            <div>
              <div style={{ ...signlearnoText, fontWeight: 800, color: theme.colors.textStrong }}>Create Learning Content</div>
              <div style={{ ...signlearnoText, fontSize: 12, color: theme.colors.textMuted, marginTop: 2 }}>Danh cho admin</div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              style={{
                border: "none",
                background: "transparent",
                color: theme.colors.textMuted,
                cursor: "pointer",
                fontSize: 16,
                fontWeight: 800,
                width: 28,
                height: 28,
                borderRadius: 999,
                ...signlearnoText,
              }}
            >
              X
            </button>
          </div>

          <div
            style={{
              border: `1px solid ${theme.colors.border}`,
              borderRadius: 12,
              padding: 12,
              background: "rgba(255,255,255,0.72)",
              display: "grid",
              gap: 10,
            }}
          >
            <div style={{ ...signlearnoText, fontWeight: 800, color: theme.colors.textStrong, fontSize: 13 }}>Basic Info</div>

            <label>
              <span style={fieldLabelStyle}>Type</span>
              <select
                value={contentType}
                onChange={(event) => setContentType(event.target.value as CreatorType)}
                style={fieldBaseStyle}
              >
                <option value="lesson">Lesson</option>
                <option value="practice">Practice</option>
              </select>
            </label>

            <label>
              <span style={fieldLabelStyle}>Title</span>
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Nhap tieu de"
                style={fieldBaseStyle}
              />
            </label>

            <label>
              <span style={fieldLabelStyle}>Description</span>
              <textarea
                value={content}
                onChange={(event) => setContent(event.target.value)}
                rows={2}
                placeholder="Mo ta ngan"
                style={{ ...fieldBaseStyle, resize: "vertical" as const, minHeight: 72 }}
              />
            </label>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <label>
                <span style={fieldLabelStyle}>Score Reward</span>
                <input
                  value={scoreReward}
                  onChange={(event) => setScoreReward(event.target.value)}
                  placeholder="10"
                  inputMode="numeric"
                  style={fieldBaseStyle}
                />
              </label>

              <label>
                <span style={fieldLabelStyle}>Order (Optional)</span>
                <input
                  value={orderValue}
                  onChange={(event) => setOrderValue(event.target.value)}
                  placeholder="Auto"
                  inputMode="numeric"
                  style={fieldBaseStyle}
                />
              </label>
            </div>
          </div>

          <div
            style={{
              border: `1px solid ${theme.colors.border}`,
              borderRadius: 12,
              padding: 12,
              background: "rgba(255,255,255,0.72)",
              display: "grid",
              gap: 10,
            }}
          >
            <div style={{ ...signlearnoText, fontWeight: 800, color: theme.colors.textStrong, fontSize: 13 }}>
              {contentType === "lesson" ? "Lesson Resources" : "Practice Questions"}
            </div>

            {contentType === "lesson" ? (
              <>
                <div style={{ ...signlearnoText, color: theme.colors.textMuted, fontSize: 12 }}>Moi dong: title|url</div>
                <textarea
                  value={resourcesInput}
                  onChange={(event) => setResourcesInput(event.target.value)}
                  rows={5}
                  placeholder={"Greeting Intro|https://youtube.com/..."}
                  style={{ ...fieldBaseStyle, resize: "vertical" as const, minHeight: 120 }}
                />
              </>
            ) : (
              <>
                <div style={{ ...signlearnoText, color: theme.colors.textMuted, fontSize: 12 }}>Moi dong: url|A|B|C|D|correct</div>
                <textarea
                  value={questionsInput}
                  onChange={(event) => setQuestionsInput(event.target.value)}
                  rows={6}
                  placeholder={"https://youtube.com/...|Xin chao|Tam biet|Cam on|Xin loi|A"}
                  style={{ ...fieldBaseStyle, resize: "vertical" as const, minHeight: 140 }}
                />
              </>
            )}
          </div>

          {statusMessage ? (
            <div
              style={{
                ...signlearnoText,
                color: isSuccess ? theme.colors.green : theme.colors.red,
                fontSize: 13,
                fontWeight: 700,
                borderRadius: 10,
                padding: "10px 12px",
                background: isSuccess ? "rgba(88, 204, 2, 0.1)" : "rgba(255, 92, 92, 0.08)",
                border: `1px solid ${isSuccess ? "rgba(88, 204, 2, 0.35)" : "rgba(255, 92, 92, 0.35)"}`,
              }}
            >
              {statusMessage}
            </div>
          ) : null}

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
            <button
              type="button"
              onClick={() => setOpen(false)}
              style={{
                border: `1px solid ${theme.colors.border}`,
                background: "#fff",
                color: theme.colors.textStrong,
                borderRadius: 10,
                padding: "10px 14px",
                fontWeight: 700,
                cursor: "pointer",
                ...signlearnoText,
              }}
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={() => void handleCreate()}
              disabled={creating}
              style={{
                border: "none",
                background: theme.colors.green,
                color: "#fff",
                borderRadius: 10,
                padding: "10px 16px",
                fontWeight: 800,
                cursor: creating ? "not-allowed" : "pointer",
                opacity: creating ? 0.7 : 1,
                ...signlearnoText,
              }}
            >
              {creating ? "Dang tao..." : "Tao"}
            </button>
          </div>
        </div>
      ) : null}

      <button
        type="button"
        aria-label="Mo form them lesson practice"
        onClick={() => {
          setOpen((current) => !current);
          setStatusMessage(null);
        }}
        style={{
          width: 58,
          height: 58,
          borderRadius: 999,
          border: `2px solid ${theme.colors.greenDark}`,
          background: theme.colors.green,
          color: "#fff",
          fontSize: 34,
          lineHeight: 1,
          fontWeight: 700,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          boxShadow: "0 8px 18px rgba(88, 204, 2, 0.35)",
          ...signlearnoText,
        }}
      >
        +
      </button>
    </div>
  );
}
