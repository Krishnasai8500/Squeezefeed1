import { useEffect, useRef, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/navbar";

const BASE_URL = "https://api.nxtbharat.com";

// ─── Vibe strings pool ────────────────────────────────────────────────────────
const VIBE_STRINGS = [
  "you're more informed than your entire family 💀",
  "bro is eating the news for breakfast 🔥",
  "your group chat needs you rn 📲",
  "government fears this reader 👁️",
  "main character energy activated 🎬",
  "you know things they don't teach in school 🧠",
  "chronically informed, no cure found 💉",
  "reading this so your relatives don't have to 😭",
  "the algorithm bows to you 🫡",
  "certified news goblin 🗞️",
  "you just unlocked a new reality 🌀",
  "your awareness level is dangerously high ⚠️",
  "bro found the lore 📜",
  "cooked and informed simultaneously 🍳",
  "the news chose you today 🎯",
];

// ─── Badge display config ─────────────────────────────────────────────────────
const BADGE_CONFIG = {
  NEWS_HUNTER_I: {
    label: "News Hunter",
    tier: "I",
    emoji: "🗞️",
    color: "#f59e0b",
  },
  NEWS_HUNTER_II: {
    label: "News Hunter",
    tier: "II",
    emoji: "🗞️",
    color: "#f97316",
  },
  NEWS_HUNTER_III: {
    label: "News Hunter",
    tier: "III",
    emoji: "🗞️",
    color: "#ef4444",
  },
  SIGNAL_BOOSTER_I: {
    label: "Signal Booster",
    tier: "I",
    emoji: "📡",
    color: "#3b82f6",
  },
  SIGNAL_BOOSTER_II: {
    label: "Signal Booster",
    tier: "II",
    emoji: "📡",
    color: "#6366f1",
  },
  SIGNAL_BOOSTER_III: {
    label: "Signal Booster",
    tier: "III",
    emoji: "📡",
    color: "#8b5cf6",
  },
  DEBATE_LORD_I: {
    label: "Debate Lord",
    tier: "I",
    emoji: "🎤",
    color: "#10b981",
  },
  DEBATE_LORD_II: {
    label: "Debate Lord",
    tier: "II",
    emoji: "🎤",
    color: "#059669",
  },
  DEBATE_LORD_III: {
    label: "Debate Lord",
    tier: "III",
    emoji: "🎤",
    color: "#047857",
  },
};

// ─── Frame styles ─────────────────────────────────────────────────────────────
const FRAME_STYLES = {
  default: { border: "3px solid #444" },
  blue_glow: { border: "3px solid #3b82f6", boxShadow: "0 0 12px #3b82f6" },
  orange_pulse: {
    border: "3px solid #f97316",
    boxShadow: "0 0 16px #f97316",
    animation: "pulse 2s infinite",
  },
  fire: {
    border: "3px solid #ef4444",
    boxShadow: "0 0 24px #ef4444, 0 0 48px #f97316",
  },
  galaxy: {
    border: "3px solid #8b5cf6",
    boxShadow: "0 0 24px #8b5cf6, 0 0 48px #3b82f6, 0 0 72px #ec4899",
  },
};

export default function ArticleDetailPage() {
  const { contentId } = useParams();
  const [searchParams] = useSearchParams();

  const referrerId = searchParams.get("ref");

  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [vibeText, setVibeText] = useState("");
  const [badgePopup, setBadgePopup] = useState(null); // { label, tier, emoji, color }
  const [frameStyle, setFrameStyle] = useState(FRAME_STYLES.default);

  const readTracked = useRef(false);
  const timerRef = useRef(null);

  const authUserId = localStorage.getItem("authUserId");
  const token = localStorage.getItem("token");

  // ─── Fetch article ────────────────────────────────────────────────────────
  useEffect(() => {
    axios
      .get(`${BASE_URL}/api/content/${contentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setArticle(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [contentId]);

  useEffect(() => {
    if (!referrerId) return;

    axios
      .post(`${BASE_URL}/api/users/track/referral`, {
        referrerId,
        contentId,
      })
      .catch(console.error);
  }, [referrerId, contentId]);

  // ─── Load user frame on mount ─────────────────────────────────────────────
  useEffect(() => {
    if (!authUserId) return;
    axios
      .get(`${BASE_URL}/api/users/profile/${authUserId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const frame = res.data.currentFrame || "default";
        setFrameStyle(FRAME_STYLES[frame] || FRAME_STYLES.default);
      })
      .catch(console.error);
  }, [authUserId]);

  // ─── Random vibe text on mount ────────────────────────────────────────────
  useEffect(() => {
    const random =
      VIBE_STRINGS[Math.floor(Math.random() * VIBE_STRINGS.length)];
    setVibeText(random);
  }, []);

  // ─── 5 second read tracker ────────────────────────────────────────────────
  useEffect(() => {
    if (!authUserId || readTracked.current) return;

    timerRef.current = setTimeout(() => {
      if (readTracked.current) return;
      readTracked.current = true;

      axios
        .post(
          `${BASE_URL}/api/users/track/read/${authUserId}`,
          {},
          { headers: { Authorization: `Bearer ${token}` } },
        )
        .then((res) => {
          const { newlyEarnedBadges, currentFrame } = res.data;

          // Update frame if upgraded
          if (currentFrame) {
            setFrameStyle(FRAME_STYLES[currentFrame] || FRAME_STYLES.default);
          }

          // Show badge popup if earned
          if (newlyEarnedBadges && newlyEarnedBadges.length > 0) {
            const config = BADGE_CONFIG[newlyEarnedBadges[0]];
            if (config) {
              setBadgePopup(config);
              setTimeout(() => setBadgePopup(null), 4000);
            }
          }

          // Change vibe text after read tracked
          const newVibe =
            VIBE_STRINGS[Math.floor(Math.random() * VIBE_STRINGS.length)];
          setVibeText(newVibe);
        })
        .catch(console.error);
    }, 5000); // 5 seconds

    return () => clearTimeout(timerRef.current);
  }, [authUserId, article]);

  // ─── Share handler ────────────────────────────────────────────────────────
  async function handleShare() {
    try {
      await navigator.share({
        title: article.title,
        text: article.summary,
        url: window.location.href,
      });

      // Track share
      if (authUserId) {
        axios
          .post(
            `${BASE_URL}/api/users/track/share/${authUserId}`,
            {},
            { headers: { Authorization: `Bearer ${token}` } },
          )
          .then((res) => {
            const { newlyEarnedBadges } = res.data;
            if (newlyEarnedBadges && newlyEarnedBadges.length > 0) {
              const config = BADGE_CONFIG[newlyEarnedBadges[0]];
              if (config) {
                setBadgePopup(config);
                setTimeout(() => setBadgePopup(null), 4000);
              }
            }
          })
          .catch(console.error);

        // Also increment content share count
        axios
          .post(
            `${BASE_URL}/api/content/${contentId}/share`,
            {},
            {
              headers: { Authorization: `Bearer ${token}` },
            },
          )
          .catch(console.error);
      }
    } catch (err) {
      // User cancelled share or browser doesn't support
      console.log("Share cancelled or unsupported");
    }
  }

  if (loading) {
    return <div style={styles.loading}>Loading article...</div>;
  }

  if (!article) {
    return <div style={styles.loading}>Article not found.</div>;
  }

  return (
    <>
      <Navbar />

      {/* ── Vibe Bar ─────────────────────────────────────────────────── */}
      <div style={styles.vibeBar}>
        <span style={styles.vibeText}>{vibeText}</span>
      </div>

      {/* ── Badge Popup ───────────────────────────────────────────────── */}
      {badgePopup && (
        <div style={styles.badgePopup}>
          <div style={{ ...styles.badgeInner, borderColor: badgePopup.color }}>
            <span style={styles.badgeEmoji}>{badgePopup.emoji}</span>
            <div>
              <p style={styles.badgeTitle}>Badge Unlocked!</p>
              <p style={{ ...styles.badgeName, color: badgePopup.color }}>
                {badgePopup.label} {badgePopup.tier}
              </p>
            </div>
          </div>
        </div>
      )}

      <div style={styles.page}>
        <div style={styles.container}>
          {/* ── Article Image ─────────────────────────────────────── */}
          <img
            src={article.imageUrl}
            alt={article.title}
            style={styles.heroImage}
          />

          {/* ── Category Tag ──────────────────────────────────────── */}

          {/* ── Title ─────────────────────────────────────────────── */}
          <h1 style={styles.title}>{article.title}</h1>

          {/* ── Meta ──────────────────────────────────────────────── */}
          <div style={styles.meta}>
            <span>{article.author}</span>
            <span>•</span>
            <span>
              {article.publishedAt
                ? new Date(article.publishedAt).toLocaleDateString()
                : ""}
            </span>
          </div>

          {/* ── Summary ───────────────────────────────────────────── */}
          <p style={styles.summary}>{article.summary}</p>

          {/* ── Full Content ──────────────────────────────────────── */}
          <div style={styles.fullContent}>{article.fullContent}</div>

          {/* ── Share Button ──────────────────────────────────────── */}
          <button style={styles.shareButton} onClick={handleShare}>
            📤 Share Article
          </button>

          {/* ── Tags ──────────────────────────────────────────────── */}
          {article.tags && (
            <div style={styles.tags}>
              {article.tags.map((tag) => (
                <span key={tag} style={styles.tag}>
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── CSS Animations ────────────────────────────────────────────── */}
      <style>{`
                @keyframes pulse {
                    0%, 100% { box-shadow: 0 0 16px #f97316; }
                    50%       { box-shadow: 0 0 32px #f97316, 0 0 48px #ef4444; }
                }
                @keyframes slideUp {
                    from { transform: translateY(100px); opacity: 0; }
                    to   { transform: translateY(0);     opacity: 1; }
                }
                @keyframes fadeOut {
                    0%   { opacity: 1; }
                    80%  { opacity: 1; }
                    100% { opacity: 0; }
                }
            `}</style>
    </>
  );
}

const styles = {
  page: {
    background: "#0f0f0f",
    minHeight: "100vh",
    paddingBottom: "60px",
  },
  container: {
    maxWidth: "760px",
    margin: "0 auto",
    padding: "24px 20px",
  },
  heroImage: {
    width: "100%",
    height: "400px",
    objectFit: "cover",
    borderRadius: "16px",
  },

  title: {
    color: "#fff",
    fontSize: "28px",
    fontWeight: "bold",
    marginTop: "16px",
    lineHeight: "1.4",
  },
  meta: {
    display: "flex",
    gap: "8px",
    color: "#888",
    fontSize: "13px",
    marginTop: "12px",
  },
  summary: {
    color: "#ccc",
    fontSize: "16px",
    lineHeight: "1.7",
    marginTop: "20px",
    borderLeft: "3px solid #ff3b3b",
    paddingLeft: "16px",
  },
  fullContent: {
    color: "#bbb",
    fontSize: "15px",
    lineHeight: "1.8",
    marginTop: "24px",
    whiteSpace: "pre-wrap",
  },
  shareButton: {
    marginTop: "32px",
    background: "#1d4ed8",
    color: "#fff",
    border: "none",
    padding: "12px 28px",
    borderRadius: "10px",
    cursor: "pointer",
    fontSize: "15px",
    fontWeight: "600",
  },
  tags: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
    marginTop: "24px",
  },
  tag: {
    background: "#1a1a1a",
    color: "#888",
    fontSize: "12px",
    padding: "4px 10px",
    borderRadius: "20px",
    border: "1px solid #333",
  },
  loading: {
    background: "#0f0f0f",
    color: "#fff",
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  vibeBar: {
    background: "#111",
    borderBottom: "1px solid #222",
    padding: "10px 24px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  vibeText: {
    color: "#ff9500",
    fontSize: "13px",
    fontWeight: "600",
    letterSpacing: "0.3px",
  },
  badgePopup: {
    position: "fixed",
    bottom: "24px",
    left: "50%",
    transform: "translateX(-50%)",
    zIndex: 9999,
    animation: "slideUp 0.4s ease, fadeOut 4s ease forwards",
  },
  badgeInner: {
    background: "#1a1a1a",
    border: "2px solid",
    borderRadius: "14px",
    padding: "14px 24px",
    display: "flex",
    alignItems: "center",
    gap: "14px",
    boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
  },
  badgeEmoji: {
    fontSize: "32px",
  },
  badgeTitle: {
    color: "#888",
    fontSize: "11px",
    textTransform: "uppercase",
    letterSpacing: "1px",
    margin: 0,
  },
  badgeName: {
    fontSize: "16px",
    fontWeight: "bold",
    margin: "4px 0 0 0",
  },
};
