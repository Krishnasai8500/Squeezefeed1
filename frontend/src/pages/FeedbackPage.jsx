import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import BottomNav from "../components/bottomNav";

const BASE_URL = "http://localhost:8080";

const CATEGORIES = [
    { value: "BUG",         label: "🐛 Bug Report",        desc: "Something isn't working" },
    { value: "FEATURE",     label: "✨ Feature Request",    desc: "Suggest something new" },
    { value: "UI",          label: "🎨 UI/Design",          desc: "Visual or layout issues" },
    { value: "CONTENT",     label: "📰 Content Quality",    desc: "About the news or memes" },
    { value: "PERFORMANCE", label: "⚡ Performance",        desc: "App feels slow or laggy" },
    { value: "OTHER",       label: "💬 Other",              desc: "Anything else" },
];

function SqueezeMark({ size = 14 }) {
    return (
        <svg width={size} height={size * (80/64)} viewBox="0 0 64 80" fill="none">
            <rect x="4"  y="6"  width="56" height="7" rx="3.5" fill="#FF6A00"/>
            <rect x="10" y="19" width="44" height="7" rx="3.5" fill="#FF6A00" opacity="0.82"/>
            <rect x="18" y="32" width="28" height="7" rx="3.5" fill="#FF6A00" opacity="0.62"/>
            <rect x="24" y="45" width="16" height="7" rx="3.5" fill="#FF6A00" opacity="0.42"/>
            <rect x="28" y="56" width="8"  height="7" rx="3.5" fill="#FF6A00" opacity="0.25"/>
            <circle cx="32" cy="72" r="4" fill="#FF6A00"/>
        </svg>
    );
}

export default function FeedbackPage() {
    const navigate   = useNavigate();
    const [category, setCategory] = useState('');
    const [message,  setMessage]  = useState('');
    const [loading,  setLoading]  = useState(false);
    const [success,  setSuccess]  = useState(false);
    const [error,    setError]    = useState('');
    const [focused,  setFocused]  = useState(false);

    const handleSubmit = async () => {
        if (!category) { setError('Please select a category'); return; }
        if (message.trim().length < 10) { setError('Please write at least 10 characters'); return; }

        setLoading(true);
        setError('');

        const authUserId = localStorage.getItem('authUserId');
        const token      = localStorage.getItem('token');

        try {
            await axios.post(
                `${BASE_URL}/api/users/feedback`,
                { authUserId: Number(authUserId), category, message: message.trim() },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setSuccess(true);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to submit. Try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;600;700;800&family=DM+Sans:wght@400;500;600&display=swap');
                @keyframes spin    { to { transform: rotate(360deg); } }
                @keyframes fadeUp  { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
                @keyframes pop     { 0%{transform:scale(0.8);opacity:0} 70%{transform:scale(1.05)} 100%{transform:scale(1);opacity:1} }
                @keyframes shimmer { 0%{background-position:200% center} 100%{background-position:-200% center} }
                @keyframes scanLine { 0%{top:-10%} 100%{top:110%} }
                @keyframes glowPulse { 0%,100%{opacity:.5} 50%{opacity:1} }
                .cat-card:hover  { border-color: rgba(255,106,0,0.35) !important; background: rgba(255,106,0,0.06) !important; }
                .back-btn:hover  { background: rgba(255,255,255,0.08) !important; }
                .submit-btn:hover:not(:disabled) { filter: brightness(1.08); transform: translateY(-1px); }
                .submit-btn:active { transform: scale(0.98); }
            `}</style>

            <div style={S.page}>

                {/* ── Header ── */}
                <div style={S.header}>
                    <div style={S.headerGlow} />
                    <div style={S.gridBg} />
                    <div style={S.scan} />

                    <div style={S.headerInner}>
                        <button
                            className="back-btn"
                            style={S.backBtn}
                            onClick={() => navigate(-1)}
                        >
                            ←
                        </button>

                        <div style={S.logoWrap}>
                            <SqueezeMark size={16} />
                            <span style={S.logoText}>
                                Squeeze<span style={{ color: '#FF6A00' }}>Feed</span>
                            </span>
                        </div>

                        <div style={{ width: 36 }} />
                    </div>

                    <div style={S.headerContent}>
                        <div style={S.iconWrap}>
                            <span style={{ fontSize: 28 }}>💡</span>
                        </div>
                        <h1 style={S.heading}>Share Feedback</h1>
                        <p style={S.subheading}>
                            Help us make SqueezeFeed better
                        </p>
                    </div>
                </div>

                {/* ── Success state ── */}
                {success ? (
                    <div style={S.successWrap}>
                        <div style={S.successCard}>
                            <div style={S.successIcon}>🎉</div>
                            <h2 style={S.successTitle}>Thanks for the feedback!</h2>
                            <p style={S.successSub}>
                                We read every submission. Your input helps shape SqueezeFeed.
                            </p>
                            <button
                                className="submit-btn"
                                style={S.submitBtn}
                                onClick={() => navigate('/profile')}
                            >
                                Back to Profile
                            </button>
                        </div>
                    </div>
                ) : (
                    <div style={S.body}>

                        {/* ── Category selector ── */}
                        <div style={S.sectionLabel}>What's this about?</div>
                        <div style={S.categoryGrid}>
                            {CATEGORIES.map(cat => (
                                <div
                                    key={cat.value}
                                    className="cat-card"
                                    onClick={() => { setCategory(cat.value); setError(''); }}
                                    style={{
                                        ...S.catCard,
                                        borderColor:  category === cat.value
                                            ? 'rgba(255,106,0,0.6)'
                                            : 'rgba(255,255,255,0.06)',
                                        background: category === cat.value
                                            ? 'rgba(255,106,0,0.1)'
                                            : 'rgba(255,255,255,0.02)',
                                    }}
                                >
                                    <span style={S.catLabel}>{cat.label}</span>
                                    <span style={S.catDesc}>{cat.desc}</span>
                                    {category === cat.value && (
                                        <div style={S.catCheck}>✓</div>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* ── Message ── */}
                        <div style={S.sectionLabel}>Tell us more</div>
                        <div style={{
                            ...S.textareaWrap,
                            borderColor: focused
                                ? 'rgba(255,106,0,0.5)'
                                : 'rgba(255,255,255,0.07)',
                            background: focused
                                ? 'rgba(255,106,0,0.03)'
                                : 'rgba(255,255,255,0.02)',
                        }}>
                            <textarea
                                value={message}
                                onChange={e => { setMessage(e.target.value); setError(''); }}
                                onFocus={() => setFocused(true)}
                                onBlur={() => setFocused(false)}
                                placeholder="Describe your feedback in detail..."
                                style={S.textarea}
                                maxLength={1000}
                            />
                            <div style={S.charCount}>
                                <span style={{ color: message.length > 900 ? '#ef4444' : '#333' }}>
                                    {message.length}/1000
                                </span>
                            </div>
                        </div>

                        {/* ── Error ── */}
                        {error && (
                            <div style={S.errorBox}>
                                <span>⚠</span> {error}
                            </div>
                        )}

                        {/* ── Submit ── */}
                        <button
                            className="submit-btn"
                            style={{
                                ...S.submitBtn,
                                opacity: loading ? 0.7 : 1,
                                cursor:  loading ? 'not-allowed' : 'pointer',
                            }}
                            onClick={handleSubmit}
                            disabled={loading}
                        >
                            {loading ? (
                                <span style={S.spinner} />
                            ) : (
                                '✦ Submit Feedback'
                            )}
                        </button>

                        <p style={S.privacyNote}>
                            Your feedback is private and only visible to the SqueezeFeed team.
                        </p>

                    </div>
                )}

            </div>
            <BottomNav />
        </>
    );
}

const S = {
    page: {
        background: '#080808',
        minHeight: '100vh',
        fontFamily: "'DM Sans', sans-serif",
        paddingBottom: 100,
        animation: 'fadeUp 0.4s ease',
    },

    // Header
    header: {
        position: 'relative', overflow: 'hidden',
        background: 'linear-gradient(180deg, #141008 0%, #0B0B0B 100%)',
        borderBottom: '1px solid rgba(255,106,0,0.08)',
        paddingBottom: 32,
    },
    headerGlow: {
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse 65% 50% at 50% 0%, rgba(255,106,0,0.15), transparent 70%)',
    },
    gridBg: {
        position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: 'linear-gradient(rgba(255,106,0,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(255,106,0,0.04) 1px,transparent 1px)',
        backgroundSize: '28px 28px',
    },
    scan: {
        position: 'absolute', left: 0, right: 0, height: 2, pointerEvents: 'none',
        background: 'linear-gradient(90deg,transparent,rgba(255,106,0,0.3),transparent)',
        animation: 'scanLine 4s linear infinite',
    },
    headerInner: {
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 20px 0',
        position: 'relative', zIndex: 2,
    },
    backBtn: {
        width: 36, height: 36, borderRadius: '50%',
        border: '1px solid rgba(255,255,255,0.08)',
        background: 'rgba(255,255,255,0.04)',
        color: '#fff', fontSize: 18,
        cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'background 0.2s',
        fontFamily: 'inherit',
    },
    logoWrap: {
        display: 'flex', alignItems: 'center', gap: 6,
        fontFamily: "'Space Grotesk', sans-serif",
        fontSize: 16, fontWeight: 800,
        color: '#fff', letterSpacing: '-0.3px',
    },
    logoText: { color: '#fff' },
    headerContent: {
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', gap: 8,
        padding: '28px 20px 0',
        position: 'relative', zIndex: 2,
    },
    iconWrap: {
        width: 64, height: 64, borderRadius: '50%',
        background: 'rgba(255,106,0,0.1)',
        border: '1px solid rgba(255,106,0,0.25)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: 4,
        boxShadow: '0 0 24px rgba(255,106,0,0.2)',
        animation: 'glowPulse 2s ease infinite',
    },
    heading: {
        fontFamily: "'Space Grotesk', sans-serif",
        color: '#fff', fontSize: 22, fontWeight: 800,
        margin: 0, letterSpacing: '-0.4px',
    },
    subheading: {
        color: '#3a3a3a', fontSize: 13, margin: 0,
        letterSpacing: '0.02em',
    },

    // Body
    body: {
        padding: '28px 20px 0',
        maxWidth: 480, margin: '0 auto',
    },
    sectionLabel: {
        fontFamily: "'Space Grotesk', sans-serif",
        color: '#fff', fontSize: 14, fontWeight: 700,
        letterSpacing: '0.04em', marginBottom: 12,
    },

    // Category grid
    categoryGrid: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 10, marginBottom: 28,
    },
    catCard: {
        borderRadius: 14, padding: '14px 14px 12px',
        border: '1px solid',
        cursor: 'pointer',
        display: 'flex', flexDirection: 'column', gap: 3,
        transition: 'all 0.2s',
        position: 'relative',
    },
    catLabel: {
        color: '#fff', fontSize: 13, fontWeight: 600,
        fontFamily: "'Space Grotesk', sans-serif",
    },
    catDesc: {
        color: '#444', fontSize: 11,
    },
    catCheck: {
        position: 'absolute', top: 8, right: 10,
        color: '#FF6A00', fontSize: 13, fontWeight: 700,
    },

    // Textarea
    textareaWrap: {
        borderRadius: 16,
        border: '1px solid',
        overflow: 'hidden',
        transition: 'all 0.2s',
        marginBottom: 20,
    },
    textarea: {
        width: '100%',
        minHeight: 140,
        background: 'transparent',
        border: 'none', outline: 'none',
        color: '#e0dbd0', fontSize: 14,
        lineHeight: '1.6',
        padding: '16px 16px 8px',
        resize: 'vertical',
        fontFamily: "'DM Sans', sans-serif",
        boxSizing: 'border-box',
    },
    charCount: {
        padding: '4px 16px 10px',
        display: 'flex', justifyContent: 'flex-end',
    },

    // Error
    errorBox: {
        background: 'rgba(239,68,68,0.08)',
        border: '1px solid rgba(239,68,68,0.2)',
        color: '#f87171',
        padding: '10px 14px', borderRadius: 10,
        fontSize: 13, marginBottom: 16,
        display: 'flex', gap: 8, alignItems: 'center',
    },

    // Submit
    submitBtn: {
        width: '100%', padding: 15,
        background: 'linear-gradient(135deg, #FF6A00 0%, #cc5200 50%, #FF6A00 100%)',
        backgroundSize: '200% auto',
        animation: 'shimmer 3s linear infinite',
        color: '#fff', border: 'none',
        borderRadius: 14, fontWeight: 700,
        fontSize: 15, letterSpacing: '0.04em',
        cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        minHeight: 52,
        fontFamily: "'Space Grotesk', sans-serif",
        transition: 'all 0.2s',
    },
    spinner: {
        width: 18, height: 18, borderRadius: '50%',
        border: '2px solid rgba(255,255,255,0.3)',
        borderTopColor: '#fff',
        animation: 'spin 0.8s linear infinite',
        display: 'inline-block',
    },

    privacyNote: {
        color: '#2a2a2a', fontSize: 11,
        textAlign: 'center', marginTop: 14,
        lineHeight: 1.5, letterSpacing: '0.02em',
    },

    // Success
    successWrap: {
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '60px 24px',
    },
    successCard: {
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,106,0,0.12)',
        borderRadius: 24, padding: '40px 28px',
        textAlign: 'center', maxWidth: 360,
        animation: 'pop 0.4s ease',
    },
    successIcon: {
        fontSize: 48, marginBottom: 16,
        animation: 'pop 0.5s ease',
    },
    successTitle: {
        fontFamily: "'Space Grotesk', sans-serif",
        color: '#fff', fontSize: 20, fontWeight: 800,
        margin: '0 0 10px', letterSpacing: '-0.3px',
    },
    successSub: {
        color: '#444', fontSize: 14,
        lineHeight: 1.6, margin: '0 0 28px',
    },
};