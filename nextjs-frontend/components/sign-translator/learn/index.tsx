import { useEffect, useState } from "react";
import { signlearnoTheme as theme, signlearnoText, signlearnoUpperLabel } from "@/components/signlearno/theme";
import { XpChestIllustration } from "@/components/signlearno/icons";
import type { Unit } from "../types";
import { RIGHT_RAIL_WIDTH } from "../constants";

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

export function UnitsGrid({ units, onSelect }: { units: Unit[]; onSelect: (unit: Unit) => void }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
      {units.map((unit, index) => (
        <div
          key={index}
          onClick={() => onSelect(unit)}
          style={{
            position: "relative",
            aspectRatio: "1 / 1",
            borderRadius: theme.radius.unit,
            background: theme.colors.surface,
            border: `2px solid ${unit.completed ? theme.colors.orange : theme.colors.border}`,
            borderBottom: `6px solid ${unit.completed ? theme.colors.orange : theme.colors.border}`,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
            textAlign: "center",
            cursor: "pointer",
            transition: "transform 140ms ease, border-color 140ms ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(2px)";
            e.currentTarget.style.borderBottomWidth = "4px";
            e.currentTarget.style.borderColor = unit.completed ? theme.colors.orange : theme.colors.green;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.borderBottomWidth = "6px";
            e.currentTarget.style.borderColor = theme.colors.border;
          }}
        >
          <div style={{ ...signlearnoText, color: theme.colors.green, fontSize: 24, fontWeight: 800, marginBottom: 8 }}>
            {unit.title}
          </div>
          <div style={{ ...signlearnoText, color: theme.colors.textStrong, fontSize: 16, fontWeight: 500, lineHeight: "22px" }}>
            {unit.subtitle}
          </div>
          {unit.completed ? (
            <div style={{ marginTop: 10, ...signlearnoUpperLabel, color: theme.colors.orange }}>COMPLETED</div>
          ) : null}
        </div>
      ))}
    </div>
  );
}

export function FlashcardView({
  unit,
  onBack,
  onDone,
  initialIndex = 0,
  onProgressChange,
}: {
  unit: Unit;
  onBack: () => void;
  onDone: () => void;
  initialIndex?: number;
  onProgressChange?: (payload: { index: number; total: number; percent: number }) => void;
}) {
  const cards = unit.flashcards ?? [];
  const [index, setIndex] = useState(initialIndex);

  useEffect(() => {
    if (cards.length === 0) {
      setIndex(0);
      return;
    }
    const nextIndex = Math.min(Math.max(initialIndex, 0), cards.length - 1);
    setIndex(nextIndex);
  }, [initialIndex, cards.length, unit.id]);

  useEffect(() => {
    if (!onProgressChange || cards.length === 0) return;
    const percent = Math.round(((index + 1) / cards.length) * 100);
    onProgressChange({ index, total: cards.length, percent });
  }, [index, cards.length, onProgressChange]);

  if (cards.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: 64, color: theme.colors.textMuted, ...signlearnoText }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>📭</div>
        <div style={{ fontSize: 18, fontWeight: 600 }}>Lesson này chưa có flashcard.</div>
        <button
          onClick={onBack}
          style={{ marginTop: 24, padding: "10px 24px", background: theme.colors.green, color: "#fff", border: "none", borderRadius: 10, cursor: "pointer", fontWeight: 700, fontSize: 15, ...signlearnoText }}
        >
          ← Quay lại
        </button>
      </div>
    );
  }

  const card = cards[index];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Header / Nav */}
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <button
          onClick={onBack}
          type="button"
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
            transition: "opacity 140ms",
          }}
        >
          ← Back
        </button>
        <div style={{ ...signlearnoText, fontWeight: 700, fontSize: 18, color: theme.colors.textStrong }}>{unit.title}</div>
        <div style={{ marginLeft: "auto", ...signlearnoUpperLabel, color: theme.colors.textMuted }}>{index + 1} / {cards.length}</div>
      </div>

      {/* Progress bar */}
      <div style={{ width: "100%", height: 8, borderRadius: 4, background: theme.colors.border, overflow: "hidden" }}>
        <div style={{ width: `${((index + 1) / cards.length) * 100}%`, height: 8, borderRadius: 4, background: theme.colors.green, transition: "width 300ms ease" }} />
      </div>

      {/* Flashcard body — một vỏ bo góc, hai cột dính nhau (giống Text to Sign / Sign to Text) */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          alignItems: "stretch",
          minHeight: 360,
          borderRadius: 30,
          overflow: "hidden",
          border: `2px solid ${theme.colors.border}`,
          background: theme.colors.surface,
          boxShadow: "0 24px 48px rgba(15, 23, 42, 0.08)",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: 40,
            textAlign: "center",
            borderRight: `2px solid ${theme.colors.border}`,
            boxSizing: "border-box",
            minHeight: 280,
          }}
        >
          <div style={{ ...signlearnoText, fontSize: 56, fontWeight: 900, color: theme.colors.green, lineHeight: 1, marginBottom: 16 }}>
            {card.word}
          </div>
          {card.description ? (
            <div style={{ ...signlearnoText, fontSize: 16, color: theme.colors.textMuted, lineHeight: "24px" }}>
              {card.description}
            </div>
          ) : null}
        </div>

        <div
          style={{
            overflow: "hidden",
            background: "#000",
            minHeight: 280,
            position: "relative",
          }}
        >
          {isDirectVideoUrl(card.videoUrl) ? (
            <video
              key={card.videoUrl}
              autoPlay
              muted
              loop
              controls
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
              }}
            >
              <source src={card.videoUrl} />
            </video>
          ) : (
            <iframe
              key={card.videoUrl}
              src={getEmbedUrl(card.videoUrl)}
              title={card.word}
              allow="autoplay; encrypted-media; picture-in-picture"
              allowFullScreen
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                border: "none",
                display: "block",
              }}
            />
          )}
        </div>
      </div>

      {/* Prev / Next buttons */}
      <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
        <button
          onClick={() => setIndex(Math.max(0, index - 1))}
          disabled={index === 0}
          style={{ padding: "12px 28px", borderRadius: 10, border: `2px solid ${theme.colors.border}`, background: theme.colors.surface, cursor: index === 0 ? "not-allowed" : "pointer", fontWeight: 700, fontSize: 15, color: index === 0 ? theme.colors.textMuted : theme.colors.textStrong, ...signlearnoText, opacity: index === 0 ? 0.5 : 1, transition: "opacity 140ms" }}
        >
          ← Prev
        </button>
        {index === cards.length - 1 ? (
          <button
            onClick={onDone}
            style={{ padding: "12px 28px", borderRadius: 10, border: "none", borderBottom: `4px solid ${theme.colors.greenDark}`, background: theme.colors.green, cursor: "pointer", fontWeight: 700, fontSize: 15, color: "#fff", ...signlearnoText }}
          >
            ✓ Done
          </button>
        ) : (
          <button
            onClick={() => setIndex(index + 1)}
            style={{ padding: "12px 28px", borderRadius: 10, border: "none", borderBottom: `4px solid ${theme.colors.greenDark}`, background: theme.colors.green, cursor: "pointer", fontWeight: 700, fontSize: 15, color: "#fff", ...signlearnoText }}
          >
            Next →
          </button>
        )}
      </div>
    </div>
  );
}

export function XpProgressCard({ goalXp, onEditGoal }: { goalXp: number; onEditGoal: () => void }) {
  const weekLabels = ["M", "Tu", "W", "Th", "F", "Sa", "Su"];
  const weekValues = [0, 0, 0, 0, 0, 0, goalXp];
  const chartWidth = 320;
  const chartHeight = 220;
  const chartLeft = 40;
  const chartRight = 18;
  const chartTop = 18;
  const chartBottom = 34;
  const innerWidth = chartWidth - chartLeft - chartRight;
  const innerHeight = chartHeight - chartTop - chartBottom;
  const xStep = innerWidth / (weekLabels.length - 1);
  const yLevels = [20, 15, 10, 5, 0];
  const dailyGoalPercent = Math.min(100, (goalXp / 20) * 100);
  const yFor = (value: number) => chartTop + innerHeight - (value / 20) * innerHeight;
  const points = weekValues.map((value, index) => ({ x: chartLeft + xStep * index, y: yFor(value) }));
  const linePoints = points.map(({ x, y }) => `${x},${y}`).join(" ");
  const areaPath = [`M ${points[0]?.x ?? 0} ${chartTop + innerHeight}`, ...points.map(({ x, y }) => `L ${x} ${y}`), `L ${points[points.length - 1]?.x ?? 0} ${chartTop + innerHeight}`, "Z"].join(" ");

  return (
    <section
      style={{ width: RIGHT_RAIL_WIDTH, maxWidth: "100%", borderRadius: theme.radius.card, border: `2px solid ${theme.colors.border}`, background: theme.colors.surface, padding: 26, boxSizing: "border-box", overflow: "hidden" }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
        <div style={{ color: theme.colors.textStrong, fontSize: 22, lineHeight: "26px", fontWeight: 700, ...signlearnoText }}>XP Progress</div>
        <button type="button" onClick={onEditGoal} style={{ border: "none", background: "transparent", color: theme.colors.blue, cursor: "pointer", padding: 0, ...signlearnoUpperLabel }}>
          Edit Goal
        </button>
      </div>

      <div style={{ marginTop: 24, display: "flex", alignItems: "flex-start", gap: 16 }}>
        <div style={{ flex: "0 0 auto" }}>
          <XpChestIllustration />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ color: theme.colors.textMuted, fontSize: 15, lineHeight: "25px", fontWeight: 500, ...signlearnoText }}>Daily Goal</div>
          <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 6 }}>
            <div style={{ width: "100%", height: 14, borderRadius: 7, background: theme.colors.border, overflow: "hidden" }}>
              <div style={{ width: `${dailyGoalPercent}%`, height: 14, borderRadius: 7, background: theme.colors.yellow, boxShadow: "inset 0 -2px 0 rgba(0,0,0,0.08)" }} />
            </div>
            <div style={{ color: theme.colors.textSoft, fontSize: 15, lineHeight: "20px", fontWeight: 500, textAlign: "right", ...signlearnoText }}>
              {goalXp}/20 XP
            </div>
          </div>
        </div>
      </div>

      <svg width="100%" viewBox={`0 0 ${chartWidth} ${chartHeight}`} preserveAspectRatio="xMidYMid meet" aria-hidden="true" style={{ marginTop: 18, display: "block", height: "auto", maxWidth: "100%" }}>
        {yLevels.map((level) => {
          const y = yFor(level);
          return (
            <g key={level}>
              <line x1={chartLeft + 18} x2={chartWidth - chartRight} y1={y} y2={y} stroke={theme.colors.grid} strokeWidth="2" />
              <text x={chartLeft - 16} y={y + 5} fill={level === 20 ? theme.colors.yellow : "#CCCAC9"} fontSize="17" textAnchor="end" style={signlearnoText}>{level}</text>
            </g>
          );
        })}
        <path d={areaPath} fill={theme.colors.chartFill} />
        <polyline points={linePoints} fill="none" stroke={theme.colors.yellow} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
        {points.map(({ x, y }, index) => (
          <circle key={weekLabels[index]} cx={x} cy={y} r={index === weekLabels.length - 1 ? 4.5 : 4} fill={theme.colors.surface} stroke={theme.colors.yellow} strokeWidth="2.5" />
        ))}
        {weekLabels.map((label, index) => (
          <text key={label} x={chartLeft + xStep * index} y={chartHeight - 8} fill="#CCCAC9" fontSize="17" textAnchor="middle" style={signlearnoText}>{label}</text>
        ))}
      </svg>
    </section>
  );
}
