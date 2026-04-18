"use client";

import { Footer } from "@/components/Footer";
import { signlearnoTheme as theme } from "@/components/signlearno/theme";

export default function LearnLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <main className="min-h-screen pt-[70px] md:pt-0" style={{ background: theme.colors.canvas }}>
        {children}
      </main>
      <Footer />
    </>
  );
}
