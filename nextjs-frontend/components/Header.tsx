"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signlearnoTheme as theme, signlearnoText } from "@/components/signlearno/theme";
import {
  BookOpen,
  Captions,
  ChevronDown,
  ClipboardCheck,
  Flame,
  GraduationCap,
  Hand,
  Home,
  Languages,
  LayoutDashboard,
  Library,
  LogOut,
  Menu,
  Search,
  Trophy,
  Users,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { MouseEvent } from "react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { clearStoredToken, getProfile, getStoredToken } from "@/lib/api";
import type { MutableRefObject } from "react";

const baseNavigation = [
  { name: "Home", href: "/", icon: "home" },
  { name: "Translator", href: "/translator", icon: "translator" },
  { name: "Learn", href: "/learn", icon: "learn" },
  { name: "Leaderboard", href: "/leaderboard", icon: "leaderboard" },
  { name: "Dictionary", href: "/dictionary", icon: "dictionary" },
];

export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [translatorDropdownOpen, setTranslatorDropdownOpen] = useState(false);
  const [mobileTranslatorOpen, setMobileTranslatorOpen] = useState(false);
  const [learnDropdownOpen, setLearnDropdownOpen] = useState(false);
  const [mobileLearnOpen, setMobileLearnOpen] = useState(false);
  const [dictionaryDropdownOpen, setDictionaryDropdownOpen] = useState(false);
  const [mobileDictionaryOpen, setMobileDictionaryOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [mobileUserOpen, setMobileUserOpen] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const [role, setRole] = useState<"user" | "admin" | null>(null);
  const [streak, setStreak] = useState<number>(0);
  const userDropdownRef = useRef<HTMLDivElement | null>(null);
  const translatorCloseTimer = useRef<number | null>(null);
  const learnCloseTimer = useRef<number | null>(null);
  const dictionaryCloseTimer = useRef<number | null>(null);
  const userCloseTimer = useRef<number | null>(null);

  const navItemStyle = {
    height: 42,
    minHeight: 42,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    boxSizing: "border-box" as const,
    whiteSpace: "nowrap" as const,
    lineHeight: 1,
  };

  /** Chỉ nâng chữ, không nâng cả khối nút (tránh layout nhảy) */
  const navLabelLiftStyle = {
    display: "inline-block" as const,
    transition: "transform 180ms ease",
  };

  const onNavLabelLiftEnter = (event: MouseEvent<HTMLDivElement>) => {
    const label = event.currentTarget.querySelector<HTMLElement>("[data-nav-label]");
    if (label) label.style.transform = "translateY(-2px)";
  };

  const onNavLabelLiftLeave = (event: MouseEvent<HTMLDivElement>) => {
    const label = event.currentTarget.querySelector<HTMLElement>("[data-nav-label]");
    if (label) label.style.transform = "none";
  };

  const onTopNavItemEnter = (event: MouseEvent<HTMLDivElement>) => {
    const label = event.currentTarget.querySelector<HTMLElement>("[data-nav-label]");
    if (label) label.style.transform = "translateY(-2px)";
    event.currentTarget.style.color = theme.colors.green;
  };

  const onTopNavItemLeave = (event: MouseEvent<HTMLDivElement>) => {
    const label = event.currentTarget.querySelector<HTMLElement>("[data-nav-label]");
    if (label) label.style.transform = "none";
    const isActive = event.currentTarget.dataset.active === "true";
    event.currentTarget.style.color = isActive ? theme.colors.green : theme.colors.textMuted;
  };

  const onDropdownItemEnter = (event: MouseEvent<HTMLDivElement>) => {
    const label = event.currentTarget.querySelector<HTMLElement>("[data-nav-label]");
    if (label) label.style.transform = "translateY(-2px)";
    event.currentTarget.style.color = theme.colors.green;
  };

  const onDropdownItemLeave = (event: MouseEvent<HTMLDivElement>) => {
    const label = event.currentTarget.querySelector<HTMLElement>("[data-nav-label]");
    if (label) label.style.transform = "none";
    const isActive = event.currentTarget.dataset.active === "true";
    event.currentTarget.style.color = isActive ? theme.colors.green : theme.colors.textMuted;
  };

  const navigation = useMemo(() => {
    if (role === "admin") {
      return [...baseNavigation, { name: "Users", href: "/users", icon: "users" }];
    }

    return baseNavigation;
  }, [role]);

  const getNavIcon = (icon: string, size = 16) => {
    switch (icon) {
      case "home":
        return <Home size={size} />;
      case "translator":
        return <Languages size={size} />;
      case "learn":
        return <GraduationCap size={size} />;
      case "leaderboard":
        return <Trophy size={size} />;
      case "dictionary":
        return <Library size={size} />;
      case "users":
        return <Users size={size} />;
      default:
        return null;
    }
  };

  const clearTimer = (timerRef: MutableRefObject<number | null>) => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const openMenu = (setOpen: (open: boolean) => void, timerRef: MutableRefObject<number | null>) => {
    clearTimer(timerRef);
    setOpen(true);
  };

  const closeMenuSoon = (setOpen: (open: boolean) => void, timerRef: MutableRefObject<number | null>) => {
    clearTimer(timerRef);
    timerRef.current = window.setTimeout(() => setOpen(false), 140);
  };

  useEffect(() => {
    const loadProfile = async () => {
      const token = getStoredToken();
      if (!token) {
        setUsername(null);
        setRole(null);
        setStreak(0);
        return;
      }
      try {
        const profile = await getProfile();
        setUsername(profile.username);
        setRole(profile.role ?? "user");
        setStreak(profile.streak ?? 0);
      } catch {
        clearStoredToken();
        setUsername(null);
        setRole(null);
        setStreak(0);
      }
    };

    const handleAuthChanged = () => {
      void loadProfile();
    };

    void loadProfile();
    window.addEventListener("auth-state-changed", handleAuthChanged);
    window.addEventListener("storage", handleAuthChanged);

    return () => {
      window.removeEventListener("auth-state-changed", handleAuthChanged);
      window.removeEventListener("storage", handleAuthChanged);
    };
  }, []);

  useEffect(() => {
    const closeOnOutside = (event: globalThis.MouseEvent) => {
      if (!userDropdownRef.current) return;
      const target = event.target as Node | null;
      if (target && userDropdownRef.current.contains(target)) return;
      setUserDropdownOpen(false);
    };

    document.addEventListener("mousedown", closeOnOutside);
    return () => document.removeEventListener("mousedown", closeOnOutside);
  }, []);

  useEffect(() => {
    setUserDropdownOpen(false);
  }, [pathname]);

  const handleLogout = () => {
    clearStoredToken();
    setUsername(null);
    setRole(null);
    setStreak(0);
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
    setMobileUserOpen(false);
    router.push("/login");
  };

  const userAvatarSrc = username
    ? `https://i.pravatar.cc/80?u=${encodeURIComponent(username.trim().toLowerCase())}`
    : "";

  return (
    <header
      style={{
        width: "100%",
        borderBottom: "none",
        background: theme.colors.surface,
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 40,
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
      }}
    >
      <div
        style={{
          maxWidth: "1440px",
          margin: "0 auto",
          padding: "12px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: "70px",
        }}
      >
        {/* Logo */}
        <Link href="/">
          <div
            style={{
              color: theme.colors.green,
              fontSize: 28,
              lineHeight: "34px",
              fontWeight: 800,
              letterSpacing: -1.2,
              textTransform: "lowercase",
              ...signlearnoText,
              cursor: "pointer",
            }}
          >
            signlearno
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav
          style={{
            display: "flex",
            alignItems: "center",
            flexWrap: "wrap",
            rowGap: 10,
            columnGap: 12,
          }}
          className="hidden md:flex"
        >
          {navigation.map((item) => {
            if (item.name === "Translator") {
              return (
                <div
                  key={item.href}
                  style={{ position: "relative" }}
                  onMouseEnter={() => openMenu(setTranslatorDropdownOpen, translatorCloseTimer)}
                  onMouseLeave={() => closeMenuSoon(setTranslatorDropdownOpen, translatorCloseTimer)}
                >
                  <Link href="/translator/signtotext">
                    <div
                    data-active={pathname.startsWith("/translator")}
                    style={{
                      padding: "0 16px",
                      borderRadius: 12,
                      background: pathname.startsWith("/translator") ? theme.colors.greenSoft : "transparent",
                      color: pathname.startsWith("/translator") ? theme.colors.green : theme.colors.textMuted,
                      fontSize: 14,
                      fontWeight: 600,
                      cursor: "pointer",
                      transition: "background-color 200ms ease, color 200ms ease",
                      ...signlearnoText,
                      ...navItemStyle,
                    }}
                    onMouseEnter={onTopNavItemEnter}
                    onMouseLeave={onTopNavItemLeave}
                  >
                    <span data-nav-label style={{ ...navLabelLiftStyle, display: "inline-flex", alignItems: "center", gap: 8 }}>
                      {getNavIcon(item.icon, 18)}
                      <span>{item.name}</span>
                    </span>
                    </div>
                  </Link>
                  {translatorDropdownOpen && (
                    <div
                      style={{
                        position: "absolute",
                        top: "calc(100% - 2px)",
                        left: 0,
                        paddingTop: 6,
                        borderRadius: 12,
                        background: theme.colors.surface,
                        border: `2px solid ${theme.colors.border}`,
                        boxShadow: "0 8px 16px rgba(0, 0, 0, 0.1)",
                        zIndex: 50,
                        minWidth: 220,
                        overflow: "hidden",
                      }}
                      onMouseEnter={() => openMenu(setTranslatorDropdownOpen, translatorCloseTimer)}
                      onMouseLeave={() => closeMenuSoon(setTranslatorDropdownOpen, translatorCloseTimer)}
                    >
                      <Link href="/translator/signtotext">
                        <div
                          data-active={pathname === "/translator/signtotext"}
                          style={{
                            padding: "12px 18px",
                            cursor: "pointer",
                            color: pathname === "/translator/signtotext" ? theme.colors.green : theme.colors.textMuted,
                            fontSize: 14,
                            fontWeight: 500,
                            transition: "all 200ms ease",
                            background: pathname === "/translator/signtotext" ? theme.colors.greenSoft : "transparent",
                            ...signlearnoText,
                          }}
                          onMouseEnter={onDropdownItemEnter}
                          onMouseLeave={onDropdownItemLeave}
                        >
                          <span data-nav-label style={{ ...navLabelLiftStyle, display: "inline-flex", alignItems: "center", gap: 8 }}>
                            <Hand size={17} />
                            <span>Sign to Text</span>
                          </span>
                        </div>
                      </Link>
                      <Link href="/translator/texttosign">
                        <div
                          data-active={pathname === "/translator/texttosign"}
                          style={{
                            padding: "12px 18px",
                            cursor: "pointer",
                            color: pathname === "/translator/texttosign" ? theme.colors.green : theme.colors.textMuted,
                            fontSize: 14,
                            fontWeight: 500,
                            transition: "all 200ms ease",
                            background: pathname === "/translator/texttosign" ? theme.colors.greenSoft : "transparent",
                            borderTop: `1px solid ${theme.colors.border}`,
                            ...signlearnoText,
                          }}
                          onMouseEnter={onDropdownItemEnter}
                          onMouseLeave={onDropdownItemLeave}
                        >
                          <span data-nav-label style={{ ...navLabelLiftStyle, display: "inline-flex", alignItems: "center", gap: 8 }}>
                            <Captions size={17} />
                            <span>Text to Sign</span>
                          </span>
                        </div>
                      </Link>
                    </div>
                  )}
                </div>
              );
            }
            if (item.name === "Learn") {
              return (
                <div
                  key={item.href}
                  style={{ position: "relative" }}
                  onMouseEnter={() => openMenu(setLearnDropdownOpen, learnCloseTimer)}
                  onMouseLeave={() => closeMenuSoon(setLearnDropdownOpen, learnCloseTimer)}
                >
                  <Link href="/learn/lesson">
                    <div
                    data-active={pathname.startsWith("/learn")}
                    style={{
                      padding: "0 16px",
                      borderRadius: 12,
                      background: pathname.startsWith("/learn") ? theme.colors.greenSoft : "transparent",
                      color: pathname.startsWith("/learn") ? theme.colors.green : theme.colors.textMuted,
                      fontSize: 14,
                      fontWeight: 600,
                      cursor: "pointer",
                      transition: "background-color 200ms ease, color 200ms ease",
                      ...signlearnoText,
                      ...navItemStyle,
                    }}
                    onMouseEnter={onTopNavItemEnter}
                    onMouseLeave={onTopNavItemLeave}
                  >
                    <span data-nav-label style={{ ...navLabelLiftStyle, display: "inline-flex", alignItems: "center", gap: 8 }}>
                      {getNavIcon(item.icon, 18)}
                      <span>{item.name}</span>
                    </span>
                    </div>
                  </Link>
                  {learnDropdownOpen && (
                    <div
                      style={{
                        position: "absolute",
                        top: "calc(100% - 2px)",
                        left: 0,
                        paddingTop: 6,
                        borderRadius: 12,
                        background: theme.colors.surface,
                        border: `2px solid ${theme.colors.border}`,
                        boxShadow: "0 8px 16px rgba(0, 0, 0, 0.1)",
                        zIndex: 50,
                        minWidth: 220,
                        overflow: "hidden",
                      }}
                      onMouseEnter={() => openMenu(setLearnDropdownOpen, learnCloseTimer)}
                      onMouseLeave={() => closeMenuSoon(setLearnDropdownOpen, learnCloseTimer)}
                    >
                      <Link href="/learn/lesson">
                        <div
                          data-active={pathname === "/learn/lesson"}
                          style={{
                            padding: "12px 18px",
                            cursor: "pointer",
                            color: pathname === "/learn/lesson" ? theme.colors.green : theme.colors.textMuted,
                            fontSize: 14,
                            fontWeight: 500,
                            transition: "all 200ms ease",
                            background: pathname === "/learn/lesson" ? theme.colors.greenSoft : "transparent",
                            ...signlearnoText,
                          }}
                          onMouseEnter={onDropdownItemEnter}
                          onMouseLeave={onDropdownItemLeave}
                        >
                          <span data-nav-label style={{ ...navLabelLiftStyle, display: "inline-flex", alignItems: "center", gap: 8 }}>
                            <BookOpen size={17} />
                            <span>Lesson</span>
                          </span>
                        </div>
                      </Link>
                      <Link href="/learn/practice">
                        <div
                          data-active={pathname === "/learn/practice"}
                          style={{
                            padding: "12px 18px",
                            cursor: "pointer",
                            color: pathname === "/learn/practice" ? theme.colors.green : theme.colors.textMuted,
                            fontSize: 14,
                            fontWeight: 500,
                            transition: "all 200ms ease",
                            background: pathname === "/learn/practice" ? theme.colors.greenSoft : "transparent",
                            borderTop: `1px solid ${theme.colors.border}`,
                            ...signlearnoText,
                          }}
                          onMouseEnter={onDropdownItemEnter}
                          onMouseLeave={onDropdownItemLeave}
                        >
                          <span data-nav-label style={{ ...navLabelLiftStyle, display: "inline-flex", alignItems: "center", gap: 8 }}>
                            <ClipboardCheck size={17} />
                            <span>Practice</span>
                          </span>
                        </div>
                      </Link>
                    </div>
                  )}
                </div>
              );
            }
            if (item.name === "Dictionary") {
              return (
                <div
                  key={item.href}
                  style={{ position: "relative" }}
                  onMouseEnter={() => openMenu(setDictionaryDropdownOpen, dictionaryCloseTimer)}
                  onMouseLeave={() => closeMenuSoon(setDictionaryDropdownOpen, dictionaryCloseTimer)}
                >
                  <Link href="/dictionary/sign-alphabet">
                    <div
                      data-active={pathname.startsWith("/dictionary")}
                      style={{
                        padding: "0 16px",
                        borderRadius: 12,
                        background: pathname.startsWith("/dictionary") ? theme.colors.greenSoft : "transparent",
                        color: pathname.startsWith("/dictionary") ? theme.colors.green : theme.colors.textMuted,
                        fontSize: 14,
                        fontWeight: 600,
                        cursor: "pointer",
                        transition: "background-color 200ms ease, color 200ms ease",
                        ...signlearnoText,
                        ...navItemStyle,
                      }}
                      onMouseEnter={onTopNavItemEnter}
                      onMouseLeave={onTopNavItemLeave}
                    >
                      <span data-nav-label style={{ ...navLabelLiftStyle, display: "inline-flex", alignItems: "center", gap: 8 }}>
                        {getNavIcon(item.icon, 18)}
                        <span>{item.name}</span>
                      </span>
                    </div>
                  </Link>
                  {dictionaryDropdownOpen && (
                    <div
                      style={{
                        position: "absolute",
                        top: "calc(100% - 2px)",
                        left: 0,
                        paddingTop: 6,
                        borderRadius: 12,
                        background: theme.colors.surface,
                        border: `2px solid ${theme.colors.border}`,
                        boxShadow: "0 8px 16px rgba(0, 0, 0, 0.1)",
                        zIndex: 50,
                        minWidth: 240,
                        overflow: "hidden",
                      }}
                      onMouseEnter={() => openMenu(setDictionaryDropdownOpen, dictionaryCloseTimer)}
                      onMouseLeave={() => closeMenuSoon(setDictionaryDropdownOpen, dictionaryCloseTimer)}
                    >
                      <Link href="/dictionary/sign-alphabet">
                        <div
                          data-active={pathname === "/dictionary/sign-alphabet"}
                          style={{
                            padding: "12px 18px",
                            cursor: "pointer",
                            color: pathname === "/dictionary/sign-alphabet" ? theme.colors.green : theme.colors.textMuted,
                            fontSize: 14,
                            fontWeight: 500,
                            transition: "all 200ms ease",
                            background: pathname === "/dictionary/sign-alphabet" ? theme.colors.greenSoft : "transparent",
                            ...signlearnoText,
                          }}
                          onMouseEnter={onDropdownItemEnter}
                          onMouseLeave={onDropdownItemLeave}
                        >
                          <span data-nav-label style={{ ...navLabelLiftStyle, display: "inline-flex", alignItems: "center", gap: 8 }}>
                            <Hand size={17} />
                            <span>Sign Alphabet</span>
                          </span>
                        </div>
                      </Link>
                      <Link href="/dictionary/word-search">
                        <div
                          data-active={pathname === "/dictionary/word-search"}
                          style={{
                            padding: "12px 18px",
                            cursor: "pointer",
                            color: pathname === "/dictionary/word-search" ? theme.colors.green : theme.colors.textMuted,
                            fontSize: 14,
                            fontWeight: 500,
                            transition: "all 200ms ease",
                            background: pathname === "/dictionary/word-search" ? theme.colors.greenSoft : "transparent",
                            borderTop: `1px solid ${theme.colors.border}`,
                            ...signlearnoText,
                          }}
                          onMouseEnter={onDropdownItemEnter}
                          onMouseLeave={onDropdownItemLeave}
                        >
                          <span data-nav-label style={{ ...navLabelLiftStyle, display: "inline-flex", alignItems: "center", gap: 8 }}>
                            <Search size={17} />
                            <span>Word Search</span>
                          </span>
                        </div>
                      </Link>
                    </div>
                  )}
                </div>
              );
            }
            const isActive = pathname === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <div
                  data-active={isActive}
                  style={{
                    padding: "0 16px",
                    borderRadius: 12,
                    background: isActive ? theme.colors.greenSoft : "transparent",
                    color: isActive ? theme.colors.green : theme.colors.textMuted,
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "background-color 200ms ease, color 200ms ease",
                    ...signlearnoText,
                    ...navItemStyle,
                  }}
                  onMouseEnter={onTopNavItemEnter}
                  onMouseLeave={onTopNavItemLeave}
                >
                  <span data-nav-label style={{ ...navLabelLiftStyle, display: "inline-flex", alignItems: "center", gap: 8 }}>
                    {getNavIcon(item.icon, 18)}
                    <span>{item.name}</span>
                  </span>
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Stats + Auth */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
          }}
          className="hidden md:flex"
        >
          {username && (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Flame size={20} color={theme.colors.orange} fill={theme.colors.orange} />
                <span style={{ color: theme.colors.orange, fontSize: 16, fontWeight: 700, ...signlearnoText }}>{streak}</span>
              </div>
              <div style={{ width: 1, height: 24, background: theme.colors.border }} />
            </>
          )}

          <ThemeToggle />

          {username ? (
            <div
              ref={userDropdownRef}
              style={{ position: "relative" }}
              onMouseEnter={() => openMenu(setUserDropdownOpen, userCloseTimer)}
              onMouseLeave={() => closeMenuSoon(setUserDropdownOpen, userCloseTimer)}
            >
              <button
                type="button"
                onClick={() => setUserDropdownOpen((open) => !open)}
                style={{
                  padding: "2px 4px",
                  borderRadius: 999,
                  border: "none",
                  fontSize: 14,
                  fontWeight: 700,
                  color: theme.colors.textStrong,
                  background: "transparent",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  ...signlearnoText,
                }}
              >
                <img
                  src={userAvatarSrc}
                  alt={`${username} avatar`}
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: "50%",
                    objectFit: "cover",
                    display: "block",
                    border: `2px solid ${theme.colors.border}`,
                  }}
                />
                <ChevronDown
                  size={16}
                  style={{
                    transform: userDropdownOpen ? "rotate(180deg)" : "none",
                    transition: "transform 180ms ease",
                  }}
                />
              </button>
              {userDropdownOpen && (
                <div
                  style={{
                    position: "absolute",
                    top: "calc(100% - 2px)",
                    right: 0,
                    minWidth: 220,
                    paddingTop: 6,
                    borderRadius: 12,
                    border: `2px solid ${theme.colors.border}`,
                    background: theme.colors.surface,
                    boxShadow: "0 8px 16px rgba(0, 0, 0, 0.1)",
                    overflow: "hidden",
                    zIndex: 60,
                  }}
                  onMouseEnter={() => openMenu(setUserDropdownOpen, userCloseTimer)}
                  onMouseLeave={() => closeMenuSoon(setUserDropdownOpen, userCloseTimer)}
                >
                  <Link href="/dashboard">
                    <div
                      data-active={pathname === "/dashboard"}
                      style={{
                        padding: "12px 18px",
                        cursor: "pointer",
                        color: pathname === "/dashboard" ? theme.colors.green : theme.colors.textMuted,
                        fontSize: 14,
                        fontWeight: 500,
                        transition: "all 200ms ease",
                        background: pathname === "/dashboard" ? theme.colors.greenSoft : "transparent",
                        ...signlearnoText,
                      }}
                      onMouseEnter={onDropdownItemEnter}
                      onMouseLeave={onDropdownItemLeave}
                    >
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
                        <LayoutDashboard size={16} />
                        <span data-nav-label style={navLabelLiftStyle}>
                          Dashboard
                        </span>
                      </span>
                    </div>
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "12px 18px",
                      cursor: "pointer",
                      border: "none",
                      borderTop: `1px solid ${theme.colors.border}`,
                      background: "transparent",
                      color: theme.colors.red,
                      transition: "all 200ms ease",
                      ...signlearnoText,
                      fontSize: 14,
                      fontWeight: 500,
                    }}
                    onMouseEnter={(event) => {
                      const label = event.currentTarget.querySelector<HTMLElement>("[data-nav-label]");
                      if (label) label.style.transform = "translateY(-2px)";
                      event.currentTarget.style.filter = "brightness(0.97)";
                    }}
                    onMouseLeave={(event) => {
                      const label = event.currentTarget.querySelector<HTMLElement>("[data-nav-label]");
                      if (label) label.style.transform = "none";
                      event.currentTarget.style.filter = "none";
                    }}
                  >
                    <LogOut size={16} />
                    <span data-nav-label style={navLabelLiftStyle}>
                      Logout
                    </span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 0,
                padding: 4,
                borderRadius: 12,
                border: `2px solid ${theme.colors.border}`,
                background: theme.colors.surface,
              }}
            >
              <Link href="/login">
                <div
                  style={{
                    padding: "8px 16px",
                    borderRadius: 8,
                    border: "none",
                    background: "transparent",
                    fontSize: 14,
                    fontWeight: 700,
                    color: theme.colors.textStrong,
                    cursor: "pointer",
                    transition: "background-color 200ms ease",
                    ...signlearnoText,
                  }}
                  onMouseEnter={onNavLabelLiftEnter}
                  onMouseLeave={onNavLabelLiftLeave}
                  onMouseOver={(e) => {
                    e.currentTarget.style.filter = "brightness(0.97)";
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.filter = "none";
                  }}
                >
                  <span data-nav-label style={navLabelLiftStyle}>
                    Log in
                  </span>
                </div>
              </Link>
              <div
                style={{
                  width: 1,
                  height: 24,
                  background: theme.colors.border,
                  margin: "0 6px",
                }}
              />
              <Link href="/register">
                <div
                  style={{
                    padding: "8px 18px",
                    borderRadius: 8,
                    border: "none",
                    background: theme.colors.green,
                    fontSize: 14,
                    fontWeight: 700,
                    color: "#fff",
                    cursor: "pointer",
                    transition: "filter 200ms ease, background-color 200ms ease",
                    ...signlearnoText,
                  }}
                  onMouseEnter={onNavLabelLiftEnter}
                  onMouseLeave={onNavLabelLiftLeave}
                >
                  <span data-nav-label style={navLabelLiftStyle}>
                    Sign up
                  </span>
                </div>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          style={{
            display: "none",
            background: "transparent",
            border: "none",
            cursor: "pointer",
            padding: 8,
            color: theme.colors.textStrong,
          }}
          className="md:hidden"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 12,
            padding: "16px 20px",
            borderTop: `1px solid ${theme.colors.border}`,
            background: theme.colors.surface,
          }}
          className="md:hidden"
        >
          {navigation.map((item) => {
            if (item.name === "Translator") {
              return (
                <div key={item.href}>
                  <div
                    style={{
                      padding: "12px 16px",
                      borderRadius: 12,
                      background: pathname.startsWith("/translator") ? theme.colors.greenSoft : "transparent",
                      color: pathname.startsWith("/translator") ? theme.colors.green : theme.colors.textMuted,
                      fontSize: 14,
                      fontWeight: 600,
                      cursor: "pointer",
                      ...signlearnoText,
                    }}
                    onClick={() => setMobileTranslatorOpen(!mobileTranslatorOpen)}
                  >
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                      {getNavIcon(item.icon, 15)}
                      {item.name}
                    </span>{" "}
                    {mobileTranslatorOpen ? "▼" : "▶"}
                  </div>
                  {mobileTranslatorOpen && (
                    <>
                      <Link href="/translator/signtotext">
                        <div
                          style={{
                            padding: "10px 16px",
                            marginLeft: 12,
                            borderRadius: 8,
                            background: pathname === "/translator/signtotext" ? theme.colors.greenSoft : "transparent",
                            color: pathname === "/translator/signtotext" ? theme.colors.green : theme.colors.textMuted,
                            fontSize: 13,
                            fontWeight: 500,
                            cursor: "pointer",
                            marginTop: 6,
                            ...signlearnoText,
                          }}
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                            <Hand size={14} />
                            Sign to Text
                          </span>
                        </div>
                      </Link>
                      <Link href="/translator/texttosign">
                        <div
                          style={{
                            padding: "10px 16px",
                            marginLeft: 12,
                            borderRadius: 8,
                            background: pathname === "/translator/texttosign" ? theme.colors.greenSoft : "transparent",
                            color: pathname === "/translator/texttosign" ? theme.colors.green : theme.colors.textMuted,
                            fontSize: 13,
                            fontWeight: 500,
                            cursor: "pointer",
                            marginTop: 6,
                            ...signlearnoText,
                          }}
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                            <Captions size={14} />
                            Text to Sign
                          </span>
                        </div>
                      </Link>
                    </>
                  )}
                </div>
              );
            }
            if (item.name === "Learn") {
              return (
                <div key={item.href}>
                  <div
                    style={{
                      padding: "12px 16px",
                      borderRadius: 12,
                      background: pathname.startsWith("/learn") ? theme.colors.greenSoft : "transparent",
                      color: pathname.startsWith("/learn") ? theme.colors.green : theme.colors.textMuted,
                      fontSize: 14,
                      fontWeight: 600,
                      cursor: "pointer",
                      ...signlearnoText,
                    }}
                    onClick={() => setMobileLearnOpen(!mobileLearnOpen)}
                  >
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                      {getNavIcon(item.icon, 15)}
                      {item.name}
                    </span>{" "}
                    {mobileLearnOpen ? "▼" : "▶"}
                  </div>
                  {mobileLearnOpen && (
                    <>
                      <Link href="/learn/lesson">
                        <div
                          style={{
                            padding: "10px 16px",
                            marginLeft: 12,
                            borderRadius: 8,
                            background: pathname === "/learn/lesson" ? theme.colors.greenSoft : "transparent",
                            color: pathname === "/learn/lesson" ? theme.colors.green : theme.colors.textMuted,
                            fontSize: 13,
                            fontWeight: 500,
                            cursor: "pointer",
                            marginTop: 6,
                            ...signlearnoText,
                          }}
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                            <BookOpen size={14} />
                            Lesson
                          </span>
                        </div>
                      </Link>
                      <Link href="/learn/practice">
                        <div
                          style={{
                            padding: "10px 16px",
                            marginLeft: 12,
                            borderRadius: 8,
                            background: pathname === "/learn/practice" ? theme.colors.greenSoft : "transparent",
                            color: pathname === "/learn/practice" ? theme.colors.green : theme.colors.textMuted,
                            fontSize: 13,
                            fontWeight: 500,
                            cursor: "pointer",
                            marginTop: 6,
                            ...signlearnoText,
                          }}
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                            <ClipboardCheck size={14} />
                            Practice
                          </span>
                        </div>
                      </Link>
                    </>
                  )}
                </div>
              );
            }
            if (item.name === "Dictionary") {
              return (
                <div key={item.href}>
                  <div
                    style={{
                      padding: "12px 16px",
                      borderRadius: 12,
                      background: pathname.startsWith("/dictionary") ? theme.colors.greenSoft : "transparent",
                      color: pathname.startsWith("/dictionary") ? theme.colors.green : theme.colors.textMuted,
                      fontSize: 14,
                      fontWeight: 600,
                      cursor: "pointer",
                      ...signlearnoText,
                    }}
                    onClick={() => setMobileDictionaryOpen(!mobileDictionaryOpen)}
                  >
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                      {getNavIcon(item.icon, 15)}
                      {item.name}
                    </span>{" "}
                    {mobileDictionaryOpen ? "▼" : "▶"}
                  </div>
                  {mobileDictionaryOpen && (
                    <>
                      <Link href="/dictionary/sign-alphabet">
                        <div
                          style={{
                            padding: "10px 16px",
                            marginLeft: 12,
                            borderRadius: 8,
                            background: pathname === "/dictionary/sign-alphabet" ? theme.colors.greenSoft : "transparent",
                            color: pathname === "/dictionary/sign-alphabet" ? theme.colors.green : theme.colors.textMuted,
                            fontSize: 13,
                            fontWeight: 500,
                            cursor: "pointer",
                            marginTop: 6,
                            ...signlearnoText,
                          }}
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                            <Hand size={14} />
                            Sign Alphabet
                          </span>
                        </div>
                      </Link>
                      <Link href="/dictionary/word-search">
                        <div
                          style={{
                            padding: "10px 16px",
                            marginLeft: 12,
                            borderRadius: 8,
                            background: pathname === "/dictionary/word-search" ? theme.colors.greenSoft : "transparent",
                            color: pathname === "/dictionary/word-search" ? theme.colors.green : theme.colors.textMuted,
                            fontSize: 13,
                            fontWeight: 500,
                            cursor: "pointer",
                            marginTop: 6,
                            ...signlearnoText,
                          }}
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                            <Search size={14} />
                            Word Search
                          </span>
                        </div>
                      </Link>
                    </>
                  )}
                </div>
              );
            }
            const isActive = pathname === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <div
                  style={{
                    padding: "12px 16px",
                    borderRadius: 12,
                    background: isActive ? theme.colors.greenSoft : "transparent",
                    color: isActive ? theme.colors.green : theme.colors.textMuted,
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: "pointer",
                    ...signlearnoText,
                  }}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                    {getNavIcon(item.icon, 15)}
                    {item.name}
                  </span>
                </div>
              </Link>
            );
          })}
          {username ? (
            <div>
              <button
                type="button"
                onClick={() => setMobileUserOpen((open) => !open)}
                style={{
                  width: "100%",
                  marginTop: 8,
                  padding: "8px 10px",
                  borderRadius: 999,
                  border: "none",
                  background: "transparent",
                  color: theme.colors.textStrong,
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: "pointer",
                  textAlign: "left",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  ...signlearnoText,
                }}
              >
                <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
                  <img
                    src={userAvatarSrc}
                    alt={`${username} avatar`}
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: "50%",
                      objectFit: "cover",
                      display: "block",
                      border: `2px solid ${theme.colors.border}`,
                    }}
                  />
                  {username}
                </span>
                <span>{mobileUserOpen ? "▼" : "▶"}</span>
              </button>
              {mobileUserOpen && (
                <div style={{ marginTop: 8, marginLeft: 12, display: "flex", flexDirection: "column", gap: 8 }}>
                  <Link href="/dashboard">
                    <div
                      style={{
                        padding: "10px 16px",
                        borderRadius: 10,
                        background: pathname === "/dashboard" ? theme.colors.greenSoft : "transparent",
                        color: pathname === "/dashboard" ? theme.colors.green : theme.colors.textMuted,
                        fontSize: 13,
                        fontWeight: 600,
                        cursor: "pointer",
                        ...signlearnoText,
                      }}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                        <LayoutDashboard size={14} />
                        Dashboard
                      </span>
                    </div>
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    style={{
                      padding: "10px 16px",
                      borderRadius: 10,
                      border: "none",
                      background: "transparent",
                      color: theme.colors.red,
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: "pointer",
                      textAlign: "left",
                      ...signlearnoText,
                    }}
                  >
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                      <LogOut size={14} />
                      Logout
                    </span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link href="/login">
                <div
                  style={{
                    padding: "12px 16px",
                    borderRadius: 12,
                    border: `2px solid ${theme.colors.border}`,
                    color: theme.colors.textStrong,
                    fontSize: 14,
                    fontWeight: 700,
                    ...signlearnoText,
                  }}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Log in
                </div>
              </Link>
              <Link href="/register">
                <div
                  style={{
                    padding: "12px 16px",
                    borderRadius: 12,
                    border: "none",
                    borderBottom: `3px solid ${theme.colors.greenDark}`,
                    background: theme.colors.green,
                    color: "#fff",
                    fontSize: 14,
                    fontWeight: 700,
                    ...signlearnoText,
                  }}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign up
                </div>
              </Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}
