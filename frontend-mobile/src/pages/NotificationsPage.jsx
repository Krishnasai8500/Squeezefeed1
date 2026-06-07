import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import BottomNav from "../components/bottomNav";

const BASE_URL = "https://api.nxtbharat.com";

const TYPE_META = {
  BADGE: { icon: "🏆", color: "#FF6A00", label: "Achievement" },
  SYSTEM: { icon: "📢", color: "#3b82f6", label: "System" },
  ANNOUNCEMENT: { icon: "📣", color: "#f59e0b", label: "Announcement" },
  LIKE: { icon: "❤️", color: "#ec4899", label: "Like" },
  COMMENT: { icon: "💬", color: "#22c55e", label: "Comment" },
};

function getMeta(type) {
  return (
    TYPE_META[type] || { icon: "🔔", color: "#FF6A00", label: "Notification" }
  );
}

function timeAgo(dateStr) {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

export default function NotificationsPage() {
  const navigate = useNavigate();
  const authUserId = localStorage.getItem("authUserId");
  const token = localStorage.getItem("token");

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all | unread

  useEffect(() => {
    fetchNotifications();
  }, []);

  async function fetchNotifications() {
    setLoading(true);
    try {
      const res = await axios.get(
        `${BASE_URL}/api/notifications/user/${authUserId}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );

      console.log("NOTIFICATIONS RESPONSE", res.data);
      // Sort newest first
      const sorted = (res.data || []).sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
      );
      setNotifications(sorted);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function deleteNotification(id) {
    try {
      await axios.delete(`${BASE_URL}/api/notifications/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch (err) {
      console.error(err);
    }
  }
  async function markRead(id) {
    try {
      await axios.put(
        `${BASE_URL}/api/notifications/${id}/read`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === id ? { ...n, isRead: true, status: "READ" } : n,
        ),
      );
    } catch (err) {
      console.error(err);
    }
  }

  async function markAllRead() {
    const unread = notifications.filter((n) => !n.isRead);
    await Promise.all(unread.map((n) => markRead(n.id)));
  }

  const displayed =
    filter === "unread"
      ? notifications.filter((n) => !n.isRead)
      : notifications;

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <>
      <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700;800&family=DM+Sans:wght@400;500;600&display=swap');
                @keyframes fadeUp  { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
                @keyframes spin    { to{transform:rotate(360deg)} }
                @keyframes slideIn { from{opacity:0;transform:translateX(-8px)} to{opacity:1;transform:translateX(0)} }
                @keyframes pulse   { 0%,100%{opacity:0.6} 50%{opacity:1} }
                .notif-row:hover   { background: rgba(255,106,0,0.05) !important; }
                .mark-btn:hover    { color: #FF6A00 !important; }
                .filter-pill:hover { border-color: rgba(255,106,0,0.4) !important; color: #FF6A00 !important; }
            `}</style>

      <div style={S.page}>
        <div style={S.ambientGlow} />

        {/* ── Header ── */}
        <div style={S.header}>
          <button style={S.backBtn} onClick={() => navigate(-1)}>
            ←
          </button>
          <div style={S.headerCenter}>
            <span style={S.headerTitle}>Notifications</span>
            {unreadCount > 0 && (
              <span style={S.unreadBadge}>{unreadCount}</span>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              className="mark-btn"
              style={S.markAllBtn}
              onClick={markAllRead}
            >
              Mark all read
            </button>
          )}
        </div>

        <div style={S.container}>
          {/* ── Filter pills ── */}
          <div style={S.filterRow}>
            {["all", "unread"].map((f) => (
              <button
                key={f}
                className="filter-pill"
                onClick={() => setFilter(f)}
                style={{
                  ...S.filterPill,
                  ...(filter === f ? S.filterPillActive : {}),
                }}
              >
                {f === "all" &&
                  `All  ${notifications.length > 0 ? `(${notifications.length})` : ""}`}
                {f === "unread" &&
                  `Unread ${unreadCount > 0 ? `(${unreadCount})` : ""}`}
              </button>
            ))}
          </div>

          {/* ── Loading ── */}
          {loading && (
            <div style={S.loadingWrap}>
              <div style={S.loadingRing} />
            </div>
          )}

          {/* ── Empty state ── */}
          {!loading && displayed.length === 0 && (
            <div style={S.empty}>
              <div style={S.emptyIcon}>{filter === "unread" ? "✅" : "🔔"}</div>
              <div style={S.emptyTitle}>
                {filter === "unread"
                  ? "All caught up!"
                  : "No notifications yet"}
              </div>
              <div style={S.emptySubtext}>
                {filter === "unread"
                  ? "You have no unread notifications."
                  : "Keep reading to earn badges and get notified."}
              </div>
              {filter === "unread" && notifications.length > 0 && (
                <button style={S.viewAllBtn} onClick={() => setFilter("all")}>
                  View all notifications
                </button>
              )}
            </div>
          )}

          {/* ── Notification list ── */}
          {!loading && displayed.length > 0 && (
            <div style={S.list}>
              {displayed.map((notif, i) => {
                const meta = getMeta(notif.type);
                return (
                  <div
                    key={notif.id}
                    className="notif-row"
                    style={{
                      ...S.notifRow,
                      opacity: notif.isRead ? 0.6 : 1,
                      borderLeft: `3px solid ${notif.isRead ? "transparent" : meta.color}`,
                      animationDelay: `${i * 0.05}s`,
                    }}
                    onClick={() => {
                      if (!notif.isRead) {
                        markRead(notif.id);
                      }

                      if (notif.type === "BADGE") {
                        navigate("/profile");
                        return;
                      }

                      if (notif.contentId) {
                        navigate("/", {
                          state: {
                            targetArticleId: notif.contentId,
                          },
                        });
                      }
                    }}
                  >
                    {/* Icon */}
                    <div
                      style={{
                        ...S.notifIcon,
                        background: meta.color + "18",
                        border: `1px solid ${meta.color}33`,
                      }}
                    >
                      <span style={{ fontSize: "20px" }}>{meta.icon}</span>
                    </div>

                    {/* Content */}
                    <div style={S.notifContent}>
                      <div style={S.notifHeader}>
                        <span
                          style={{
                            ...S.notifType,
                            color: meta.color,
                          }}
                        >
                          {meta.label}
                        </span>
                        <span style={S.notifTime}>
                          {timeAgo(notif.createdAt)}
                        </span>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <div style={S.notifTitle}>{notif.title}</div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotification(notif.id);
                          }}
                          style={{
                            background: "transparent",
                            border: "none",
                            cursor: "pointer",
                            fontSize: "18px",
                            color: "#ff6a00",
                          }}
                        >
                          🗑
                        </button>
                      </div>

                      <div style={S.notifMessage}>{notif.message}</div>
                    </div>

                    {/* Unread dot */}
                    {!notif.isRead && (
                      <div
                        style={{
                          ...S.unreadDot,
                          background: meta.color,
                          boxShadow: `0 0 6px ${meta.color}`,
                        }}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div style={{ height: "100px" }} />
      </div>

      <BottomNav />
    </>
  );
}

const S = {
  page: {
    position: "fixed",
    inset: 0,
    background: "#0B0B0B",
    fontFamily: "'DM Sans', sans-serif",
    overflowY: "auto",
  },
  ambientGlow: {
    position: "fixed",
    top: "-80px",
    left: "50%",
    transform: "translateX(-50%)",
    width: "260px",
    height: "260px",
    borderRadius: "50%",
    background:
      "radial-gradient(circle,rgba(255,106,0,0.07) 0%,transparent 70%)",
    pointerEvents: "none",
    zIndex: 0,
  },

  // Header
  header: {
    position: "sticky",
    top: 0,
    zIndex: 100,
    background: "rgba(11,11,11,0.97)",
    backdropFilter: "blur(16px)",
    borderBottom: "1px solid rgba(255,106,0,0.08)",
    padding: "0 20px",
    height: "60px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "12px",
  },
  backBtn: {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    color: "#fff",
    width: "38px",
    height: "38px",
    borderRadius: "50%",
    cursor: "pointer",
    fontSize: "18px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  headerCenter: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    flex: 1,
  },
  headerTitle: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: "18px",
    fontWeight: "800",
    color: "#fff",
    letterSpacing: "-0.3px",
  },
  unreadBadge: {
    background: "#FF6A00",
    color: "#fff",
    fontSize: "11px",
    fontWeight: "700",
    padding: "2px 7px",
    borderRadius: "999px",
    minWidth: "20px",
    textAlign: "center",
  },
  markAllBtn: {
    background: "none",
    border: "none",
    color: "#555",
    fontSize: "12px",
    fontWeight: "600",
    cursor: "pointer",
    letterSpacing: "0.02em",
    fontFamily: "'DM Sans', sans-serif",
    transition: "color 0.2s",
    flexShrink: 0,
    whiteSpace: "nowrap",
  },

  container: {
    maxWidth: "480px",
    margin: "0 auto",
    padding: "20px 16px",
    position: "relative",
    zIndex: 1,
  },

  // Filter
  filterRow: {
    display: "flex",
    gap: "8px",
    marginBottom: "20px",
  },
  filterPill: {
    padding: "7px 16px",
    borderRadius: "999px",
    background: "transparent",
    border: "1px solid rgba(255,255,255,0.08)",
    color: "#555",
    fontSize: "12px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s",
    fontFamily: "'DM Sans', sans-serif",
    letterSpacing: "0.02em",
  },
  filterPillActive: {
    background: "rgba(255,106,0,0.1)",
    border: "1px solid rgba(255,106,0,0.35)",
    color: "#FF6A00",
  },

  // Loading
  loadingWrap: {
    display: "flex",
    justifyContent: "center",
    padding: "60px 0",
  },
  loadingRing: {
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    border: "2px solid rgba(255,106,0,0.15)",
    borderTopColor: "#FF6A00",
    animation: "spin 0.9s linear infinite",
  },

  // Empty
  empty: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "72px 24px",
    textAlign: "center",
    animation: "fadeUp 0.4s ease",
  },
  emptyIcon: { fontSize: "48px", marginBottom: "16px" },
  emptyTitle: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: "18px",
    fontWeight: "700",
    color: "#fff",
    marginBottom: "8px",
  },
  emptySubtext: {
    color: "#444",
    fontSize: "13px",
    lineHeight: "1.6",
    maxWidth: "260px",
  },
  viewAllBtn: {
    marginTop: "20px",
    background: "rgba(255,106,0,0.1)",
    border: "1px solid rgba(255,106,0,0.25)",
    color: "#FF6A00",
    padding: "9px 20px",
    borderRadius: "999px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "600",
    fontFamily: "'DM Sans', sans-serif",
  },

  // Notification list
  list: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    animation: "fadeUp 0.4s ease",
  },
  notifRow: {
    display: "flex",
    alignItems: "flex-start",
    gap: "14px",
    padding: "16px",
    background: "rgba(255,255,255,0.02)",
    borderRadius: "14px",
    border: "1px solid rgba(255,255,255,0.05)",
    cursor: "pointer",
    transition: "background 0.2s",
    animation: "slideIn 0.35s ease both",
    position: "relative",
  },
  notifIcon: {
    width: "44px",
    height: "44px",
    borderRadius: "12px",
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  notifContent: { flex: 1, minWidth: 0 },
  notifHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "4px",
  },
  notifType: {
    fontSize: "10px",
    fontWeight: "700",
    letterSpacing: "0.08em",
    textTransform: "uppercase",
  },
  notifTime: { color: "#333", fontSize: "11px" },
  notifTitle: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: "14px",
    fontWeight: "700",
    color: "#f0ece0",
    lineHeight: "1.3",
    marginBottom: "4px",
  },
  notifMessage: {
    color: "#555",
    fontSize: "12px",
    lineHeight: "1.6",
  },
  unreadDot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    flexShrink: 0,
    marginTop: "4px",
    animation: "pulse 2s ease infinite",
  },
};
