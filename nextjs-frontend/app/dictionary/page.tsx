"use client";

import Link from "next/link";
import { Footer } from "@/components/Footer";
import { signlearnoTheme as theme, signlearnoText } from "@/components/signlearno/theme";

const duolingo = {
  green: "#58CC02",
  greenDark: "#46A302",
  yellow: "#FFC800",
  blue: "#1CB0F6",
  ink: "#36454F",
  softInk: "#6F7E88",
  line: "#E7E7E7",
  surface: "#FFFFFF",
  blush: "#FFF9DE",
  mint: "#E9F8DD",
};

export default function DictionaryPage() {
  const cards = [
    {
      title: "Sign Alphabet",
      description: "Browse sign language letters and numbers, then open related videos for the symbol you choose.",
      href: "/dictionary/sign-alphabet",
      accent: duolingo.green,
      badge: "ALPHABET",
      emoji: "A",
    },
    {
      title: "Word Search",
      description: "Type a word or phrase and discover related sign videos like a playful dictionary.",
      href: "/dictionary/word-search",
      accent: duolingo.blue,
      badge: "WORDS",
      emoji: "W",
    },
  ];

  return (
    <>
      <main className="min-h-screen pt-[70px] md:pt-0" style={{ background: theme.colors.surface }}>
        <div className="mx-auto max-w-7xl px-4 pb-14 sm:px-6 lg:px-8">
          <section
            className="rounded-3xl border-2 p-6 sm:p-8"
            style={{
              background: `linear-gradient(145deg, ${duolingo.surface} 0%, ${duolingo.blush} 100%)`,
              borderColor: duolingo.line,
              boxShadow: "0 12px 0 rgba(0,0,0,0.08)",
            }}
          >
            <p className="text-xs font-extrabold uppercase tracking-[0.24em]" style={{ color: duolingo.blue }}>
              Sign Dictionary
            </p>
            <h1 className="mt-2 text-3xl font-black sm:text-4xl" style={{ color: duolingo.ink }}>
              Choose how you want to learn
            </h1>
            <p className="mt-2 max-w-2xl text-sm sm:text-base" style={{ color: duolingo.softInk }}>
              Pick a sign alphabet or search by word. Each path opens a dedicated page with related sign videos.
            </p>
          </section>

          <section className="mt-6 grid gap-5 lg:grid-cols-2">
            {cards.map((card) => (
              <Link key={card.href} href={card.href} style={{ textDecoration: "none" }}>
                <div
                  className="h-full rounded-3xl border-2 p-6 transition"
                  style={{
                    background: theme.colors.surface,
                    borderColor: theme.colors.border,
                    boxShadow: "0 10px 0 rgba(0,0,0,0.06)",
                  }}
                  onMouseEnter={(event) => {
                    event.currentTarget.style.borderColor = card.accent;
                    event.currentTarget.style.transform = "translateY(-3px)";
                    event.currentTarget.style.boxShadow = `0 14px 0 ${card.accent}22`;
                  }}
                  onMouseLeave={(event) => {
                    event.currentTarget.style.borderColor = theme.colors.border;
                    event.currentTarget.style.transform = "translateY(0)";
                    event.currentTarget.style.boxShadow = "0 10px 0 rgba(0,0,0,0.06)";
                  }}
                >
                  <div
                    className="inline-flex h-14 w-14 items-center justify-center rounded-2xl text-2xl font-black"
                    style={{ background: `${card.accent}18`, color: card.accent }}
                  >
                    {card.emoji}
                  </div>

                  <div className="mt-5 inline-flex rounded-full px-3 py-1 text-xs font-black" style={{ background: duolingo.mint, color: duolingo.greenDark }}>
                    {card.badge}
                  </div>

                  <h2 className="mt-4 text-2xl font-black" style={{ color: duolingo.ink }}>
                    {card.title}
                  </h2>
                  <p className="mt-3 text-sm leading-6" style={{ color: duolingo.softInk }}>
                    {card.description}
                  </p>

                  <div
                    className="mt-6 inline-flex items-center rounded-2xl px-4 py-3 text-sm font-extrabold"
                    style={{
                      background: card.accent,
                      color: "#fff",
                      borderBottom: `4px solid ${card.accent === duolingo.green ? duolingo.greenDark : "#0f86bf"}`,
                    }}
                  >
                    Open {card.title}
                  </div>
                </div>
              </Link>
            ))}
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
