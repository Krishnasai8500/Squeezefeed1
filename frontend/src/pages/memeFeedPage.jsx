import { useEffect, useState, useRef } from "react";
import axios from "axios";
import Navbar from "../components/navbar";
import { useLocation } from "react-router-dom";
const BASE_URL = "http://localhost:8080";

export default function MemeFeedPage() {
    const [memes, setMemes]     = useState([]);
    const [loading, setLoading] = useState(true);
    const [current, setCurrent] = useState(0);
    const [animDir, setAnimDir] = useState('up');
    const [animKey, setAnimKey] = useState(0);
    const [savedIds, setSavedIds] = useState(new Set());
    const [savingId, setSavingId] = useState(null);
    const touchStartY = useRef(0);
    const location = useLocation();

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        document.documentElement.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = '';
            document.documentElement.style.overflow = '';
        };
    }, []);

    useEffect(() => {
        const token = localStorage.getItem("token");
        axios
            .get(`${BASE_URL}/api/content/memes`, {
                headers: { Authorization: `Bearer ${token}` },
            })
            .then((res) => {

                const memeList = res.data || [];

                setMemes(memeList);

                const targetMemeId =
                    location.state?.memeId;

                if (targetMemeId) {

                    const index =
                        memeList.findIndex(
                            m => m.id === targetMemeId
                        );

                    if (index >= 0) {
                        setCurrent(index);
                    }
                }
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    // Load already-saved article ids so save button shows correct state
    useEffect(() => {
        const authUserId = localStorage.getItem("authUserId");
        const token = localStorage.getItem("token");

        if (!authUserId) return;

        axios
            .get(`${BASE_URL}/api/users/profile/${authUserId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
            .then((res) => {

                const memeIds =
                    res.data.savedMemeIds || [];

                setSavedIds(
                    new Set(memeIds)
                );
            })
            .catch(console.error);

    }, []);


    useEffect(() => {
        const handler = (e) => {
            if (e.detail?.path === "/memes") {
                // Re-fetch memes from scratch
                const token = localStorage.getItem("token");
                setLoading(true);
                setCurrent(0);
                axios
                    .get(`${BASE_URL}/api/content/memes`, {
                        headers: { Authorization: `Bearer ${token}` },
                    })
                    .then((res) => setMemes(res.data || []))
                    .catch(console.error)
                    .finally(() => setLoading(false));
            }
        };
        window.addEventListener("refreshCurrentPage", handler);
        return () => window.removeEventListener("refreshCurrentPage", handler);
    }, []);

    const goNext = () => {
        if (current >= memes.length - 1) return;
        setAnimDir('up');
        setAnimKey(k => k + 1);
        setCurrent(p => p + 1);
    };

    const goPrev = () => {
        if (current <= 0) return;
        setAnimDir('down');
        setAnimKey(k => k + 1);
        setCurrent(p => p - 1);
    };

    const onTouchStart = (e) => { touchStartY.current = e.touches[0].clientY; };
    const onTouchEnd   = (e) => {
        const diff = touchStartY.current - e.changedTouches[0].clientY;
        if (diff > 50)  goNext();
        if (diff < -50) goPrev();
    };

    const handleSave = async (meme) => {
        console.log('MEME:', meme);
        const memeId = meme.id;
        console.log('memeId:', memeId); // ← and this
        const authUserId = localStorage.getItem("authUserId");
        const token      = localStorage.getItem("token");
        if (!memeId || !authUserId) return;

        setSavingId(memeId);
        const isSaved = savedIds.has(memeId);

        try {
            if (isSaved) {
                await axios.delete(
                    `${BASE_URL}/api/users/save-meme/${authUserId}/${memeId}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setSavedIds(prev => {
                    const next = new Set(prev);
                    next.delete(memeId);
                    return next;
                });
            } else {
                await axios.post(
                    `${BASE_URL}/api/users/save-meme/${authUserId}/${memeId}`,
                    {},
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setSavedIds(prev => new Set([...prev, memeId]));
            }
        } catch (e) {
            console.error('Save failed', e);
        } finally {
            setSavingId(null);
        }
    };

    if (loading) return (
        <>
            <Navbar />
            <div style={S.loading}>
                <div style={S.spinner} />
                <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', letterSpacing: '0.1em' }}>
                    LOADING
                </span>
            </div>
        </>
    );

    if (memes.length === 0) return (
        <>
            <Navbar />
            <div style={S.loading}>
                <span style={{ color: 'rgba(255,255,255,0.4)' }}>No memes yet. Check back later.</span>
            </div>
        </>
    );

    const meme    = memes[current];
    const isSaved = savedIds.has(meme.id);
    const canSave = !!meme.id;

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700;800;900&family=DM+Sans:wght@400;500&display=swap');

                @keyframes slideUp {
                    from { opacity: 0; transform: translateY(40px) scale(0.98); }
                    to   { opacity: 1; transform: translateY(0) scale(1); }
                }
                @keyframes slideDown {
                    from { opacity: 0; transform: translateY(-40px) scale(0.98); }
                    to   { opacity: 1; transform: translateY(0) scale(1); }
                }
                @keyframes spinAnim { to { transform: rotate(360deg); } }
                @keyframes bgPan {
                    0%   { transform: scale(1.08) translate(0,0); }
                    100% { transform: scale(1.08) translate(-1%,-1%); }
                }
                @keyframes savePop {
                    0%   { transform: scale(1); }
                    40%  { transform: scale(1.35); }
                    100% { transform: scale(1); }
                }
                .meme-card { animation: ${animDir === 'up' ? 'slideUp' : 'slideDown'} 0.38s cubic-bezier(0.22,1,0.36,1) both; }
                .nav-btn:active  { transform: scale(0.9) !important; }
                .nav-btn:hover   { background: rgba(255,255,255,0.15) !important; }
                .back-btn:active { transform: scale(0.9) !important; }
                .save-btn:active { transform: scale(0.88) !important; }
                .save-btn.saved  { animation: savePop 0.35s ease; }
            `}</style>

            <div style={S.shell}>
                <Navbar />

                <div
                    style={S.stage}
                    onTouchStart={onTouchStart}
                    onTouchEnd={onTouchEnd}
                >
                    {/* Blurred bg */}
                    <div style={{ ...S.blurBg, backgroundImage: `url(${meme.imageUrl})` }} />
                    <div style={S.vignette} />

                    {/* Card */}
                    <div className="meme-card" key={animKey} style={S.card}>

                        {/* Full image — no crop */}
                        <div style={S.imageWrap}>
                            <img
                                src={meme.imageUrl}
                                alt={meme.title}
                                style={S.image}
                                onError={e => {
                                    e.target.onerror = null;
                                    e.target.src = 'https://placehold.co/400x500/111/fff?text=Meme';
                                }}
                            />
                        </div>

                        {/* Text overlay at bottom */}
                        <div style={S.textOverlay}>
                            <h2 style={S.title}>{meme.title}</h2>
                            {meme.shortContext && (
                                <p style={S.context}>{meme.shortContext}</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* ── Bottom bar ── */}
                <div style={S.bottomBar}>

                    {/* Back */}
                    <button
                        className="back-btn"
                        style={S.backBtn}
                        onClick={() => window.history.back()}
                        title="Go back"
                    >
                        ←
                    </button>

                    {/* Prev */}
                    <button
                        className="nav-btn"
                        style={{ ...S.navBtn, opacity: current === 0 ? 0.25 : 1 }}
                        onClick={goPrev}
                        disabled={current === 0}
                    >↑</button>

                    {/* Progress dots */}
                    <div style={S.dotsWrap}>
                        {memes.slice(
                            Math.max(0, current - 3),
                            Math.min(memes.length, current + 4)
                        ).map((_, i) => {
                            const idx = Math.max(0, current - 3) + i;
                            const isActive = idx === current;
                            return (
                                <div
                                    key={idx}
                                    onClick={() => setCurrent(idx)}
                                    style={{
                                        width:        isActive ? '28px' : '6px',
                                        height:       '6px',
                                        borderRadius: '3px',
                                        background:   isActive ? '#FF6A00' : 'rgba(255,255,255,0.25)',
                                        transition:   'all 0.3s cubic-bezier(0.22,1,0.36,1)',
                                        cursor:       'pointer',
                                        flexShrink:   0,
                                    }}
                                />
                            );
                        })}
                    </div>

                    {/* Next */}
                    <button
                        className="nav-btn"
                        style={{ ...S.navBtn, opacity: current === memes.length - 1 ? 0.25 : 1 }}
                        onClick={goNext}
                        disabled={current === memes.length - 1}
                    >↓</button>

                    {/* Save */}
                    <button
                        className={`save-btn${isSaved ? ' saved' : ''}`}
                        style={{
                            ...S.saveBtn,
                            background:   isSaved ? 'rgba(255,106,0,0.18)' : 'rgba(255,255,255,0.06)',
                            border:       isSaved ? '1px solid rgba(255,106,0,0.5)' : '1px solid rgba(255,255,255,0.1)',
                            opacity: !canSave ? 0.3 : savingId === meme.id ? 0.6 : 1,
                            cursor:       !canSave ? 'not-allowed' : 'pointer',
                        }}
                        onClick={() => handleSave(meme)}
                        disabled={!canSave || savingId === meme.id}
                        title={isSaved ? 'Unsave' : 'Save'}
                    >
                        {savingId === meme.id
                            ? <span style={S.spinnerSm} />
                            : <span style={{ fontSize: '18px', lineHeight: 1 }}>{isSaved ? '🔖' : '🔖'}</span>
                        }
                    </button>

                </div>
            </div>
        </>
    );
}

const S = {
    shell: {
        position: 'fixed', inset: 0,
        background: '#080808',
        display: 'flex', flexDirection: 'column',
        fontFamily: "'DM Sans', sans-serif",
        overflow: 'hidden',
    },
    stage: {
        flex: 1, position: 'relative',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '12px 16px 8px',
        overflow: 'hidden',
    },
    blurBg: {
        position: 'absolute', inset: '-40px',
        backgroundSize: 'cover', backgroundPosition: 'center',
        filter: 'blur(40px) brightness(0.2) saturate(1.4)',
        zIndex: 0,
        animation: 'bgPan 8s ease-in-out infinite alternate',
    },
    vignette: {
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.7) 100%)',
        zIndex: 1, pointerEvents: 'none',
    },
    card: {
        position: 'relative', zIndex: 2,
        width: '100%', maxWidth: '420px', height: '100%',
        borderRadius: '20px', overflow: 'hidden',
        boxShadow: '0 24px 80px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.06)',
        display: 'flex', flexDirection: 'column',
        background: '#000',
    },
    imageWrap: {
        flex: 1, minHeight: 0,
        background: '#000',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        overflow: 'hidden',
    },
    image: {
        width: '100%', height: '100%',
        objectFit: 'contain',  // full image, no cropping
        display: 'block',
    },
    textOverlay: {
        flexShrink: 0,
        padding: '20px 20px 22px',
        background: 'linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.97) 100%)',
        display: 'flex', flexDirection: 'column', gap: '6px',
    },
    title: {
        fontFamily: "'Barlow Condensed', sans-serif",
        fontSize: 'clamp(22px, 5.5vw, 30px)',
        fontWeight: '800',
        letterSpacing: '0.02em',
        color: '#ffffff', margin: 0, lineHeight: 1.1,
        textTransform: 'uppercase',
        textShadow: '0 2px 12px rgba(0,0,0,0.8)',
    },
    context: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 'clamp(12px, 3vw, 13px)',
        lineHeight: '1.5', margin: 0,
    },
    bottomBar: {
        flexShrink: 0, height: '68px',
        background: 'rgba(8,8,8,0.98)',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 20px',
        backdropFilter: 'blur(20px)',
        gap: '10px',
    },
    backBtn: {
        width: '42px', height: '42px',
        borderRadius: '50%',
        border: '1px solid rgba(255,106,0,0.35)',
        background: 'rgba(255,106,0,0.1)',
        color: '#FF6A00', fontSize: '18px',
        cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all 0.2s', flexShrink: 0,
    },
    navBtn: {
        width: '42px', height: '42px',
        borderRadius: '50%',
        border: '1px solid rgba(255,255,255,0.1)',
        background: 'rgba(255,255,255,0.06)',
        color: '#fff', fontSize: '17px',
        cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all 0.2s', flexShrink: 0,
    },
    dotsWrap: {
        display: 'flex', alignItems: 'center',
        gap: '6px', flex: 1, justifyContent: 'center',
    },
    saveBtn: {
        width: '42px', height: '42px',
        borderRadius: '50%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all 0.2s', flexShrink: 0,
    },
    loading: {
        background: '#080808', color: 'rgba(255,255,255,0.5)',
        height: '100vh',
        display: 'flex', flexDirection: 'column', gap: '14px',
        justifyContent: 'center', alignItems: 'center',
        fontFamily: "'DM Sans', sans-serif",
    },
    spinner: {
        width: '24px', height: '24px', borderRadius: '50%',
        border: '2px solid rgba(255,106,0,0.2)',
        borderTopColor: '#FF6A00',
        animation: 'spinAnim 0.8s linear infinite',
    },
    spinnerSm: {
        width: '14px', height: '14px', borderRadius: '50%',
        border: '2px solid rgba(255,255,255,0.2)',
        borderTopColor: '#fff',
        animation: 'spinAnim 0.8s linear infinite',
        display: 'inline-block',
    },
};