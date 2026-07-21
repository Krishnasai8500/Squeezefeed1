import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";

// ── SVG Icons ─────────────────────────────────────────────────
function HomeIcon({ active }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path
        d="M3 12L12 3L21 12V21H15V15H9V21H3V12Z"
        fill={active ? "#FF6A00" : "none"}
        stroke={active ? "#FF6A00" : "#B5B5B5"}
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SearchIcon({ active }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <circle
        cx="11"
        cy="11"
        r="7"
        stroke={active ? "#FF6A00" : "#B5B5B5"}
        strokeWidth="1.8"
      />
      <path
        d="M16.5 16.5L21 21"
        stroke={active ? "#FF6A00" : "#B5B5B5"}
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function BellIcon({ active }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path
        d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"
        stroke={active ? "#FF6A00" : "#B5B5B5"}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M13.73 21a2 2 0 0 1-3.46 0"
        stroke={active ? "#FF6A00" : "#B5B5B5"}
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ProfileIcon({ active }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <circle
        cx="12"
        cy="8"
        r="4"
        fill={active ? "#FF6A00" : "none"}
        stroke={active ? "#FF6A00" : "#B5B5B5"}
        strokeWidth="1.8"
      />
      <path
        d="M4 20c0-4 3.582-7 8-7s8 3 8 7"
        stroke={active ? "#FF6A00" : "#B5B5B5"}
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

// ── Main Component ─────────────────────────────────────────────
export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch unread notifications count whenever route changes
  useEffect(() => {
    const authUserId = localStorage.getItem("authUserId");
    const token = localStorage.getItem("token");
    if (!authUserId || !token) return;

    axios
      .get(
        `https://api.squeezefeed.com/api/notifications/user/${authUserId}/unread`,
        { headers: { Authorization: `Bearer ${token}` } },
      )
      .then((res) => setUnreadCount((res.data || []).length))
      .catch(() => {});
  }, [location.pathname]); // runs every time user navigates

  const active = (path) => location.pathname === path;

  return (
    <>
      <style>{`
                .bnav-btn:active { transform: scale(0.88); }
            `}</style>

      <div style={S.nav} data-bottomnav>
        {/* Gold top line */}
        <div style={S.goldLine} />

        {/* Home */}
        <button
          className="bnav-btn"
          style={S.btn}
          onClick={() => {
            if (location.pathname === "/") {
              sessionStorage.removeItem("homeScrollPosition");
              sessionStorage.removeItem("feedCache");

              window.dispatchEvent(new Event("refreshHomeFeed"));
            } else {
              navigate("/");
            }
          }}
        >
          <HomeIcon active={active("/")} />
          <span style={{ ...S.label, color: active("/") ? "#FF6A00" : "#A0A0A0" }}>
            Home
          </span>
        </button>

        {/* Search */}
        <button
          className="bnav-btn"
          style={S.btn}
          onClick={() => navigate("/search-users")}
        >
          <SearchIcon active={active("/search-users")} />
          <span
            style={{
              ...S.label,
              color: active("/search-users") ? "#FF6A00" : "#A0A0A0",
            }}
          >
            Search
          </span>
        </button>

        {/* Notifications Bell — replaces the old refresh button */}
        <button
          className="bnav-btn"
          style={S.btn}
          onClick={() => navigate("/notifications")}
        >
          <div style={{ position: "relative" }}>
            <BellIcon active={active("/notifications")} />
            {/* Unread count badge */}
            {unreadCount > 0 && (
              <div style={S.badge}>{unreadCount > 9 ? "9+" : unreadCount}</div>
            )}
          </div>
          <span
            style={{
              ...S.label,
              color: active("/notifications") ? "#FF6A00" : "#A0A0A0",
            }}
          >
            Alerts
          </span>
        </button>

        {/* Profile */}
        <button
          className="bnav-btn"
          style={S.btn}
          onClick={() => navigate("/profile")}
        >
          <ProfileIcon active={active("/profile")} />
          <span
            style={{
              ...S.label,
              color: active("/profile") ? "#FF6A00" : "#A0A0A0",
            }}
          >
            Profile
          </span>
        </button>
      </div>
    </>
  );
}

// ── Styles ─────────────────────────────────────────────────────
const S = {
  nav: {
    position: "fixed",
    bottom: 0,
    left: 0,
    right: 0,
    height: "72px",
    background: "rgba(8,8,8,0.97)",
    backdropFilter: "blur(20px)",
    display: "flex",
    justifyContent: "space-around",
    alignItems: "center",
    zIndex: 9999,
    paddingBottom: "env(safe-area-inset-bottom)",
    fontFamily: "'DM Sans', sans-serif",
  },
  goldLine: {
    position: "absolute",
    top: 0,
    left: "10%",
    right: "10%",
    height: "1px",
    background:
      "linear-gradient(90deg, transparent, rgba(255,106,0,0.4), transparent)",
  },
  btn: {
    background: "transparent",
    border: "none",
    cursor: "pointer",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "3px",
    padding: "8px 16px",
    transition: "transform 0.15s ease",
    userSelect: "none",
  },
  label: {
    fontSize: "10px",
    fontWeight: "600",
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    transition: "color 0.2s",
  },
  badge: {
    position: "absolute",
    top: "-4px",
    right: "-6px",
    width: "16px",
    height: "16px",
    borderRadius: "50%",
    background: "#FF6A00",
    border: "2px solid #0B0B0B",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "9px",
    fontWeight: "700",
    color: "#fff",
    lineHeight: 1,
  },
};
