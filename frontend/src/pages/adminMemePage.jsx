import { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../components/navbar";
import BottomNav from "../components/bottomNav";

const BASE_URL = "http://localhost:8080";
const CACHE_TTL_MS = 2 * 60 * 1000;

const cache = { articles: null, publishedMemes: null, fetchedAt: null };
function isCacheValid() {
    if (!cache.fetchedAt || cache.articles === null) return false;
    return Date.now() - cache.fetchedAt < CACHE_TTL_MS;
}
function clearCache() { cache.articles = null; cache.publishedMemes = null; cache.fetchedAt = null; }

// ── Score color helper ──────────────────────────────────────────────────────
function scoreColor(score) {
    if (!score) return "#555";
    if (score >= 0.8) return "#ff4444";
    if (score >= 0.6) return "#ff9500";
    return "#facc15";
}
function scoreLabel(score) {
    if (!score) return "—";
    if (score >= 0.8) return "🔥 VIRAL";
    if (score >= 0.6) return "⚡ HOT";
    return "📈 MID";
}

export default function AdminMemePage() {
    const [articles, setArticles] = useState(isCacheValid() ? cache.articles : []);
    const [loading, setLoading] = useState(!isCacheValid());
    const [customTitles, setCustomTitles] = useState({});
    const [customContexts, setCustomContexts] = useState({});
    const [selectedFiles, setSelectedFiles] = useState({});
    const [publishedMemes, setPublishedMemes] = useState(isCacheValid() ? cache.publishedMemes : []);
    const [activeTab, setActiveTab] = useState("candidates");
    const [editingMemeId, setEditingMemeId] = useState(null);
    const [publishing, setPublishing] = useState({});
    const [toast, setToast] = useState(null);

    const [showCreateMeme,
        setShowCreateMeme] =
        useState(false);

    const [newMemeTitle,
        setNewMemeTitle] =
        useState("");

    const [newMemeContext,
        setNewMemeContext] =
        useState("");

    const [newMemeImage,
        setNewMemeImage] =
        useState(null);

    const [creatingMeme,
        setCreatingMeme] =
        useState(false);

    const showToast = (msg, type = "success") => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    useEffect(() => {
        if (isCacheValid()) return;
        fetchAll();
    }, []);

    function fetchAll() {
        setLoading(true);
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };
        Promise.all([
            axios.get(`${BASE_URL}/api/content/meme-candidates`, { headers }),
            axios.get(`${BASE_URL}/api/content/memes`, { headers }),
        ])
            .then(([candidatesRes, memesRes]) => {
                const arts = candidatesRes.data || [];
                const memes = memesRes.data || [];
                cache.articles = arts; cache.publishedMemes = memes; cache.fetchedAt = Date.now();
                setArticles(arts); setPublishedMemes(memes);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }

    async function handleMemeUpload(event, article) {
        const file = event.target.files[0];
        if (!file) return;
        if (!customTitles[article.id] || !customContexts[article.id]) {
            showToast("Add meme title + context first", "error"); return;
        }
        setPublishing(p => ({ ...p, [article.id]: true }));
        const token = localStorage.getItem("token");
        try {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("uploadedByUserId", "1");
            formData.append("fileType", "image");
            formData.append("mediaCategory", "meme-news");
            formData.append("isAiGenerated", "true");
            const uploadRes = await axios.post(`${BASE_URL}/api/media/upload`, formData, {
                headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
            });
            const uploadedFileName = uploadRes.data.fileName;
            await axios.post(`${BASE_URL}/api/content/memes`, {
                title: customTitles[article.id],
                shortContext: customContexts[article.id],
                imageUrl: `http://localhost:8089/uploads/${uploadedFileName}`,
                sourceContentId: article.id,
                memeabilityScore: article.memeabilityScore || 0.8,
            }, { headers: { Authorization: `Bearer ${token}` } });
            const newMeme = {
                ...article,
                title: customTitles[article.id] || article.title,
                shortContext: customContexts[article.id] || article.summary?.slice(0, 120),
                imageUrl: `http://localhost:8089/uploads/${uploadedFileName}`,
            };
            cache.publishedMemes = [...(cache.publishedMemes || []), newMeme];
            cache.articles = (cache.articles || []).filter(a => a.id !== article.id);
            setPublishedMemes(prev => [...prev, newMeme]);
            setArticles(prev => prev.filter(a => a.id !== article.id));
            showToast("Meme published successfully!");
        } catch (err) {
            console.error(err);
            showToast("Failed to publish meme", "error");
        } finally {
            setPublishing(p => ({ ...p, [article.id]: false }));
        }
    }

    async function handleCreateMeme() {

        if (!newMemeTitle.trim()) {

            showToast(
                "Enter meme title",
                "error"
            );

            return;
        }

        if (!newMemeContext.trim()) {

            showToast(
                "Enter short context",
                "error"
            );

            return;
        }

        if (!newMemeImage) {

            showToast(
                "Select image",
                "error"
            );

            return;
        }

        setCreatingMeme(true);

        const token =
            localStorage.getItem(
                "token"
            );

        try {

            const formData =
                new FormData();

            formData.append(
                "file",
                newMemeImage
            );

            formData.append(
                "uploadedByUserId",
                "1"
            );

            formData.append(
                "fileType",
                "image"
            );

            formData.append(
                "mediaCategory",
                "meme-news"
            );

            formData.append(
                "isAiGenerated",
                "false"
            );

            const uploadRes =
                await axios.post(
                    `${BASE_URL}/api/media/upload`,
                    formData,
                    {
                        headers: {
                            Authorization:
                                `Bearer ${token}`,
                            "Content-Type":
                                "multipart/form-data"
                        }
                    }
                );

            const uploadedFileName =
                uploadRes.data.fileName;

            const memeRes =
                await axios.post(
                    `${BASE_URL}/api/content/memes`,
                    {
                        title:
                            newMemeTitle,

                        shortContext:
                            newMemeContext,

                        imageUrl:
                            `http://localhost:8089/uploads/${uploadedFileName}`,

                        sourceContentId:
                            null,

                        memeabilityScore:
                            1.0
                    },
                    {
                        headers: {
                            Authorization:
                                `Bearer ${token}`
                        }
                    }
                );

            setPublishedMemes(
                prev => [
                    memeRes.data,
                    ...prev
                ]
            );

            setShowCreateMeme(false);

            setNewMemeTitle("");

            setNewMemeContext("");

            setNewMemeImage(null);

            showToast(
                "Meme published successfully!"
            );

        } catch (err) {

            console.error(err);

            showToast(
                "Failed to create meme",
                "error"
            );

        } finally {

            setCreatingMeme(false);
        }
    }
    function handleRefresh() { clearCache(); fetchAll(); }

    if (loading) return (
        <div style={S.loadingScreen}>
            <div style={S.loadingInner}>
                <div style={S.loadingPulse} />
                <span style={S.loadingText}>Loading meme queue...</span>
            </div>
        </div>
    );

    const candidateCount = articles.length;
    const publishedCount = publishedMemes.length;

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Mono:wght@400;500&family=DM+Sans:wght@400;500;600&display=swap');
                * { box-sizing: border-box; }
                ::-webkit-scrollbar { width: 4px; }
                ::-webkit-scrollbar-track { background: #0a0a0a; }
                ::-webkit-scrollbar-thumb { background: #2a2a2a; border-radius: 4px; }
                .meme-card:hover { transform: translateY(-2px); box-shadow: 0 12px 40px rgba(0,0,0,.5) !important; }
                .meme-card { transition: transform 0.2s ease, box-shadow 0.2s ease; }
                .action-btn:hover { opacity: 0.85 !important; }
                .tab-btn:hover { border-color: rgba(255,68,68,0.4) !important; }
                input:focus, textarea:focus { border-color: #ff4444 !important; outline: none; }
            `}</style>

            <Navbar />

            {/* Toast */}
            {toast && (
                <div style={{
                    ...S.toast,
                    background: toast.type === "error" ? "#3d0000" : "#003d1a",
                    borderColor: toast.type === "error" ? "#ff4444" : "#22c55e",
                }}>
                    {toast.type === "error" ? "✗" : "✓"} {toast.msg}
                </div>
            )}

            <div style={S.page}>

                {/* ── Header ── */}
                <div style={S.header}>
                    <div style={S.headerLeft}>
                        <span style={S.headerIcon}>⚡</span>
                        <div>
                            <div style={S.headerTitle}>Meme Studio</div>
                            <div style={S.headerSub}>Admin content pipeline</div>
                        </div>
                    </div>
                    <div
                        style={{
                            display: "flex",
                            gap: "10px"
                        }}
                    >

                        <button
                            style={S.refreshBtn}
                            onClick={handleRefresh}
                        >
                            ↺ Sync
                        </button>

                        <button
                            style={{
                                ...S.refreshBtn,
                                color: "#22c55e",
                                border: "1px solid #22c55e55"
                            }}
                            onClick={() =>
                                setShowCreateMeme(true)
                            }
                        >
                            + Create Meme
                        </button>

                    </div>
                </div>

                {/* ── Stats strip ── */}
                <div style={S.statsStrip}>
                    <div style={S.statChip}>
                        <span style={{ ...S.statNum, color: "#ff4444" }}>{candidateCount}</span>
                        <span style={S.statLabel}>In Queue</span>
                    </div>
                    <div style={S.statDivider} />
                    <div style={S.statChip}>
                        <span style={{ ...S.statNum, color: "#22c55e" }}>{publishedCount}</span>
                        <span style={S.statLabel}>Published</span>
                    </div>
                    <div style={S.statDivider} />
                    <div style={S.statChip}>
                        <span style={{ ...S.statNum, color: "#facc15" }}>
                            {articles.filter(a => (a.memeabilityScore || 0) >= 0.8).length}
                        </span>
                        <span style={S.statLabel}>Viral Picks</span>
                    </div>
                </div>

                {/* ── Tabs ── */}
                <div style={S.tabBar}>
                    <button
                        className="tab-btn"
                        style={{ ...S.tab, ...(activeTab === "candidates" ? S.tabActive : {}) }}
                        onClick={() => setActiveTab("candidates")}
                    >
                        <span style={S.tabIcon}>🔥</span>
                        Candidates
                        {candidateCount > 0 && (
                            <span style={{ ...S.tabBadge, background: activeTab === "candidates" ? "#ff4444" : "#2a2a2a" }}>
                                {candidateCount}
                            </span>
                        )}
                    </button>
                    <button
                        className="tab-btn"
                        style={{ ...S.tab, ...(activeTab === "published" ? S.tabActive : {}) }}
                        onClick={() => setActiveTab("published")}
                    >
                        <span style={S.tabIcon}>✦</span>
                        Published
                        {publishedCount > 0 && (
                            <span style={{ ...S.tabBadge, background: activeTab === "published" ? "#ff4444" : "#2a2a2a" }}>
                                {publishedCount}
                            </span>
                        )}
                    </button>
                </div>

                {/* ── Candidates ── */}
                {activeTab === "candidates" && (
                    <div style={S.grid}>
                        {articles.length === 0 && (
                            <div style={S.empty}>
                                <div style={S.emptyIcon}>📭</div>
                                <div style={S.emptyText}>Queue is empty</div>
                                <div style={S.emptySub}>Check back after next scrape cycle</div>
                            </div>
                        )}
                        {articles.map(article => (
                            <CandidateCard
                                key={article.id}
                                article={article}
                                customTitle={customTitles[article.id] || ""}
                                customContext={customContexts[article.id] || ""}
                                selectedFile={selectedFiles[article.id]}
                                isPublishing={!!publishing[article.id]}
                                onTitleChange={v => setCustomTitles(p => ({ ...p, [article.id]: v }))}
                                onContextChange={v => setCustomContexts(p => ({ ...p, [article.id]: v }))}
                                onFileSelect={file => setSelectedFiles(p => ({ ...p, [article.id]: file }))}
                                onPublish={() => handleMemeUpload(
                                    { target: { files: [selectedFiles[article.id]] } }, article
                                )}
                            />
                        ))}
                    </div>
                )}

                {/* ── Published ── */}
                {activeTab === "published" && (
                    <div style={S.grid}>
                        {publishedMemes.length === 0 && (
                            <div style={S.empty}>
                                <div style={S.emptyIcon}>🎭</div>
                                <div style={S.emptyText}>No memes published yet</div>
                            </div>
                        )}
                        {publishedMemes.map(meme => (
                            <PublishedCard
                                key={meme.id}
                                meme={meme}
                                isEditing={editingMemeId === meme.id}
                                onEditToggle={() => setEditingMemeId(editingMemeId === meme.id ? null : meme.id)}
                                onUpdate={updated => setPublishedMemes(prev => prev.map(m => m.id === meme.id ? { ...m, ...updated } : m))}
                                onDelete={() => {
                                    axios.delete(`${BASE_URL}/api/content/memes/${meme.id}`)
                                        .then(() => {
                                            cache.publishedMemes = (cache.publishedMemes || []).filter(m => m.id !== meme.id);
                                            setPublishedMemes(prev => prev.filter(m => m.id !== meme.id));
                                            showToast("Meme deleted");
                                        }).catch(console.error);
                                }}
                                onSave={(updated) => {
                                    const token = localStorage.getItem("token");
                                    axios.put(`${BASE_URL}/api/content/memes/${meme.id}`, updated,
                                        { headers: { Authorization: `Bearer ${token}` } })
                                        .then(() => { setEditingMemeId(null); showToast("Meme updated!"); })
                                        .catch(console.error);
                                }}
                            />
                        ))}
                    </div>
                )}
            </div>

            {showCreateMeme && (

                <div
                    style={{
                        position: "fixed",
                        inset: 0,
                        background: "rgba(0,0,0,0.8)",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        zIndex: 9999
                    }}
                >

                    <div
                        style={{
                            width: "90%",
                            maxWidth: "500px",
                            background: "#111",
                            borderRadius: "16px",
                            padding: "20px",
                            border: "1px solid #222"
                        }}
                    >

                        <h2
                            style={{
                                color: "#fff",
                                marginBottom: "20px"
                            }}
                        >
                            Create Meme
                        </h2>

                        <input
                            type="text"
                            placeholder="Punchy Meme Title"
                            value={newMemeTitle}
                            onChange={(e) =>
                                setNewMemeTitle(
                                    e.target.value
                                )
                            }
                            style={S.textInput}
                        />

                        <textarea
                            placeholder="Short Context"
                            value={newMemeContext}
                            onChange={(e) =>
                                setNewMemeContext(
                                    e.target.value
                                )
                            }
                            style={{
                                ...S.textArea,
                                marginTop: "12px"
                            }}
                        />

                        <input
                            type="file"
                            accept="image/*"
                            style={{
                                marginTop: "12px",
                                color: "#fff"
                            }}
                            onChange={(e) =>
                                setNewMemeImage(
                                    e.target.files[0]
                                )
                            }
                        />

                        <div
                            style={{
                                display: "flex",
                                gap: "10px",
                                marginTop: "20px"
                            }}
                        >

                            <button
                                style={S.btnGhost}
                                onClick={() =>
                                    setShowCreateMeme(false)
                                }
                            >
                                Cancel
                            </button>

                            <button
                                style={S.btnPublish}
                                onClick={handleCreateMeme}
                                disabled={creatingMeme}
                            >
                                {creatingMeme
                                    ? "Publishing..."
                                    : "Publish Meme"}
                            </button>

                        </div>

                    </div>

                </div>

            )}

            <BottomNav />
        </>
    );
}

// ── Candidate Card ─────────────────────────────────────────────────────────
function CandidateCard({ article, customTitle, customContext, selectedFile, isPublishing, onTitleChange, onContextChange, onFileSelect, onPublish }) {
    const score = article.memeabilityScore;
    return (
        <div className="meme-card" style={S.card}>
            {/* Image */}
            <div style={S.cardImgWrap}>
                <img src={article.imageUrl} alt={article.title} style={S.cardImg}
                    onError={e => { e.target.style.display = "none"; }} />
                <div style={{ ...S.scorePill, background: scoreColor(score) }}>
                    {scoreLabel(score)}
                </div>
                <div style={S.cardImgOverlay} />
            </div>

            {/* Body */}
            <div style={S.cardBody}>
                <div style={S.cardMeta}>
                    <span style={S.cardId}>#{article.id}</span>
                    <span style={{ ...S.scoreBar }}>
                        <span style={{ ...S.scoreBarFill, width: `${(score || 0) * 100}%`, background: scoreColor(score) }} />
                    </span>
                    <span style={{ ...S.scoreNum, color: scoreColor(score) }}>{score ? (score * 100).toFixed(0) + "%" : "—"}</span>
                </div>

                <h3 style={S.cardTitle}>{article.title}</h3>
                <p style={S.cardSummary}>{article.summary?.split(" ").slice(0, 20).join(" ")}…</p>

                {/* Inputs */}
                <input
                    type="text"
                    placeholder="Meme title..."
                    style={S.textInput}
                    value={customTitle}
                    onChange={e => onTitleChange(e.target.value)}
                />
                <textarea
                    placeholder="Short context (1-2 lines)..."
                    style={S.textArea}
                    value={customContext}
                    onChange={e => onContextChange(e.target.value)}
                />

                {/* File selected indicator */}
                {selectedFile && (
                    <div style={S.fileChip}>
                        ✓ {selectedFile.name}
                    </div>
                )}

                {/* Actions */}
                <div style={S.actions}>
                    <button className="action-btn" style={S.btnGhost}
                        onClick={() => { navigator.clipboard.writeText(article.summary); }}>
                        ⎘ Copy
                    </button>
                    <button className="action-btn" style={S.btnGhost}
                        onClick={() => window.open(`/article/${article.id}`, "_blank")}>
                        ↗ Article
                    </button>
                    <label style={S.btnBlue}>
                        ⊞ Image
                        <input type="file" hidden accept="image/*"
                            onChange={e => onFileSelect(e.target.files[0])} />
                    </label>
                    <button className="action-btn"
                        style={{ ...S.btnPublish, opacity: isPublishing ? 0.6 : 1 }}
                        onClick={onPublish}
                        disabled={isPublishing}>
                        {isPublishing ? "↻ Posting..." : "▶ Publish"}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ── Published Card ─────────────────────────────────────────────────────────
function PublishedCard({ meme, isEditing, onEditToggle, onUpdate, onDelete, onSave }) {
    return (
        <div className="meme-card" style={{ ...S.card, borderColor: "#1a1a1a" }}>
            <div style={S.cardImgWrap}>
                <img src={meme.imageUrl} alt={meme.title} style={S.cardImg}
                    onError={e => { e.target.style.display = "none"; }} />
                <div style={{ ...S.scorePill, background: "#22c55e" }}>✦ LIVE</div>
                <div style={S.cardImgOverlay} />
            </div>
            <div style={S.cardBody}>
                <div style={S.cardMeta}>
                    <span style={S.cardId}>#{meme.id}</span>
                </div>
                {isEditing ? (
                    <>
                        <input type="text" value={meme.title} style={S.textInput}
                            onChange={e => onUpdate({ title: e.target.value })} />
                        <textarea value={meme.shortContext} style={S.textArea}
                            onChange={e => onUpdate({ shortContext: e.target.value })} />
                        <div style={S.actions}>
                            <button className="action-btn" style={S.btnPublish}
                                onClick={() => onSave({ title: meme.title, shortContext: meme.shortContext, imageUrl: meme.imageUrl, memeabilityScore: meme.memeabilityScore })}>
                                ✓ Save
                            </button>
                            <button className="action-btn" style={S.btnGhost} onClick={onEditToggle}>
                                ✕ Cancel
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        <h3 style={S.cardTitle}>{meme.title}</h3>
                        <p style={S.cardSummary}>{meme.shortContext}</p>
                        <div style={S.actions}>
                            <button className="action-btn" style={S.btnBlue} onClick={onEditToggle}>
                                ✎ Edit
                            </button>
                            <button className="action-btn" style={{ ...S.btnGhost, color: "#ff4444", borderColor: "#ff444433" }} onClick={onDelete}>
                                ⌫ Delete
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

// ── Styles ──────────────────────────────────────────────────────────────────
const S = {
    page: {
        background: "#080808",
        minHeight: "100vh",
        paddingBottom: 120,
        fontFamily: "'DM Sans', sans-serif",
    },
    header: {
        display: "flex", alignItems: "center",
        justifyContent: "space-between",
        padding: "20px 24px 16px",
        borderBottom: "1px solid #141414",
    },
    headerLeft: { display: "flex", alignItems: "center", gap: 14 },
    headerIcon: { fontSize: 28, lineHeight: 1 },
    headerTitle: {
        fontFamily: "'Syne', sans-serif",
        fontSize: 22, fontWeight: 800,
        color: "#fff", letterSpacing: "-0.02em",
    },
    headerSub: { fontSize: 12, color: "#444", marginTop: 2 },
    refreshBtn: {
        padding: "8px 18px",
        borderRadius: 8,
        border: "1px solid #2a2a2a",
        background: "transparent",
        color: "#666",
        cursor: "pointer",
        fontSize: 13,
        fontWeight: 600,
        fontFamily: "'DM Mono', monospace",
        transition: "all 0.15s",
    },
    statsStrip: {
        display: "flex", alignItems: "center",
        padding: "14px 24px",
        borderBottom: "1px solid #141414",
        gap: 24,
    },
    statChip: { display: "flex", alignItems: "baseline", gap: 8 },
    statNum: { fontFamily: "'Syne', sans-serif", fontSize: 22, fontWeight: 800 },
    statLabel: { fontSize: 11, color: "#444", textTransform: "uppercase", letterSpacing: "0.08em" },
    statDivider: { width: 1, height: 24, background: "#1e1e1e" },
    tabBar: {
        display: "flex", gap: 4,
        padding: "14px 24px 0",
        borderBottom: "1px solid #141414",
    },
    tab: {
        display: "flex", alignItems: "center", gap: 8,
        padding: "10px 20px",
        borderRadius: "10px 10px 0 0",
        border: "1px solid transparent",
        borderBottom: "none",
        background: "transparent",
        color: "#555",
        cursor: "pointer",
        fontSize: 14, fontWeight: 600,
        fontFamily: "'DM Sans', sans-serif",
        transition: "all 0.15s",
    },
    tabActive: {
        background: "#111",
        color: "#fff",
        borderColor: "#2a2a2a",
        borderBottomColor: "#111",
    },
    tabIcon: { fontSize: 14 },
    tabBadge: {
        fontSize: 11, fontWeight: 700,
        padding: "1px 7px",
        borderRadius: 99,
        color: "#fff",
        fontFamily: "'DM Mono', monospace",
    },
    grid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
        gap: 16,
        padding: 24,
    },
    card: {
        background: "#0f0f0f",
        borderRadius: 16,
        overflow: "hidden",
        border: "1px solid #1e1e1e",
        boxShadow: "0 4px 20px rgba(0,0,0,.4)",
    },
    cardImgWrap: { position: "relative", height: 200, overflow: "hidden", background: "#111" },
    cardImg: { width: "100%", height: "100%", objectFit: "cover", display: "block" },
    cardImgOverlay: {
        position: "absolute", inset: 0,
        background: "linear-gradient(to bottom, transparent 50%, #0f0f0f)",
    },
    scorePill: {
        position: "absolute", top: 12, right: 12,
        padding: "4px 10px",
        borderRadius: 6,
        fontSize: 11, fontWeight: 700,
        color: "#fff",
        fontFamily: "'DM Mono', monospace",
        letterSpacing: "0.05em",
    },
    cardBody: { padding: "14px 16px 16px", display: "flex", flexDirection: "column", gap: 10 },
    cardMeta: { display: "flex", alignItems: "center", gap: 8 },
    cardId: {
        fontFamily: "'DM Mono', monospace",
        fontSize: 11, color: "#444",
        background: "#141414",
        padding: "2px 8px", borderRadius: 4,
    },
    scoreBar: {
        flex: 1, height: 3,
        background: "#1e1e1e",
        borderRadius: 99, overflow: "hidden",
    },
    scoreBarFill: { display: "block", height: "100%", borderRadius: 99, transition: "width 0.3s" },
    scoreNum: { fontFamily: "'DM Mono', monospace", fontSize: 11, fontWeight: 600 },
    cardTitle: {
        margin: 0,
        fontFamily: "'Syne', sans-serif",
        fontSize: 15, fontWeight: 700,
        color: "#e8e8e8", lineHeight: 1.35,
    },
    cardSummary: { margin: 0, fontSize: 13, color: "#555", lineHeight: 1.55 },
    textInput: {
        width: "100%",
        padding: "9px 12px",
        borderRadius: 8,
        border: "1px solid #1e1e1e",
        background: "#141414",
        color: "#e8e8e8",
        fontSize: 13,
        fontFamily: "'DM Sans', sans-serif",
        transition: "border-color 0.15s",
    },
    textArea: {
        width: "100%",
        padding: "9px 12px",
        borderRadius: 8,
        border: "1px solid #1e1e1e",
        background: "#141414",
        color: "#e8e8e8",
        fontSize: 13,
        minHeight: 70,
        resize: "vertical",
        fontFamily: "'DM Sans', sans-serif",
        transition: "border-color 0.15s",
    },
    fileChip: {
        fontSize: 11, color: "#22c55e",
        background: "#0a2010",
        border: "1px solid #14532d",
        padding: "4px 10px", borderRadius: 6,
        fontFamily: "'DM Mono', monospace",
        wordBreak: "break-all",
    },
    actions: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 6, marginTop: 2 },
    btnGhost: {
        padding: "8px 4px",
        borderRadius: 7,
        border: "1px solid #2a2a2a",
        background: "transparent",
        color: "#666",
        cursor: "pointer",
        fontSize: 12, fontWeight: 600,
        textAlign: "center",
        fontFamily: "'DM Sans', sans-serif",
        transition: "opacity 0.15s",
    },
    btnBlue: {
        padding: "8px 4px",
        borderRadius: 7,
        border: "none",
        background: "#1d3461",
        color: "#93c5fd",
        cursor: "pointer",
        fontSize: 12, fontWeight: 600,
        textAlign: "center",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: "'DM Sans', sans-serif",
    },
    btnPublish: {
        padding: "8px 4px",
        borderRadius: 7,
        border: "none",
        background: "#ff4444",
        color: "#fff",
        cursor: "pointer",
        fontSize: 12, fontWeight: 700,
        textAlign: "center",
        fontFamily: "'Syne', sans-serif",
        letterSpacing: "0.02em",
    },
    empty: {
        gridColumn: "1/-1",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        padding: "80px 24px",
        gap: 12,
    },
    emptyIcon: { fontSize: 48 },
    emptyText: { fontFamily: "'Syne', sans-serif", fontSize: 18, fontWeight: 700, color: "#333" },
    emptySub: { fontSize: 13, color: "#333" },
    toast: {
        position: "fixed", bottom: 80, left: "50%",
        transform: "translateX(-50%)",
        padding: "10px 20px",
        borderRadius: 10,
        border: "1px solid",
        color: "#fff",
        fontSize: 13, fontWeight: 600,
        zIndex: 99999,
        whiteSpace: "nowrap",
        fontFamily: "'DM Sans', sans-serif",
        boxShadow: "0 4px 24px rgba(0,0,0,.5)",
    },
    loadingScreen: {
        background: "#080808", minHeight: "100vh",
        display: "flex", alignItems: "center", justifyContent: "center",
    },
    loadingInner: { display: "flex", flexDirection: "column", alignItems: "center", gap: 16 },
    loadingPulse: {
        width: 40, height: 40,
        borderRadius: "50%",
        border: "3px solid #ff4444",
        borderTopColor: "transparent",
        animation: "spin 0.8s linear infinite",
    },
    loadingText: { color: "#444", fontSize: 14, fontFamily: "'DM Mono', monospace" },
};