import type { CSSProperties } from "react";

export const signlearnoTheme = {
  brandName: "signlearno",
  fontFamily: "Inter, var(--font-geist-sans), sans-serif",
  colors: {
    surface: "var(--signlearno-surface)",
    canvas: "var(--signlearno-canvas)",
    sidebar: "var(--signlearno-sidebar)",
    border: "var(--signlearno-border)",
    textStrong: "var(--signlearno-text-strong)",
    textMuted: "var(--signlearno-text-muted)",
    textSoft: "var(--signlearno-text-soft)",
    blue: "var(--signlearno-blue)",
    blueSoft: "var(--signlearno-blue-soft)",
    blueBorder: "var(--signlearno-blue-border)",
    green: "var(--signlearno-green)",
    greenDark: "var(--signlearno-green-dark)",
    greenSoft: "var(--signlearno-green-soft)",
    yellow: "var(--signlearno-yellow)",
    yellowSoft: "var(--signlearno-yellow-soft)",
    orange: "var(--signlearno-orange)",
    red: "var(--signlearno-red)",
    purple: "var(--signlearno-purple)",
    purpleSoft: "var(--signlearno-purple-soft)",
    node: "var(--signlearno-node)",
    nodeShadow: "var(--signlearno-node-shadow)",
    nodeIcon: "var(--signlearno-node-icon)",
    grid: "var(--signlearno-grid)",
    chartFill: "var(--signlearno-chart-fill)",
    focus: "var(--signlearno-focus)",
  },
  radius: {
    unit: 13,
    card: 16,
    pill: 999,
    bubble: 10,
  },
  fontSize: {
    brand: 34,
    unitTitle: 22,
    sectionTitle: 21,
    body: 16,
    bodySmall: 15,
    label: 13,
  },
  shadow: {
    button: "0 2px 0 rgba(0, 0, 0, 0.2)",
    tile: "0 8px 0 rgba(0, 0, 0, 0.18)",
  },
} as const;

export const signlearnoText: CSSProperties = {
  fontFamily: signlearnoTheme.fontFamily,
};

export const signlearnoUpperLabel: CSSProperties = {
  ...signlearnoText,
  fontSize: signlearnoTheme.fontSize.label,
  lineHeight: "18px",
  fontWeight: 700,
  letterSpacing: 0.8,
  textTransform: "uppercase",
};
