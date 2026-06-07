import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Geolocation } from "@capacitor/geolocation";

const BASE_URL = "https://api.nxtbharat.com";

const LANGUAGES = ["ENGLISH", "TELUGU"];

const CATEGORIES = [
  {
    id: "politics",
    emoji: "🏛️",
    label: "Politics",
    color: "#ff6b6b",
    glow: "rgba(255,107,107,0.4)",
  },
  {
    id: "business",
    emoji: "📈",
    label: "Business",
    color: "#4ecdc4",
    glow: "rgba(78,205,196,0.4)",
  },
  {
    id: "technology",
    emoji: "💻",
    label: "Technology",
    color: "#a29bfe",
    glow: "rgba(162,155,254,0.4)",
  },
  {
    id: "sports",
    emoji: "🏏",
    label: "Sports",
    color: "#fd79a8",
    glow: "rgba(253,121,168,0.4)",
  },
  {
    id: "entertainment",
    emoji: "🎬",
    label: "Entertainment",
    color: "#fdcb6e",
    glow: "rgba(253,203,110,0.4)",
  },
  {
    id: "health",
    emoji: "🏥",
    label: "Health",
    color: "#55efc4",
    glow: "rgba(85,239,196,0.4)",
  },
  {
    id: "science",
    emoji: "🔬",
    label: "Science",
    color: "#74b9ff",
    glow: "rgba(116,185,255,0.4)",
  },
  {
    id: "international",
    emoji: "🌍",
    label: "International",
    color: "#e17055",
    glow: "rgba(225,112,85,0.4)",
  },
  {
    id: "crime",
    emoji: "⚖️",
    label: "Crime",
    color: "#b2bec3",
    glow: "rgba(178,190,195,0.4)",
  },
  {
    id: "education",
    emoji: "🎓",
    label: "Education",
    color: "#6c5ce7",
    glow: "rgba(108,92,231,0.4)",
  },
  {
    id: "lifestyle",
    emoji: "✨",
    label: "Lifestyle",
    color: "#ff7675",
    glow: "rgba(255,118,117,0.4)",
  },
  {
    id: "general",
    emoji: "📰",
    label: "General",
    color: "#FF6A00",
    glow: "rgba(255,106,0,0.4)",
  },
];

const INDIAN_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Dadra and Nagar Haveli",
  "Daman and Diu",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Lakshadweep",
  "Puducherry",
];

function showToast(msg, type = "error") {
  const existing = document.getElementById("sf-toast");
  if (existing) existing.remove();
  const t = document.createElement("div");
  t.id = "sf-toast";
  t.textContent = msg;
  Object.assign(t.style, {
    position: "fixed",
    bottom: "32px",
    left: "50%",
    transform: "translateX(-50%) translateY(20px)",
    background: type === "error" ? "#ff4444" : "#00c896",
    color: "#fff",
    padding: "12px 24px",
    borderRadius: "12px",
    fontSize: "13px",
    fontWeight: "600",
    zIndex: 9999,
    boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
    transition: "all 0.3s ease",
    opacity: "0",
    fontFamily: "'DM Sans', sans-serif",
  });
  document.body.appendChild(t);
  requestAnimationFrame(() => {
    t.style.opacity = "1";
    t.style.transform = "translateX(-50%) translateY(0)";
  });
  setTimeout(() => {
    t.style.opacity = "0";
    t.style.transform = "translateX(-50%) translateY(20px)";
    setTimeout(() => t.remove(), 300);
  }, 3000);
}

// ─── Permission Explain Modal ─────────────────────────────────────────────────
function LocationPermissionModal({ onAllow, onDeny }) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        background: "rgba(0,0,0,0.75)",
        backdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        animation: "fadeIn 0.2s ease both",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "520px",
          background: "#141414",
          borderRadius: "24px 24px 0 0",
          padding: "28px 24px 40px",
          border: "1px solid rgba(255,255,255,0.08)",
          borderBottom: "none",
          animation: "slideUp 0.35s cubic-bezier(0.22,1,0.36,1) both",
        }}
      >
        {/* Handle bar */}
        <div
          style={{
            width: "40px",
            height: "4px",
            background: "rgba(255,255,255,0.12)",
            borderRadius: "2px",
            margin: "0 auto 24px",
          }}
        />

        {/* Icon */}
        <div
          style={{
            width: "64px",
            height: "64px",
            borderRadius: "20px",
            background: "rgba(85,239,196,0.1)",
            border: "1.5px solid rgba(85,239,196,0.25)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "28px",
            margin: "0 auto 20px",
          }}
        >
          📍
        </div>

        <h2
          style={{
            fontFamily: "'Syne', sans-serif",
            fontSize: "20px",
            fontWeight: "800",
            color: "#fff",
            textAlign: "center",
            marginBottom: "10px",
            letterSpacing: "-0.02em",
          }}
        >
          Allow Location Access?
        </h2>

        <p
          style={{
            fontSize: "13px",
            color: "#666",
            textAlign: "center",
            lineHeight: "1.6",
            marginBottom: "28px",
            maxWidth: "300px",
            margin: "0 auto 28px",
          }}
        >
          SqueezeFeed wants to use your location to show you{" "}
          <strong style={{ color: "#aaa" }}>local news</strong> relevant to your
          area.
        </p>

        {/* What we use it for */}
        <div
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: "14px",
            padding: "14px 16px",
            marginBottom: "20px",
            display: "flex",
            flexDirection: "column",
            gap: "10px",
          }}
        >
          {[
            { icon: "📰", text: "Show news from your city & state" },
            { icon: "🔒", text: "Location is never stored or shared" },
            { icon: "⚙️", text: "You can change this anytime in settings" },
          ].map(({ icon, text }) => (
            <div
              key={text}
              style={{ display: "flex", alignItems: "center", gap: "10px" }}
            >
              <span style={{ fontSize: "15px" }}>{icon}</span>
              <span style={{ fontSize: "12px", color: "#555" }}>{text}</span>
            </div>
          ))}
        </div>

        {/* Buttons */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <button
            onClick={onAllow}
            style={{
              width: "100%",
              padding: "15px",
              borderRadius: "14px",
              border: "none",
              background: "linear-gradient(135deg,#55efc4,#00b894)",
              color: "#000",
              fontSize: "15px",
              fontWeight: "700",
              fontFamily: "'Syne', sans-serif",
              cursor: "pointer",
              letterSpacing: "0.02em",
            }}
          >
            Allow Location Access
          </button>
          <button
            onClick={onDeny}
            style={{
              width: "100%",
              padding: "14px",
              borderRadius: "14px",
              border: "1.5px solid rgba(255,255,255,0.07)",
              background: "transparent",
              color: "#444",
              fontSize: "14px",
              fontWeight: "600",
              fontFamily: "'DM Sans', sans-serif",
              cursor: "pointer",
            }}
          >
            Not now
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Denied Instructions Modal ────────────────────────────────────────────────
function LocationDeniedModal({ onClose, onManual }) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        background: "rgba(0,0,0,0.75)",
        backdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        animation: "fadeIn 0.2s ease both",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "520px",
          background: "#141414",
          borderRadius: "24px 24px 0 0",
          padding: "28px 24px 40px",
          border: "1px solid rgba(255,255,255,0.08)",
          borderBottom: "none",
          animation: "slideUp 0.35s cubic-bezier(0.22,1,0.36,1) both",
        }}
      >
        <div
          style={{
            width: "40px",
            height: "4px",
            background: "rgba(255,255,255,0.12)",
            borderRadius: "2px",
            margin: "0 auto 24px",
          }}
        />

        <div
          style={{
            width: "64px",
            height: "64px",
            borderRadius: "20px",
            background: "rgba(255,68,68,0.1)",
            border: "1.5px solid rgba(255,68,68,0.25)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "28px",
            margin: "0 auto 20px",
          }}
        >
          🚫
        </div>

        <h2
          style={{
            fontFamily: "'Syne', sans-serif",
            fontSize: "20px",
            fontWeight: "800",
            color: "#fff",
            textAlign: "center",
            marginBottom: "10px",
            letterSpacing: "-0.02em",
          }}
        >
          Location Blocked
        </h2>

        <p
          style={{
            fontSize: "13px",
            color: "#666",
            textAlign: "center",
            lineHeight: "1.6",
            margin: "0 auto 24px",
            maxWidth: "300px",
          }}
        >
          You've blocked location access. To enable it, open your browser
          settings and allow location for this site.
        </p>

        {/* Steps */}
        <div
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: "14px",
            padding: "14px 16px",
            marginBottom: "20px",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}
        >
          {[
            { step: "1", text: "Open browser Settings / Site Settings" },
            { step: "2", text: "Find 'Location' or 'Permissions'" },
            { step: "3", text: "Set this site to 'Allow'" },
            { step: "4", text: "Come back and try again" },
          ].map(({ step, text }) => (
            <div
              key={step}
              style={{ display: "flex", alignItems: "center", gap: "12px" }}
            >
              <div
                style={{
                  width: "22px",
                  height: "22px",
                  borderRadius: "50%",
                  background: "rgba(255,68,68,0.15)",
                  border: "1px solid rgba(255,68,68,0.3)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "11px",
                  fontWeight: "700",
                  color: "#ff6b6b",
                  flexShrink: 0,
                }}
              >
                {step}
              </div>
              <span style={{ fontSize: "12px", color: "#555" }}>{text}</span>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <button
            onClick={onManual}
            style={{
              width: "100%",
              padding: "15px",
              borderRadius: "14px",
              border: "none",
              background: "linear-gradient(135deg,#FF6A00,#ff9a56)",
              color: "#000",
              fontSize: "15px",
              fontWeight: "700",
              fontFamily: "'Syne', sans-serif",
              cursor: "pointer",
            }}
          >
            Enter Location Manually
          </button>
          <button
            onClick={onClose}
            style={{
              width: "100%",
              padding: "14px",
              borderRadius: "14px",
              border: "1.5px solid rgba(255,255,255,0.07)",
              background: "transparent",
              color: "#444",
              fontSize: "14px",
              fontWeight: "600",
              fontFamily: "'DM Sans', sans-serif",
              cursor: "pointer",
            }}
          >
            Skip location
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function OnboardingPage() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [language, setLanguage] = useState("ENGLISH");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [notificationsEnabled, setNotificationsEnabled] = useState(null);

  // Location state
  const [locationMode, setLocationMode] = useState(null);
  const [locationStatus, setLocationStatus] = useState("idle");
  const [city, setCity] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [loading, setLoading] = useState(false);

  // Modal state
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [showDeniedModal, setShowDeniedModal] = useState(false);

  function toggleCategory(id) {
    setSelectedCategories((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id],
    );
  }

  function goToStep2() {
    if (selectedCategories.length < 3) {
      showToast("Select at least 3 interests", "error");
      return;
    }
    setStep(2);
  }

  // Step 1: Show our explain modal before triggering the browser prompt
  function handleGPSClick() {
    setShowPermissionModal(true);
  }

  // Step 2: User tapped "Allow" in our modal → now trigger native browser/OS prompt
  async function requestNativeLocation() {
    setShowPermissionModal(false);
    setLocationMode("gps");
    setLocationStatus("fetching");

    // Check if Permissions API is available (most modern browsers/Android)
    if (navigator.permissions) {
      try {
        const permResult = await navigator.permissions.query({
          name: "geolocation",
        });

        if (permResult.state === "denied") {
          // Already permanently denied — show instructions
          setLocationStatus("idle");
          setLocationMode(null);
          setShowDeniedModal(true);
          return;
        }
        // state === "granted" or "prompt" → proceed to getCurrentPosition
        // This will show the native OS allow/deny dialog on Android if state is "prompt"
      } catch {
        // Permissions API not supported — proceed anyway
      }
    }

    doGetCurrentPosition();
  }

  async function doGetCurrentPosition() {
    try {
      // This triggers native Android allow/deny dialog
      const permission = await Geolocation.requestPermissions();

      if (permission.location !== "granted") {
        setLocationStatus("idle");
        setLocationMode(null);
        setShowDeniedModal(true);
        return;
      }

      const pos = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 15000,
      });

      const { latitude, longitude } = pos.coords;
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
        { headers: { "Accept-Language": "en" } },
      );
      const data = await res.json();
      const detectedCity =
        data.address?.city ||
        data.address?.town ||
        data.address?.village ||
        data.address?.county ||
        "";
      const detectedState = data.address?.state || "";
      setCity(detectedCity);
      setSelectedState(detectedState);
      setLocationStatus("success");
    } catch (err) {
      setLocationStatus("idle");
      setLocationMode(null);
      setShowDeniedModal(true);
    }
  }

  function switchToManual() {
    setShowPermissionModal(false);
    setShowDeniedModal(false);
    setLocationMode("manual");
    setLocationStatus("idle");
    setCity("");
    setSelectedState("");
  }

  async function handleSubmit() {
    if (notificationsEnabled === null) {
      showToast("Please choose notification preference", "error");
      return;
    }
    const token = localStorage.getItem("token");
    const authUserId = localStorage.getItem("authUserId");
    if (!token || !authUserId) {
      showToast("Session expired. Please log in again.", "error");
      navigate("/login");
      return;
    }
    setLoading(true);
    try {
      await axios.put(
        `${BASE_URL}/api/users/profile/${authUserId}`,
        {
          language,
          preferredCategories: selectedCategories,
          subscriptionPlan: "FREE",
          notificationsEnabled,
          city: city.trim() || null,
          state: selectedState || null,
          country: "India",
          onboardingCompleted: true,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );
      localStorage.setItem("onboardingCompleted", "true");
      localStorage.setItem(
        "selectedLanguage",
        language.toLowerCase().substring(0, 2),
      );
      localStorage.removeItem("newUser");
      showToast("Feed is ready! 🎉", "success");
      setTimeout(() => navigate("/"), 800);
    } catch (err) {
      if (err?.response?.status === 401) {
        showToast("Session expired. Please log in again.", "error");
        localStorage.clear();
        navigate("/login");
      } else {
        showToast("Failed to complete onboarding. Please try again.", "error");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap');
                * { box-sizing: border-box; margin: 0; padding: 0; }

                @keyframes floatUp {
                    0%,100% { transform: translateY(0px) rotate(0deg); }
                    50%     { transform: translateY(-8px) rotate(2deg); }
                }
                @keyframes pulseRing {
                    0%   { transform: scale(1);    opacity: 0.6; }
                    70%  { transform: scale(1.35); opacity: 0; }
                    100% { transform: scale(1.35); opacity: 0; }
                }
                @keyframes orbitDot {
                    from { transform: rotate(0deg) translateX(28px) rotate(0deg); }
                    to   { transform: rotate(360deg) translateX(28px) rotate(-360deg); }
                }
                @keyframes shimmer {
                    0%   { background-position: -200% center; }
                    100% { background-position:  200% center; }
                }
                @keyframes fadeSlideIn {
                    from { opacity: 0; transform: translateY(28px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                @keyframes fadeSlideInRight {
                    from { opacity: 0; transform: translateX(28px); }
                    to   { opacity: 1; transform: translateX(0); }
                }
                @keyframes popIn {
                    0%  { transform: scale(0.7); opacity: 0; }
                    70% { transform: scale(1.1); }
                    100%{ transform: scale(1);   opacity: 1; }
                }
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
                @keyframes gpsPing {
                    0%,100% { box-shadow: 0 0 0 0 rgba(85,239,196,0.5); }
                    50%     { box-shadow: 0 0 0 14px rgba(85,239,196,0); }
                }
                @keyframes notifPulse {
                    0%,100% { box-shadow: 0 0 0 0 rgba(255,106,0,0.4); }
                    50%     { box-shadow: 0 0 0 12px rgba(255,106,0,0); }
                }
                @keyframes successBounce {
                    0%  { transform: scale(0.5); opacity: 0; }
                    70% { transform: scale(1.15); }
                    100%{ transform: scale(1); opacity: 1; }
                }
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to   { opacity: 1; }
                }
                @keyframes slideUp {
                    from { transform: translateY(100%); }
                    to   { transform: translateY(0); }
                }

                .ob-page {
                    min-height: 100vh;
                    background: #080808;
                    display: flex; justify-content: center; align-items: flex-start;
                    padding: 40px 16px 80px;
                    font-family: 'DM Sans', sans-serif;
                    overflow-x: hidden; position: relative;
                }
                .ob-page::before {
                    content:''; position:fixed; border-radius:50%; filter:blur(80px);
                    pointer-events:none; z-index:0;
                    width:400px; height:400px;
                    background:radial-gradient(circle,rgba(255,106,0,0.08),transparent 70%);
                    top:-100px; right:-100px;
                }
                .ob-wrap { width:100%; max-width:520px; position:relative; z-index:1; }

                /* Progress */
                .ob-progress { display:flex; align-items:center; gap:8px; margin-bottom:40px; }
                .ob-progress-track {
                    flex:1; height:3px;
                    background:rgba(255,255,255,0.06); border-radius:99px; overflow:hidden;
                }
                .ob-progress-fill {
                    height:100%; border-radius:99px;
                    background:linear-gradient(90deg,#FF6A00,#ff9a56);
                    transition: width 0.6s cubic-bezier(0.34,1.56,0.64,1);
                }
                .ob-step-label { font-size:11px; font-weight:700; color:#333; letter-spacing:0.1em; white-space:nowrap; }
                .ob-step-label.active { color:#FF6A00; }

                /* Header */
                .ob-header { margin-bottom:36px; }
                .ob-eyebrow {
                    font-size:11px; font-weight:700; letter-spacing:0.2em;
                    text-transform:uppercase; color:#FF6A00; margin-bottom:10px;
                    display:flex; align-items:center; gap:8px;
                }
                .ob-eyebrow::before { content:''; width:20px; height:2px; background:#FF6A00; border-radius:1px; }
                .ob-title {
                    font-family:'Syne',sans-serif;
                    font-size:clamp(28px,7vw,38px);
                    font-weight:800; color:#fff; line-height:1.1; letter-spacing:-0.03em;
                }
                .ob-title span {
                    background:linear-gradient(90deg,#FF6A00,#ff9a56,#FF6A00);
                    background-size:200% auto;
                    -webkit-background-clip:text; -webkit-text-fill-color:transparent;
                    animation:shimmer 2.5s linear infinite;
                }
                .ob-sub { color:#444; font-size:14px; margin-top:10px; line-height:1.5; }
                .ob-section-label {
                    font-size:11px; font-weight:700; letter-spacing:0.18em;
                    text-transform:uppercase; color:#333; margin-bottom:14px;
                }

                /* Language */
                .lang-row { display:flex; gap:10px; margin-bottom:36px; }
                .lang-pill {
                    flex:1; padding:12px 0; border-radius:14px;
                    font-family:'DM Sans',sans-serif; font-size:14px; font-weight:600;
                    cursor:pointer; border:1.5px solid rgba(255,255,255,0.07);
                    background:#111; color:#555; transition:all 0.2s ease; text-align:center;
                }
                .lang-pill.active {
                    border-color:#FF6A00; background:rgba(255,106,0,0.1); color:#FF6A00;
                    box-shadow:0 0 18px rgba(255,106,0,0.2);
                }

                /* Categories */
                .cat-grid {
                    display:grid; grid-template-columns:repeat(4,1fr);
                    gap:16px 8px; margin-bottom:36px;
                }
                @media(max-width:380px){ .cat-grid{ grid-template-columns:repeat(3,1fr); } }
                .cat-item { display:flex; flex-direction:column; align-items:center; gap:8px; cursor:pointer; user-select:none; }
                .cat-circle-wrap { position:relative; width:64px; height:64px; }
                .cat-circle-wrap::before {
                    content:''; position:absolute; inset:0; border-radius:50%;
                    border:2px solid var(--cat-color); opacity:0; transition:opacity 0.2s;
                }
                .cat-item.selected .cat-circle-wrap::before { opacity:1; animation:pulseRing 1.4s ease-out infinite; }
                .cat-orbit-dot {
                    position:absolute; top:50%; left:50%;
                    width:7px; height:7px; border-radius:50%;
                    background:var(--cat-color); margin:-3.5px;
                    opacity:0; transition:opacity 0.3s;
                }
                .cat-item.selected .cat-orbit-dot { opacity:1; animation:orbitDot 1.6s linear infinite; }
                .cat-circle {
                    width:64px; height:64px; border-radius:50%;
                    background:#111; border:2px solid rgba(255,255,255,0.06);
                    display:flex; align-items:center; justify-content:center; font-size:26px;
                    transition:all 0.25s cubic-bezier(0.34,1.56,0.64,1); position:relative; z-index:1;
                }
                .cat-item.selected .cat-circle {
                    border-color:var(--cat-color); background:var(--cat-bg);
                    box-shadow:0 0 20px var(--cat-glow),0 4px 16px rgba(0,0,0,0.4);
                    transform:scale(1.08); animation:floatUp 2.5s ease-in-out infinite;
                }
                .cat-item:not(.selected):hover .cat-circle { border-color:rgba(255,255,255,0.15); transform:scale(1.05); background:#161616; }
                .cat-check {
                    position:absolute; top:-2px; right:-2px; width:20px; height:20px;
                    border-radius:50%; background:var(--cat-color);
                    display:flex; align-items:center; justify-content:center;
                    font-size:10px; color:#000; font-weight:900; z-index:2;
                    animation:popIn 0.3s cubic-bezier(0.34,1.56,0.64,1) both;
                }
                .cat-label { font-size:11px; font-weight:600; color:#444; text-align:center; transition:color 0.2s; line-height:1.2; }
                .cat-item.selected .cat-label { color:#e0e0e0; }

                /* Counter */
                .counter-row { display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; }
                .counter-badge {
                    font-size:12px; font-weight:600; color:#FF6A00;
                    background:rgba(255,106,0,0.1); border:1px solid rgba(255,106,0,0.2);
                    padding:4px 12px; border-radius:999px; transition:all 0.2s;
                }
                .counter-hint { font-size:12px; color:#333; }

                /* CTA */
                .ob-cta {
                    width:100%; padding:16px; border-radius:16px; border:none;
                    font-family:'Syne',sans-serif; font-size:16px; font-weight:700;
                    letter-spacing:0.04em; cursor:pointer; transition:all 0.25s ease;
                    position:relative; overflow:hidden;
                    display:flex; align-items:center; justify-content:center; gap:8px;
                }
                .ob-cta.ready { background:linear-gradient(135deg,#FF6A00,#ff9a56); color:#000; box-shadow:0 8px 32px rgba(255,106,0,0.35); }
                .ob-cta.ready:hover { transform:translateY(-2px); box-shadow:0 12px 40px rgba(255,106,0,0.5); }
                .ob-cta.not-ready { background:#111; color:#333; border:1px solid rgba(255,255,255,0.05); cursor:not-allowed; }
                .ob-cta.loading { background:linear-gradient(135deg,#FF6A00,#ff9a56); color:#000; cursor:not-allowed; opacity:0.7; }
                .ob-spinner { width:18px; height:18px; border:2.5px solid rgba(0,0,0,0.3); border-top-color:#000; border-radius:50%; animation:spin 0.7s linear infinite; }

                /* Step animations */
                .s1-wrap { animation:fadeSlideIn 0.6s ease both; }
                .s2-wrap { animation:fadeSlideInRight 0.45s cubic-bezier(0.22,1,0.36,1) both; }

                /* Notification cards */
                .notif-cards { display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:36px; }
                .notif-card {
                    padding:20px 16px; border-radius:18px;
                    border:1.5px solid rgba(255,255,255,0.06);
                    background:#0f0f0f; cursor:pointer;
                    transition:all 0.25s cubic-bezier(0.34,1.56,0.64,1);
                    text-align:center; position:relative; overflow:hidden;
                }
                .notif-card::before {
                    content:''; position:absolute; top:0; left:0; right:0; height:1px;
                    background:linear-gradient(90deg,transparent,rgba(255,106,0,0.3),transparent);
                    opacity:0; transition:opacity 0.3s;
                }
                .notif-card.active { border-color:#FF6A00; background:rgba(255,106,0,0.07); box-shadow:0 0 32px rgba(255,106,0,0.15),inset 0 1px 0 rgba(255,106,0,0.1); transform:translateY(-2px); }
                .notif-card.active::before { opacity:1; }
                .notif-card:hover:not(.active) { border-color:rgba(255,255,255,0.12); transform:translateY(-1px); }
                .notif-card-icon { font-size:32px; margin-bottom:10px; display:block; }
                .notif-card.active .notif-card-icon { animation:notifPulse 2s ease-in-out infinite; }
                .notif-card-title { font-family:'Syne',sans-serif; font-size:14px; font-weight:700; color:#fff; margin-bottom:4px; }
                .notif-card.active .notif-card-title { color:#FF6A00; }
                .notif-card-desc { font-size:11px; color:#444; line-height:1.4; }

                /* Location section */
                .loc-options { display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:16px; }
                .loc-option-btn {
                    padding:18px 12px; border-radius:18px;
                    border:1.5px solid rgba(255,255,255,0.06);
                    background:#0f0f0f; cursor:pointer;
                    transition:all 0.25s cubic-bezier(0.34,1.56,0.64,1);
                    text-align:center; position:relative; overflow:hidden;
                    display:flex; flex-direction:column; align-items:center; gap:8px;
                }
                .loc-option-btn.active-gps { border-color:#55efc4; background:rgba(85,239,196,0.07); box-shadow:0 0 28px rgba(85,239,196,0.12); transform:translateY(-2px); }
                .loc-option-btn.active-manual { border-color:#FF6A00; background:rgba(255,106,0,0.07); box-shadow:0 0 28px rgba(255,106,0,0.12); transform:translateY(-2px); }
                .loc-option-btn:hover:not(.active-gps):not(.active-manual) { border-color:rgba(255,255,255,0.12); transform:translateY(-1px); }
                .loc-option-icon { font-size:28px; }
                .loc-option-title { font-family:'Syne',sans-serif; font-size:13px; font-weight:700; color:#fff; }
                .loc-option-btn.active-gps .loc-option-title { color:#55efc4; }
                .loc-option-btn.active-manual .loc-option-title { color:#FF6A00; }
                .loc-option-desc { font-size:10px; color:#444; line-height:1.3; }

                /* GPS status */
                .gps-status-box {
                    border-radius:14px; padding:14px 16px;
                    margin-bottom:16px;
                    display:flex; align-items:center; gap:12px;
                    animation:fadeSlideIn 0.3s ease both;
                }
                .gps-status-box.fetching { background:rgba(116,185,255,0.06); border:1px solid rgba(116,185,255,0.15); }
                .gps-status-box.success  { background:rgba(85,239,196,0.06); border:1px solid rgba(85,239,196,0.2); }
                .gps-status-box.error    { background:rgba(255,68,68,0.06);  border:1px solid rgba(255,68,68,0.2); }
                .gps-ping { width:10px; height:10px; border-radius:50%; flex-shrink:0; }
                .gps-ping.fetching { background:#74b9ff; animation:gpsPing 1.2s ease-in-out infinite; }
                .gps-ping.success  { background:#55efc4; animation:successBounce 0.4s ease both; }
                .gps-ping.error    { background:#ff4444; }
                .gps-status-text { font-size:13px; font-weight:500; flex:1; }
                .gps-status-text.fetching { color:#74b9ff; }
                .gps-status-text.success  { color:#55efc4; }
                .gps-status-text.error    { color:#ff6b6b; }
                .gps-detected-info { font-size:12px; color:#888; margin-top:2px; }

                /* Manual fields */
                .manual-fields { display:flex; flex-direction:column; gap:10px; margin-bottom:16px; animation:fadeSlideIn 0.3s ease both; }
                .sf-input-wrap { position:relative; }
                .sf-input-icon { position:absolute; left:14px; top:50%; transform:translateY(-50%); font-size:15px; pointer-events:none; }
                .sf-input {
                    width:100%; background:#0f0f0f;
                    border:1.5px solid rgba(255,255,255,0.06); border-radius:14px;
                    padding:14px 16px 14px 42px; color:#fff; font-size:14px;
                    font-family:'DM Sans',sans-serif; outline:none;
                    transition:all 0.2s ease; -webkit-appearance:none; appearance:none;
                }
                .sf-input::placeholder { color:#333; }
                .sf-input:focus { border-color:#FF6A00; background:rgba(255,106,0,0.04); box-shadow:0 0 0 3px rgba(255,106,0,0.08); }
                .sf-input option { background:#111; color:#fff; }

                /* Skip */
                .skip-loc-btn {
                    background:none; border:none; color:#333; font-size:12px;
                    font-family:'DM Sans',sans-serif; font-weight:600;
                    cursor:pointer; text-align:center; width:100%;
                    padding:8px; transition:color 0.2s; margin-bottom:20px;
                    display:block;
                }
                .skip-loc-btn:hover { color:#666; }

                /* Back */
                .ob-back {
                    background:none; border:none; color:#444; font-size:13px;
                    font-family:'DM Sans',sans-serif; font-weight:600; cursor:pointer;
                    display:flex; align-items:center; gap:6px;
                    padding:0; margin-bottom:32px; transition:color 0.2s; letter-spacing:0.02em;
                }
                .ob-back:hover { color:#fff; }
            `}</style>

      {/* ── Modals ── */}
      {showPermissionModal && (
        <LocationPermissionModal
          onAllow={requestNativeLocation}
          onDeny={() => setShowPermissionModal(false)}
        />
      )}
      {showDeniedModal && (
        <LocationDeniedModal
          onClose={() => setShowDeniedModal(false)}
          onManual={switchToManual}
        />
      )}

      <div className="ob-page">
        <div className="ob-wrap">
          {/* Progress bar */}
          <div className="ob-progress">
            <span className={`ob-step-label ${step === 1 ? "active" : ""}`}>
              Interests
            </span>
            <div className="ob-progress-track">
              <div
                className="ob-progress-fill"
                style={{ width: step === 1 ? "50%" : "100%" }}
              />
            </div>
            <span className={`ob-step-label ${step === 2 ? "active" : ""}`}>
              Permissions
            </span>
          </div>

          {/* ══════════ STEP 1 ══════════ */}
          {step === 1 && (
            <div className="s1-wrap">
              <div className="ob-header">
                <div className="ob-eyebrow">SqueezeFeed</div>
                <h1 className="ob-title">
                  Your feed,
                  <br />
                  <span>your rules.</span>
                </h1>
                <p className="ob-sub">Pick what matters to you</p>
              </div>

              <div className="ob-section-label">Language</div>
              <div className="lang-row">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang}
                    className={`lang-pill${language === lang ? " active" : ""}`}
                    onClick={() => setLanguage(lang)}
                  >
                    {lang === "ENGLISH" ? "🇬🇧 English" : "🇮🇳 Telugu"}
                  </button>
                ))}
              </div>

              <div className="counter-row">
                <div className="ob-section-label" style={{ margin: 0 }}>
                  Interests
                </div>
                <div
                  style={{ display: "flex", gap: "8px", alignItems: "center" }}
                >
                  {selectedCategories.length > 0 && (
                    <span className="counter-badge">
                      {selectedCategories.length} selected
                    </span>
                  )}
                  <span className="counter-hint">min 3</span>
                </div>
              </div>

              <div className="cat-grid">
                {CATEGORIES.map((cat, i) => {
                  const selected = selectedCategories.includes(cat.id);
                  return (
                    <div
                      key={cat.id}
                      className={`cat-item${selected ? " selected" : ""}`}
                      style={{
                        "--cat-color": cat.color,
                        "--cat-glow": cat.glow,
                        "--cat-bg": cat.glow.replace("0.4", "0.12"),
                        animationDelay: `${i * 0.05}s`,
                      }}
                      onClick={() => toggleCategory(cat.id)}
                    >
                      <div className="cat-circle-wrap">
                        <div className="cat-circle">{cat.emoji}</div>
                        {selected && (
                          <>
                            <div className="cat-check">✓</div>
                            <div className="cat-orbit-dot" />
                          </>
                        )}
                      </div>
                      <span className="cat-label">{cat.label}</span>
                    </div>
                  );
                })}
              </div>

              <button
                className={`ob-cta${selectedCategories.length >= 3 ? " ready" : " not-ready"}`}
                onClick={goToStep2}
              >
                {selectedCategories.length >= 3
                  ? "Continue →"
                  : `Select ${3 - selectedCategories.length} more to continue`}
              </button>
            </div>
          )}

          {/* ══════════ STEP 2 ══════════ */}
          {step === 2 && (
            <div className="s2-wrap">
              <button className="ob-back" onClick={() => setStep(1)}>
                ← Back
              </button>

              <div className="ob-header">
                <div className="ob-eyebrow">Almost there</div>
                <h1 className="ob-title">
                  Stay
                  <br />
                  <span>connected.</span>
                </h1>
                <p className="ob-sub">
                  Choose your preferences — you can change these anytime.
                </p>
              </div>

              {/* Notifications */}
              <div className="ob-section-label">Notifications</div>
              <div className="notif-cards">
                <div
                  className={`notif-card${notificationsEnabled === true ? " active" : ""}`}
                  onClick={() => setNotificationsEnabled(true)}
                >
                  <span className="notif-card-icon">🔔</span>
                  <div className="notif-card-title">Enable</div>
                  <div className="notif-card-desc">
                    Get breaking news instantly
                  </div>
                </div>
                <div
                  className={`notif-card${notificationsEnabled === false ? " active" : ""}`}
                  onClick={() => setNotificationsEnabled(false)}
                >
                  <span className="notif-card-icon">🔕</span>
                  <div className="notif-card-title">Not now</div>
                  <div className="notif-card-desc">Browse at your own pace</div>
                </div>
              </div>

              {/* Location */}
              <div className="ob-section-label">
                Location
                <span
                  style={{
                    color: "#333",
                    fontSize: "10px",
                    letterSpacing: "0.1em",
                    marginLeft: "8px",
                  }}
                >
                  — OPTIONAL
                </span>
              </div>

              <div className="loc-options">
                <div
                  className={`loc-option-btn${locationMode === "gps" ? " active-gps" : ""}`}
                  onClick={handleGPSClick}
                >
                  <span className="loc-option-icon">📍</span>
                  <span className="loc-option-title">Use GPS</span>
                  <span className="loc-option-desc">
                    Auto-detect my location
                  </span>
                </div>
                <div
                  className={`loc-option-btn${locationMode === "manual" ? " active-manual" : ""}`}
                  onClick={switchToManual}
                >
                  <span className="loc-option-icon">✏️</span>
                  <span className="loc-option-title">Enter Manually</span>
                  <span className="loc-option-desc">Type city & state</span>
                </div>
              </div>

              {/* GPS status feedback */}
              {locationMode === "gps" && locationStatus !== "idle" && (
                <div className={`gps-status-box ${locationStatus}`}>
                  <div className={`gps-ping ${locationStatus}`} />
                  <div style={{ flex: 1 }}>
                    <div className={`gps-status-text ${locationStatus}`}>
                      {locationStatus === "fetching" &&
                        "Detecting your location…"}
                      {locationStatus === "success" && "Location detected!"}
                      {locationStatus === "error" &&
                        "Could not detect location. Try manual."}
                    </div>
                    {locationStatus === "success" &&
                      (city || selectedState) && (
                        <div className="gps-detected-info">
                          📍 {[city, selectedState].filter(Boolean).join(", ")}
                          <span
                            style={{
                              color: "#FF6A00",
                              marginLeft: "10px",
                              cursor: "pointer",
                              fontSize: "11px",
                            }}
                            onClick={switchToManual}
                          >
                            Edit
                          </span>
                        </div>
                      )}
                  </div>
                </div>
              )}

              {/* Manual input fields */}
              {locationMode === "manual" && (
                <div className="manual-fields">
                  <div className="sf-input-wrap">
                    <span className="sf-input-icon">🏙️</span>
                    <input
                      className="sf-input"
                      placeholder="City (e.g. Hyderabad)"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                    />
                  </div>
                  <div className="sf-input-wrap">
                    <span className="sf-input-icon">📍</span>
                    <select
                      className="sf-input"
                      value={selectedState}
                      onChange={(e) => setSelectedState(e.target.value)}
                    >
                      <option value="">Select State</option>
                      {INDIAN_STATES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* Skip location */}
              {locationMode === null && (
                <button className="skip-loc-btn" onClick={handleSubmit}>
                  Skip location →
                </button>
              )}

              <button
                className={`ob-cta${loading ? " loading" : notificationsEnabled !== null ? " ready" : " not-ready"}`}
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="ob-spinner" /> Building your feed…
                  </>
                ) : notificationsEnabled !== null ? (
                  "Build My Feed →"
                ) : (
                  "Choose notification preference"
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
