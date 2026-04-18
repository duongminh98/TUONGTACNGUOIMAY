"use client";

import { useEffect, useState } from "react";
import { Footer } from "@/components/Footer";
import { signlearnoTheme as theme, signlearnoText } from "@/components/signlearno/theme";
import { getProfile, getUsers } from "@/lib/api";
import type { AuthUser } from "@/lib/api/backend";

export default function UsersPage() {
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [forbidden, setForbidden] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      setForbidden(false);

      try {
        const profile = await getProfile();
        if (profile.role !== "admin") {
          setForbidden(true);
          return;
        }

        const data = await getUsers();
        setUsers(data);
      } catch (nextError) {
        setError(nextError instanceof Error ? nextError.message : "Failed to load users.");
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, []);

  return (
    <>
      <main
        className="min-h-screen pt-[70px] md:pt-0"
        style={{ background: theme.colors.canvas, fontFamily: theme.fontFamily }}
      >
        <div style={{ maxWidth: 980, margin: "0 auto", padding: "0 24px 64px" }}>
          <h1 style={{ ...signlearnoText, fontSize: 30, fontWeight: 900, color: theme.colors.textStrong, margin: "0 0 8px" }}>
            User Management
          </h1>
          <p style={{ ...signlearnoText, color: theme.colors.textMuted, marginBottom: 24 }}>
            Visible only for administrators.
          </p>

          {loading ? (
            <div style={{ ...signlearnoText, color: theme.colors.textMuted }}>Loading users...</div>
          ) : null}

          {forbidden ? (
            <div style={{ ...signlearnoText, color: theme.colors.red }}>You do not have permission to access this page.</div>
          ) : null}

          {error ? (
            <div style={{ ...signlearnoText, color: theme.colors.red }}>{error}</div>
          ) : null}

          {!loading && !forbidden && !error ? (
            <div style={{ border: `2px solid ${theme.colors.border}`, borderRadius: 16, overflow: "hidden", background: theme.colors.surface }}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1.2fr 1.4fr 0.6fr",
                  gap: 12,
                  padding: "12px 16px",
                  background: theme.colors.greenSoft,
                  color: theme.colors.textStrong,
                  fontWeight: 800,
                  ...signlearnoText,
                }}
              >
                <div>Username</div>
                <div>Email</div>
                <div>Role</div>
              </div>

              {users.map((user) => (
                <div
                  key={user.id || user._id || user.email}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1.2fr 1.4fr 0.6fr",
                    gap: 12,
                    padding: "12px 16px",
                    borderTop: `1px solid ${theme.colors.border}`,
                    color: theme.colors.textStrong,
                    ...signlearnoText,
                  }}
                >
                  <div>{user.username}</div>
                  <div>{user.email}</div>
                  <div style={{ fontWeight: 700, color: user.role === "admin" ? theme.colors.green : theme.colors.textMuted }}>
                    {user.role || "user"}
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </main>
      <Footer />
    </>
  );
}
