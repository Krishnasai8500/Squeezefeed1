import { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../components/navbar";
import confetti from "canvas-confetti";

const BASE_URL = "https://api.squeezefeed.com";

// ── Confetti helper ──────────────────────────────────────────
const fireConfetti = () => {
  const canvas = document.createElement("canvas");
  canvas.style.position = "fixed";
  canvas.style.inset = "0";
  canvas.style.width = "100%";
  canvas.style.height = "100%";
  canvas.style.zIndex = "999999999";
  canvas.style.pointerEvents = "none";
  document.body.appendChild(canvas);

  const myConfettiOnCanvas = confetti.create(canvas, {
    resize: true,
    useWorker: false,
  });

  myConfettiOnCanvas({
    particleCount: 200,
    spread: 120,
    startVelocity: 40,
    origin: { y: 0.6 },
  });

  setTimeout(() => {
    canvas.remove();
  }, 3000);
};

// ── Popup component ──────────────────────────────────────────
function BadgeUnlockPopup({ badge, onClaim }) {
  if (!badge) return null;

  return (
    <>
      <style>{`
                @keyframes popupScale {
                    from { transform: scale(0.8); opacity: 0; }
                    to   { transform: scale(1);   opacity: 1; }
                }
            `}</style>

      <div style={popupStyles.overlay}>
        <div style={popupStyles.popup}>
          <div style={popupStyles.glow} />
          <div style={popupStyles.icon}>🏆</div>
          <h1 style={popupStyles.title}>Badge Unlocked!</h1>
          <h2 style={popupStyles.badgeName}>{badge}</h2>
          <p style={popupStyles.text}>Your progression just evolved.</p>
          <button
            style={popupStyles.button}
            onClick={() => {
              fireConfetti();
              setTimeout(() => onClaim(), 2500);
            }}
          >
            Claim Badge
          </button>
        </div>
      </div>
    </>
  );
}

// ── Main Page ────────────────────────────────────────────────
export default function BadgesPage() {
  const [badges, setBadges] = useState([]);
  const [profile, setProfile] = useState(null);
  const [claimingBadge, setClaimingBadge] = useState(null); // { key, title }

  useEffect(() => {
    const token = localStorage.getItem("token");
    const authUserId = localStorage.getItem("authUserId");

    axios
      .get(`${BASE_URL}/api/users/badges`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setBadges(res.data || []));

    axios
      .get(`${BASE_URL}/api/users/profile/${authUserId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setProfile(res.data));
  }, []);

  // Called after user clicks "Claim Badge" in popup
  const handleClaim = async () => {
    if (!claimingBadge) return;

    const token = localStorage.getItem("token");

    await axios.put(
      `${BASE_URL}/api/users/claim-badge/${profile.authUserId}/${claimingBadge.key}`,
      {},
      { headers: { Authorization: `Bearer ${token}` } },
    );

    localStorage.removeItem("hasPendingBadges");
    localStorage.removeItem("achievementPopup");

    setClaimingBadge(null);
    window.location.reload();
  };

  if (!profile) {
    return <div style={styles.loading}>Loading badges...</div>;
  }

  return (
    <div style={styles.page}>
      <Navbar />

      <div style={styles.container}>
        <button style={styles.backButton} onClick={() => window.history.back()}>
          ← Back
        </button>

        <h1 style={styles.heading}>🏆 Badge Collection</h1>

        <div style={styles.grid}>
          {badges.map((badge) => {
            const unlocked = profile.badges?.includes(badge.key);
            const pending = profile.pendingBadges?.includes(badge.key);

            return (
              <div
                key={badge.key}
                style={
                  unlocked
                    ? styles.unlockedCard
                    : pending
                      ? styles.pendingCard
                      : styles.lockedCard
                }
              >
                <div style={styles.icon}>{unlocked ? "🏆" : "🔒"}</div>

                <h2 style={styles.title}>{badge.title}</h2>
                <p style={styles.description}>{badge.description}</p>

                {unlocked ? (
                  <p style={styles.unlocked}>Unlocked</p>
                ) : pending ? (
                  <button
                    style={styles.claimButton}
                    onClick={() =>
                      setClaimingBadge({
                        key: badge.key,
                        title: badge.title,
                      })
                    }
                  >
                    🎁 Claim
                  </button>
                ) : (
                  <p style={styles.locked}>Locked</p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Popup — only mounts when claimingBadge is set */}
      <BadgeUnlockPopup badge={claimingBadge?.title} onClaim={handleClaim} />
    </div>
  );
}

// ── Page styles ──────────────────────────────────────────────
const styles = {
  page: { background: "#0f0f0f", minHeight: "100vh" },
  container: { padding: "24px" },
  heading: { color: "#fff", marginBottom: "24px" },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
    gap: "20px",
  },
  unlockedCard: {
    background: "#181818",
    border: "2px solid #ff9500",
    borderRadius: "18px",
    padding: "20px",
    textAlign: "center",
  },
  lockedCard: {
    background: "#111",
    border: "1px solid #333",
    borderRadius: "18px",
    padding: "20px",
    textAlign: "center",
    opacity: 0.5,
  },
  pendingCard: {
    background: "#181818",
    border: "2px solid #00ff99",
    borderRadius: "18px",
    padding: "20px",
    textAlign: "center",
    boxShadow: "0 0 20px rgba(0,255,153,0.35)",
  },
  icon: { fontSize: "40px" },
  title: { color: "#fff", marginTop: "14px" },
  description: {
    color: "#999",
    marginTop: "12px",
    fontSize: "14px",
    lineHeight: "1.5",
  },
  unlocked: { color: "#ff9500", marginTop: "16px", fontWeight: "bold" },
  locked: { color: "#666", marginTop: "16px" },
  loading: {
    background: "#000",
    color: "#fff",
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  backButton: {
    background: "transparent",
    color: "#fff",
    border: "none",
    fontSize: "16px",
    cursor: "pointer",
    marginBottom: "20px",
  },
  claimButton: {
    marginTop: "16px",
    background: "#00ff99",
    color: "#000",
    border: "none",
    padding: "10px 16px",
    borderRadius: "12px",
    fontWeight: "bold",
    cursor: "pointer",
  },
};

// ── Popup styles ─────────────────────────────────────────────
const popupStyles = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.7)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 99999,
  },
  popup: {
    position: "relative",
    width: "90%",
    maxWidth: "420px",
    background: "#181818",
    borderRadius: "24px",
    padding: "32px",
    textAlign: "center",
    overflow: "hidden",
    animation: "popupScale 0.4s ease",
  },
  glow: {
    position: "absolute",
    inset: "-30%",
    background:
      "radial-gradient(circle, rgba(255,149,0,0.35), transparent 70%)",
    zIndex: 0,
  },
  icon: { position: "relative", zIndex: 1, fontSize: "64px" },
  title: { position: "relative", zIndex: 1, color: "#fff", marginTop: "16px" },
  badgeName: {
    position: "relative",
    zIndex: 1,
    color: "#ff9500",
    marginTop: "12px",
  },
  text: { position: "relative", zIndex: 1, color: "#aaa", marginTop: "14px" },
  button: {
    position: "relative",
    zIndex: 1,
    marginTop: "24px",
    width: "100%",
    background: "#ff9500",
    color: "#000",
    border: "none",
    padding: "14px",
    borderRadius: "12px",
    fontWeight: "bold",
    fontSize: "16px",
    cursor: "pointer",
  },
};
