"use client";

import { usePathname } from "next/navigation";
import { Header } from "@/components/Header";
import { DESKTOP_SIDEBAR_WIDTH_PX } from "@/components/shell-layout";

const HIDDEN_HEADER_PATHS = ["/login", "/register"];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hideHeader =
    pathname === "/" ||
    HIDDEN_HEADER_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`));

  const shellVars = !hideHeader
    ? ({ ["--app-sidebar-width" as string]: `${DESKTOP_SIDEBAR_WIDTH_PX}px` } as React.CSSProperties)
    : undefined;

  return (
    <div style={shellVars}>
      {!hideHeader ? <Header /> : null}
      <div
        className={
          !hideHeader ? "min-h-screen bg-[var(--signlearno-canvas)] md:pl-[var(--app-sidebar-width)]" : undefined
        }
      >
        {children}
      </div>
    </div>
  );
}