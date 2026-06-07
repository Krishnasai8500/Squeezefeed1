import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/navbar";
import ArticleCard from "../components/ArticleCard";
import { setSavedCache } from "../services/savedCache";
import BottomNav from "../components/bottomNav";

// const BASE_URL = "https://api.nxtbharat.com";
const BASE_URL = "https://api.nxtbharat.com";

export default function SavedPage() {
  const navigate = useNavigate();
  const [articles, setArticles] = useState([]);
  const [memes, setMemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("articles"); // 'articles' | 'memes'

  useEffect(() => {
    const token = localStorage.getItem("token");
    const authUserId = localStorage.getItem("authUserId");

    if (!authUserId || !token) {
      navigate("/login");
      return;
    }

    const headers = { Authorization: `Bearer ${token}` };

    Promise.all([
      axios.get(`${BASE_URL}/api/content/saved/${authUserId}`, { headers }),
      axios.get(`${BASE_URL}/api/content/memes`, { headers }),
      axios.get(`${BASE_URL}/api/users/profile/${authUserId}`, { headers }),
    ])
      .then(([savedRes, memesRes, profileRes]) => {
        const savedArticles = savedRes.data || [];
        const allMemes = memesRes.data || [];

        console.log(
          "SAVED ARTICLES:",
          savedArticles.map((a) => a.id),
        ); // ← add

        setArticles(savedArticles);

        // Seed save cache
        const map = {};
        savedArticles.forEach((a) => {
          map[a.id] = true;
        });
        setSavedCache(map);

        const savedMemeIds = new Set(profileRes.data.savedMemeIds || []);

        const savedMemes = allMemes.filter((meme) => savedMemeIds.has(meme.id));
        setMemes(savedMemes);

        // Also add the sourceContentIds from memes to articles list
        // so clicking "View Post" works
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <>
        <Navbar />
        <div style={S.loading}>
          <div style={S.spinner} />
          <span>Loading saved content...</span>
        </div>
      </>
    );

  return (
    <>
      <div style={S.page}>
        <Navbar />
        <div style={S.container}>
          <button style={S.backBtn} onClick={() => window.history.back()}>
            ← Back
          </button>

          <h1 style={S.heading}>🔖 Saved</h1>

          {/* Tab switcher */}
          <div style={S.tabs}>
            <button
              style={{ ...S.tab, ...(tab === "articles" ? S.tabActive : {}) }}
              onClick={() => setTab("articles")}
            >
              Articles
              <span style={S.tabCount}>{articles.length}</span>
            </button>
            <button
              style={{ ...S.tab, ...(tab === "memes" ? S.tabActive : {}) }}
              onClick={() => setTab("memes")}
            >
              Memes
              <span style={S.tabCount}>{memes.length}</span>
            </button>
          </div>

          {/* ── Articles tab ── */}
          {tab === "articles" &&
            (articles.length === 0 ? (
              <div style={S.empty}>
                <div style={{ fontSize: "40px", marginBottom: "12px" }}>📭</div>
                <p>No saved articles yet.</p>
                <p style={{ color: "#444", fontSize: "13px" }}>
                  Hit 🔖 on any article to save it.
                </p>
              </div>
            ) : (
              <div style={S.grid}>
                {articles.map((article) => (
                  <div key={article.id} style={S.cardWrapper}>
                    <ArticleCard
                      article={article}
                      navigate={navigate}
                      fromSavedPage={true}
                    />
                  </div>
                ))}
              </div>
            ))}

          {/* ── Memes tab ── */}
          {tab === "memes" &&
            (memes.length === 0 ? (
              <div style={S.empty}>
                <div style={{ fontSize: "40px", marginBottom: "12px" }}>🤣</div>
                <p>No saved memes yet.</p>
                <p style={{ color: "#444", fontSize: "13px" }}>
                  Hit 🔖 on any meme to save it here.
                </p>
              </div>
            ) : (
              <div style={S.memeGrid}>
                {memes.map((meme) => (
                  <div key={meme.id} style={S.memeCard}>
                    <div style={S.memeImgWrap}>
                      <img
                        src={meme.imageUrl}
                        alt={meme.title}
                        style={S.memeImg}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src =
                            "https://placehold.co/400x400/111/fff?text=Meme";
                        }}
                      />
                    </div>
                    <div style={S.memeInfo}>
                      <h3 style={S.memeTitle}>{meme.title}</h3>
                      {meme.shortContext && (
                        <p style={S.memeContext}>{meme.shortContext}</p>
                      )}

                      <button
                        style={S.viewPostBtn}
                        onClick={() =>
                          navigate("/memes", {
                            state: {
                              memeId: meme.id,
                            },
                          })
                        }
                      >
                        🎭 View in Visually
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ))}
        </div>
      </div>
      <BottomNav />
    </>
  );
}

const S = {
  page: {
    background: "#080808",
    minHeight: "100vh",
    paddingBottom: "80px",
  },
  container: {
    padding: "20px 16px",
    maxWidth: "700px",
    margin: "0 auto",
  },
  backBtn: {
    background: "none",
    border: "1px solid rgba(255,255,255,0.1)",
    color: "rgba(255,255,255,0.5)",
    borderRadius: "8px",
    padding: "6px 14px",
    fontSize: "13px",
    cursor: "pointer",
    marginBottom: "16px",
    fontFamily: "inherit",
  },
  heading: {
    color: "#fff",
    fontSize: "22px",
    fontWeight: "700",
    margin: "0 0 20px",
  },

  // Tabs
  tabs: {
    display: "flex",
    gap: "8px",
    marginBottom: "24px",
    borderBottom: "1px solid rgba(255,255,255,0.07)",
    paddingBottom: "0",
  },
  tab: {
    background: "none",
    border: "none",
    color: "rgba(255,255,255,0.4)",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    padding: "10px 4px",
    borderBottom: "2px solid transparent",
    display: "flex",
    alignItems: "center",
    gap: "6px",
    transition: "all 0.2s",
    fontFamily: "inherit",
    marginBottom: "-1px",
  },
  tabActive: {
    color: "#FF6A00",
    borderBottom: "2px solid #FF6A00",
  },
  tabCount: {
    background: "rgba(255,106,0,0.15)",
    color: "#FF6A00",
    borderRadius: "20px",
    padding: "1px 7px",
    fontSize: "11px",
    fontWeight: "700",
  },

  // Articles grid — fixed height removed, let card define its own height
  grid: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  cardWrapper: {
    // No fixed height — ArticleCard renders at its natural height
    width: "100%",
  },

  // Memes grid
  memeGrid: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  memeCard: {
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: "16px",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
  },
  memeImgWrap: {
    width: "100%",
    background: "#000",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    maxHeight: "320px",
    overflow: "hidden",
  },
  memeImg: {
    width: "100%",
    height: "auto", // natural height — no crop
    objectFit: "contain",
    display: "block",
    maxHeight: "320px",
  },
  memeInfo: {
    padding: "14px 16px 16px",
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  memeTitle: {
    color: "#fff",
    fontSize: "15px",
    fontWeight: "700",
    margin: 0,
    lineHeight: 1.3,
    fontFamily: "'Barlow Condensed', sans-serif",
    textTransform: "uppercase",
    letterSpacing: "0.02em",
  },
  memeContext: {
    color: "rgba(255,255,255,0.5)",
    fontSize: "13px",
    margin: 0,
    lineHeight: 1.5,
  },
  viewPostBtn: {
    alignSelf: "flex-start",
    marginTop: "8px",
    background: "linear-gradient(135deg, #FF6A00, #cc5200)",
    border: "none",
    color: "#fff",
    borderRadius: "10px",
    padding: "8px 16px",
    fontSize: "12px",
    fontWeight: "700",
    cursor: "pointer",
    fontFamily: "inherit",
    letterSpacing: "0.02em",
    boxShadow: "0 4px 12px rgba(255,106,0,0.3)",
  },

  empty: {
    textAlign: "center",
    color: "#555",
    fontSize: "15px",
    marginTop: "60px",
    lineHeight: 1.6,
  },
  loading: {
    background: "#080808",
    color: "rgba(255,255,255,0.4)",
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    gap: "14px",
    justifyContent: "center",
    alignItems: "center",
    fontSize: "14px",
  },
  spinner: {
    width: "22px",
    height: "22px",
    borderRadius: "50%",
    border: "2px solid rgba(255,106,0,0.2)",
    borderTopColor: "#FF6A00",
    animation: "spin 0.8s linear infinite",
  },
};
