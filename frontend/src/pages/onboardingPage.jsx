import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const BASE_URL = "http://localhost:8080";

const LANGUAGES = ["ENGLISH", "TELUGU"];

const CATEGORIES = [
    { id: "politics",       emoji: "🏛️",  label: "Politics",       color: "#ff6b6b", glow: "rgba(255,107,107,0.4)" },
    { id: "business",       emoji: "📈",  label: "Business",       color: "#4ecdc4", glow: "rgba(78,205,196,0.4)" },
    { id: "technology",     emoji: "💻",  label: "Technology",     color: "#a29bfe", glow: "rgba(162,155,254,0.4)" },
    { id: "sports",         emoji: "🏏",  label: "Sports",         color: "#fd79a8", glow: "rgba(253,121,168,0.4)" },
    { id: "entertainment",  emoji: "🎬",  label: "Entertainment",  color: "#fdcb6e", glow: "rgba(253,203,110,0.4)" },
    { id: "health",         emoji: "🏥",  label: "Health",         color: "#55efc4", glow: "rgba(85,239,196,0.4)" },
    { id: "science",        emoji: "🔬",  label: "Science",        color: "#74b9ff", glow: "rgba(116,185,255,0.4)" },
    { id: "international",  emoji: "🌍",  label: "International",  color: "#e17055", glow: "rgba(225,112,85,0.4)" },
    { id: "crime",          emoji: "⚖️",  label: "Crime",          color: "#b2bec3", glow: "rgba(178,190,195,0.4)" },
    { id: "education",      emoji: "🎓",  label: "Education",      color: "#6c5ce7", glow: "rgba(108,92,231,0.4)" },
    { id: "lifestyle",      emoji: "✨",  label: "Lifestyle",      color: "#ff7675", glow: "rgba(255,118,117,0.4)" },
    { id: "general",        emoji: "📰",  label: "General",        color: "#FF6A00", glow: "rgba(255,106,0,0.4)"  },
];

export default function OnboardingPage() {
    const navigate = useNavigate();
    const [language, setLanguage] = useState("ENGLISH");
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [hoveredCat, setHoveredCat] = useState(null);

    function toggleCategory(id) {
        setSelectedCategories(prev =>
            prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
        );
    }

    async function handleSubmit() {
        if (selectedCategories.length < 3) {
            alert("Select at least 3 interests");
            return;
        }
        const token = localStorage.getItem("token");
        const authUserId = localStorage.getItem("authUserId");
        if (!token || !authUserId) {
            alert("Session expired. Please log in again.");
            navigate("/login");
            return;
        }
        try {
            await axios.put(
                `${BASE_URL}/api/users/profile/${authUserId}`,
                {
                    language,
                    preferredCategories: selectedCategories,
                    subscriptionPlan: "FREE",
                    notificationsEnabled: true,
                },
                { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
            );
            localStorage.setItem("onboardingCompleted", "true");
            localStorage.setItem("selectedLanguage", language.toLowerCase().substring(0, 2));
            navigate("/");
        } catch (err) {
            if (err?.response?.status === 401) {
                alert("Session expired. Please log in again.");
                localStorage.clear();
                navigate("/login");
            } else {
                alert("Failed to complete onboarding. Please try again.");
            }
        }
    }

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap');

                * { box-sizing: border-box; margin: 0; padding: 0; }

                @keyframes floatUp {
                    0%   { transform: translateY(0px) rotate(0deg); }
                    50%  { transform: translateY(-8px) rotate(2deg); }
                    100% { transform: translateY(0px) rotate(0deg); }
                }
                @keyframes pulseRing {
                    0%   { transform: scale(1);   opacity: 0.6; }
                    70%  { transform: scale(1.35); opacity: 0; }
                    100% { transform: scale(1.35); opacity: 0; }
                }
                @keyframes orbitDot {
                    from { transform: rotate(0deg) translateX(28px) rotate(0deg); }
                    to   { transform: rotate(360deg) translateX(28px) rotate(-360deg); }
                }
                @keyframes shimmer {
                    0%   { background-position: -200% center; }
                    100% { background-position: 200% center; }
                }
                @keyframes fadeSlideIn {
                    from { opacity: 0; transform: translateY(24px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                @keyframes gradientBG {
                    0%   { background-position: 0% 50%; }
                    50%  { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }
                @keyframes popIn {
                    0%   { transform: scale(0.7); opacity: 0; }
                    70%  { transform: scale(1.1); }
                    100% { transform: scale(1);   opacity: 1; }
                }
                @keyframes checkmark {
                    from { transform: scale(0) rotate(-30deg); }
                    to   { transform: scale(1) rotate(0deg); }
                }

                .ob-page {
                    min-height: 100vh;
                    background: #080808;
                    display: flex;
                    justify-content: center;
                    align-items: flex-start;
                    padding: 40px 16px 60px;
                    font-family: 'DM Sans', sans-serif;
                    overflow-x: hidden;
                }

                .ob-wrap {
                    width: 100%;
                    max-width: 520px;
                    animation: fadeSlideIn 0.6s ease both;
                }

                /* ── Header ── */
                .ob-header { margin-bottom: 36px; text-align: center; }
                .ob-eyebrow {
                    font-size: 11px; font-weight: 700;
                    letter-spacing: 0.2em; text-transform: uppercase;
                    color: #FF6A00; margin-bottom: 10px;
                }
                .ob-title {
                    font-family: 'Syne', sans-serif;
                    font-size: clamp(28px, 7vw, 38px);
                    font-weight: 800; color: #fff;
                    line-height: 1.1; letter-spacing: -0.03em;
                }
                .ob-title span {
                    background: linear-gradient(90deg, #FF6A00, #ff9a56, #FF6A00);
                    background-size: 200% auto;
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    animation: shimmer 2.5s linear infinite;
                }
                .ob-sub {
                    color: #444; font-size: 14px; margin-top: 10px;
                }

                /* ── Section label ── */
                .ob-section-label {
                    font-size: 11px; font-weight: 700;
                    letter-spacing: 0.18em; text-transform: uppercase;
                    color: #333; margin-bottom: 14px;
                }

                /* ── Language pills ── */
                .lang-row {
                    display: flex; gap: 10px;
                    margin-bottom: 36px;
                }
                .lang-pill {
                    flex: 1; padding: 12px 0;
                    border-radius: 14px;
                    font-family: 'DM Sans', sans-serif;
                    font-size: 14px; font-weight: 600;
                    cursor: pointer;
                    border: 1.5px solid rgba(255,255,255,0.07);
                    background: #111;
                    color: #555;
                    transition: all 0.2s ease;
                    text-align: center;
                }
                .lang-pill.active {
                    border-color: #FF6A00;
                    background: rgba(255,106,0,0.1);
                    color: #FF6A00;
                    box-shadow: 0 0 18px rgba(255,106,0,0.2);
                }

                /* ── Category grid ── */
                .cat-grid {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 16px 8px;
                    margin-bottom: 36px;
                }
                @media (max-width: 380px) {
                    .cat-grid { grid-template-columns: repeat(3, 1fr); }
                }

                /* ── Category item ── */
                .cat-item {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 8px;
                    cursor: pointer;
                    user-select: none;
                }

                .cat-circle-wrap {
                    position: relative;
                    width: 64px; height: 64px;
                }

                /* Pulse ring — shows when selected */
                .cat-circle-wrap::before {
                    content: '';
                    position: absolute; inset: 0;
                    border-radius: 50%;
                    border: 2px solid var(--cat-color);
                    opacity: 0;
                    transition: opacity 0.2s;
                }
                .cat-item.selected .cat-circle-wrap::before {
                    opacity: 1;
                    animation: pulseRing 1.4s ease-out infinite;
                }

                /* Orbit dot — shows when selected */
                .cat-orbit-dot {
                    position: absolute;
                    top: 50%; left: 50%;
                    width: 7px; height: 7px;
                    border-radius: 50%;
                    background: var(--cat-color);
                    margin: -3.5px;
                    opacity: 0;
                    transition: opacity 0.3s;
                }
                .cat-item.selected .cat-orbit-dot {
                    opacity: 1;
                    animation: orbitDot 1.6s linear infinite;
                }

                .cat-circle {
                    width: 64px; height: 64px;
                    border-radius: 50%;
                    background: #111;
                    border: 2px solid rgba(255,255,255,0.06);
                    display: flex; align-items: center; justify-content: center;
                    font-size: 26px;
                    transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
                    position: relative; z-index: 1;
                }
                .cat-item.selected .cat-circle {
                    border-color: var(--cat-color);
                    background: var(--cat-bg);
                    box-shadow: 0 0 20px var(--cat-glow), 0 4px 16px rgba(0,0,0,0.4);
                    transform: scale(1.08);
                    animation: floatUp 2.5s ease-in-out infinite;
                }
                .cat-item:not(.selected):hover .cat-circle {
                    border-color: rgba(255,255,255,0.15);
                    transform: scale(1.05);
                    background: #161616;
                }

                /* Checkmark badge */
                .cat-check {
                    position: absolute;
                    top: -2px; right: -2px;
                    width: 20px; height: 20px;
                    border-radius: 50%;
                    background: var(--cat-color);
                    display: flex; align-items: center; justify-content: center;
                    font-size: 10px; color: #000; font-weight: 900;
                    z-index: 2;
                    animation: popIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) both;
                }

                .cat-label {
                    font-size: 11px; font-weight: 600;
                    color: #444;
                    text-align: center;
                    letter-spacing: 0.01em;
                    transition: color 0.2s;
                    line-height: 1.2;
                }
                .cat-item.selected .cat-label {
                    color: #e0e0e0;
                }

                /* ── Counter badge ── */
                .counter-row {
                    display: flex; justify-content: space-between;
                    align-items: center; margin-bottom: 20px;
                }
                .counter-badge {
                    font-size: 12px; font-weight: 600;
                    color: #FF6A00;
                    background: rgba(255,106,0,0.1);
                    border: 1px solid rgba(255,106,0,0.2);
                    padding: 4px 12px; border-radius: 999px;
                    transition: all 0.2s;
                }
                .counter-hint {
                    font-size: 12px; color: #333;
                }

                /* ── CTA button ── */
                .ob-cta {
                    width: 100%;
                    padding: 16px;
                    border-radius: 16px;
                    border: none;
                    font-family: 'Syne', sans-serif;
                    font-size: 16px; font-weight: 700;
                    letter-spacing: 0.04em;
                    cursor: pointer;
                    transition: all 0.25s ease;
                    position: relative; overflow: hidden;
                }
                .ob-cta.ready {
                    background: linear-gradient(135deg, #FF6A00, #ff9a56);
                    color: #000;
                    box-shadow: 0 8px 32px rgba(255,106,0,0.35);
                }
                .ob-cta.ready:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 12px 40px rgba(255,106,0,0.5);
                }
                .ob-cta.not-ready {
                    background: #111;
                    color: #333;
                    border: 1px solid rgba(255,255,255,0.05);
                    cursor: not-allowed;
                }
            `}</style>

            <div className="ob-page">
                <div className="ob-wrap">

                    {/* Header */}
                    <div className="ob-header">
                        <div className="ob-eyebrow">SqueezeFeed</div>
                        <h1 className="ob-title">
                            Your feed,<br /><span>your rules.</span>
                        </h1>
                        <p className="ob-sub">Pick what matters to you</p>
                    </div>

                    {/* Language */}
                    <div className="ob-section-label">Language</div>
                    <div className="lang-row">
                        {LANGUAGES.map(lang => (
                            <button
                                key={lang}
                                className={`lang-pill${language === lang ? " active" : ""}`}
                                onClick={() => setLanguage(lang)}
                            >
                                {lang === "ENGLISH" ? "🇬🇧 English" : "🇮🇳 Telugu"}
                            </button>
                        ))}
                    </div>

                    {/* Categories */}
                    <div className="counter-row">
                        <div className="ob-section-label" style={{ margin: 0 }}>Interests</div>
                        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
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
                                    onMouseEnter={() => setHoveredCat(cat.id)}
                                    onMouseLeave={() => setHoveredCat(null)}
                                >
                                    <div className="cat-circle-wrap">
                                        <div className="cat-circle">
                                            {cat.emoji}
                                        </div>
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

                    {/* CTA */}
                    <button
                        className={`ob-cta${selectedCategories.length >= 3 ? " ready" : " not-ready"}`}
                        onClick={handleSubmit}
                    >
                        {selectedCategories.length >= 3
                            ? "Build My Feed →"
                            : `Select ${3 - selectedCategories.length} more to continue`}
                    </button>

                </div>
            </div>
        </>
    );
}