"use client";

import { FloatingLessonPracticeCreator } from "@/components/admin/FloatingLessonPracticeCreator";

export default function LearnLayout({ children }: { children: React.ReactNode }) {
  return (
    <main style={{ minHeight: "100vh", paddingTop: "70px", background: "transparent" }}>
      {children}
      <FloatingLessonPracticeCreator />
    </main>
  );
}
