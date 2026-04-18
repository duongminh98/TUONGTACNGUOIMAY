"use client";

import { useEffect, useMemo, useState } from "react";
import { Footer } from "@/components/Footer";
import { signlearnoTheme as theme, signlearnoText } from "@/components/signlearno/theme";
import { getDictionaryEntries } from "@/lib/api";
import type { TranslatorWord } from "@/lib/api/backend";

type VideoItem = {
  title: string;
  url: string;
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

function getWordLabel(word: TranslatorWord): string {
  return String(word.title || word.text || "").trim();
}

function getWordVideos(word: TranslatorWord | null): VideoItem[] {
  if (!word) return [];

  if (Array.isArray(word.videos) && word.videos.length > 0) {
    return word.videos
      .map((video) => ({
        title: String(video.title || getWordLabel(word)).trim() || getWordLabel(word),
        url: String(video.url || "").trim(),
      }))
      .filter((video) => video.url);
  }

  if (word.videoUrl) {
    return [{ title: getWordLabel(word), url: word.videoUrl }];
  }

  return [];
}

function isDirectVideoUrl(url: string): boolean {
  const normalized = String(url || "").trim().toLowerCase();
  return /\.(mp4|webm|ogg)(\?|#|$)/.test(normalized) || normalized.includes("/video/upload/");
}

export default function WordSearchPage() {
  const [searchWord, setSearchWord] = useState("");
  const [words, setWords] = useState<TranslatorWord[]>([]);
  const [selectedWord, setSelectedWord] = useState<TranslatorWord | null>(null);
  const [activeVideoUrl, setActiveVideoUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedWordVideos = useMemo(() => getWordVideos(selectedWord), [selectedWord]);

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
    const timerId = window.setTimeout(() => {
      const query = searchWord.trim();

      if (!query) {
        setWords([]);
        setSelectedWord(null);
        setError(null);
        setLoading(false);
        return;
      }

      const load = async () => {
        setLoading(true);
        setError(null);
        try {
          const response = await getDictionaryEntries(query, 80);
          const incomingWords = Array.isArray(response.words) ? response.words : [];
          setWords(incomingWords);
          setSelectedWord(incomingWords[0] || null);
        } catch (nextError) {
          setError(nextError instanceof Error ? nextError.message : "Failed to load words.");
          setWords([]);
          setSelectedWord(null);
        } finally {
          setLoading(false);
        }
      };

      void load();
    }, 320);

    return () => window.clearTimeout(timerId);
  }, [searchWord]);

  return (
    <>
      <main className="min-h-screen pt-[70px] md:pt-0" style={{ background: theme.colors.surface }}>
        <div className="mx-auto max-w-7xl px-4 pb-14 sm:px-6 lg:px-8">
          <section className="rounded-3xl border-2 bg-white p-5 sm:p-6" style={{ borderColor: duolingo.line }}>
            <h2 className="text-xl font-black" style={{ color: duolingo.ink }}>
              Search by word
            </h2>
            <p className="mt-1 text-sm" style={{ color: duolingo.softInk }}>
              Use the search box and choose a result from the list.
            </p>

            <div className="mt-4 rounded-2xl border-2 bg-white px-4 py-3" style={{ borderColor: duolingo.line }}>
              <input
                value={searchWord}
                onChange={(event) => setSearchWord(event.target.value)}
                placeholder="Type a word, phrase, or number..."
                className="w-full bg-transparent text-base font-semibold outline-none"
                style={{ color: duolingo.ink }}
              />
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

              {!loading && searchWord.trim() && words.length === 0 ? (
                <div className="rounded-2xl border-2 px-4 py-5 text-sm font-bold" style={{ borderColor: duolingo.line, color: duolingo.softInk }}>
                  No words found for your search.
                </div>
              ) : null}

              {!searchWord.trim() ? (
                <div className="rounded-2xl border-2 px-4 py-5 text-sm font-bold" style={{ borderColor: duolingo.line, color: duolingo.softInk }}>
                  Start typing to see related videos.
                </div>
              ) : null}

              <div className="grid gap-3">
                {words.map((word) => {
                  const wordLabel = getWordLabel(word);
                  const isActive = selectedWord?._id === word._id;
                  const videoCount = getWordVideos(word).length;

                  return (
                    <button
                      key={word._id}
                      type="button"
                      onClick={() => setSelectedWord(word)}
                      className="w-full rounded-2xl border-2 p-4 text-left transition"
                      style={{
                        borderColor: isActive ? duolingo.blue : duolingo.line,
                        background: isActive ? "#e8f7ff" : "#fff",
                        boxShadow: isActive ? "0 6px 0 #cfeeff" : "0 3px 0 #ececec",
                      }}
                    >
                      <div className="text-base font-black" style={{ color: isActive ? duolingo.blue : duolingo.ink }}>
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
                {selectedWord ? `Sign Videos: ${getWordLabel(selectedWord)}` : "Choose a word to preview videos"}
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
                        This word does not have a playable video URL.
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
                            borderColor: isVideoActive ? duolingo.green : duolingo.line,
                            background: isVideoActive ? duolingo.mint : "#fff",
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
