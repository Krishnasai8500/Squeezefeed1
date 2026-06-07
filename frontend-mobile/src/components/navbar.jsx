import { useState, useCallback, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
// ── Time-aware vibe strings ───────────────────────────────────
function getVibeStrings() {
  const hour = new Date().getHours();

  if (hour >= 5 && hour < 9)
    return [
      "your morning briefing has arrived ☕",
      "rise and read, the world didn't pause 🌅",
      "early bird gets the lore 🐦",
      "coffee + news = dangerous combo ⚡",
      "you're up before the algorithm 🧠",
      "morning person or doomscroller? both. 😮‍💨",
    ];

  if (hour >= 9 && hour < 12)
    return [
      "bro found the lore 📜",
      "government fears this reader 👁️",
      "your group chat needs you rn 📲",
      "chronically informed, no cure found 💉",
      "you know things they don't teach in school 🧠",
      "the news chose you today 🎯",
    ];

  if (hour >= 12 && hour < 14)
    return [
      "reading news on lunch break, respect 🫡",
      "eating and learning simultaneously 🍱",
      "mid-day lore drop incoming 📦",
      "certified lunch break scholar 🎓",
      "your colleagues are watching reels. you're not. 👑",
    ];

  if (hour >= 14 && hour < 18)
    return [
      "afternoon slump? news fixes that ⚡",
      "3pm and still more informed than yesterday 📈",
      "bro is eating the news for breakfast 🔥",
      "main character energy activated 🎬",
      "the algorithm bows to you 🫡",
      "cooked and informed simultaneously 🍳",
    ];

  if (hour >= 18 && hour < 21)
    return [
      "dinner table conversation starter loaded 🍽️",
      "you're more informed than your entire family 💀",
      "evening edition unlocked 🌆",
      "reading this so your relatives don't have to 😭",
      "certified news goblin 🗞️",
      "your awareness level is dangerously high ⚠️",
    ];

  // Late night 21:00 – 04:59
  return [
    "why are you awake reading news 💀",
    "midnight lore seeker detected 🌙",
    "bro can't sleep without knowing what happened 😤",
    "the night shift of the informed 🦉",
    "3am news reader, different breed 🫠",
    "sleep is for the uninformed apparently 👁️",
  ];
}

const BURST_EMOJIS = [
  "🔥",
  "💀",
  "🫡",
  "⚡",
  "🌀",
  "👁️",
  "🎯",
  "💥",
  "🧠",
  "📲",
  "🗞️",
  "🎬",
  "🌍",
  "💉",
  "😭",
  "🏆",
  "🤯",
  "⚠️",
];
let emojiCounter = 0;

// ── Typing hook ───────────────────────────────────────────────
function useTypingEffect(
  strings,
  typingSpeed = 45,
  deleteSpeed = 22,
  pauseMs = 2800,
) {
  const [displayed, setDisplayed] = useState("");
  const [strIndex, setStrIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [deleting, setDeleting] = useState(false);
  const [pausing, setPausing] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    if (pausing) {
      timerRef.current = setTimeout(() => {
        setPausing(false);
        setDeleting(true);
      }, pauseMs);
      return () => clearTimeout(timerRef.current);
    }

    const current = strings[strIndex % strings.length];

    if (!deleting) {
      // Typing forward
      if (charIndex < current.length) {
        timerRef.current = setTimeout(() => {
          setDisplayed(current.slice(0, charIndex + 1));
          setCharIndex((c) => c + 1);
        }, typingSpeed);
      } else {
        // Fully typed — pause before deleting
        setPausing(true);
      }
    } else {
      // Deleting
      if (charIndex > 0) {
        timerRef.current = setTimeout(() => {
          setDisplayed(current.slice(0, charIndex - 1));
          setCharIndex((c) => c - 1);
        }, deleteSpeed);
      } else {
        // Fully deleted — move to next string
        setDeleting(false);
        setStrIndex((i) => (i + 1) % strings.length);
      }
    }

    return () => clearTimeout(timerRef.current);
  }, [charIndex, deleting, pausing, strIndex, strings]);

  return displayed;
}

export default function Navbar({ onRefresh }) {
  const navigate = useNavigate();
  const role = localStorage.getItem("role");
  const location = useLocation();
  const vibeStrings = getVibeStrings();
  const typedText = useTypingEffect(vibeStrings);

  const [emojiBursts, setEmojiBursts] = useState([]);
  const [hasBadgeNotification, setHasBadgeNotification] = useState(
    localStorage.getItem("hasPendingBadges") === "true",
  );

  useEffect(() => {
    const handler = () =>
      setHasBadgeNotification(
        localStorage.getItem("hasPendingBadges") === "true",
      );
    window.addEventListener("badgeUnlocked", handler);
    return () => window.removeEventListener("badgeUnlocked", handler);
  }, []);

  const handleVibeClick = useCallback((e) => {
    const id = emojiCounter++;
    const emoji = BURST_EMOJIS[id % BURST_EMOJIS.length];
    setEmojiBursts((prev) => [
      ...prev,
      { id, emoji, x: e.clientX, y: e.clientY },
    ]);
    setTimeout(
      () => setEmojiBursts((prev) => prev.filter((b) => b.id !== id)),
      900,
    );
  }, []);

  return (
    <>
      <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@400;500;600&display=swap');
                .nav-pill:hover { background: rgba(212,175,55,0.15) !important; color: #d4af37 !important; }
                @keyframes shimmerGold {
                    0%   { background-position: 200% center; }
                    100% { background-position: -200% center; }
                }
                @keyframes vibePulse {
                    0%, 100% { opacity: 1;   transform: scale(1);   }
                    50%       { opacity: 0.4; transform: scale(1.5); }
                }
                @keyframes emojiFly {
                    0%   { transform: translateY(0) scale(1);   opacity: 1; }
                    100% { transform: translateY(-90px) scale(1.6); opacity: 0; }
                }
                @keyframes blink {
                    0%, 100% { opacity: 1; }
                    50%       { opacity: 0; }
                }
            `}</style>

      {/* Emoji bursts */}
      {emojiBursts.map((burst) => (
        <div
          key={burst.id}
          style={{
            position: "fixed",
            left: burst.x,
            top: burst.y,
            fontSize: "28px",
            pointerEvents: "none",
            zIndex: 99999,
            animation: "emojiFly 0.9s ease-out forwards",
            userSelect: "none",
          }}
        >
          {burst.emoji}
        </div>
      ))}

      <div style={S.wrapper}>
        {/* Top bar */}
        <nav style={S.nav}>
          <div style={S.container}>
            <div
              style={S.brandWrap}
              onClick={() => {
                if (onRefresh) {
                  onRefresh(); // always call onRefresh if provided (home page passes it)
                } else {
                  // dispatch a generic refresh event for other pages to listen to
                  window.dispatchEvent(
                    new CustomEvent("refreshCurrentPage", {
                      detail: { path: location.pathname },
                    }),
                  );
                }
              }}
            >
              <svg width="20" height="25" viewBox="0 0 64 80" fill="none">
                <rect
                  x="4"
                  y="6"
                  width="56"
                  height="7"
                  rx="3.5"
                  fill="#FF6A00"
                />
                <rect
                  x="10"
                  y="19"
                  width="44"
                  height="7"
                  rx="3.5"
                  fill="#FF6A00"
                  opacity="0.85"
                />
                <rect
                  x="18"
                  y="32"
                  width="28"
                  height="7"
                  rx="3.5"
                  fill="#FF6A00"
                  opacity="0.65"
                />
                <rect
                  x="24"
                  y="45"
                  width="16"
                  height="7"
                  rx="3.5"
                  fill="#FF6A00"
                  opacity="0.45"
                />
                <rect
                  x="28"
                  y="56"
                  width="8"
                  height="7"
                  rx="3.5"
                  fill="#FF6A00"
                  opacity="0.3"
                />
                <circle cx="32" cy="72" r="4" fill="#FF6A00" />
              </svg>
              <span style={S.brand}>
                Squeeze<span style={{ color: "#FF6A00" }}>Feed</span>
              </span>
              {/* Refresh indicator — always visible so users know it's tappable */}
              <span style={S.refreshHint} title="Tap to refresh">
                ↻
              </span>
            </div>
            <div style={S.pills}>
              <span
                className="nav-pill"
                style={S.pill}
                onClick={() => navigate("/memes")}
              >
                🎨 Visual
              </span>
              {role === "ADMIN" && (
                <>
                  <span
                    className="nav-pill"
                    style={S.pill}
                    onClick={() => navigate("/admin/memes")}
                  >
                    🛠 Memes
                  </span>
                  <span
                    className="nav-pill"
                    style={S.pill}
                    onClick={() => navigate("/admin/news")}
                  >
                    📰 News
                  </span>
                  <span
                    className="nav-pill"
                    style={S.pill}
                    onClick={() => navigate("/admin/analytics")}
                  >
                    📊 Analytics
                  </span>
                  <span
                    className="nav-pill"
                    style={S.pill}
                    onClick={() => navigate("/admin/reports")}
                  >
                    🚩 Reports
                  </span>
                </>
              )}
            </div>
          </div>
        </nav>

        {/* Vibe bar — typing effect */}
        <div style={S.vibeBarWrapper}>
          <div style={S.vibeBar} onClick={handleVibeClick}>
            <span style={S.vibeDot} />

            <span style={S.vibeText}>
              {typedText}
              {/* Blinking cursor */}
              <span style={S.cursor}>|</span>
            </span>

            <span style={S.vibeDot} />
          </div>
        </div>
      </div>
    </>
  );
}

const S = {
    wrapper: {
      position: "sticky",
      top: 0,
      zIndex: 1000,
      background: "#0B0B0B",
      paddingTop: "env(safe-area-inset-top)",
      borderBottom: "1px solid rgba(255,106,0,0.12)",
      fontFamily: "'DM Sans', sans-serif",
    },
  nav: { width: "100%", background: "#0a0a0a" },
  container: {
    width: "100%",
    padding: "0 16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    height: "52px",
    boxSizing: "border-box",
  },
  brand: {
    fontFamily: "'Playfair Display', serif",
    fontSize: "20px",
    fontWeight: "700",
    color: "#d4af37",
    letterSpacing: "0.08em",
    cursor: "pointer",
    userSelect: "none",
  },
  pills: {
    display: "flex",
    gap: "6px",
    overflowX: "auto",
    scrollbarWidth: "none",
    alignItems: "center",
  },
  pill: {
    color: "#888",
    fontSize: "12px",
    fontWeight: "500",
    cursor: "pointer",
    whiteSpace: "nowrap",
    padding: "5px 12px",
    borderRadius: "999px",
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.06)",
    transition: "all 0.2s",
    letterSpacing: "0.02em",
  },
  vibeBarWrapper: {
    height: "44px",
    background: "#0a0a0a",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  vibeBar: {
    width: "80%",
    background:
      "linear-gradient(90deg,#cc5200,#FF6A00,#ff8c3a,#FF6A00,#cc5200)",
    backgroundSize: "200% 100%",
    animation: "shimmerGold 2.8s linear infinite",
    borderRadius: "999px",
    padding: "8px 18px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    boxShadow: "0 0 20px rgba(255,106,0,0.3)",
    cursor: "pointer",
    userSelect: "none",
    minWidth: 0,
  },
  vibeText: {
    color: "#fff", // ← was #1a1200, now white for contrast
    fontSize: "11px",
    fontWeight: "800",
    textAlign: "center",
    letterSpacing: "0.3px",
    lineHeight: "1.3",
    pointerEvents: "none",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    maxWidth: "100%",
  },
  cursor: {
    display: "inline-block",
    marginLeft: "1px",
    animation: "blink 0.9s step-end infinite",
    fontWeight: "300",
    color: "#fff", // ← was #1a1200
  },
  vibeDot: {
    width: "5px",
    height: "5px",
    borderRadius: "50%",
    background: "#fff", // ← was #1a1200
    opacity: 0.6,
    animation: "vibePulse 1.2s ease-in-out infinite",
    flexShrink: 0,
    pointerEvents: "none",
  },
  wrapper: {
    position: "sticky",
    top: 0,
    zIndex: 1000,
    background: "#0B0B0B",
    borderBottom: "1px solid rgba(255,106,0,0.12)", // ← orange not gold
    fontFamily: "'DM Sans', sans-serif",
  },
  brandWrap: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    cursor: "pointer",
    userSelect: "none",
    flexShrink: 0,
  },
  brand: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: "18px",
    fontWeight: "800",
    color: "#ffffff", // ← white not gold
    letterSpacing: "-0.3px",
  },
  refreshHint: {
    fontSize: "16px",
    color: "rgba(255,106,0,0.6)",
    fontWeight: "700",
    lineHeight: 1,
    marginLeft: "2px",
    transition: "color 0.2s, transform 0.3s",
    display: "inline-block",
    userSelect: "none",
  },
};

// Copy this anywhere — navbar, splash, favicon, app icon

export function SqueezeMark({ size = 48, color = "#FF6A00", darkMode = true }) {
  const h = size * 1.25;
  return (
    <svg width={size} height={h} viewBox="0 0 64 80" fill="none">
      <rect x="4" y="6" width="56" height="7" rx="3.5" fill={color} />
      <rect
        x="10"
        y="19"
        width="44"
        height="7"
        rx="3.5"
        fill={color}
        opacity="0.85"
      />
      <rect
        x="18"
        y="32"
        width="28"
        height="7"
        rx="3.5"
        fill={color}
        opacity="0.65"
      />
      <rect
        x="24"
        y="45"
        width="16"
        height="7"
        rx="3.5"
        fill={color}
        opacity="0.45"
      />
      <rect
        x="28"
        y="56"
        width="8"
        height="7"
        rx="3.5"
        fill={color}
        opacity="0.3"
      />
      <circle cx="32" cy="72" r="4" fill={color} />
    </svg>
  );
}

// export function SqueezeWordmark({ size = 32 }) {
//     return (
//         <div style={{ display: "flex", alignItems: "center", gap: size * 0.25 }}>
//             <SqueezeMark size={size * 0.75} />
//             <div style={{
//                 fontSize: size,
//                 fontWeight: 800,
//                 color: "#fff",
//                 letterSpacing: "-0.03em",
//                 lineHeight: 1,
//                 fontFamily: "'Space Grotesk', sans-serif",
//             }}>
//                 Squeeze<span style={{ color: "#FF6A00" }}>Feed</span>
//             </div>
//         </div>
//     );
// }
