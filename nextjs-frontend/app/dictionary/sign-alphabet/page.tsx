"use client";

import { useEffect, useMemo, useState } from "react";
import { Footer } from "@/components/Footer";
import { signlearnoTheme as theme, signlearnoText } from "@/components/signlearno/theme";
import { getAlphabetSignVideos, getNumberSignVideos } from "@/lib/api";
import type { SignVideoItem } from "@/lib/api/backend";
import alphabetA from "@/components/assets/alphabets/a.jpg";
import alphabetB from "@/components/assets/alphabets/b.jpg";
import alphabetC from "@/components/assets/alphabets/c.jpg";
import alphabetD from "@/components/assets/alphabets/d.jpg";
import alphabetE from "@/components/assets/alphabets/e.jpg";
import alphabetF from "@/components/assets/alphabets/f.jpg";
import alphabetG from "@/components/assets/alphabets/g.jpg";
import alphabetH from "@/components/assets/alphabets/h.jpg";
import alphabetI from "@/components/assets/alphabets/i.jpg";
import alphabetJ from "@/components/assets/alphabets/j.jpg";
import alphabetK from "@/components/assets/alphabets/k.jpg";
import alphabetL from "@/components/assets/alphabets/l.jpg";
import alphabetM from "@/components/assets/alphabets/m.jpg";
import alphabetN from "@/components/assets/alphabets/n.jpg";
import alphabetO from "@/components/assets/alphabets/o.jpg";
import alphabetP from "@/components/assets/alphabets/p.jpg";
import alphabetQ from "@/components/assets/alphabets/q.jpg";
import alphabetR from "@/components/assets/alphabets/r.jpg";
import alphabetS from "@/components/assets/alphabets/s.jpg";
import alphabetT from "@/components/assets/alphabets/t.jpg";
import alphabetU from "@/components/assets/alphabets/u.jpg";
import alphabetV from "@/components/assets/alphabets/v.jpg";
import alphabetW from "@/components/assets/alphabets/w.jpg";
import alphabetX from "@/components/assets/alphabets/x.jpg";
import alphabetY from "@/components/assets/alphabets/y.jpg";
import alphabetZ from "@/components/assets/alphabets/z.jpg";
import number1 from "@/components/assets/numbers/1.jpg";
import number2 from "@/components/assets/numbers/2.jpg";
import number3 from "@/components/assets/numbers/3.jpg";
import number4 from "@/components/assets/numbers/4.jpg";
import number5 from "@/components/assets/numbers/5.jpg";
import number6 from "@/components/assets/numbers/6.jpg";
import number7 from "@/components/assets/numbers/7.jpg";
import number8 from "@/components/assets/numbers/8.jpg";
import number9 from "@/components/assets/numbers/9.jpg";
import number10 from "@/components/assets/numbers/10.jpg";
import number11 from "@/components/assets/numbers/11.jpg";
import number12 from "@/components/assets/numbers/12.jpg";
import number13 from "@/components/assets/numbers/13.jpg";
import number14 from "@/components/assets/numbers/14.jpg";
import number15 from "@/components/assets/numbers/15.jpg";
import number16 from "@/components/assets/numbers/16.jpg";
import number17 from "@/components/assets/numbers/17.jpg";
import number18 from "@/components/assets/numbers/18.jpg";
import number19 from "@/components/assets/numbers/19.jpg";
import number20 from "@/components/assets/numbers/20.jpg";

type SignSet = "letters" | "numbers";

type VideoItem = {
  title: string;
  url: string;
};

const LETTER_SIGNS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const NUMBER_SIGNS = Array.from({ length: 20 }, (_, index) => String(index + 1));

const LETTER_SIGN_IMAGES: Record<string, string | null> = {
  A: alphabetA.src,
  B: alphabetB.src,
  C: alphabetC.src,
  D: alphabetD.src,
  E: alphabetE.src,
  F: alphabetF.src,
  G: alphabetG.src,
  H: alphabetH.src,
  I: alphabetI.src,
  J: alphabetJ.src,
  K: alphabetK.src,
  L: alphabetL.src,
  M: alphabetM.src,
  N: alphabetN.src,
  O: alphabetO.src,
  P: alphabetP.src,
  Q: alphabetQ.src,
  R: alphabetR.src,
  S: alphabetS.src,
  T: alphabetT.src,
  U: alphabetU.src,
  V: alphabetV.src,
  W: alphabetW.src,
  X: alphabetX.src,
  Y: alphabetY.src,
  Z: alphabetZ.src,
};

const NUMBER_SIGN_IMAGES: Record<string, string> = {
  "1": number1.src,
  "2": number2.src,
  "3": number3.src,
  "4": number4.src,
  "5": number5.src,
  "6": number6.src,
  "7": number7.src,
  "8": number8.src,
  "9": number9.src,
  "10": number10.src,
  "11": number11.src,
  "12": number12.src,
  "13": number13.src,
  "14": number14.src,
  "15": number15.src,
  "16": number16.src,
  "17": number17.src,
  "18": number18.src,
  "19": number19.src,
  "20": number20.src,
};

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

function getWordLabel(word: SignVideoItem): string {
  return String(word.name || "").trim();
}

function getWordVideos(word: SignVideoItem | null): VideoItem[] {
  if (!word) return [];
  return [{ title: getWordLabel(word), url: String(word.url || "").trim() }].filter((video) => video.url);
}

function rankByPrefix(words: SignVideoItem[], symbol: string): SignVideoItem[] {
  const normalized = symbol.toLowerCase();

  const startsWith = words.filter((word) => getWordLabel(word).toLowerCase().startsWith(normalized));
  const includes = words.filter((word) => {
    const label = getWordLabel(word).toLowerCase();
    return !label.startsWith(normalized) && label.includes(normalized);
  });

  return [...startsWith, ...includes];
}

function isDirectVideoUrl(url: string): boolean {
  const normalized = String(url || "").trim().toLowerCase();
  return /\.(mp4|webm|ogg)(\?|#|$)/.test(normalized) || normalized.includes("/video/upload/");
}

export default function SignAlphabetPage() {
  const [signSet, setSignSet] = useState<SignSet>("letters");
  const [hoveredSignSet, setHoveredSignSet] = useState<SignSet | null>(null);
  const [selectedSymbol, setSelectedSymbol] = useState("A");
  const [words, setWords] = useState<SignVideoItem[]>([]);
  const [selectedWord, setSelectedWord] = useState<SignVideoItem | null>(null);
  const [activeVideoUrl, setActiveVideoUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const availableSymbols = useMemo(() => (signSet === "letters" ? LETTER_SIGNS : NUMBER_SIGNS), [signSet]);
  const selectedWordVideos = useMemo(() => getWordVideos(selectedWord), [selectedWord]);

  useEffect(() => {
    if (availableSymbols.includes(selectedSymbol)) return;
    setSelectedSymbol(availableSymbols[0]);
  }, [availableSymbols, selectedSymbol]);

  useEffect(() => {
    if (selectedWordVideos.length === 0) {
      setActiveVideoUrl("");
      return;
    }

    const stillExists = selectedWordVideos.some((video) => video.url === activeVideoUrl);
    if (!stillExists) {
      setActiveVideoUrl(selectedWordVideos[0].url);
    }
  }, [selectedWordVideos, activeVideoUrl]);

  useEffect(() => {
    if (signSet !== "letters") {
      return;
    }

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await getAlphabetSignVideos(selectedSymbol);
        const incoming = Array.isArray(response) ? response : [];
        const ranked = rankByPrefix(incoming, selectedSymbol);
        setWords(ranked);
        setSelectedWord(ranked[0] || null);
      } catch (nextError) {
        setError(nextError instanceof Error ? nextError.message : "Failed to load symbols.");
        setWords([]);
        setSelectedWord(null);
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [signSet, selectedSymbol]);

  useEffect(() => {
    if (signSet !== "numbers") {
      return;
    }

    const load = async () => {
      setLoading(true);
      setError(null);

      try {
        const source = await getNumberSignVideos(selectedSymbol);
        const nextWords = Array.isArray(source) ? source : [];
        setWords(nextWords);
        setSelectedWord(nextWords[0] || null);
      } catch (nextError) {
        setError(nextError instanceof Error ? nextError.message : "Failed to load symbols.");
        setWords([]);
        setSelectedWord(null);
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [signSet, selectedSymbol]);

  return (
    <>
      <main className="min-h-screen pt-[70px] md:pt-0" style={{ background: theme.colors.surface }}>
        <div className="mx-auto max-w-7xl px-4 pb-14 sm:px-6 lg:px-8">
          <section className="rounded-3xl border-2 bg-white p-5 sm:p-6" style={{ borderColor: duolingo.line }}>
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-xl font-black" style={{ color: duolingo.ink }}>
                  Choose Sign Set
                </h2>
                <p className="mt-1 text-sm" style={{ color: duolingo.softInk }}>
                  Tap a symbol tile below to load all related sign videos.
                </p>
              </div>

              <div className="inline-flex rounded-2xl p-1" style={{ background: duolingo.mint }}>
                <button
                  type="button"
                  onClick={() => {
                    setSignSet("letters");
                    setSelectedSymbol("A");
                  }}
                  onMouseEnter={() => setHoveredSignSet("letters")}
                  onMouseLeave={() => setHoveredSignSet(null)}
                  className="rounded-xl px-4 py-2 text-sm font-semibold"
                  style={{
                    background: signSet === "letters" ? duolingo.green : "transparent",
                    color: signSet === "letters" ? "#fff" : hoveredSignSet === "letters" ? duolingo.green : duolingo.ink,
                    transition: "color 180ms ease",
                  }}
                >
                  LETTER SIGNS
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSignSet("numbers");
                    setSelectedSymbol("1");
                  }}
                  onMouseEnter={() => setHoveredSignSet("numbers")}
                  onMouseLeave={() => setHoveredSignSet(null)}
                  className="rounded-xl px-4 py-2 text-sm font-semibold"
                  style={{
                    background: signSet === "numbers" ? duolingo.green : "transparent",
                    color: signSet === "numbers" ? "#fff" : hoveredSignSet === "numbers" ? duolingo.green : duolingo.ink,
                    transition: "color 180ms ease",
                  }}
                >
                  NUMBER SIGNS
                </button>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-5 gap-3 sm:grid-cols-8 lg:grid-cols-10">
              {availableSymbols.map((symbol) => {
                const active = symbol === selectedSymbol;
                const mediaSrc = signSet === "letters" ? LETTER_SIGN_IMAGES[symbol] : NUMBER_SIGN_IMAGES[symbol];
                return (
                  <button
                    key={symbol}
                    type="button"
                    onClick={() => setSelectedSymbol(symbol)}
                    className="aspect-square overflow-hidden rounded-2xl border-2 transition"
                    style={{
                      borderColor: active ? duolingo.greenDark : duolingo.line,
                      background: active ? duolingo.green : "#fff",
                      boxShadow: active ? "0 6px 0 #3d9602" : "0 4px 0 #e2e2e2",
                      transform: "translateY(0)",
                      filter: "none",
                      transition: "transform 180ms ease, box-shadow 180ms ease, filter 180ms ease",
                    }}
                    onMouseEnter={(event) => {
                      event.currentTarget.style.transform = "translateY(-4px) scale(1.02)";
                      event.currentTarget.style.boxShadow = active ? "0 10px 0 #3d9602" : "0 10px 0 #d8d8d8";
                      event.currentTarget.style.filter = "brightness(1.04)";
                    }}
                    onMouseLeave={(event) => {
                      event.currentTarget.style.transform = "translateY(0) scale(1)";
                      event.currentTarget.style.boxShadow = active ? "0 6px 0 #3d9602" : "0 4px 0 #e2e2e2";
                      event.currentTarget.style.filter = "none";
                    }}
                    aria-label={`Select sign ${symbol}`}
                  >
                    <span style={{ display: "flex", flexDirection: "column", width: "100%", height: "100%" }}>
                      <span style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", background: "#fff" }}>
                        {mediaSrc ? (
                          <img
                            src={mediaSrc}
                            alt={`${symbol} sign`}
                            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                          />
                        ) : (
                          <span style={{ fontSize: 22, fontWeight: 800, color: duolingo.ink }}>{symbol}</span>
                        )}
                      </span>
                      <span
                        style={{
                          height: 28,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 14,
                          fontWeight: 800,
                          background: active ? duolingo.greenDark : "#f7f7f7",
                          color: active ? "#fff" : duolingo.ink,
                          borderTop: `1px solid ${active ? duolingo.greenDark : duolingo.line}`,
                          ...signlearnoText,
                        }}
                      >
                        {symbol}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          {error ? (
            <div className="mt-5 rounded-2xl border-2 px-4 py-3 text-sm font-bold" style={{ borderColor: "#ffb9b9", color: "#c32424", background: "#fff0f0" }}>
              {error}
            </div>
          ) : null}

          <section className="mt-6 grid gap-6 xl:grid-cols-[1fr_1.2fr]">
            <div className="rounded-3xl border-2 bg-white p-4 sm:p-5" style={{ borderColor: duolingo.line }}>
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-lg font-black" style={{ color: duolingo.ink }}>
                  Related Words
                </h3>
                <span className="rounded-full px-3 py-1 text-xs font-black" style={{ background: duolingo.mint, color: duolingo.greenDark }}>
                  {words.length} results
                </span>
              </div>

              {loading ? (
                <div className="rounded-2xl border-2 px-4 py-5 text-sm font-bold" style={{ borderColor: duolingo.line, color: duolingo.softInk }}>
                  Loading dictionary videos...
                </div>
              ) : null}

              {!loading && words.length === 0 ? (
                <div className="rounded-2xl border-2 px-4 py-5 text-sm font-bold" style={{ borderColor: duolingo.line, color: duolingo.softInk }}>
                  No words found for this symbol.
                </div>
              ) : null}

              <div className="grid gap-3">
                {words.map((word) => {
                  const wordLabel = getWordLabel(word);
                  const isActive = selectedWord?.id === word.id;
                  const videoCount = getWordVideos(word).length;

                  return (
                    <button
                      key={word.id}
                      type="button"
                      onClick={() => setSelectedWord(word)}
                      className="w-full rounded-2xl border-2 p-4 text-left transition"
                      style={{
                        borderColor: isActive ? duolingo.greenDark : duolingo.line,
                        background: isActive ? duolingo.mint : "#fff",
                        boxShadow: isActive ? "0 6px 0 #d2efb7" : "0 3px 0 #ececec",
                      }}
                    >
                      <div className="text-base font-black" style={{ color: isActive ? duolingo.greenDark : duolingo.ink }}>
                        {wordLabel}
                      </div>
                      <div className="mt-1 text-xs font-bold uppercase tracking-[0.14em]" style={{ color: duolingo.softInk }}>
                        {videoCount} video{videoCount === 1 ? "" : "s"}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="rounded-3xl border-2 bg-white p-4 sm:p-5" style={{ borderColor: duolingo.line }}>
              <h3 className="text-lg font-black" style={{ color: duolingo.ink }}>
                {selectedWord ? `Sign Videos: ${getWordLabel(selectedWord)}` : "Choose a symbol to preview videos"}
              </h3>

              {selectedWord ? (
                <>
                  <div className="mt-4 overflow-hidden rounded-2xl border-2" style={{ borderColor: duolingo.line, background: "#000" }}>
                    {activeVideoUrl ? (
                      isDirectVideoUrl(activeVideoUrl) ? (
                        <video
                          key={activeVideoUrl}
                          src={activeVideoUrl}
                          controls
                          autoPlay
                          muted
                          playsInline
                          style={{ width: "100%", height: 520, border: "none", display: "block", objectFit: "contain", background: "#000" }}
                        />
                      ) : (
                        <iframe
                          key={activeVideoUrl}
                          src={`${activeVideoUrl}${activeVideoUrl.includes("?") ? "&" : "?"}autoplay=1&mute=1&rel=0`}
                          title={`Sign video ${getWordLabel(selectedWord)}`}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope"
                          allowFullScreen
                          style={{ width: "100%", height: 520, border: "none", display: "block" }}
                        />
                      )
                    ) : (
                      <div className="flex min-h-[260px] items-center justify-center px-6 text-center text-sm font-bold" style={{ color: "#d3d3d3" }}>
                        This symbol does not have a playable video URL.
                      </div>
                    )}
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    {selectedWordVideos.map((video) => {
                      const isVideoActive = video.url === activeVideoUrl;

                      return (
                        <button
                          key={`${video.title}-${video.url}`}
                          type="button"
                          onClick={() => setActiveVideoUrl(video.url)}
                          className="rounded-2xl border-2 px-4 py-3 text-left transition"
                          style={{
                            borderColor: isVideoActive ? duolingo.blue : duolingo.line,
                            background: isVideoActive ? "#e8f7ff" : "#fff",
                          }}
                        >
                          <div className="text-sm font-black" style={{ color: duolingo.ink }}>
                            {video.title}
                          </div>
                          <div className="mt-1 line-clamp-1 text-xs font-semibold" style={{ color: duolingo.softInk }}>
                            {video.url}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </>
              ) : (
                <div className="mt-4 rounded-2xl border-2 px-4 py-5 text-sm font-bold" style={{ borderColor: duolingo.line, color: duolingo.softInk }}>
                  Pick any result on the left to watch related sign videos.
                </div>
              )}
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
