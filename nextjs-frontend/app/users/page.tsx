"use client";

import { useEffect, useState } from "react";
import { signlearnoTheme as theme, signlearnoText } from "@/components/signlearno/theme";
import { deleteUser, getProfile, getUsers } from "@/lib/api";
import type { AuthUser } from "@/lib/api/backend";

export default function UsersPage() {
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [forbidden, setForbidden] = useState(false);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const resolveUserId = (user: AuthUser): string | null => {
    return (user.id || user._id || null) as string | null;
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      setForbidden(false);

      try {
        const profile = await getProfile();
        setCurrentUserId(resolveUserId(profile));
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

  const handleDelete = async (user: AuthUser) => {
    const targetUserId = resolveUserId(user);
    if (!targetUserId) {
      setError("User id is missing, cannot delete this user.");
      return;
    }

    if (targetUserId === currentUserId) {
      setError("Bạn không thể tự xóa tài khoản admin của chính mình.");
      return;
    }

    const isConfirmed = window.confirm(`Xác nhận xóa người dùng ${user.username || user.email}?`);
    if (!isConfirmed) return;

    setDeletingUserId(targetUserId);
    setError(null);

    try {
      await deleteUser(targetUserId);
      setUsers((prev) => prev.filter((item) => resolveUserId(item) !== targetUserId));
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Failed to delete user.");
    } finally {
      setDeletingUserId(null);
    }
  };

  return (
    <>
      <main style={{ minHeight: "100vh", background: "transparent", paddingTop: 90, fontFamily: theme.fontFamily }}>
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
                  gridTemplateColumns: "1fr 1.3fr 0.6fr 0.7fr",
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
                <div style={{ textAlign: "right" }}>Action</div>
              </div>

              {users.map((user) => (
                <div
                  key={user.id || user._id || user.email}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1.3fr 0.6fr 0.7fr",
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
                  <div style={{ display: "flex", justifyContent: "flex-end" }}>
                    <button
                      type="button"
                      onClick={() => handleDelete(user)}
                      disabled={deletingUserId === resolveUserId(user) || resolveUserId(user) === currentUserId}
                      style={{
                        border: `1px solid ${theme.colors.red}`,
                        color: theme.colors.red,
                        background: "transparent",
                        padding: "6px 10px",
                        borderRadius: 8,
                        fontWeight: 700,
                        cursor:
                          deletingUserId === resolveUserId(user) || resolveUserId(user) === currentUserId
                            ? "not-allowed"
                            : "pointer",
                        opacity:
                          deletingUserId === resolveUserId(user) || resolveUserId(user) === currentUserId
                            ? 0.5
                            : 1,
                      }}
                    >
                      {deletingUserId === resolveUserId(user) ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </main>
    </>
  );
}
