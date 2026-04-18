"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, Sparkles } from "lucide-react";
import { signlearnoTheme as theme, signlearnoText, signlearnoUpperLabel } from "@/components/signlearno/theme";
import { extractHolisticKeypoints, SIGN_FEATURE_SIZE, SIGN_SEQUENCE_LENGTH } from "@/lib/mediapipe";
import { drawDetectedLabel, drawHolisticLandmarks, drawProbabilityBars, type HolisticDrawResults } from "@/lib/mediapipe";
import { predictSignToText } from "@/lib/api/sign-translation";
import { formatSession, describeCameraError, getCameraStream, humanizeDetectedLabel, resolveHolisticConstructor } from "../utils";
import { ToolStatCard } from "../ui/shared";
import { TOOL_WIDTH, TRANSLATOR_TOOL_GRID_HEIGHT } from "../constants";

export function SignToTextExperience() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const captureIntervalRef = useRef<number | null>(null);
  const sessionIntervalRef = useRef<number | null>(null);
  const sequenceRef = useRef<number[][]>([]);
  const framePendingRef = useRef(false);
  const predictionPendingRef = useRef(false);
  const lastPredictionAtRef = useRef(0);
  const latestScoresRef = useRef<Record<string, number> | null>(null);
  const latestLabelRef = useRef<string>("");
  const holisticRef = useRef<{
    close: () => Promise<void>;
    onResults: (listener: (results: unknown) => void) => void;
    send: (inputs: { image: HTMLVideoElement }) => Promise<void>;
    setOptions: (options: Record<string, unknown>) => void;
  } | null>(null);

  const [cameraActive, setCameraActive] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [sessionSeconds, setSessionSeconds] = useState(0);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isPredicting, setIsPredicting] = useState(false);
  const [translationText, setTranslationText] = useState("Start the camera to begin translating.");
  const [translationStatus, setTranslationStatus] = useState("Camera Off");
  const [confidence, setConfidence] = useState<number | null>(null);

  const stopCamera = async () => {
    if (captureIntervalRef.current) {
      window.clearInterval(captureIntervalRef.current);
      captureIntervalRef.current = null;
    }

    if (sessionIntervalRef.current) {
      window.clearInterval(sessionIntervalRef.current);
      sessionIntervalRef.current = null;
    }

    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;

    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.srcObject = null;
    }

    if (holisticRef.current) {
      try {
        await holisticRef.current.close();
      } catch {
        // ignore MediaPipe teardown errors
      }
      holisticRef.current = null;
    }

    sequenceRef.current = [];
    framePendingRef.current = false;
    predictionPendingRef.current = false;
    latestScoresRef.current = null;
    latestLabelRef.current = "";

    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
    }

    setCameraActive(false);
    setCameraReady(false);
    setIsPredicting(false);
    setSessionSeconds(0);
    setTranslationStatus("Camera Off");
  };

  useEffect(() => {
    return () => {
      void stopCamera();
    };
  }, []);

  const runPrediction = async (sequence: number[][]) => {
    predictionPendingRef.current = true;
    setIsPredicting(true);
    setTranslationStatus("Translating...");
    setCameraError(null);

    try {
      const response = await predictSignToText(sequence);
      const label = humanizeDetectedLabel(response.result.label);
      setTranslationText(label);
      setConfidence(response.result.confidence);
      setTranslationStatus("Live prediction ready");
      latestScoresRef.current = response.result.scores;
      latestLabelRef.current = label;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to reach the translation API.";
      setCameraError(message);
      setTranslationStatus("Prediction failed");
      setConfidence(null);
    } finally {
      setIsPredicting(false);
      predictionPendingRef.current = false;
    }
  };

  const startCamera = async () => {
    if (cameraActive) {
      return;
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError("Camera access is not supported in this browser.");
      setTranslationStatus("Camera unavailable");
      return;
    }

    setCameraError(null);
    setConfidence(null);
    setTranslationText("Move into frame and start signing.");
    setTranslationStatus("Requesting camera access...");
    setSessionSeconds(0);
    sequenceRef.current = [];
    lastPredictionAtRef.current = 0;

    let stream: MediaStream | null = null;

    try {
      stream = await getCameraStream();

      const videoElement = videoRef.current;
      if (!videoElement) {
        throw new Error("Video element is not ready.");
      }

      videoElement.srcObject = stream;
      setCameraActive(true);
      setTranslationStatus("Starting video…");

      try {
        await videoElement.play();
      } catch (playError) {
        throw playError instanceof Error ? playError : new Error(String(playError));
      }

      const overlayCanvas = canvasRef.current;
      if (overlayCanvas) {
        overlayCanvas.width = videoElement.videoWidth || 640;
        overlayCanvas.height = videoElement.videoHeight || 480;
      }

      const mediaPipeModule = await import("@mediapipe/holistic");
      const HolisticConstructor = resolveHolisticConstructor(mediaPipeModule);

      const holistic = new HolisticConstructor({
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/holistic/${file}`,
      });

      holistic.setOptions({
        modelComplexity: 1,
        smoothLandmarks: true,
        refineFaceLandmarks: false,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });

      holistic.onResults((results) => {
        const holisticResults = results as HolisticDrawResults & {
          poseLandmarks?: { x: number; y: number; z: number; visibility?: number }[];
          faceLandmarks?: { x: number; y: number; z: number }[];
          leftHandLandmarks?: { x: number; y: number; z: number }[];
          rightHandLandmarks?: { x: number; y: number; z: number }[];
        };

        const cvs = canvasRef.current;
        if (cvs) {
          const ctx = cvs.getContext("2d");
          if (ctx) {
            ctx.clearRect(0, 0, cvs.width, cvs.height);
            drawHolisticLandmarks(ctx, holisticResults, cvs.width, cvs.height);
            if (latestScoresRef.current) {
              drawProbabilityBars(ctx, latestScoresRef.current, cvs.width);
            }
            if (latestLabelRef.current) {
              drawDetectedLabel(ctx, latestLabelRef.current, cvs.width, cvs.height);
            }
          }
        }

        const keypoints = extractHolisticKeypoints(holisticResults);

        if (keypoints.length !== SIGN_FEATURE_SIZE) {
          return;
        }

        setCameraReady(true);
        sequenceRef.current = [...sequenceRef.current.slice(-(SIGN_SEQUENCE_LENGTH - 1)), keypoints];

        if (
          sequenceRef.current.length >= SIGN_SEQUENCE_LENGTH &&
          !predictionPendingRef.current &&
          Date.now() - lastPredictionAtRef.current > 1800
        ) {
          lastPredictionAtRef.current = Date.now();
          void runPrediction(sequenceRef.current.slice(-SIGN_SEQUENCE_LENGTH));
        }
      });

      streamRef.current = stream;
      holisticRef.current = holistic;
      setTranslationStatus("Collecting frames...");

      captureIntervalRef.current = window.setInterval(async () => {
        const currentVideo = videoRef.current;
        if (
          !currentVideo ||
          currentVideo.readyState < 2 ||
          !holisticRef.current ||
          framePendingRef.current
        ) {
          return;
        }

        framePendingRef.current = true;
        try {
          await holisticRef.current.send({ image: currentVideo });
        } finally {
          framePendingRef.current = false;
        }
      }, 140);

      sessionIntervalRef.current = window.setInterval(() => {
        setSessionSeconds((current) => current + 1);
      }, 1000);
    } catch (error) {
      stream?.getTracks().forEach((track) => track.stop());
      setCameraError(describeCameraError(error));
      await stopCamera();
      setTranslationStatus("Camera start failed");
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(translationText);
    } catch {
      setCameraError("Copy failed in this browser.");
    }
  };

  const handleSpeak = () => {
    if (!("speechSynthesis" in window) || !translationText.trim()) {
      return;
    }

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(new SpeechSynthesisUtterance(translationText));
  };

  const statusValue = cameraError
    ? cameraError
    : cameraActive
      ? isPredicting
        ? "Listening..."
        : cameraReady
          ? "Camera Active"
          : "Starting..."
      : "Camera Off";
  const accuracyValue =
    confidence !== null ? `${Math.round(confidence * 100)}% Confidence` : "Awaiting gesture";

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
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: 0,
              border: "none",
              background: "linear-gradient(180deg, color-mix(in srgb, var(--signlearno-soft-gradient-start) 42%, transparent) 0%, color-mix(in srgb, var(--signlearno-blue-soft) 26%, transparent) 100%)",
              overflow: "hidden",
            }}
          >
            <video
              ref={videoRef}
              muted
              playsInline
              autoPlay
              style={{ width: "100%", height: "100%", objectFit: "cover", display: cameraActive ? "block" : "none" }}
            />
            <canvas
              ref={canvasRef}
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", pointerEvents: "none", display: cameraActive ? "block" : "none" }}
            />
            {!cameraActive ? (
              <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, color: theme.colors.textMuted, textAlign: "center", padding: 24, boxSizing: "border-box", ...signlearnoText }}>
                <Camera size={34} color={theme.colors.green} />
                <div style={{ fontSize: 20, lineHeight: "28px", fontWeight: 700 }}>
                  Camera preview will appear here
                </div>
                <div style={{ fontSize: 15, lineHeight: "24px", maxWidth: 320 }}>
                  Start the camera to stream landmarks to the backend model in real time.
                </div>
              </div>
            ) : null}
          </div>

          <div style={{ position: "absolute", top: 24, left: 24, right: 24, display: "flex", alignItems: "center", justifyContent: "space-between", pointerEvents: "none" }}>
            <span style={{ color: theme.colors.green, ...signlearnoUpperLabel }}>Live Camera</span>
          </div>

          <div style={{ position: "absolute", right: 24, bottom: 24, display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 18 }}>
            <button
              type="button"
              onClick={() => { void (cameraActive ? stopCamera() : startCamera()); }}
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
                cursor: "pointer",
                boxShadow: "0 8px 24px rgba(88, 204, 2, 0.3)",
                transition: "filter 200ms ease, box-shadow 200ms ease",
                fontSize: 16,
                lineHeight: "20px",
                fontWeight: 700,
                ...signlearnoText,
              }}
            >
              <span data-cta-label style={ctaLabelLiftStyle}>
                <Camera size={18} />
                {cameraActive ? "Stop Camera" : "Start Camera"}
              </span>
            </button>
          </div>
        </section>

        <section style={{ padding: 0, height: TRANSLATOR_TOOL_GRID_HEIGHT, boxSizing: "border-box", background: "linear-gradient(180deg, var(--signlearno-soft-gradient-start) 0%, var(--signlearno-soft-gradient-end) 100%)", color: theme.colors.textStrong, display: "flex", overflow: "hidden" }}>
          <div style={{ position: "relative", flex: 1, background: "linear-gradient(180deg, var(--signlearno-soft-gradient-start) 0%, var(--signlearno-soft-gradient-end) 100%)", overflow: "hidden", display: "flex", flexDirection: "column" }}>
            <div style={{ padding: "24px 24px 12px", boxSizing: "border-box", display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ color: theme.colors.green, ...signlearnoUpperLabel }}>
                Real-time Translation
              </span>
            </div>

            <div style={{ flex: 1, minHeight: 0, padding: "0 24px", display: "flex", alignItems: "flex-start" }}>
              <div style={{ marginTop: 4, color: theme.colors.textStrong, fontSize: 50, lineHeight: "52px", fontWeight: 800, letterSpacing: -1.8, ...signlearnoText }}>
                {translationText}
              </div>
            </div>

            <div style={{ marginTop: "auto", padding: "14px 24px 24px", borderTop: "2px solid rgba(88, 204, 2, 0.2)", display: "grid", gap: 14 }}>
              <ToolStatCard icon={<Sparkles size={22} color={theme.colors.orange} />} eyebrow="Accuracy" value={accuracyValue} tone="orange" />
            </div>
          </div>
        </section>
      </div>

      {/* Keep total page height aligned with Text-to-Sign (which has a recent-phrases section). */}
      <section
        aria-hidden="true"
        style={{
          marginTop: 24,
          minHeight: 176,
          borderRadius: 30,
          border: `2px solid transparent`,
          visibility: "hidden",
        }}
      />

    </section>
  );
}



