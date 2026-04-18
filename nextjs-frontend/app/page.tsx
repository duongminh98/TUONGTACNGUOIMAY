"use client";

import Link from "next/link";
import Image from "next/image";
import { Footer } from "@/components/shared";
import { signlearnoTheme as theme, signlearnoText } from "@/components/signlearno/theme";
import { ArrowRight, Play, Sparkles } from "lucide-react";
import heroLogo from "@/components/Gemini_Generated_Image_7bvlng7bvlng7bvl (1).png";

export default function LandingPage() {
  const heroCtaBaseStyle = {
    padding: "16px 32px",
    borderRadius: 16,
    fontSize: 16,
    fontWeight: 700,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: 12,
    transition: "background-color 220ms ease, border-color 220ms ease, filter 220ms ease",
    ...signlearnoText,
  };

  const ctaLabelLiftStyle = {
    display: "inline-flex",
    alignItems: "center",
    gap: 12,
    transition: "transform 180ms ease",
  };

  const onHeroCtaMouseEnter = (event: React.MouseEvent<HTMLButtonElement>) => {
    const label = event.currentTarget.querySelector<HTMLElement>("[data-cta-label]");
    if (label) label.style.transform = "translateY(-2px)";
    event.currentTarget.style.boxShadow = "0 14px 30px rgba(15, 23, 42, 0.16)";
  };

  const onHeroCtaMouseLeave = (event: React.MouseEvent<HTMLButtonElement>) => {
    const label = event.currentTarget.querySelector<HTMLElement>("[data-cta-label]");
    if (label) label.style.transform = "none";
    const resetShadow = event.currentTarget.dataset.shadowRest;
    if (resetShadow) {
      event.currentTarget.style.boxShadow = resetShadow;
    }
  };

  return (
    <>
      <main className="min-h-screen">
        {/* Hero Section */}
        <section
          style={{
            background: `linear-gradient(135deg, ${theme.colors.greenSoft} 0%, rgba(28, 176, 246, 0.05) 100%)`,
            padding: "80px 20px 120px",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              maxWidth: "1200px",
              margin: "0 auto",
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: 60,
              alignItems: "center",
            }}
          >
            {/* Left Content */}
            <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
              <div>
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "10px 14px",
                    borderRadius: 999,
                    background: "rgba(88, 204, 2, 0.1)",
                    border: `2px solid ${theme.colors.greenSoft}`,
                    marginBottom: 24,
                  }}
                >
                  <Sparkles size={16} color={theme.colors.green} />
                  <span
                    style={{
                      color: theme.colors.green,
                      fontSize: 13,
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: 0.5,
                      ...signlearnoText,
                    }}
                  >
                    AI-Powered Learning
                  </span>
                </div>

                <h1
                  style={{
                    color: theme.colors.textStrong,
                    fontSize: 56,
                    fontWeight: 900,
                    lineHeight: "66px",
                    letterSpacing: -2,
                    marginBottom: 20,
                    ...signlearnoText,
                  }}
                >
                  Master Sign Language<br />with Real-Time AI
                </h1>

                <p
                  style={{
                    color: theme.colors.textMuted,
                    fontSize: 18,
                    lineHeight: "28px",
                    fontWeight: 500,
                    ...signlearnoText,
                  }}
                >
                  SignLearn combines interactive lessons, real-time gesture translation, and gamified progress tracking to help you learn sign language faster than ever before.
                </p>
              </div>

              {/* CTA Buttons */}
              <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                <Link href="/learn">
                  <button
                    data-shadow-rest="0 8px 24px rgba(88, 204, 2, 0.3)"
                    style={{
                      border: "none",
                      background: theme.colors.green,
                      color: theme.colors.surface,
                      boxShadow: "0 8px 24px rgba(88, 204, 2, 0.3)",
                      ...heroCtaBaseStyle,
                      ...signlearnoText,
                    }}
                    onMouseEnter={onHeroCtaMouseEnter}
                    onMouseLeave={onHeroCtaMouseLeave}
                  >
                    <span data-cta-label style={ctaLabelLiftStyle}>
                      Start Learning
                      <ArrowRight size={18} />
                    </span>
                  </button>
                </Link>

                <a href="#features">
                  <button
                    data-shadow-rest="0 8px 24px rgba(88, 204, 2, 0.12)"
                    style={{
                      border: `2px solid ${theme.colors.border}`,
                      background: theme.colors.surface,
                      color: theme.colors.textStrong,
                      boxShadow: "0 8px 24px rgba(88, 204, 2, 0.12)",
                      ...heroCtaBaseStyle,
                      ...signlearnoText,
                    }}
                    onMouseEnter={(e) => {
                      onHeroCtaMouseEnter(e);
                    }}
                    onMouseLeave={onHeroCtaMouseLeave}
                  >
                    <span data-cta-label style={ctaLabelLiftStyle}>
                      <Play size={18} />
                      Watch Demo
                    </span>
                  </button>
                </a>
              </div>

              {/* Stats */}
              <div style={{ display: "flex", gap: 40, flexWrap: "wrap" }}>
                {[
                  { label: "Active Learners", value: "10K+" },
                  { label: "Signs Mastered", value: "500+" },
                  { label: "Success Rate", value: "95%" },
                ].map((stat, idx) => (
                  <div key={idx}>
                    <div
                      style={{
                        color: theme.colors.green,
                        fontSize: 24,
                        fontWeight: 800,
                        ...signlearnoText,
                      }}
                    >
                      {stat.value}
                    </div>
                    <div
                      style={{
                        color: theme.colors.textMuted,
                        fontSize: 13,
                        fontWeight: 600,
                        marginTop: 4,
                        ...signlearnoText,
                      }}
                    >
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Visual */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                minHeight: 420,
                pointerEvents: "none",
              }}
            >
              <div
                style={{
                  position: "relative",
                  width: "100%",
                  maxWidth: 520,
                  aspectRatio: "1 / 1",
                  overflow: "visible",
                  pointerEvents: "none",
                }}
              >
                <Image
                  src={heroLogo}
                  alt="SignLearn logo"
                  fill
                  style={{
                    objectFit: "contain",
                    transform: "translateY(36px) scale(4)",
                    transformOrigin: "center",
                    pointerEvents: "none",
                  }}
                  priority
                />
              </div>
              {/* Removed 4 feature tiles (Learn/Practice/Master/Celebrate) */}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section
          id="features"
          style={{
            padding: "80px 20px",
            background: theme.colors.canvas,
          }}
        >
          <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: 60 }}>
              <h2
                style={{
                  color: theme.colors.textStrong,
                  fontSize: 44,
                  fontWeight: 800,
                  marginBottom: 16,
                  letterSpacing: -1,
                  ...signlearnoText,
                }}
              >
                Why Choose SignLearn?
              </h2>
              <p
                style={{
                  color: theme.colors.textMuted,
                  fontSize: 18,
                  lineHeight: "28px",
                  maxWidth: "500px",
                  margin: "0 auto",
                  ...signlearnoText,
                }}
              >
                Experience the future of language learning with cutting-edge AI technology
              </p>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                gap: 24,
              }}
            >
              {[
                {
                  title: "Real-Time Translation",
                  desc: "AI-powered camera detects and translates gestures instantly",
                  color: theme.colors.orange,
                },
                {
                  title: "Structured Curriculum",
                  desc: "Progressive lessons from basics to advanced fluency",
                  color: theme.colors.blue,
                },
                {
                  title: "Instant Feedback",
                  desc: "Get real-time accuracy metrics on your signing",
                  color: theme.colors.green,
                },
                {
                  title: "Community Support",
                  desc: "Learn alongside thousands of other learners worldwide",
                  color: theme.colors.yellow,
                },
              ].map((feature, idx) => (
                <div
                  key={idx}
                  style={{
                    borderRadius: 20,
                    border: `2px solid ${theme.colors.border}`,
                    background: theme.colors.surface,
                    padding: 28,
                    display: "flex",
                    flexDirection: "column",
                    gap: 16,
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.04)",
                    transition: "all 300ms ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = "0 16px 40px rgba(0, 0, 0, 0.12)";
                    e.currentTarget.style.transform = "translateY(-8px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.04)";
                    e.currentTarget.style.transform = "none";
                  }}
                >
                  <div
                    style={{
                      width: 12,
                      height: 12,
                      borderRadius: "50%",
                      background: feature.color,
                    }}
                  />
                  <h3
                    style={{
                      color: theme.colors.textStrong,
                      fontSize: 18,
                      fontWeight: 700,
                      ...signlearnoText,
                    }}
                  >
                    {feature.title}
                  </h3>
                  <p
                    style={{
                      color: theme.colors.textMuted,
                      fontSize: 15,
                      lineHeight: "24px",
                      fontWeight: 500,
                      ...signlearnoText,
                    }}
                  >
                    {feature.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section
          style={{
            padding: "80px 20px",
            background: `linear-gradient(135deg, ${theme.colors.green} 0%, ${theme.colors.greenDark} 100%)`,
          }}
        >
          <div
            style={{
              maxWidth: "800px",
              margin: "0 auto",
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 28,
            }}
          >
            <h2
              style={{
                color: theme.colors.surface,
                fontSize: 44,
                fontWeight: 800,
                lineHeight: "52px",
                letterSpacing: -1,
                ...signlearnoText,
              }}
            >
              Ready to Start Your Sign Language Journey?
            </h2>
            <p
              style={{
                color: "rgba(255, 255, 255, 0.9)",
                fontSize: 18,
                lineHeight: "28px",
                fontWeight: 500,
                ...signlearnoText,
              }}
            >
              Join thousands of learners mastering sign language with our AI-powered platform. No experience needed!
            </p>
            <Link href="/learn">
              <button
                style={{
                  padding: "16px 40px",
                  borderRadius: 16,
                  border: "none",
                  background: theme.colors.surface,
                  color: theme.colors.green,
                  fontSize: 16,
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  boxShadow: "0 8px 24px rgba(0, 0, 0, 0.2)",
                  transition: "all 200ms ease",
                  ...signlearnoText,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "0 12px 32px rgba(0, 0, 0, 0.3)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "none";
                  e.currentTarget.style.boxShadow = "0 8px 24px rgba(0, 0, 0, 0.2)";
                }}
              >
                Get Started Now
                <ArrowRight size={18} />
              </button>
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
