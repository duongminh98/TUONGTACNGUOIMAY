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
  Hand,
  Home,
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

type NavItem = { name: string; href: string; icon: string };

const baseNavItems: NavItem[] = [
  { name: "Home", href: "/dashboard", icon: "home" },
  { name: "Sign to Text", href: "/translator/signtotext", icon: "sign-to-text" },
  { name: "Text to Sign", href: "/translator/texttosign", icon: "text-to-sign" },
  { name: "Lesson", href: "/learn/lesson", icon: "lesson" },
  { name: "Practice", href: "/learn/practice", icon: "practice" },
  { name: "Leaderboard", href: "/leaderboard", icon: "leaderboard" },
  { name: "Sign Alphabet", href: "/dictionary/sign-alphabet", icon: "sign-alphabet" },
  { name: "Word Search", href: "/dictionary/word-search", icon: "word-search" },
];

export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [mobileUserOpen, setMobileUserOpen] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const [role, setRole] = useState<"user" | "admin" | null>(null);
  const [streak, setStreak] = useState<number>(0);
  const userDropdownRef = useRef<HTMLDivElement | null>(null);
  const userCloseTimer = useRef<number | null>(null);

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
      return [...baseNavItems, { name: "User", href: "/users", icon: "users" }];
    }

    return baseNavItems;
  }, [role]);

  const getNavIcon = (icon: string, size = 16) => {
    switch (icon) {
      case "home":
        return <Home size={size} />;
      case "sign-to-text":
        return <Hand size={size} />;
      case "text-to-sign":
        return <Captions size={size} />;
      case "lesson":
        return <BookOpen size={size} />;
      case "practice":
        return <ClipboardCheck size={size} />;
      case "leaderboard":
        return <Trophy size={size} />;
      case "sign-alphabet":
        return <Library size={size} />;
      case "word-search":
        return <Search size={size} />;
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
    void loadProfile();
  }, []);

  useEffect(() => {
    const closeOnOutside = (event: globalThis.MouseEvent) => {
      const target = event.target as Node | null;
      if (userDropdownRef.current && target && userDropdownRef.current.contains(target)) return;
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

  const sidebarRowStyle = {
    width: "100%",
    borderRadius: 14,
    fontSize: 16,
    fontWeight: 500,
    cursor: "pointer",
    transition: "background-color 200ms ease, color 200ms ease",
    ...signlearnoText,
    display: "flex",
    alignItems: "center",
    minHeight: 52,
    padding: "0 16px",
    boxSizing: "border-box" as const,
  };

  return (
    <>
      <aside
        className="pointer-events-auto hidden flex-col md:flex"
        style={{
          position: "fixed",
          top: 0,
          bottom: 0,
          left: 0,
          zIndex: 35,
          width: "var(--app-sidebar-width)",
          boxSizing: "border-box",
          borderRight: `2px solid ${theme.colors.border}`,
          background: theme.colors.sidebar,
          padding: "20px 12px 16px",
          overflowY: "auto",
          overflowX: "hidden",
        }}
      >
        <Link
          href="/dashboard"
          style={{
            marginBottom: 24,
            display: "flex",
            flexShrink: 0,
            width: "100%",
            justifyContent: "center",
            alignItems: "center",
            textDecoration: "none",
          }}
        >
          <div
            style={{
              color: theme.colors.green,
              fontSize: 34,
              lineHeight: "40px",
              fontWeight: 800,
              letterSpacing: -1.4,
              textTransform: "lowercase",
              ...signlearnoText,
              cursor: "pointer",
              textAlign: "center",
            }}
          >
            signlearno
          </div>
        </Link>
        <nav
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 14,
            flex: 1,
            minHeight: 0,
          }}
        >
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link key={item.href} href={item.href} style={{ width: "100%" }}>
                <div
                  data-active={isActive}
                  style={{
                    ...sidebarRowStyle,
                    fontWeight: isActive ? 600 : 500,
                    background: isActive ? theme.colors.greenSoft : "transparent",
                    color: isActive ? theme.colors.green : theme.colors.textMuted,
                  }}
                  onMouseEnter={onTopNavItemEnter}
                  onMouseLeave={onTopNavItemLeave}
                >
                  <span data-nav-label style={{ ...navLabelLiftStyle, display: "inline-flex", alignItems: "center", gap: 10 }}>
                    {getNavIcon(item.icon, 21)}
                    <span>{item.name}</span>
                  </span>
                </div>
              </Link>
            );
          })}
        </nav>
        <div
          style={{
            marginTop: "auto",
            flexShrink: 0,
            paddingTop: 16,
            borderTop: `1px solid ${theme.colors.border}`,
            background: "color-mix(in srgb, var(--signlearno-sidebar) 88%, var(--signlearno-border))",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
              flexWrap: "wrap",
              width: "100%",
            }}
          >
            {username ? (
              <>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
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
                      bottom: "calc(100% + 4px)",
                      left: 0,
                      right: "auto",
                      top: "auto",
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
                          padding: "14px 20px",
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
                        padding: "14px 20px",
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
                  <ThemeToggle />
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Flame size={20} color={theme.colors.orange} fill={theme.colors.orange} />
                  <span style={{ color: theme.colors.orange, fontSize: 16, fontWeight: 700, ...signlearnoText }}>{streak}</span>
                </div>
              </>
            ) : (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", gap: 12 }}>
                <ThemeToggle />
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
                      padding: "8px 12px",
                      borderRadius: 8,
                      border: "none",
                      background: "transparent",
                      fontSize: 13,
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
                    margin: "0 4px",
                  }}
                />
                <Link href="/register">
                  <div
                    style={{
                      padding: "8px 12px",
                      borderRadius: 8,
                      border: "none",
                      background: theme.colors.green,
                      fontSize: 13,
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
              </div>
            )}
          </div>
        </div>
      </aside>
      <header
        style={{
          borderBottom: "none",
          background: "transparent",
          position: "fixed",
          top: 0,
          zIndex: 40,
          boxShadow: "none",
        }}
        className="left-0 right-0 w-full md:hidden"
      >
      <div
        style={{
          maxWidth: "1440px",
          margin: "0 auto",
          padding: "12px 20px",
          display: "flex",
          alignItems: "center",
          height: "70px",
        }}
        className="justify-between"
      >
        {/* Logo — mobile only */}
        <Link href="/dashboard" className="md:hidden">
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
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link key={item.href} href={item.href}>
                <div
                  style={{
                    padding: "12px 16px",
                    borderRadius: 12,
                    background: isActive ? theme.colors.greenSoft : "transparent",
                    color: isActive ? theme.colors.green : theme.colors.textMuted,
                    fontSize: 14,
                    fontWeight: isActive ? 600 : 500,
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
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: username ? "space-between" : "flex-end",
              flexWrap: "wrap",
              gap: 12,
              marginTop: 8,
              paddingTop: 12,
              borderTop: `1px solid ${theme.colors.border}`,
            }}
          >
            <ThemeToggle />
            {username ? (
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Flame size={20} color={theme.colors.orange} fill={theme.colors.orange} />
                <span style={{ color: theme.colors.orange, fontSize: 16, fontWeight: 700, ...signlearnoText }}>{streak}</span>
              </div>
            ) : null}
          </div>
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
    </>
  );
}
