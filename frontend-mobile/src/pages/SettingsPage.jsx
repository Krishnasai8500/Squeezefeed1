import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { showToast } from "../components/Toast";
const BASE_URL = "https://api.nxtbharat.com";

const LANGUAGES = [
  { value: "ENGLISH", flag: "🇮🇳", label: "English" },
  //     { value: "HINDI",   flag: "🇮🇳", label: "Hindi"   },
  { value: "TELUGU", flag: "🇮🇳", label: "Telugu" },
  //     { value: "TAMIL",   flag: "🇮🇳", label: "Tamil"   },
];

const CATEGORIES = [
  { value: "politics", icon: "🏛️", label: "Politics" },
  { value: "business", icon: "📈", label: "Business" },
  { value: "technology", icon: "💻", label: "Technology" },
  { value: "sports", icon: "🏏", label: "Sports" },
  { value: "entertainment", icon: "🎬", label: "Entertainment" },
  { value: "health", icon: "🏥", label: "Health" },
  { value: "science", icon: "🔬", label: "Science" },
  { value: "international", icon: "🌍", label: "International" },
  { value: "crime", icon: "⚖️", label: "Crime" },
  { value: "education", icon: "🎓", label: "Education" },
  { value: "lifestyle", icon: "✨", label: "Lifestyle" },
  { value: "general", icon: "📰", label: "General" },
];

function SqueezeMark({ size = 18 }) {
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

export default function SettingsPage() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const authUserId = localStorage.getItem("authUserId");

  const [language, setLanguage] = useState("ENGLISH");
  const [categories, setCategories] = useState([]);
  const [notifEnabled, setNotifEnabled] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState("preferences"); // preferences | account | about

  // ── Load current profile ──────────────────────────────────
  useEffect(() => {
    axios
      .get(`${BASE_URL}/api/users/profile/${authUserId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const p = res.data;
        setLanguage(p.language || "ENGLISH");
        setCategories(p.preferredCategories || []);
        setNotifEnabled(p.notificationsEnabled ?? true);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // ── Toggle category ───────────────────────────────────────
  function toggleCategory(val) {
    setCategories((prev) =>
      prev.includes(val) ? prev.filter((c) => c !== val) : [...prev, val],
    );
  }

  // ── Save settings ─────────────────────────────────────────
  async function handleSave() {
    if (categories.length < 3) {
      //             alert("Please select at least 3 interests.");
      showToast("Please select at least 3 interests", "error");
      return;
    }
    setSaving(true);
    try {
      await axios.put(
        `${BASE_URL}/api/users/profile/${authUserId}`,
        {
          language,
          preferredCategories: categories,
          subscriptionPlan: "FREE",
          notificationsEnabled: notifEnabled,
          authUserId: Number(authUserId),
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      // Update localStorage language
      localStorage.setItem(
        "selectedLanguage",
        language.toLowerCase().substring(0, 2),
      );

      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      console.error(err);
      //             alert("Failed to save settings. Please try again.");
      showToast("Failed to save settings. Please try again.", "error");
    } finally {
      setSaving(false);
    }
  }

  // ── Delete account ────────────────────────────────────────
  function handleDeleteAccount() {
    const confirmed = window.confirm(
      "Are you sure you want to delete your account? This cannot be undone.",
    );
    if (!confirmed) return;
    // Wire up your delete endpoint here when ready
    //         alert("Account deletion coming soon. Contact support.");
    showToast("Account deletion coming soon. Contact support.", "warning");
  }

  if (loading)
    return (
      <div style={S.loadingPage}>
        <div style={S.loadingRing} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );

  return (
    <>
      <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700;800&family=DM+Sans:wght@400;500;600&display=swap');
                @keyframes spin    { to { transform:rotate(360deg); } }
                @keyframes fadeUp  { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
                @keyframes toast   { 0%{opacity:0;transform:translateY(8px)} 20%,80%{opacity:1;transform:translateY(0)} 100%{opacity:0} }
                .cat-chip:hover    { border-color: rgba(255,106,0,0.5) !important; }
                .lang-btn:hover    { border-color: rgba(255,106,0,0.5) !important; }
                .tab-btn:hover     { color: #FF6A00 !important; }
                .save-btn:hover:not(:disabled) { filter: brightness(1.1); transform: translateY(-1px); }
                .toggle-wrap:hover { opacity: 0.85; }
            `}</style>

      <div style={S.page}>
        <div style={S.ambientGlow} />

        {/* ── Header ── */}
        <div style={S.header}>
          <button style={S.backBtn} onClick={() => navigate(-1)}>
            ←
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <SqueezeMark size={16} />
            <span style={S.headerTitle}>Settings</span>
          </div>
          <div style={{ width: "38px" }} />
        </div>

        {/* ── Tab row ── */}
        <div style={S.tabRow}>
          {["preferences", "account", "about"].map((tab) => (
            <button
              key={tab}
              className="tab-btn"
              onClick={() => setActiveTab(tab)}
              style={{
                ...S.tabBtn,
                ...(activeTab === tab ? S.tabBtnActive : {}),
              }}
            >
              {tab === "preferences" && "⚙️ "}
              {tab === "account" && "👤 "}
              {tab === "about" && "ℹ️ "}
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        <div style={S.container}>
          {/* ════════════════════════════
                        PREFERENCES TAB
                    ════════════════════════════ */}
          {activeTab === "preferences" && (
            <div style={{ animation: "fadeUp 0.4s ease" }}>
              {/* Language */}
              <div style={S.section}>
                <div style={S.sectionTitle}>🌐 Language</div>
                <div style={S.sectionSub}>
                  Choose your preferred reading language
                </div>
                <div style={S.langGrid}>
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang.value}
                      className="lang-btn"
                      onClick={() => setLanguage(lang.value)}
                      style={{
                        ...S.langBtn,
                        ...(language === lang.value ? S.langBtnActive : {}),
                      }}
                    >
                      <span style={{ fontSize: "20px" }}>{lang.flag}</span>
                      <span
                        style={{
                          fontSize: "13px",
                          fontWeight: "600",
                          color: language === lang.value ? "#FF6A00" : "#888",
                        }}
                      >
                        {lang.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div style={S.divider} />

              {/* Interests */}
              <div style={S.section}>
                <div style={S.sectionTitle}>🎯 Interests</div>
                <div style={S.sectionSub}>
                  Select at least 3 — currently {categories.length} selected
                </div>
                <div style={S.catGrid}>
                  {CATEGORIES.map((cat) => {
                    const selected = categories.includes(cat.value);
                    return (
                      <button
                        key={cat.value}
                        className="cat-chip"
                        onClick={() => toggleCategory(cat.value)}
                        style={{
                          ...S.catChip,
                          ...(selected ? S.catChipActive : {}),
                        }}
                      >
                        <span style={{ fontSize: "16px" }}>{cat.icon}</span>
                        <span
                          style={{
                            fontSize: "12px",
                            fontWeight: "600",
                            color: selected ? "#FF6A00" : "#666",
                          }}
                        >
                          {cat.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div style={S.divider} />

              {/* Notifications toggle */}
              <div style={S.section}>
                <div style={S.sectionTitle}>🔔 Notifications</div>
                <div style={S.toggleRow}>
                  <div>
                    <div style={S.toggleLabel}>In-app notifications</div>
                    <div style={S.toggleSub}>
                      Get notified about badges and achievements
                    </div>
                  </div>
                  <div
                    className="toggle-wrap"
                    style={{
                      ...S.toggle,
                      background: notifEnabled
                        ? "#FF6A00"
                        : "rgba(255,255,255,0.08)",
                    }}
                    onClick={() => setNotifEnabled((p) => !p)}
                  >
                    <div
                      style={{
                        ...S.toggleThumb,
                        transform: notifEnabled
                          ? "translateX(22px)"
                          : "translateX(2px)",
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Save button */}
              <button
                className="save-btn"
                onClick={handleSave}
                disabled={saving}
                style={{
                  ...S.saveBtn,
                  opacity: saving ? 0.7 : 1,
                }}
              >
                {saving ? (
                  <span style={S.miniSpinner} />
                ) : saved ? (
                  "✓ Saved!"
                ) : (
                  "Save Changes"
                )}
              </button>
            </div>
          )}

          {/* ════════════════════════════
                        ACCOUNT TAB
                    ════════════════════════════ */}
          {activeTab === "account" && (
            <div style={{ animation: "fadeUp 0.4s ease" }}>
              <div style={S.section}>
                <div style={S.sectionTitle}>👤 Account Info</div>
                <div style={S.infoCard}>
                  <div style={S.infoRow}>
                    <span style={S.infoKey}>User ID</span>
                    <span style={S.infoVal}>{authUserId}</span>
                  </div>
                  <div style={S.infoRow}>
                    <span style={S.infoKey}>Language</span>
                    <span style={S.infoVal}>{language}</span>
                  </div>
                  <div style={S.infoRow}>
                    <span style={S.infoKey}>Notifications</span>
                    <span
                      style={{
                        ...S.infoVal,
                        color: notifEnabled ? "#22c55e" : "#ef4444",
                      }}
                    >
                      {notifEnabled ? "Enabled" : "Disabled"}
                    </span>
                  </div>
                  <div style={S.infoRow}>
                    <span style={S.infoKey}>Plan</span>
                    <span style={{ ...S.infoVal, color: "#FF6A00" }}>FREE</span>
                  </div>
                </div>
              </div>

              <div style={S.divider} />

              {/* Logout */}
              <div style={S.section}>
                <div style={S.sectionTitle}>🔐 Session</div>
                <button
                  style={S.logoutBtn}
                  onClick={() => {
                    if (!window.confirm("Log out?")) return;
                    localStorage.clear();
                    navigate("/login");
                  }}
                >
                  Sign Out
                </button>
              </div>

              <div style={S.divider} />

              {/* Danger zone */}
              <div style={S.section}>
                <div style={{ ...S.sectionTitle, color: "#ef4444" }}>
                  ⚠️ Danger Zone
                </div>
                <div style={S.dangerCard}>
                  <div>
                    <div style={S.dangerTitle}>Delete Account</div>
                    <div style={S.dangerSub}>
                      Permanently delete your account and all data. This cannot
                      be undone.
                    </div>
                  </div>
                  <button style={S.deleteBtn} onClick={handleDeleteAccount}>
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ════════════════════════════
                        ABOUT TAB
                    ════════════════════════════ */}
          {activeTab === "about" && (
            <div style={{ animation: "fadeUp 0.4s ease" }}>
              <div style={S.aboutCard}>
                <div style={S.aboutLogo}>
                  <SqueezeMark size={32} />
                </div>
                <div style={S.aboutName}>
                  Squeeze<span style={{ color: "#FF6A00" }}>Feed</span>
                </div>
                <div style={S.aboutTagline}>
                  Squeeze the noise. Keep the signal.
                </div>
                <div style={S.aboutVersion}>Version 1.0.0</div>
              </div>

              <div style={S.linkList}>
                {[
                  { label: "Terms of Service", path: "/terms" },
                  { label: "Privacy Policy", path: "/privacy" },
                  { label: "About Us", path: "/about" },
                ].map((item) => (
                  <div
                    key={item.path}
                    style={S.linkRow}
                    onClick={() => navigate(item.path)}
                  >
                    <span style={S.linkLabel}>{item.label}</span>
                    <span style={S.linkArrow}>›</span>
                  </div>
                ))}
              </div>

              <div style={S.copyright}>
                © 2025 SqueezeFeed. All rights reserved.
              </div>
            </div>
          )}

          <div style={{ height: "80px" }} />
        </div>

        {/* ── Toast ── */}
        {saved && <div style={S.toast}>✓ Settings saved successfully</div>}
      </div>
    </>
  );
}

const S = {
  page: {
    minHeight: "100vh",
    background: "#0B0B0B",
    fontFamily: "'DM Sans', sans-serif",
    position: "relative",
    overflow: "hidden",
  },
  ambientGlow: {
    position: "fixed",
    top: "-60px",
    left: "50%",
    transform: "translateX(-50%)",
    width: "240px",
    height: "240px",
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
  },
  headerTitle: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: "17px",
    fontWeight: "800",
    color: "#fff",
    letterSpacing: "-0.3px",
  },

  // Tabs
  tabRow: {
    display: "flex",
    gap: "0",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
    background: "#0B0B0B",
    position: "sticky",
    top: "60px",
    zIndex: 99,
  },
  tabBtn: {
    flex: 1,
    padding: "14px 8px",
    background: "transparent",
    border: "none",
    color: "#444",
    fontSize: "12px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "color 0.2s",
    fontFamily: "'DM Sans', sans-serif",
    letterSpacing: "0.02em",
    borderBottom: "2px solid transparent",
  },
  tabBtnActive: {
    color: "#FF6A00",
    borderBottom: "2px solid #FF6A00",
  },

  container: {
    maxWidth: "480px",
    margin: "0 auto",
    padding: "24px 20px",
    position: "relative",
    zIndex: 1,
  },

  // Section
  section: { marginBottom: "8px" },
  sectionTitle: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: "15px",
    fontWeight: "700",
    color: "#fff",
    marginBottom: "4px",
  },
  sectionSub: {
    fontSize: "12px",
    color: "#444",
    marginBottom: "16px",
  },
  divider: {
    height: "1px",
    margin: "24px 0",
    background:
      "linear-gradient(90deg,transparent,rgba(255,106,0,0.1),transparent)",
  },

  // Language
  langGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "10px",
  },
  langBtn: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "14px 16px",
    borderRadius: "12px",
    background: "rgba(255,255,255,0.02)",
    border: "1px solid rgba(255,255,255,0.07)",
    cursor: "pointer",
    transition: "border-color 0.2s",
    fontFamily: "'DM Sans', sans-serif",
  },
  langBtnActive: {
    background: "rgba(255,106,0,0.08)",
    border: "1px solid rgba(255,106,0,0.4)",
  },

  // Categories
  catGrid: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
  },
  catChip: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "8px 14px",
    borderRadius: "999px",
    background: "transparent",
    border: "1px solid rgba(255,255,255,0.08)",
    cursor: "pointer",
    transition: "border-color 0.2s",
    fontFamily: "'DM Sans', sans-serif",
  },
  catChipActive: {
    background: "rgba(255,106,0,0.1)",
    border: "1px solid rgba(255,106,0,0.4)",
  },

  // Toggle
  toggleRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "16px",
    padding: "16px",
    background: "rgba(255,255,255,0.02)",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: "12px",
  },
  toggleLabel: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#f0ece0",
  },
  toggleSub: {
    fontSize: "11px",
    color: "#444",
    marginTop: "2px",
  },
  toggle: {
    width: "46px",
    height: "26px",
    borderRadius: "13px",
    position: "relative",
    cursor: "pointer",
    transition: "background 0.2s",
    flexShrink: 0,
  },
  toggleThumb: {
    position: "absolute",
    top: "3px",
    width: "20px",
    height: "20px",
    borderRadius: "50%",
    background: "#fff",
    transition: "transform 0.2s",
    boxShadow: "0 1px 4px rgba(0,0,0,0.3)",
  },

  // Save button
  saveBtn: {
    width: "100%",
    padding: "14px",
    marginTop: "24px",
    background: "linear-gradient(135deg,#FF6A00,#cc5200,#FF6A00)",
    backgroundSize: "200% auto",
    color: "#fff",
    border: "none",
    borderRadius: "12px",
    fontWeight: "700",
    fontSize: "15px",
    cursor: "pointer",
    fontFamily: "'Space Grotesk', sans-serif",
    letterSpacing: "0.04em",
    transition: "filter 0.2s, transform 0.2s",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "50px",
  },
  miniSpinner: {
    width: "18px",
    height: "18px",
    borderRadius: "50%",
    border: "2px solid rgba(255,255,255,0.3)",
    borderTopColor: "#fff",
    animation: "spin 0.8s linear infinite",
    display: "inline-block",
  },

  // Account tab
  infoCard: {
    background: "rgba(255,255,255,0.02)",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: "14px",
    overflow: "hidden",
  },
  infoRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "14px 16px",
    borderBottom: "1px solid rgba(255,255,255,0.04)",
  },
  infoKey: {
    fontSize: "13px",
    color: "#555",
    fontWeight: "500",
  },
  infoVal: {
    fontSize: "13px",
    color: "#f0ece0",
    fontWeight: "600",
    fontFamily: "'Space Grotesk', sans-serif",
  },
  logoutBtn: {
    width: "100%",
    padding: "13px",
    borderRadius: "12px",
    border: "1px solid rgba(239,68,68,0.15)",
    background: "rgba(239,68,68,0.05)",
    color: "#ef4444",
    fontWeight: "600",
    fontSize: "13px",
    cursor: "pointer",
    letterSpacing: "0.04em",
    fontFamily: "'DM Sans', sans-serif",
  },
  dangerCard: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "16px",
    padding: "16px",
    background: "rgba(239,68,68,0.04)",
    border: "1px solid rgba(239,68,68,0.12)",
    borderRadius: "12px",
  },
  dangerTitle: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#ef4444",
  },
  dangerSub: {
    fontSize: "11px",
    color: "#555",
    marginTop: "4px",
    lineHeight: "1.5",
  },
  deleteBtn: {
    background: "rgba(239,68,68,0.1)",
    border: "1px solid rgba(239,68,68,0.3)",
    color: "#ef4444",
    padding: "8px 16px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: "700",
    fontFamily: "'DM Sans', sans-serif",
    flexShrink: 0,
  },

  // About tab
  aboutCard: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "40px 24px",
    background: "rgba(255,255,255,0.02)",
    border: "1px solid rgba(255,106,0,0.08)",
    borderRadius: "20px",
    marginBottom: "24px",
    gap: "8px",
  },
  aboutLogo: { marginBottom: "8px" },
  aboutName: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: "24px",
    fontWeight: "800",
    color: "#fff",
    letterSpacing: "-0.3px",
  },
  aboutTagline: {
    color: "#444",
    fontSize: "12px",
    letterSpacing: "0.06em",
    textAlign: "center",
  },
  aboutVersion: {
    color: "#2a2a2a",
    fontSize: "11px",
    letterSpacing: "0.08em",
    marginTop: "4px",
  },
  linkList: {
    background: "rgba(255,255,255,0.02)",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: "14px",
    overflow: "hidden",
    marginBottom: "24px",
  },
  linkRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px",
    borderBottom: "1px solid rgba(255,255,255,0.04)",
    cursor: "pointer",
  },
  linkLabel: {
    fontSize: "14px",
    color: "#888",
    fontWeight: "500",
  },
  linkArrow: { color: "#333", fontSize: "20px" },
  copyright: {
    textAlign: "center",
    color: "#1f1f1f",
    fontSize: "11px",
    letterSpacing: "0.04em",
  },

  // Toast
  toast: {
    position: "fixed",
    bottom: "90px",
    left: "50%",
    transform: "translateX(-50%)",
    background: "#22c55e",
    color: "#fff",
    padding: "12px 24px",
    borderRadius: "999px",
    fontSize: "13px",
    fontWeight: "700",
    zIndex: 99999,
    animation: "toast 2.5s ease forwards",
    whiteSpace: "nowrap",
    boxShadow: "0 4px 20px rgba(34,197,94,0.4)",
  },

  // Loading
  loadingPage: {
    background: "#0B0B0B",
    height: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  loadingRing: {
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    border: "2px solid rgba(255,106,0,0.15)",
    borderTopColor: "#FF6A00",
    animation: "spin 0.9s linear infinite",
  },
};
