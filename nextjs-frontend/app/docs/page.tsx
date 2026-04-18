"use client";

import { Footer } from "@/components/Footer";
import { signlearnoTheme as theme, signlearnoText } from "@/components/signlearno/theme";
import { BookOpen, Zap, Users, Award } from "lucide-react";

export default function DocsPage() {
  const features = [
    {
      icon: Zap,
      title: "Real-time Translation",
      description: "AI-powered gesture recognition translates sign language to text in real-time with high accuracy.",
      color: theme.colors.orange,
      bgColor: "rgba(255, 150, 0, 0.12)",
    },
    {
      icon: BookOpen,
      title: "Interactive Lessons",
      description: "Structured learning paths with stories, practice sessions, and knowledge checks to master new signs.",
      color: theme.colors.blue,
      bgColor: "rgba(28, 176, 246, 0.12)",
    },
    {
      icon: Users,
      title: "Community Learning",
      description: "Learn from others, practice together, and celebrate achievements with the SignLearn community.",
      color: theme.colors.green,
      bgColor: "rgba(88, 204, 2, 0.12)",
    },
    {
      icon: Award,
      title: "Gamified Progress",
      description: "Earn XP, complete daily goals, and track your progress with an intuitive gamification system.",
      color: theme.colors.yellow,
      bgColor: "rgba(255, 200, 0, 0.12)",
    },
  ];

  const sections = [
    {
      title: "Getting Started",
      content: "Welcome to SignLearn! This platform is designed to help you learn sign language through interactive lessons and real-time translation technology. Start by creating an account and choosing your learning path.",
    },
    {
      title: "How Translation Works",
      content: "Our AI system uses advanced computer vision (MediaPipe Holistic) to detect hand positions, body poses, and facial landmarks. These are analyzed by our neural network to recognize the sign language gesture and translate it to text in real-time.",
    },
    {
      title: "Learning Paths",
      content: "SignLearn offers structured learning paths organized by difficulty level. Each unit contains story introductions, interactive lessons, practice sessions, and knowledge checks to ensure comprehensive learning.",
    },
    {
      title: "Practice & Feedback",
      content: "Use the Translator tool to practice your signing skills. Get instant feedback on your gestures, learn from mistakes, and track improvement over time with detailed accuracy metrics.",
    },
  ];

  return (
    <>
      <main className="min-h-screen pt-[70px] md:pt-0" style={{ background: theme.colors.canvas }}>
        {/* Hero Section */}
        <div
          style={{
            maxWidth: "1400px",
            margin: "0 auto",
            padding: "60px 20px 80px",
          }}
        >
          <div style={{ textAlign: "center", marginBottom: 80 }}>
            <h1
              style={{
                color: theme.colors.textStrong,
                fontSize: 56,
                fontWeight: 900,
                marginBottom: 16,
                letterSpacing: -2,
                lineHeight: "64px",
                ...signlearnoText,
              }}
            >
              Learn Sign Language<br />with AI Technology
            </h1>
            <p
              style={{
                color: theme.colors.textMuted,
                fontSize: 20,
                lineHeight: "32px",
                fontWeight: 500,
                maxWidth: "600px",
                margin: "0 auto",
                ...signlearnoText,
              }}
            >
              SignLearn is a revolutionary platform that combines interactive lessons with real-time AI translation to help you master sign language faster than ever before.
            </p>
          </div>

          {/* Features Grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: 24,
              marginBottom: 80,
            }}
          >
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
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
                      width: 48,
                      height: 48,
                      borderRadius: "50%",
                      background: feature.bgColor,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: feature.color,
                    }}
                  >
                    <Icon size={24} />
                  </div>
                  <div>
                    <h3
                      style={{
                        color: theme.colors.textStrong,
                        fontSize: 18,
                        fontWeight: 700,
                        marginBottom: 8,
                        ...signlearnoText,
                      }}
                    >
                      {feature.title}
                    </h3>
                    <p
                      style={{
                        color: theme.colors.textMuted,
                        fontSize: 14,
                        lineHeight: "22px",
                        fontWeight: 500,
                        ...signlearnoText,
                      }}
                    >
                      {feature.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Content Sections */}
          <div style={{ display: "grid", gap: 40 }}>
            {sections.map((section, idx) => (
              <div
                key={idx}
                style={{
                  borderRadius: 20,
                  border: `2px solid ${theme.colors.border}`,
                  background: theme.colors.surface,
                  padding: 40,
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.04)",
                }}
              >
                <h2
                  style={{
                    color: theme.colors.textStrong,
                    fontSize: 28,
                    fontWeight: 800,
                    marginBottom: 16,
                    ...signlearnoText,
                  }}
                >
                  {section.title}
                </h2>
                <p
                  style={{
                    color: theme.colors.textMuted,
                    fontSize: 16,
                    lineHeight: "28px",
                    fontWeight: 500,
                    ...signlearnoText,
                  }}
                >
                  {section.content}
                </p>
              </div>
            ))}
          </div>

          {/* CTA Section */}
          <div
            style={{
              marginTop: 80,
              borderRadius: 20,
              background: `linear-gradient(135deg, ${theme.colors.green} 0%, ${theme.colors.greenDark} 100%)`,
              padding: 60,
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 24,
            }}
          >
            <h2
              style={{
                color: theme.colors.surface,
                fontSize: 36,
                fontWeight: 800,
                lineHeight: "44px",
                letterSpacing: -1,
                ...signlearnoText,
              }}
            >
              Ready to Start Your Journey?
            </h2>
            <p
              style={{
                color: "rgba(255, 255, 255, 0.9)",
                fontSize: 18,
                lineHeight: "28px",
                fontWeight: 500,
                maxWidth: "500px",
                ...signlearnoText,
              }}
            >
              Join thousands of learners who are mastering sign language with SignLearn's innovative platform.
            </p>
            <button
              style={{
                marginTop: 16,
                padding: "14px 36px",
                borderRadius: 16,
                border: "none",
                background: theme.colors.surface,
                color: theme.colors.green,
                fontSize: 16,
                fontWeight: 700,
                cursor: "pointer",
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
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
