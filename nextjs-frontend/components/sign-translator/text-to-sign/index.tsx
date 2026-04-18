"use client";

import { useState } from "react";
import { Clock3, SendHorizontal } from "lucide-react";
import { signlearnoTheme as theme, signlearnoText, signlearnoUpperLabel } from "@/components/signlearno/theme";
import { TOOL_WIDTH, TEXT_TO_SIGN_PLACEHOLDER, TRANSLATOR_TOOL_GRID_HEIGHT } from "../constants";
import { translateTextToSign } from "@/lib/api/sign-translation";
import type { TextToSignResult } from "@/lib/types";

export function TextToSignExperience() {
  const videoSurfaceBg =
    "linear-gradient(180deg, var(--signlearno-soft-gradient-start) 0%, var(--signlearno-soft-gradient-end) 100%)";
  const [inputText, setInputText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [translation, setTranslation] = useState<TextToSignResult | null>(null);
  const [videoPlaybackError, setVideoPlaybackError] = useState<string | null>(null);
  const [recentPhrases, setRecentPhrases] = useState([
    "How are you today?",
    "Nice to meet you",
    "I love you",
    "Where is the exit?",
  ]);

  const runTranslation = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) {
      setTranslation(null);
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setVideoPlaybackError(null);

    try {
      const response = await translateTextToSign(trimmed, {
        spokenLanguage: "en",
        signedLanguage: "ase",
      });
      setTranslation(response.result);
      setRecentPhrases((current) => {
        const next = [trimmed, ...current.filter((item) => item !== trimmed)];
        return next.slice(0, 6);
      });
    } catch (nextError) {
      let message =
        nextError instanceof Error ? nextError.message : "Unable to reach the translation API.";
      try {
        const parsed = JSON.parse(message) as { message?: string };
        if (parsed?.message && typeof parsed.message === "string") {
          message = parsed.message;
        }
      } catch {
        /* plain text error */
      }
      setError(message);
      setTranslation(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const ctaLabelLiftStyle = {
    display: "inline-flex",
    alignItems: "center",
    gap: 12,
    transition: "transform 180ms ease",
  };

  const onCtaMouseEnter = (event: React.MouseEvent<HTMLButtonElement>) => {
    const label = event.currentTarget.querySelector<HTMLElement>("[data-cta-label]");
    if (label) label.style.transform = "translateY(-2px)";
    event.currentTarget.style.boxShadow = "0 14px 30px rgba(15, 23, 42, 0.16)";
  };

  const onCtaMouseLeave = (event: React.MouseEvent<HTMLButtonElement>) => {
    const label = event.currentTarget.querySelector<HTMLElement>("[data-cta-label]");
    if (label) label.style.transform = "none";
    const resetShadow = event.currentTarget.dataset.shadowRest;
    if (resetShadow) event.currentTarget.style.boxShadow = resetShadow;
  };

  return (
    <section style={{ width: "100%", maxWidth: TOOL_WIDTH, margin: "0 auto", padding: "0 12px", boxSizing: "border-box" }}>
      <div
        style={{
          borderRadius: 30,
          overflow: "hidden",
          border: `2px solid ${theme.colors.border}`,
          background: theme.colors.surface,
          boxShadow: "0 24px 48px rgba(15, 23, 42, 0.08)",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          height: TRANSLATOR_TOOL_GRID_HEIGHT,
          alignItems: "stretch",
        }}
      >
        <section style={{ padding: 0, height: TRANSLATOR_TOOL_GRID_HEIGHT, boxSizing: "border-box", position: "relative", overflow: "hidden" }}>
          <textarea
            value={inputText}
            onChange={(event) => setInputText(event.target.value)}
            placeholder={TEXT_TO_SIGN_PLACEHOLDER}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              borderRadius: 0,
              border: "none",
              background: "linear-gradient(180deg, color-mix(in srgb, var(--signlearno-soft-gradient-start) 42%, transparent) 0%, color-mix(in srgb, var(--signlearno-blue-soft) 26%, transparent) 100%)",
              padding: "64px 20px 236px",
              color: theme.colors.textStrong,
              fontSize: 22,
              lineHeight: "32px",
              fontWeight: 500,
              resize: "none",
              outline: "none",
              boxSizing: "border-box",
              ...signlearnoText,
            }}
          />

          <div style={{ position: "absolute", top: 24, left: 24, right: 24, display: "flex", alignItems: "center", justifyContent: "space-between", pointerEvents: "none" }}>
            <span style={{ color: theme.colors.green, ...signlearnoUpperLabel }}>Type Message</span>
          </div>

          <div style={{ position: "absolute", left: 24, right: 24, bottom: 180, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 18 }}>
            <span style={{ color: theme.colors.textMuted, fontSize: 15, lineHeight: "20px", fontWeight: 700, ...signlearnoText }}>
              {inputText.trim().length} / 500
            </span>

            <button
              type="button"
              disabled={isSubmitting || !inputText.trim()}
              onClick={() => { void runTranslation(inputText); }}
              data-shadow-rest="0 8px 24px rgba(88, 204, 2, 0.3)"
              onMouseEnter={onCtaMouseEnter}
              onMouseLeave={onCtaMouseLeave}
              style={{
                padding: "16px 32px",
                borderRadius: 16,
                border: "none",
                background: theme.colors.green,
                color: theme.colors.surface,
                display: "flex",
                alignItems: "center",
                gap: 12,
                cursor: isSubmitting || !inputText.trim() ? "not-allowed" : "pointer",
                opacity: isSubmitting || !inputText.trim() ? 0.7 : 1,
                boxShadow: "0 8px 24px rgba(88, 204, 2, 0.3)",
                transition: "filter 200ms ease, box-shadow 200ms ease",
                fontSize: 16,
                lineHeight: "20px",
                fontWeight: 700,
                ...signlearnoText,
              }}
            >
              <span data-cta-label style={ctaLabelLiftStyle}>
                {isSubmitting ? "Translating..." : "Translate"}
                <SendHorizontal size={18} />
              </span>
            </button>
          </div>

          <div style={{ position: "absolute", left: 24, right: 24, bottom: 24, paddingTop: 12, borderTop: "2px solid rgba(88, 204, 2, 0.16)", display: "grid", gap: 8 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Clock3 size={16} color={theme.colors.green} />
                <span style={{ color: theme.colors.green, ...signlearnoUpperLabel }}>Recently Translated</span>
              </div>
              <button type="button" onClick={() => setRecentPhrases([])} style={{ border: "none", background: "transparent", color: theme.colors.green, cursor: "pointer", fontSize: 14, lineHeight: "18px", fontWeight: 700, ...signlearnoText }}>
                Clear
              </button>
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {recentPhrases.slice(0, 5).map((phrase) => (
                <button
                  key={phrase}
                  type="button"
                  onClick={() => { setInputText(phrase); void runTranslation(phrase); }}
                  style={{ padding: "8px 12px", borderRadius: 999, border: `2px solid ${theme.colors.border}`, background: "var(--signlearno-glass)", display: "flex", alignItems: "center", cursor: "pointer", color: theme.colors.textStrong, fontSize: 13, lineHeight: "18px", fontWeight: 600, ...signlearnoText, whiteSpace: "nowrap" }}
                >
                  <span>&ldquo;{phrase}&rdquo;</span>
                </button>
              ))}
            </div>
          </div>
        </section>

        <section style={{ padding: 0, height: TRANSLATOR_TOOL_GRID_HEIGHT, boxSizing: "border-box", background: videoSurfaceBg, color: theme.colors.textStrong, display: "flex", overflow: "hidden" }}>
          <div style={{ position: "relative", flex: 1, background: videoSurfaceBg, overflow: "hidden", display: "flex", flexDirection: "column" }}>
            <div style={{ flex: 1, minHeight: 0, width: "100%", overflow: "hidden", position: "relative" }}>
              <div
                style={{
                  position: "absolute",
                  top: 24,
                  left: 24,
                  zIndex: 2,
                  color: theme.colors.green,
                  textShadow: "0 1px 0 color-mix(in srgb, var(--signlearno-elevated) 75%, transparent)",
                  ...signlearnoUpperLabel,
                }}
              >
                Generated Sign Video
              </div>
              {translation ? (
                <>
                  <video
                    key={translation.video_url}
                    src={translation.video_url}
                    controls
                    autoPlay
                    loop
                    muted
                    playsInline
                    onError={() => setVideoPlaybackError("The generated sign video could not be played in this browser.")}
                    style={{ width: "100%", height: "100%", display: "block", objectFit: "cover", background: videoSurfaceBg }}
                  />

                  {videoPlaybackError ? (
                    <div style={{ position: "absolute", right: 16, bottom: 16, borderRadius: 10, background: "var(--signlearno-glass)", padding: "8px 10px", color: theme.colors.red, fontSize: 13, lineHeight: "18px", fontWeight: 700, ...signlearnoText }}>
                      {videoPlaybackError}
                    </div>
                  ) : null}
                </>
              ) : (
                <div style={{ width: "100%", height: "100%", background: videoSurfaceBg, display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", color: error ? theme.colors.red : theme.colors.textMuted, fontSize: 20, lineHeight: "30px", fontWeight: 700, padding: "0 24px", ...signlearnoText }}>
                  {error || "Your translated sign video will appear here."}
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </section>
  );
}




