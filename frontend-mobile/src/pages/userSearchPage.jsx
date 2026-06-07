import { useState, useRef } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import BottomNav from "../components/bottomNav";

const BASE_URL = "https://api.nxtbharat.com";

function SqueezeMark({ size = 16 }) {
  return (
    <svg width={size} height={size * 1.25} viewBox="0 0 64 80" fill="none">
      <rect x="4" y="6" width="56" height="7" rx="3.5" fill="#FF6A00" />
      <rect
        x="10"
        y="19"
        width="44"
        height="7"
        rx="3.5"
        fill="#FF6A00"
        opacity="0.82"
      />
      <rect
        x="18"
        y="32"
        width="28"
        height="7"
        rx="3.5"
        fill="#FF6A00"
        opacity="0.62"
      />
      <rect
        x="24"
        y="45"
        width="16"
        height="7"
        rx="3.5"
        fill="#FF6A00"
        opacity="0.42"
      />
      <rect
        x="28"
        y="56"
        width="8"
        height="7"
        rx="3.5"
        fill="#FF6A00"
        opacity="0.25"
      />
      <circle cx="32" cy="72" r="4" fill="#FF6A00" />
    </svg>
  );
}

const PILLS = [
  { label: "Top Readers", term: "a", icon: "👑" },
  { label: "Most Active", term: "e", icon: "🔥" },
  { label: "New Users", term: "i", icon: "✨" },
];

const SHIMMER = "linear-gradient(90deg,#141414 25%,#1e1e1e 50%,#141414 75%)";

export default function UserSearchPage() {
  const navigate = useNavigate();
  const inputRef = useRef(null);

  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [focused, setFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activePill, setActivePill] = useState("");

  const fetchResults = async (value) => {
    if (!value.trim()) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `${BASE_URL}/api/users/search?query=${value}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setResults(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value) => {
    setQuery(value);
    setActivePill("");
    fetchResults(value);
  };
  const handlePill = (label, term) => {
    setActivePill(label);
    setQuery(term);
    fetchResults(term);
  };
  const clearSearch = () => {
    setQuery("");
    setResults([]);
    setActivePill("");
    inputRef.current?.focus();
  };

  return (
    <>
      <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700;800&family=DM+Sans:wght@400;500;600&display=swap');
                @keyframes fadeUp {
                    from { opacity:0; transform:translateY(14px); }
                    to   { opacity:1; transform:translateY(0); }
                }
                @keyframes shimmer {
                    0%   { background-position:-400px 0; }
                    100% { background-position: 400px 0; }
                }
                @keyframes spin { to { transform:rotate(360deg); } }
                .user-card:hover {
                    border-color: rgba(255,106,0,0.3) !important;
                    transform: translateY(-2px);
                    box-shadow: 0 8px 32px rgba(255,106,0,0.08) !important;
                }
                .pill-btn:hover { border-color: rgba(255,106,0,0.4) !important; color: #FF6A00 !important; }
            `}</style>

      <div style={S.page}>
        <div style={S.ambientGlow} />

        <div style={S.container}>
          {/* ── Header ── */}
          <div style={S.header}>
            <button style={S.backBtn} onClick={() => navigate(-1)}>
              ←
            </button>
            <div style={S.logoRow}>
              <SqueezeMark size={16} />
              <span style={S.logoText}>
                Squeeze<span style={{ color: "#FF6A00" }}>Feed</span>
              </span>
            </div>
          </div>

          <h1 style={S.heading}>
            Find <span style={{ color: "#FF6A00" }}>Readers</span>
          </h1>
          <p style={S.sub}>Discover top readers & most active users</p>

          {/* ── Search bar ── */}
          <div
            style={{
              ...S.searchWrap,
              boxShadow: focused
                ? "0 0 0 2px #FF6A00"
                : "0 0 0 1px rgba(255,255,255,0.07)",
            }}
          >
            <span
              style={{
                position: "absolute",
                left: "16px",
                top: "50%",
                transform: "translateY(-50%)",
                fontSize: "16px",
                opacity: focused ? 1 : 0.4,
              }}
            >
              🔍
            </span>
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => handleSearch(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setTimeout(() => setFocused(false), 150)}
              placeholder="Search by username..."
              style={S.input}
            />
            {query && (
              <button onClick={clearSearch} style={S.clearBtn}>
                ✕
              </button>
            )}
          </div>

          {/* ── Pills ── */}
          <div style={S.pillsRow}>
            {PILLS.map(({ label, term, icon }) => (
              <button
                key={label}
                className="pill-btn"
                onClick={() => handlePill(label, term)}
                style={{
                  ...S.pill,
                  ...(activePill === label ? S.pillActive : {}),
                }}
              >
                {icon} {label}
              </button>
            ))}
          </div>

          {/* ── Loading shimmer ── */}
          {loading && (
            <div
              style={{ display: "flex", flexDirection: "column", gap: "12px" }}
            >
              {[1, 2, 3].map((i) => (
                <div key={i} style={S.shimmerCard}>
                  <div
                    style={{
                      width: "52px",
                      height: "52px",
                      borderRadius: "50%",
                      backgroundImage: SHIMMER,
                      backgroundSize: "800px 100%",
                      animation: "shimmer 1.4s infinite linear",
                      flexShrink: 0,
                    }}
                  />
                  <div
                    style={{
                      flex: 1,
                      display: "flex",
                      flexDirection: "column",
                      gap: "10px",
                    }}
                  >
                    <div
                      style={{
                        height: "14px",
                        borderRadius: "6px",
                        width: "50%",
                        backgroundImage: SHIMMER,
                        backgroundSize: "800px 100%",
                        animation: "shimmer 1.4s infinite linear",
                      }}
                    />
                    <div
                      style={{
                        height: "11px",
                        borderRadius: "6px",
                        width: "30%",
                        backgroundImage: SHIMMER,
                        backgroundSize: "800px 100%",
                        animation: "shimmer 1.4s infinite linear 0.2s",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── Results ── */}
          {!loading && (
            <div
              style={{ display: "flex", flexDirection: "column", gap: "10px" }}
            >
              {results.map((user, i) => (
                <div
                  key={user.id}
                  className="user-card"
                  style={{ ...S.userCard, animationDelay: `${i * 0.06}s` }}
                  onClick={() => navigate(`/u/${user.userName}`)}
                >
                  {/* Avatar */}
                  <div style={S.avatar}>
                    <span style={{ fontSize: "24px" }}>👤</span>
                    <div style={S.avatarRing} />
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                      }}
                    >
                      <div>
                        <div style={S.fullName}>{user.fullName}</div>
                        <div style={S.userName}>@{user.userName}</div>
                      </div>
                      {user.badges?.length > 0 && (
                        <div style={S.badgePill}>🏆 {user.badges.length}</div>
                      )}
                    </div>
                    <div style={S.statsChips}>
                      <span style={S.chip}>❤️ {user.profileLikes || 0}</span>
                      <span style={S.chip}>📖 {user.articlesRead || 0}</span>
                      <span style={S.chip}>💬 {user.totalComments || 0}</span>
                    </div>
                  </div>

                  <span style={S.arrow}>›</span>
                </div>
              ))}

              {query && results.length === 0 && (
                <div style={S.empty}>
                  <div style={{ fontSize: "36px", marginBottom: "12px" }}>
                    🕵️
                  </div>
                  <div
                    style={{
                      color: "#555",
                      fontSize: "16px",
                      fontWeight: "700",
                    }}
                  >
                    No users found
                  </div>
                  <div
                    style={{
                      color: "#333",
                      fontSize: "12px",
                      marginTop: "6px",
                    }}
                  >
                    Try a different search
                  </div>
                </div>
              )}
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
    color: "#fff",
    fontFamily: "'DM Sans',sans-serif",
    overflowY: "auto",
  },
  ambientGlow: {
    position: "fixed",
    top: "-100px",
    left: "50%",
    transform: "translateX(-50%)",
    width: "300px",
    height: "300px",
    borderRadius: "50%",
    background:
      "radial-gradient(circle,rgba(255,106,0,0.08) 0%,transparent 70%)",
    pointerEvents: "none",
    zIndex: 0,
  },
  container: {
    maxWidth: "480px",
    margin: "0 auto",
    padding: "24px 20px",
    position: "relative",
    zIndex: 1,
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "28px",
  },
  backBtn: {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    color: "#fff",
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    cursor: "pointer",
    fontSize: "18px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  logoRow: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },
  logoText: {
    fontFamily: "'Space Grotesk',sans-serif",
    fontSize: "15px",
    fontWeight: "800",
    color: "#fff",
    letterSpacing: "-0.2px",
  },
  heading: {
    fontFamily: "'Space Grotesk',sans-serif",
    fontSize: "28px",
    fontWeight: "800",
    color: "#fff",
    margin: "0 0 6px",
    letterSpacing: "-0.5px",
  },
  sub: { fontSize: "13px", color: "#444", marginBottom: "24px" },
  searchWrap: {
    position: "relative",
    borderRadius: "14px",
    marginBottom: "14px",
    transition: "box-shadow 0.2s",
  },
  input: {
    width: "100%",
    padding: "14px 44px 14px 48px",
    borderRadius: "14px",
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.07)",
    color: "#fff",
    fontSize: "15px",
    fontFamily: "'DM Sans',sans-serif",
    outline: "none",
    boxSizing: "border-box",
  },
  clearBtn: {
    position: "absolute",
    right: "14px",
    top: "50%",
    transform: "translateY(-50%)",
    width: "24px",
    height: "24px",
    borderRadius: "50%",
    background: "rgba(255,255,255,0.08)",
    border: "none",
    color: "#777",
    fontSize: "11px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  pillsRow: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
    marginBottom: "20px",
  },
  pill: {
    padding: "7px 14px",
    borderRadius: "999px",
    background: "transparent",
    border: "1px solid rgba(255,255,255,0.08)",
    color: "#555",
    fontSize: "12px",
    fontWeight: "600",
    cursor: "pointer",
    fontFamily: "'DM Sans',sans-serif",
    transition: "all 0.2s",
    userSelect: "none",
    letterSpacing: "0.02em",
  },
  pillActive: {
    background: "rgba(255,106,0,0.1)",
    border: "1px solid rgba(255,106,0,0.4)",
    color: "#FF6A00",
  },
  shimmerCard: {
    background: "#111",
    border: "1px solid #1a1a1a",
    borderRadius: "14px",
    padding: "16px",
    display: "flex",
    gap: "14px",
    alignItems: "center",
  },
  userCard: {
    background: "rgba(255,255,255,0.02)",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: "14px",
    padding: "16px",
    display: "flex",
    gap: "14px",
    alignItems: "center",
    cursor: "pointer",
    transition: "border-color 0.2s, transform 0.2s, box-shadow 0.2s",
    animation: "fadeUp 0.35s ease both",
  },
  avatar: {
    width: "52px",
    height: "52px",
    borderRadius: "50%",
    background: "linear-gradient(135deg,#1a0e00,#2a1400)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    flexShrink: 0,
  },
  avatarRing: {
    position: "absolute",
    inset: "-2px",
    borderRadius: "50%",
    border: "1.5px solid rgba(255,106,0,0.25)",
    pointerEvents: "none",
  },
  fullName: {
    fontFamily: "'Space Grotesk',sans-serif",
    fontSize: "15px",
    fontWeight: "700",
    color: "#f0ece0",
    letterSpacing: "-0.2px",
  },
  userName: {
    color: "#FF6A00",
    fontSize: "12px",
    marginTop: "2px",
    fontWeight: "600",
  },
  badgePill: {
    background: "rgba(255,106,0,0.1)",
    border: "1px solid rgba(255,106,0,0.2)",
    color: "#FF6A00",
    padding: "4px 10px",
    borderRadius: "999px",
    fontSize: "11px",
    fontWeight: "700",
    flexShrink: 0,
  },
  statsChips: { display: "flex", gap: "6px", marginTop: "10px" },
  chip: {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.06)",
    color: "#555",
    padding: "4px 10px",
    borderRadius: "999px",
    fontSize: "11px",
    fontWeight: "600",
  },
  arrow: { color: "#2a2a2a", fontSize: "22px", flexShrink: 0 },
  empty: {
    textAlign: "center",
    padding: "60px 0 40px",
    animation: "fadeUp 0.3s ease both",
  },
};
