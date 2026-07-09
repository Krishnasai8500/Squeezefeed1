import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { likePublicProfile, trackProfileView } from "../services/api";
import BottomNav from "../components/bottomNav";

// const BASE_URL = "https://api.squeezefeed.com";
const BASE_URL = "https://api.squeezefeed.com";

// ── Badge meta ───────────────────────────────────────────────
const BADGE_META = {
  NEWS_HUNTER_I: {
    icon: "🥉",
    color: "#cd7f32",
    glow: "rgba(205,127,50,0.5)",
    label: "Bronze",
  },
  NEWS_HUNTER_II: {
    icon: "🥈",
    color: "#c0c0c0",
    glow: "rgba(192,192,192,0.5)",
    label: "Silver",
  },
  NEWS_HUNTER_III: {
    icon: "🥇",
    color: "#FF6A00",
    glow: "rgba(255,106,0,0.5)",
    label: "Gold",
  },
  NEWS_HUNTER_IV: {
    icon: "💎",
    color: "#7dd3fc",
    glow: "rgba(125,211,252,0.5)",
    label: "Diamond",
  },
  NEWS_HUNTER_V: {
    icon: "👑",
    color: "#f9a8d4",
    glow: "rgba(249,168,212,0.5)",
    label: "Legend",
  },
  SIGNAL_BOOSTER_I: {
    icon: "📡",
    color: "#FF6A00",
    glow: "rgba(255,106,0,0.4)",
    label: "Signal",
  },
  DEBATE_LORD_I: {
    icon: "⚡",
    color: "#facc15",
    glow: "rgba(250,204,21,0.4)",
    label: "Debate",
  },
};
function getBadgeMeta(key) {
  return (
    BADGE_META[key] || {
      icon: "🏆",
      color: "#FF6A00",
      glow: "rgba(255,106,0,0.4)",
      label: "Badge",
    }
  );
}

// ── SqueezeFeed mark ─────────────────────────────────────────
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

// ── Avatar with frame animation (same logic as ProfilePage) ──
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

  const wrap = {
    position: "relative",
    width: 108,
    height: 108,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };
  const frameRingBase = { position: "absolute", borderRadius: "50%" };
  const coreBase = {
    width: 92,
    height: 92,
    borderRadius: "50%",
    background: "#111",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    zIndex: 2,
  };

  if (frameKey === "blue_glow")
    return (
      <div style={wrap}>
        <div
          style={{
            ...frameRingBase,
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
            ...coreBase,
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
      <div style={wrap}>
        <div
          style={{
            ...frameRingBase,
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
            ...coreBase,
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
      <div style={wrap}>
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
        <div style={{ ...coreBase, background: "#111", zIndex: 3 }}>
          {avatarIcon("#ff8c00")}
        </div>
        {online}
      </div>
    );

  if (frameKey === "galaxy")
    return (
      <div style={wrap}>
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
        <div
          style={{
            ...frameRingBase,
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
        <div
          style={{
            ...frameRingBase,
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
        <div style={{ ...coreBase, background: "#06021a", zIndex: 3 }}>
          {avatarIcon("#a78bfa")}
        </div>
        {online}
      </div>
    );

  // default
  return (
    <div style={wrap}>
      <div
        style={{
          ...frameRingBase,
          inset: -7,
          border: "2px dashed rgba(255,106,0,0.45)",
          animation: "defaultRingSpin 9s linear infinite",
        }}
      />
      <div
        style={{
          ...frameRingBase,
          inset: -14,
          border: "1px dotted rgba(255,106,0,0.2)",
          animation: "defaultRingSpin 15s linear infinite reverse",
        }}
      />
      <div style={coreBase}>{avatarIcon("#FF6A00")}</div>
      {online}
    </div>
  );
}

// ── Frame label pill color per frame ─────────────────────────
const FRAME_META = {
  default: {
    label: "Default",
    color: "#888",
    bg: "rgba(136,136,136,0.1)",
    border: "rgba(136,136,136,0.25)",
  },
  blue_glow: {
    label: "Blue Glow",
    color: "#38bdf8",
    bg: "rgba(56,189,248,0.08)",
    border: "rgba(56,189,248,0.3)",
  },
  orange_pulse: {
    label: "Orange Pulse",
    color: "#FF6A00",
    bg: "rgba(255,106,0,0.08)",
    border: "rgba(255,106,0,0.3)",
  },
  fire: {
    label: "Fire 🔥",
    color: "#ff4500",
    bg: "rgba(255,69,0,0.08)",
    border: "rgba(255,69,0,0.3)",
  },
  galaxy: {
    label: "Galaxy ✨",
    color: "#a78bfa",
    bg: "rgba(124,58,237,0.08)",
    border: "rgba(124,58,237,0.3)",
  },
};

// ── Main ─────────────────────────────────────────────────────
export default function PublicProfilePage() {
  const { userName } = useParams();
  const navigate = useNavigate();
  const currentUserId = localStorage.getItem("authUserId");

  const [profile, setProfile] = useState(null);
  const [liked, setLiked] = useState(false);
  const [visibleBadges, setVisibleBadges] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    axios
      .get(`${BASE_URL}/api/users/profile/username/${userName}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(async (res) => {
        const data = res.data;
        const uid = Number(currentUserId);
        await trackProfileView(data.authUserId, uid);
        if (uid !== data.authUserId)
          data.profileViews = (data.profileViews || 0) + 1;
        setProfile(data);
        if (data.likedUserIds?.includes(uid)) setLiked(true);
        (data.badges || []).forEach((_, i) => {
          setTimeout(
            () => setVisibleBadges((prev) => [...prev, i]),
            100 + i * 80,
          );
        });
      })
      .catch(console.error);
  }, [userName]);

  if (!profile) {
    return (
      <div
        style={{
          background: "#080808",
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: "50%",
            border: "2px solid rgba(255,106,0,0.2)",
            borderTopColor: "#FF6A00",
            animation: "spin 0.9s linear infinite",
          }}
        />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  const isOwn = Number(currentUserId) === profile.authUserId;
  const frameKey = profile.currentFrame || "default";
  const frameMeta = FRAME_META[frameKey] || FRAME_META.default;

  return (
    <>
      <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;600;700;800&family=DM+Sans:wght@400;500;600&display=swap');

                @keyframes spin            { to { transform:rotate(360deg); } }
                @keyframes fadeUp          { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
                @keyframes floatAvatar     { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-5px)} }
                @keyframes scanLine        { 0%{top:-10%} 100%{top:110%} }
                @keyframes badgeIn         { from{opacity:0;transform:translateX(-10px)} to{opacity:1;transform:translateX(0)} }
                @keyframes glowPulse       { 0%,100%{opacity:0.6} 50%{opacity:1} }
                @keyframes logoShimmer     { 0%{background-position:200% center} 100%{background-position:-200% center} }
                @keyframes particleDrift   { 0%{opacity:.9;transform:translate(0,0)} 100%{opacity:0;transform:var(--pxy)} }

                @keyframes defaultRingSpin { to{transform:rotate(360deg)} }

                @keyframes blueGlowPulse {
                    0%,100%{box-shadow:0 0 0 3px rgba(56,189,248,.4),0 0 20px 6px rgba(56,189,248,.25)}
                    50%    {box-shadow:0 0 0 5px rgba(56,189,248,.7),0 0 35px 12px rgba(56,189,248,.5)}
                }
                @keyframes blueRingSpin    { to{transform:rotate(360deg)} }

                @keyframes orangePulseRing {
                    0%,100%{box-shadow:0 0 0 3px rgba(255,106,0,.5),0 0 20px 6px rgba(255,106,0,.3)}
                    50%    {box-shadow:0 0 0 6px rgba(255,106,0,.8),0 0 40px 14px rgba(255,106,0,.55)}
                }
                @keyframes orangeRingSpin  { to{transform:rotate(360deg)} }

                @keyframes fireBorder  { 0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%} }
                @keyframes fireFlicker { 0%,100%{opacity:1;transform:scaleY(1)} 30%{opacity:.85;transform:scaleY(.97)} 60%{opacity:.95;transform:scaleY(1.02)} }
                @keyframes fireParticle{ 0%{transform:translateY(0) scale(1);opacity:1} 100%{transform:translateY(-28px) scale(.3);opacity:0} }

                @keyframes galaxyRotate { to{transform:rotate(360deg)} }

                .like-btn:hover  { filter:brightness(1.15); transform:translateY(-1px); }
                .badge-row:hover { background:rgba(255,106,0,0.08) !important; transform:translateX(4px); }
                .stat-col:hover  { background:rgba(255,106,0,0.05) !important; }
                .back-btn:hover  { background:rgba(255,255,255,0.08) !important; }
            `}</style>

      <div style={S.page}>
        {/* Ambient glow */}
        <div style={S.ambientGlow} aria-hidden />

        {/* Scanline */}
        <div style={S.scan} aria-hidden />

        {/* Particles */}
        {[
          {
            left: "10%",
            top: "60%",
            dx: "-16px",
            dy: "-42px",
            dur: "3.2s",
            del: ".2s",
          },
          {
            left: "80%",
            top: "50%",
            dx: "12px",
            dy: "-48px",
            dur: "2.8s",
            del: ".9s",
          },
          {
            left: "45%",
            top: "78%",
            dx: "-6px",
            dy: "-52px",
            dur: "3.6s",
            del: "1.4s",
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
              zIndex: 0,
            }}
          />
        ))}

        {/* SqueezeFeed logo */}
        <div style={S.sfLogo}>
          <SqueezeMark size={13} />
          <span>
            Squeeze<span style={{ color: "#FF6A00" }}>Feed</span>
          </span>
        </div>

        {/* Back button */}
        <button
          className="back-btn"
          style={S.backBtn}
          onClick={() => navigate(-1)}
        >
          ←
        </button>

        {/* ── Hero ── */}
        <div style={S.hero}>
          <div
            style={{
              animation: "floatAvatar 4s ease-in-out infinite",
              marginBottom: 18,
            }}
          >
            <AvatarFrame frameKey={frameKey} />
          </div>

          <h1 style={S.name}>{profile.fullName}</h1>
          <div style={S.userName}>@{profile.userName}</div>

          {/* Frame pill */}
          <div
            style={{
              ...S.framePill,
              background: frameMeta.bg,
              borderColor: frameMeta.border,
            }}
          >
            <div
              style={{
                ...S.frameDot,
                background: frameMeta.color,
                boxShadow: `0 0 6px ${frameMeta.color}`,
                animation: "glowPulse 2s infinite",
              }}
            />
            <span style={{ ...S.frameText, color: frameMeta.color }}>
              {frameMeta.label}
            </span>
          </div>

          {/* Like button — only for other users */}
          {!isOwn && (
            <button
              className="like-btn"
              disabled={liked}
              style={{
                ...S.likeBtn,
                background: liked ? "rgba(255,255,255,0.06)" : "#FF6A00",
                color: liked ? "#555" : "#fff",
                cursor: liked ? "default" : "pointer",
                marginTop: 14,
              }}
              onClick={async () => {
                try {
                  await likePublicProfile(profile.authUserId, currentUserId);
                  setLiked(true);
                  setProfile((prev) => ({
                    ...prev,
                    profileLikes: prev.profileLikes + 1,
                  }));
                } catch (err) {
                  console.error(err);
                }
              }}
            >
              {liked ? "❤️ Appreciated" : "🤍 Appreciate"}
            </button>
          )}
        </div>

        {/* ── Stats (read-only, no saved/interests/frame section) ── */}
        <div style={S.statsRow}>
          {[
            { n: profile.articlesRead || 0, l: "Reads" },
            { n: profile.totalComments || 0, l: "Comments" },
            { n: profile.totalShares || 0, l: "Shares" },
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
          <div style={S.sectionTitle}>Badges</div>

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
            <div style={S.emptyBadges}>
              <span style={{ fontSize: 28 }}>🎯</span>
              <span style={{ fontSize: 13, color: "#333", marginTop: 8 }}>
                No badges yet
              </span>
            </div>
          )}
        </div>

        <div style={{ height: 120 }} />
      </div>

      <BottomNav />
    </>
  );
}

// ── Styles ───────────────────────────────────────────────────
const S = {
  page: {
    minHeight: "100vh",
    background: "#080808",
    fontFamily: "'DM Sans',sans-serif",
    position: "relative",
    overflow: "hidden",
    animation: "fadeUp 0.4s ease",
  },
  ambientGlow: {
    position: "fixed",
    top: 0,
    left: "50%",
    transform: "translateX(-50%)",
    width: 300,
    height: 300,
    borderRadius: "50%",
    background:
      "radial-gradient(circle,rgba(255,106,0,0.07) 0%,transparent 70%)",
    pointerEvents: "none",
    zIndex: 0,
  },
  scan: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 2,
    pointerEvents: "none",
    zIndex: 1,
    background:
      "linear-gradient(90deg,transparent,rgba(255,106,0,0.25),transparent)",
    animation: "scanLine 5s linear infinite",
  },

  // Logo
  sfLogo: {
    position: "absolute",
    top: 16,
    left: 20,
    zIndex: 10,
    display: "flex",
    alignItems: "center",
    gap: 5,
    fontFamily: "'Space Grotesk',sans-serif",
    fontSize: 14,
    fontWeight: 800,
    letterSpacing: "-0.3px",
    background: "linear-gradient(90deg,#fff 30%,#FF6A00 60%,#fff 90%)",
    backgroundSize: "200% auto",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    animation: "logoShimmer 3s linear infinite",
  },

  // Back button
  backBtn: {
    position: "absolute",
    top: 16,
    right: 20,
    zIndex: 10,
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    color: "#fff",
    width: 40,
    height: 40,
    borderRadius: "50%",
    cursor: "pointer",
    fontSize: 18,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "background 0.2s",
  },

  // Hero
  hero: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "64px 24px 32px",
    background: "linear-gradient(180deg,#141008 0%,#080808 100%)",
    borderBottom: "1px solid rgba(255,106,0,0.08)",
    position: "relative",
    zIndex: 2,
  },
  name: {
    fontFamily: "'Space Grotesk',sans-serif",
    fontSize: 22,
    fontWeight: 800,
    letterSpacing: "-0.3px",
    margin: "0 0 5px",
    background: "linear-gradient(135deg,#fff 40%,#FF6A00)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  userName: {
    color: "#FF6A00",
    fontSize: 13,
    fontWeight: 600,
    marginBottom: 14,
  },
  framePill: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    borderRadius: 999,
    padding: "5px 14px",
    border: "1px solid",
  },
  frameDot: { width: 6, height: 6, borderRadius: "50%" },
  frameText: {
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: "0.1em",
    textTransform: "uppercase",
  },
  likeBtn: {
    border: "none",
    borderRadius: 999,
    padding: "9px 20px",
    fontWeight: 700,
    fontSize: 13,
    letterSpacing: "0.02em",
    fontFamily: "'DM Sans',sans-serif",
    transition: "filter 0.2s, transform 0.2s",
  },

  // Stats
  statsRow: {
    display: "grid",
    gridTemplateColumns: "repeat(5,1fr)",
    borderTop: "1px solid rgba(255,255,255,0.04)",
    borderBottom: "1px solid rgba(255,255,255,0.04)",
    position: "relative",
    zIndex: 2,
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
  },
  statNum: {
    fontFamily: "'Space Grotesk',sans-serif",
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

  // Badges
  section: { padding: "24px 20px 0", position: "relative", zIndex: 2 },
  sectionTitle: {
    fontFamily: "'Space Grotesk',sans-serif",
    color: "#fff",
    fontSize: 16,
    fontWeight: 700,
    marginBottom: 14,
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  badgeRow: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "14px 16px",
    borderRadius: 12,
    border: "1px solid",
    background: "rgba(255,255,255,0.02)",
  },
  emptyBadges: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: 24,
    border: "1px dashed rgba(255,255,255,0.06)",
    borderRadius: 12,
  },
};
