import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import BadgeUnlockPopup from "../components/BadgeUnlockPopup";
import BottomNav from "../components/bottomNav";

const BASE_URL = "https://api.squeezefeed.com";

// ── Badge meta ───────────────────────────────────────────────
const BADGE_META = {
  NEWS_HUNTER_I: {
    icon: "🥉",
    label: "Bronze",
    color: "#cd7f32",
    glow: "rgba(205,127,50,0.5)",
  },
  NEWS_HUNTER_II: {
    icon: "🥈",
    label: "Silver",
    color: "#c0c0c0",
    glow: "rgba(192,192,192,0.5)",
  },
  NEWS_HUNTER_III: {
    icon: "🥇",
    label: "Gold",
    color: "#FF6A00",
    glow: "rgba(255,106,0,0.5)",
  },
  NEWS_HUNTER_IV: {
    icon: "💎",
    label: "Diamond",
    color: "#7dd3fc",
    glow: "rgba(125,211,252,0.5)",
  },
  NEWS_HUNTER_V: {
    icon: "👑",
    label: "Legend",
    color: "#f9a8d4",
    glow: "rgba(249,168,212,0.5)",
  },
  SIGNAL_BOOSTER_I: {
    icon: "📡",
    label: "Signal",
    color: "#FF6A00",
    glow: "rgba(255,106,0,0.4)",
  },
  DEBATE_LORD_I: {
    icon: "⚡",
    label: "Debate",
    color: "#facc15",
    glow: "rgba(250,204,21,0.4)",
  },
};

function getBadgeMeta(key) {
  return (
    BADGE_META[key] || {
      icon: "🏆",
      label: "Badge",
      color: "#FF6A00",
      glow: "rgba(255,106,0,0.4)",
    }
  );
}

// ── Frame definitions (mirrors backend resolveFrame logic) ───
const FRAME_DEFS = [
  {
    key: "default",
    label: "Default",
    req: 0,
    color: "#888",
    miniStyle: {
      background: "#1a1a1a",
      border: "2px dashed rgba(255,106,0,0.5)",
    },
    miniIconColor: "#FF6A00",
  },
  {
    key: "blue_glow",
    label: "Blue Glow",
    req: 50,
    color: "#38bdf8",
    miniStyle: {
      background: "#050d14",
      border: "2px solid #38bdf8",
      boxShadow: "0 0 12px rgba(56,189,248,0.6)",
    },
    miniIconColor: "#38bdf8",
  },
  {
    key: "orange_pulse",
    label: "Orange Pulse",
    req: 200,
    color: "#FF6A00",
    miniStyle: {
      background: "#110800",
      border: "2px solid #FF6A00",
      boxShadow: "0 0 14px rgba(255,106,0,0.7)",
    },
    miniIconColor: "#FF6A00",
  },
  {
    key: "fire",
    label: "Fire 🔥",
    req: 500,
    color: "#ff4500",
    miniStyle: {
      background: "linear-gradient(135deg,#ff4500,#ff8c00)",
      border: "none",
    },
    miniIconColor: "#fff",
  },
  {
    key: "galaxy",
    label: "Galaxy ✨",
    req: 1500,
    color: "#a78bfa",
    miniStyle: {
      background: "linear-gradient(135deg,#06021a,#1a0640)",
      border: "2px solid #7c3aed",
      boxShadow: "0 0 14px rgba(124,58,237,0.5)",
    },
    miniIconColor: "#a78bfa",
  },
];

function resolveFrame(articlesRead) {
  if (articlesRead >= 1500) return "galaxy";
  if (articlesRead >= 500) return "fire";
  if (articlesRead >= 200) return "orange_pulse";
  if (articlesRead >= 50) return "blue_glow";
  return "default";
}

// ── SqueezeFeed SVG mark ─────────────────────────────────────
function SqueezeMark({ size = 14 }) {
  return (
    <svg width={size} height={size * (80 / 64)} viewBox="0 0 64 80" fill="none">
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

// ── Avatar frame renderer ────────────────────────────────────
function AvatarFrame({ frameKey }) {
  const avatarIcon = (color = "#FF6A00") => (
    <span style={{ fontSize: 38, color }}>👤</span>
  );

  const online = (
    <div
      style={{
        position: "absolute",
        bottom: 5,
        right: 5,
        width: 13,
        height: 13,
        borderRadius: "50%",
        background: "#22c55e",
        border: "2px solid #080808",
        boxShadow: "0 0 8px rgba(34,197,94,0.7)",
        zIndex: 5,
      }}
    />
  );

  if (frameKey === "blue_glow")
    return (
      <div
        style={{
          position: "relative",
          width: 108,
          height: 108,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* spinning ring with dot */}
        <div
          style={{
            ...S.frameRing,
            inset: -8,
            border: "2px solid rgba(56,189,248,0.35)",
            animation: "blueRingSpin 6s linear infinite",
          }}
        >
          <div
            style={{
              position: "absolute",
              width: 7,
              height: 7,
              borderRadius: "50%",
              background: "#38bdf8",
              boxShadow: "0 0 10px #38bdf8",
              top: -3.5,
              left: "calc(50% - 3.5px)",
            }}
          />
        </div>
        <div
          style={{
            ...S.avatarCore,
            border: "2.5px solid #38bdf8",
            background: "#050d14",
            animation: "blueGlowPulse 2s ease-in-out infinite",
          }}
        >
          {avatarIcon("#38bdf8")}
        </div>
        {online}
      </div>
    );

  if (frameKey === "orange_pulse")
    return (
      <div
        style={{
          position: "relative",
          width: 108,
          height: 108,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            ...S.frameRing,
            inset: -8,
            border: "2px solid rgba(255,106,0,0.4)",
            animation: "orangeRingSpin 4s linear infinite",
          }}
        >
          <div
            style={{
              position: "absolute",
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: "#FF6A00",
              boxShadow: "0 0 12px #FF6A00",
              top: -4,
              left: "calc(50% - 4px)",
            }}
          />
        </div>
        <div
          style={{
            ...S.avatarCore,
            border: "2.5px solid #FF6A00",
            background: "#110800",
            animation: "orangePulseRing 1.8s ease-in-out infinite",
          }}
        >
          {avatarIcon("#FF6A00")}
        </div>
        {online}
      </div>
    );

  if (frameKey === "fire")
    return (
      <div
        style={{
          position: "relative",
          width: 108,
          height: 108,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Fire particles */}
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              width: 5,
              height: 8,
              borderRadius: "50%",
              background: "#ff6a00",
              bottom: -12,
              left: `${30 + i * 12}%`,
              zIndex: 6,
              animation: `fireParticle ${0.6 + i * 0.15}s ease-out infinite`,
              animationDelay: `${i * 0.2}s`,
              opacity: 0.8,
            }}
          />
        ))}
        {/* Gradient fire border shell */}
        <div
          style={{
            position: "absolute",
            inset: -5,
            borderRadius: "50%",
            background:
              "linear-gradient(45deg,#ff4500,#FF6A00,#ffaa00,#ff4500)",
            backgroundSize: "300% 300%",
            animation:
              "fireBorder 1.5s ease infinite, fireFlicker 1.2s ease-in-out infinite",
            zIndex: 1,
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 3,
              borderRadius: "50%",
              background: "#111",
              zIndex: 2,
            }}
          />
        </div>
        <div style={{ ...S.avatarCore, background: "#111", zIndex: 3 }}>
          {avatarIcon("#ff8c00")}
        </div>
        {online}
      </div>
    );

  if (frameKey === "galaxy")
    return (
      <div
        style={{
          position: "relative",
          width: 108,
          height: 108,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Galaxy gradient shell */}
        <div
          style={{
            position: "absolute",
            inset: -5,
            borderRadius: "50%",
            background:
              "linear-gradient(135deg,#7c3aed,#FF6A00,#06b6d4,#f9a8d4,#7c3aed)",
            backgroundSize: "300% 300%",
            animation: "fireBorder 3s ease infinite",
            zIndex: 1,
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 3,
              borderRadius: "50%",
              background: "#06021a",
              zIndex: 2,
            }}
          />
        </div>
        {/* Orbit ring 1 */}
        <div
          style={{
            ...S.frameRing,
            inset: -16,
            border: "1px solid rgba(167,139,250,0.2)",
            animation: "galaxyRotate 4s linear infinite",
            zIndex: 6,
          }}
        >
          <div
            style={{
              position: "absolute",
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: "#a78bfa",
              boxShadow: "0 0 10px #a78bfa",
              top: -4,
              left: "calc(50% - 4px)",
            }}
          />
        </div>
        {/* Orbit ring 2 */}
        <div
          style={{
            ...S.frameRing,
            inset: -24,
            border: "1px solid rgba(6,182,212,0.15)",
            animation: "galaxyRotate 7s linear infinite reverse",
            zIndex: 6,
          }}
        >
          <div
            style={{
              position: "absolute",
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "#06b6d4",
              boxShadow: "0 0 8px #06b6d4",
              bottom: -3,
              left: "calc(50% - 3px)",
            }}
          />
        </div>
        <div style={{ ...S.avatarCore, background: "#06021a", zIndex: 3 }}>
          {avatarIcon("#a78bfa")}
        </div>
        {online}
      </div>
    );

  // default
  return (
    <div
      style={{
        position: "relative",
        width: 108,
        height: 108,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          ...S.frameRing,
          inset: -7,
          border: "2px dashed rgba(255,106,0,0.45)",
          animation: "defaultRingSpin 9s linear infinite",
        }}
      />
      <div
        style={{
          ...S.frameRing,
          inset: -14,
          border: "1px dotted rgba(255,106,0,0.2)",
          animation: "defaultRingSpin 15s linear infinite reverse",
        }}
      />
      <div style={S.avatarCore}>{avatarIcon("#FF6A00")}</div>
      {online}
    </div>
  );
}

// ── Frame card in the profile frame section ──────────────────
function FrameCard({ def, articlesRead, currentFrame, autoFrame, onSelect }) {
  const unlocked = articlesRead >= def.req;
  const isActive = currentFrame === def.key;
  const isAuto = autoFrame === def.key;

  return (
    <div
      onClick={() => unlocked && onSelect(def.key)}
      style={{
        ...S.frameCard,
        borderColor: isActive
          ? "rgba(255,106,0,0.5)"
          : "rgba(255,255,255,0.06)",
        background: isActive
          ? "rgba(255,106,0,0.08)"
          : "rgba(255,255,255,0.02)",
        opacity: unlocked ? 1 : 0.5,
        cursor: unlocked ? "pointer" : "not-allowed",
      }}
    >
      {/* Mini avatar */}
      <div style={{ ...S.frameMini, ...def.miniStyle }}>
        <span style={{ fontSize: 16, color: def.miniIconColor }}>👤</span>
      </div>

      <div style={{ flex: 1 }}>
        <div
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: "#fff",
            fontFamily: "'Space Grotesk', sans-serif",
          }}
        >
          {def.label}
        </div>
        <div
          style={{
            fontSize: 10,
            color: unlocked ? "#22c55e" : "#3a3a3a",
            marginTop: 2,
            letterSpacing: "0.04em",
          }}
        >
          {unlocked ? "✓ Unlocked" : `🔒 ${def.req} articles`}
        </div>
      </div>

      {isActive && <div style={S.activeBadge}>ON</div>}
      {!isActive && isAuto && unlocked && (
        <div style={{ ...S.activeBadge, background: "#22c55e" }}>AUTO</div>
      )}
      {!unlocked && <span style={{ fontSize: 13, color: "#2a2a2a" }}>🔒</span>}
    </div>
  );
}

// ── Main page ────────────────────────────────────────────────
export default function ProfilePage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [activeBadge, setActiveBadge] = useState(null);
  const [visibleBadges, setVisibleBadges] = useState([]);
  const [currentFrame, setCurrentFrame] = useState("default");

  useEffect(() => {
    const token = localStorage.getItem("token");
    const authUserId = localStorage.getItem("authUserId");

    axios
      .get(`${BASE_URL}/api/users/profile/${authUserId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setProfile(res.data);
        const frame =
          res.data.currentFrame || resolveFrame(res.data.articlesRead || 0);
        setCurrentFrame(frame);

        if (res.data.pendingBadges?.length > 0) {
          localStorage.setItem("hasPendingBadges", "true");
        } else {
          localStorage.removeItem("hasPendingBadges");
        }

        const badges = res.data.badges || [];
        badges.forEach((_, i) => {
          setTimeout(
            () => setVisibleBadges((prev) => [...prev, i]),
            100 + i * 80,
          );
        });
      })
      .catch((err) => {
        console.error(err);
        localStorage.clear();
        navigate("/login");
      });
  }, []);

  const handleFrameSelect = useCallback(async (key) => {
    const token = localStorage.getItem("token");
    const authUserId = localStorage.getItem("authUserId");
    setCurrentFrame(key);
    try {
      await axios.put(
        `${BASE_URL}/api/users/profile/${authUserId}/frame`,
        { frame: key },
        { headers: { Authorization: `Bearer ${token}` } },
      );
    } catch (err) {
      console.error("Frame update failed", err);
    }
  }, []);

  if (!profile) {
    return (
      <div style={S.loading}>
        <div style={S.loadingRing} />
      </div>
    );
  }

  const articlesRead = profile.articlesRead || 0;
  const autoFrame = resolveFrame(articlesRead);

  return (
    <>
      <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700;800&family=DM+Sans:wght@400;500;600&display=swap');

                @keyframes spin            { to { transform: rotate(360deg); } }
                @keyframes fadeUp          { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
                @keyframes floatAvatar     { 0%,100% { transform:translateY(0); } 50% { transform:translateY(-5px); } }
                @keyframes scanLine        { 0% { top:-10%; } 100% { top:110%; } }
                @keyframes glowPulse       { 0%,100% { opacity:.5; } 50% { opacity:1; } }
                @keyframes logoShimmer     { 0% { background-position:200% center; } 100% { background-position:-200% center; } }
                @keyframes particleDrift   { 0% { opacity:.9; transform:translate(0,0); } 100% { opacity:0; transform:var(--pxy); } }
                @keyframes badgeIn         { from { opacity:0; transform:translateX(-12px); } to { opacity:1; transform:translateX(0); } }
                @keyframes chipPop         { from { opacity:0; transform:scale(0.75); } to { opacity:1; transform:scale(1); } }
                @keyframes statUp          { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }

                @keyframes defaultRingSpin { to { transform:rotate(360deg); } }

                @keyframes blueGlowPulse   {
                    0%,100% { box-shadow:0 0 0 3px rgba(56,189,248,.4),0 0 20px 6px rgba(56,189,248,.25); }
                    50%     { box-shadow:0 0 0 5px rgba(56,189,248,.7),0 0 35px 12px rgba(56,189,248,.5); }
                }
                @keyframes blueRingSpin    { to { transform:rotate(360deg); } }

                @keyframes orangePulseRing {
                    0%,100% { box-shadow:0 0 0 3px rgba(255,106,0,.5),0 0 20px 6px rgba(255,106,0,.3); }
                    50%     { box-shadow:0 0 0 6px rgba(255,106,0,.8),0 0 40px 14px rgba(255,106,0,.55); }
                }
                @keyframes orangeRingSpin  { to { transform:rotate(360deg); } }

                @keyframes fireBorder      { 0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%} }
                @keyframes fireFlicker     { 0%,100%{opacity:1;transform:scaleY(1)} 30%{opacity:.85;transform:scaleY(.97)} 60%{opacity:.95;transform:scaleY(1.02)} }
                @keyframes fireParticle    { 0%{transform:translateY(0) scale(1);opacity:1} 100%{transform:translateY(-28px) scale(.3);opacity:0} }

                @keyframes galaxyRotate    { to { transform:rotate(360deg); } }

                .badge-row:hover { background: rgba(255,106,0,0.08) !important; transform: translateX(4px); }
                .stat-col:hover  { background: rgba(255,106,0,0.05) !important; }
                .frame-card-hover:hover { border-color: rgba(255,106,0,0.3) !important; }
                .chip:hover      { border-color: rgba(255,106,0,0.35) !important; color:#FF6A00 !important; background:rgba(255,106,0,0.06) !important; }
                .action-btn:hover { transform: translateY(-1px); }
                .action-btn:active { transform: scale(0.98); }
            `}</style>

      <BadgeUnlockPopup
        badge={activeBadge}
        onClaim={async () => {
          const token = localStorage.getItem("token");
          try {
            await axios.put(
              `${BASE_URL}/api/users/claim-badge/${profile.authUserId}/${activeBadge}`,
              {},
              { headers: { Authorization: `Bearer ${token}` } },
            );
            setProfile((prev) => ({
              ...prev,
              badges: [...prev.badges, activeBadge],
              pendingBadges: prev.pendingBadges.filter(
                (b) => b !== activeBadge,
              ),
            }));
            setActiveBadge(null);
          } catch (err) {
            console.error(err);
          }
        }}
      />

      <div style={S.page}>
        {/* ── Hero ── */}
        <div style={S.hero}>
          <div style={S.heroGlow} aria-hidden />
          <div style={S.gridBg} aria-hidden />
          <div style={S.scan} aria-hidden />

          {/* Ambient particles */}
          {[
            {
              left: "12%",
              top: "65%",
              dx: "-18px",
              dy: "-45px",
              dur: "3.2s",
              del: ".2s",
            },
            {
              left: "78%",
              top: "55%",
              dx: "14px",
              dy: "-50px",
              dur: "2.8s",
              del: ".8s",
            },
            {
              left: "42%",
              top: "82%",
              dx: "-8px",
              dy: "-55px",
              dur: "3.5s",
              del: "1.3s",
            },
            {
              left: "88%",
              top: "35%",
              dx: "10px",
              dy: "-38px",
              dur: "2.6s",
              del: ".5s",
            },
          ].map((p, i) => (
            <div
              key={i}
              aria-hidden
              style={{
                position: "absolute",
                width: 3,
                height: 3,
                borderRadius: "50%",
                background: "#FF6A00",
                pointerEvents: "none",
                left: p.left,
                top: p.top,
                "--pxy": `translate(${p.dx},${p.dy})`,
                animation: `particleDrift ${p.dur} ease-out infinite`,
                animationDelay: p.del,
              }}
            />
          ))}

          {/* SqueezeFeed logo */}
          <div style={S.sfLogo}>
            <SqueezeMark size={14} />
            <span>
              Squeeze<span style={{ color: "#FF6A00" }}>Feed</span>
            </span>
          </div>

          {/* Avatar with frame */}
          <div
            style={{
              animation: "floatAvatar 4s ease-in-out infinite",
              marginBottom: 20,
            }}
          >
            <AvatarFrame frameKey={currentFrame} />
          </div>

          <h1 style={S.name}>{profile.fullName}</h1>
          <p style={S.email}>{profile.email}</p>

          <div style={S.framePill}>
            <div style={S.frameDot} />
            <span style={S.frameLabel}>
              {FRAME_DEFS.find((f) => f.key === currentFrame)?.label ||
                "Default"}
            </span>
          </div>
        </div>

        {/* ── Stats ── */}
        <div style={S.statsRow}>
          {[
            { n: articlesRead, l: "Read" },
            { n: profile.totalShares || 0, l: "Shared" },
            { n: profile.totalComments || 0, l: "Comments" },
            { n: profile.profileLikes || 0, l: "Likes" },
            { n: profile.profileViews || 0, l: "Views" },
          ].map((s, i) => (
            <div
              className="stat-col"
              key={s.l}
              style={{ ...S.statCol, animationDelay: `${0.05 + i * 0.05}s` }}
            >
              <span style={S.statNum}>{s.n}</span>
              <span style={S.statLabel}>{s.l}</span>
            </div>
          ))}
        </div>

        {/* ── Badges ── */}
        <div style={S.section}>
          <div style={S.sectionHead}>
            <span style={S.sectionTitle}>Badges</span>
            <button
              style={{
                ...S.viewBtn,
                ...(profile.pendingBadges?.length > 0
                  ? {
                      background:
                        "linear-gradient(135deg,#FF6A00,#cc5200,#FF6A00)",
                      backgroundSize: "200% auto",
                      animation: "logoShimmer 2s linear infinite",
                      color: "#fff",
                      border: "none",
                    }
                  : {}),
              }}
              onClick={() => navigate("/badges")}
            >
              {profile.pendingBadges?.length > 0
                ? `✦ ${profile.pendingBadges.length} to claim`
                : "View All"}
            </button>
          </div>

          {profile.badges?.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {profile.badges.map((badge, i) => {
                const meta = getBadgeMeta(badge);
                return (
                  <div
                    key={badge}
                    className="badge-row"
                    style={{
                      ...S.badgeRow,
                      borderColor: meta.color + "33",
                      opacity: visibleBadges.includes(i) ? 1 : 0,
                      animation: visibleBadges.includes(i)
                        ? "badgeIn 0.35s ease forwards"
                        : "none",
                      transition: "background 0.2s, transform 0.2s",
                    }}
                  >
                    <div
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        background: meta.color,
                        boxShadow: `0 0 8px ${meta.glow}`,
                        flexShrink: 0,
                        animation: "glowPulse 2s ease infinite",
                      }}
                    />
                    <span style={{ fontSize: 22, flexShrink: 0 }}>
                      {meta.icon}
                    </span>
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          fontSize: 13,
                          fontWeight: 700,
                          color: "#f0ece0",
                          letterSpacing: "0.04em",
                        }}
                      >
                        {badge.replace(/_/g, " ")}
                      </div>
                      <div
                        style={{
                          fontSize: 10,
                          color: meta.color,
                          letterSpacing: "0.08em",
                          marginTop: 2,
                        }}
                      >
                        {meta.label} tier
                      </div>
                    </div>
                    <div
                      style={{
                        fontSize: 10,
                        color: "#333",
                        letterSpacing: "0.06em",
                      }}
                    >
                      EARNED
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={S.emptyState}>
              <span style={{ fontSize: 28 }}>🎯</span>
              <span style={{ fontSize: 13, color: "#333", marginTop: 8 }}>
                Keep reading to earn badges
              </span>
            </div>
          )}
        </div>

        <div style={S.divider} />

        {/* ── Saved Articles ── */}
        <div style={S.section}>
          <div style={S.sectionHead}>
            <span style={S.sectionTitle}>Saved Articles</span>
            <button style={S.viewBtn} onClick={() => navigate("/saved")}>
              View Saved
            </button>
          </div>
        </div>

        <div style={S.divider} />

        {/* ── Interests ── */}
        <div style={S.section}>
          <div style={S.sectionHead}>
            <span style={S.sectionTitle}>Interests</span>
          </div>
          <div
            style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 4 }}
          >
            {[...new Set(profile.preferredCategories || [])].map((cat, i) => (
              <span
                key={cat}
                className="chip"
                style={{ ...S.chip, animationDelay: `${0.05 + i * 0.07}s` }}
              >
                {cat}
              </span>
            ))}
          </div>
        </div>

        <div style={S.divider} />

        {/* ── Profile Frame ── */}
        <div style={S.section}>
          <div style={S.sectionHead}>
            <span style={S.sectionTitle}>Profile Frame</span>
          </div>
          <p
            style={{
              fontSize: 11,
              color: "#2e2e2e",
              letterSpacing: "0.04em",
              marginBottom: 14,
            }}
          >
            Unlock frames by reading more articles
          </p>
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}
          >
            {FRAME_DEFS.map((def) => (
              <FrameCard
                key={def.key}
                def={def}
                articlesRead={articlesRead}
                currentFrame={currentFrame}
                autoFrame={autoFrame}
                onSelect={handleFrameSelect}
              />
            ))}
          </div>
        </div>

        <div style={S.divider} />

        {/* ── Actions ── */}
        <button
          className="action-btn"
          style={{
            ...S.actionBtn,
            color: "#FF6A00",
            borderColor: "rgba(255,106,0,0.2)",
            background: "rgba(255,106,0,0.06)",
            marginBottom: 12,
          }}
          onClick={() => navigate("/settings")}
        >
          ⚙️ Settings
        </button>
        <button
          style={S.profileActionBtn}
          onClick={() => navigate("/feedback")}
        >
          💡 Feedback
        </button>
        <button
          className="action-btn"
          style={S.actionBtn}
          onClick={() => {
            if (!window.confirm("Are you sure you want to logout?")) return;
            localStorage.clear();
            sessionStorage.setItem("splashShown", "true");
            window.location.href = "/login";
          }}
        >
          Sign Out
        </button>

        <div style={{ height: 110 }} />
      </div>

      <BottomNav />
    </>
  );
}

// ── Styles ───────────────────────────────────────────────────
const S = {
  page: {
    position: "fixed",
    inset: 0,
    background: "#080808",
    fontFamily: "'DM Sans', sans-serif",
    overflowY: "auto", // scrollable inside
  },

  // Hero
  hero: {
    position: "relative",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "48px 24px 36px",
    background: "linear-gradient(180deg, #141008 0%, #0B0B0B 100%)",
    borderBottom: "1px solid rgba(255,106,0,0.08)",
  },
  heroGlow: {
    position: "absolute",
    inset: 0,
    pointerEvents: "none",
    background:
      "radial-gradient(ellipse 65% 50% at 50% 0%, rgba(255,106,0,0.15), transparent 70%)",
  },
  gridBg: {
    position: "absolute",
    inset: 0,
    pointerEvents: "none",
    backgroundImage:
      "linear-gradient(rgba(255,106,0,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(255,106,0,0.04) 1px,transparent 1px)",
    backgroundSize: "28px 28px",
  },
  scan: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 2,
    pointerEvents: "none",
    background:
      "linear-gradient(90deg,transparent,rgba(255,106,0,0.3),transparent)",
    animation: "scanLine 4s linear infinite",
  },

  // Logo
  sfLogo: {
    position: "absolute",
    top: 16,
    left: 20,
    display: "flex",
    alignItems: "center",
    gap: 5,
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: 15,
    fontWeight: 800,
    letterSpacing: "-0.3px",
    background: "linear-gradient(90deg,#fff 30%,#FF6A00 60%,#fff 90%)",
    backgroundSize: "200% auto",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    animation: "logoShimmer 3s linear infinite",
  },

  // Avatar
  frameRing: {
    position: "absolute",
    borderRadius: "50%",
  },
  avatarCore: {
    width: 92,
    height: 92,
    borderRadius: "50%",
    background: "#111",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    zIndex: 2,
  },

  name: {
    fontFamily: "'Space Grotesk', sans-serif",
    color: "#ffffff",
    fontSize: 23,
    fontWeight: 800,
    margin: "0 0 5px",
    letterSpacing: "-0.4px",
    background: "linear-gradient(135deg,#fff 40%,#FF6A00)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  email: {
    color: "#3a3a3a",
    fontSize: 12,
    margin: "0 0 14px",
    letterSpacing: "0.04em",
  },
  framePill: {
    display: "flex",
    alignItems: "center",
    gap: 7,
    background: "rgba(255,106,0,0.07)",
    border: "1px solid rgba(255,106,0,0.25)",
    borderRadius: 999,
    padding: "6px 16px",
  },
  frameDot: {
    width: 6,
    height: 6,
    borderRadius: "50%",
    background: "#FF6A00",
    boxShadow: "0 0 8px #FF6A00",
    animation: "glowPulse 2s infinite",
  },
  frameLabel: {
    color: "#FF6A00",
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: "0.12em",
    textTransform: "uppercase",
  },

  // Stats
  statsRow: {
    display: "grid",
    gridTemplateColumns: "repeat(5,1fr)",
    borderTop: "1px solid rgba(255,255,255,0.04)",
    borderBottom: "1px solid rgba(255,255,255,0.04)",
  },
  statCol: {
    padding: "18px 4px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 3,
    borderRight: "1px solid rgba(255,255,255,0.04)",
    transition: "background 0.2s",
    cursor: "default",
    animation: "statUp 0.5s ease both",
  },
  statNum: {
    fontFamily: "'Space Grotesk', sans-serif",
    color: "#fff",
    fontSize: 18,
    fontWeight: 800,
    lineHeight: 1,
  },
  statLabel: {
    color: "#2e2e2e",
    fontSize: 8,
    fontWeight: 600,
    letterSpacing: "0.1em",
    textTransform: "uppercase",
  },

  // Sections
  section: { padding: "24px 20px 0" },
  sectionHead: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontFamily: "'Space Grotesk', sans-serif",
    color: "#fff",
    fontSize: 16,
    fontWeight: 700,
    display: "flex",
    alignItems: "center",
    gap: 8,
    // The ::before orange bar is done via CSS class in the <style> block
  },
  viewBtn: {
    background: "rgba(255,106,0,0.08)",
    border: "1px solid rgba(255,106,0,0.25)",
    color: "#FF6A00",
    padding: "6px 14px",
    borderRadius: 999,
    cursor: "pointer",
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: "0.04em",
    fontFamily: "'DM Sans', sans-serif",
    transition: "opacity 0.2s",
  },

  // Badge rows
  badgeRow: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "14px 16px",
    borderRadius: 12,
    border: "1px solid",
    background: "rgba(255,255,255,0.02)",
    cursor: "default",
  },
  emptyState: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: 24,
    border: "1px dashed rgba(255,255,255,0.06)",
    borderRadius: 12,
  },

  divider: {
    height: 1,
    margin: "24px 20px 0",
    background:
      "linear-gradient(90deg,transparent,rgba(255,106,0,0.12),transparent)",
  },

  chip: {
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.08)",
    color: "#555",
    padding: "7px 15px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 500,
    letterSpacing: "0.04em",
    textTransform: "capitalize",
    animation: "chipPop 0.4s ease both",
    transition: "all 0.25s",
    cursor: "default",
  },

  // Frame cards
  frameCard: {
    borderRadius: 14,
    padding: 14,
    display: "flex",
    alignItems: "center",
    gap: 12,
    border: "1px solid",
    position: "relative",
    transition: "all 0.2s",
  },
  frameMini: {
    width: 42,
    height: 42,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  activeBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    background: "#FF6A00",
    borderRadius: 4,
    padding: "2px 6px",
    fontSize: 9,
    fontWeight: 700,
    color: "#fff",
    letterSpacing: "0.06em",
    fontFamily: "'Space Grotesk', sans-serif",
  },

  // Actions
  actionBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    margin: "20px 20px 0",
    width: "calc(100% - 40px)",
    padding: 14,
    borderRadius: 14,
    border: "1px solid rgba(239,68,68,0.15)",
    background: "rgba(239,68,68,0.05)",
    color: "#ef4444",
    fontWeight: 600,
    fontSize: 13,
    cursor: "pointer",
    letterSpacing: "0.04em",
    fontFamily: "'DM Sans', sans-serif",
    transition: "all 0.2s",
  },

  // Loading
  loading: {
    background: "#080808",
    height: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  loadingRing: {
    width: 36,
    height: 36,
    borderRadius: "50%",
    border: "2px solid rgba(255,106,0,0.15)",
    borderTopColor: "#FF6A00",
    animation: "spin 0.9s linear infinite",
  },

  profileActionBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    margin: "12px 20px 0",
    width: "calc(100% - 40px)",
    padding: 14,
    borderRadius: 14,
    border: "1px solid rgba(255,106,0,0.2)",
    background: "rgba(255,106,0,0.06)",
    color: "#FF6A00",
    fontWeight: 600,
    fontSize: 13,
    cursor: "pointer",
    letterSpacing: "0.04em",
    fontFamily: "'DM Sans', sans-serif",
    transition: "all 0.2s",
  },
};
