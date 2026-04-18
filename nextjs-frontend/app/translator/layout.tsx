"use client";

import { Footer } from "@/components/Footer";
import { signlearnoTheme as theme } from "@/components/signlearno/theme";

export default function TranslatorLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <main
        className="min-h-screen pb-10 pt-[70px] md:pb-14 md:pt-0"
        style={{ background: theme.colors.canvas }}
      >
        {children}
      </main>
      <Footer />
    </>
  );
}
