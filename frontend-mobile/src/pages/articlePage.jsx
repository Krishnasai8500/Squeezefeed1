import { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { getComments, createComment, getArticleById } from "../services/api";
import Navbar from "../components/navbar";

const selectedLanguage = localStorage.getItem("selectedLanguage") || "en";

const FALLBACK_IMAGE =
  "https://placehold.co/800x400/1a1a1a/FF6A00?text=SqueezeFeed";
const VIBES = [
  "more informed than your relatives 💀",
  "doomscrolling but educational 📉",
  "brain upgraded successfully 🧠",
  "internet scholar unlocked 🌍",
  "your IQ just increased slightly 📚",
  "emotionally damaged but informed 😭",
  "geopolitics entered your bloodstream 🌐",
];

function decodeHTML(str) {
  if (!str) return "";
  return str
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ");
}

function SqueezeMark({ size = 28 }) {
  return (
    <svg width={size} height={size * 1.25} viewBox="0 0 64 80" fill="none">
      <rect x="4" y="6" width="56" height="8" rx="4" fill="#FF6A00" />
      <rect
        x="10"
        y="20"
        width="44"
        height="8"
        rx="4"
        fill="#FF6A00"
        opacity="0.82"
      />
      <rect
        x="18"
        y="34"
        width="28"
        height="8"
        rx="4"
        fill="#FF6A00"
        opacity="0.62"
      />
      <rect
        x="24"
        y="48"
        width="16"
        height="8"
        rx="4"
        fill="#FF6A00"
        opacity="0.42"
      />
      <rect
        x="28"
        y="62"
        width="8"
        height="8"
        rx="4"
        fill="#FF6A00"
        opacity="0.25"
      />
    </svg>
  );
}

export default function ArticlePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isPublic = location.pathname.includes("/public/");

  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [vibe, setVibe] = useState("");
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setVibe(VIBES[Math.floor(Math.random() * VIBES.length)]);

    getArticleById(id)
      .then((res) => setArticle(res.data))
      .catch(() => navigate("/"))
      .finally(() => setLoading(false));

    getComments(id)
      .then((res) => setComments(res.data || []))
      .catch(console.error);

    const timer = setTimeout(() => {
      const authUserId = localStorage.getItem("authUserId");
      const params = new URLSearchParams(window.location.search);
      const refUser = params.get("ref");

      if (isPublic && refUser) {
        const shareKey = `shared_${id}_${refUser}`;
        if (!localStorage.getItem(shareKey)) {
          axios
            .post(`https://api.squeezefeed.com/api/users/track/share/${refUser}`)
            .then(() => localStorage.setItem(shareKey, "true"))
            .catch(console.error);
        }
      }

      if (authUserId) {
        axios
          .post(`https://api.squeezefeed.com/api/users/track/read/${authUserId}`)
          .catch(console.error);
      }
    }, 6000);

    return () => clearTimeout(timer);
  }, [id]);

  const handleComment = async () => {
    if (!commentText.trim()) return;
    const authUserId = localStorage.getItem("authUserId");
    const username = localStorage.getItem("username");
    try {
      const res = await createComment({
        contentId: Number(id),
        authUserId: Number(authUserId),
        username,
        commentText,
      });
      setComments((prev) => [res.data, ...prev]);
      setCommentText("");
    } catch (err) {
      console.error(err);
    }
  };

  const handleShare = () => {
    const authUserId = localStorage.getItem("authUserId");
    // FIXED:
    const shareUrl =
        `https://share.squeezefeed.com/public/article/${article.id}?ref=${authUserId}`;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading)
    return (
      <div style={S.loadingPage}>
        <div style={S.loadingSpinner} />
      </div>
    );
  if (!article) return null;

  const title = decodeHTML(
    article.translatedTitle?.[selectedLanguage] || article.title,
  );
  const summary =
    decodeHTML(
      article.translatedSummary?.[selectedLanguage] || article.summary,
    ) ||
    decodeHTML(article.description) ||
    "No summary available.";

  return (
    <>
      <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap');
                @keyframes spin { to { transform: rotate(360deg); } }
                @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
                @keyframes shimmer { 0%{background-position:200% center;} 100%{background-position:-200% center;} }
                .sf-back:hover { background: rgba(255,255,255,0.08) !important; }
                .sf-share:hover { filter: brightness(1.1); }
                .sf-login:hover { filter: brightness(1.08); transform: translateY(-1px); }
                .sf-comment-btn:hover { filter: brightness(1.1); }
            `}</style>

      <div style={S.page}>
        {/* ── Top bar ── */}
        {!isPublic ? (
          <Navbar />
        ) : (
          <div style={S.publicBar}>
            <div style={S.publicBarInner}>
              <div style={S.publicLogo}>
                <SqueezeMark size={22} />
                <span style={S.logoText}>
                  Squeeze<span style={{ color: "#FF6A00" }}>Feed</span>
                </span>
              </div>
{/*               <button */}
{/*                 className="sf-login" */}
{/*                 style={S.publicJoinBtn} */}

{/*                 onClick={() => navigate("/download")} */}
{/*               > */}
{/*                 Join Free → */}
{/*               </button> */}


              <button
                style={S.publicJoinBtn}
                onClick={() => {

                  navigate("/download");
                }}
              >
                Join Free →
              </button>
            </div>
          </div>
        )}

        <div style={S.container}>
          {/* Back button — authenticated only */}
          {!isPublic && (
            <button
              className="sf-back"
              style={S.backBtn}
              onClick={() => navigate(-1)}
            >
              ← Back
            </button>
          )}

          {/* Article content */}
          <article style={S.article}>
            {/* Title */}
            <h1 style={S.title}>{title}</h1>

            {/* Vibe — authenticated only */}
            {!isPublic && <div style={S.vibePill}>{vibe}</div>}

            {/* Meta row — authenticated only */}
            {!isPublic && (
              <div style={S.meta}>
                <span style={S.metaItem}>
                  ✍️ {article.author || "SqueezeFeed"}
                </span>
                <span style={S.metaDot}>·</span>
                <span style={S.metaItem}>
                  {article.publishedAt
                    ? new Date(article.publishedAt).toLocaleDateString(
                        "en-IN",
                        { day: "numeric", month: "short", year: "numeric" },
                      )
                    : "N/A"}
                </span>
                <span style={S.metaDot}>·</span>
                <span style={S.langBadge}>{article.language || "ENGLISH"}</span>
                <button
                  className="sf-share"
                  style={S.shareBtn}
                  onClick={handleShare}
                >
                  {copied ? "✓ Copied!" : "↗ Share"}
                </button>
              </div>
            )}

            {/* Image */}
            <div style={S.imageWrap}>
              <img
                src={article.imageUrl || FALLBACK_IMAGE}
                alt={title}
                style={S.image}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = FALLBACK_IMAGE;
                }}
              />
            </div>

            {/* Summary */}
            <div style={S.summaryBox}>
              <div style={S.summaryAccent} />
              <p style={S.summaryText}>{summary}</p>
            </div>

            {/*                          */}
            {/* Read full article */}
            {/*                         {article.sourceUrl && ( */}
            {/*                             <a href={article.sourceUrl} target="_blank" rel="noreferrer" style={S.readFull}> */}
            {/*                                 Read Full Article → */}
            {/*                             </a> */}
            {/*                         )} */}
          </article>

          {/* ── Comments ── */}
          <div style={S.commentsSection}>
            <h3 style={S.commentsHeading}>
              <span style={{ marginRight: "8px" }}>💬</span>
              Comments
              {comments.length > 0 && (
                <span style={S.commentCount}>{comments.length}</span>
              )}
            </h3>

            {/* Comment input — hide for public users */}
            {!isPublic ? (
              <div style={S.commentInputWrap}>
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Share your thoughts..."
                  style={S.commentInput}
                />
                <button
                  className="sf-comment-btn"
                  style={S.commentPostBtn}
                  onClick={handleComment}
                >
                  Post
                </button>
              </div>
            ) : (
              <div style={S.publicCommentBanner}>
                <span
                  style={{ color: "rgba(255,255,255,0.4)", fontSize: "14px" }}
                >
                  Join SqueezeFeed to comment
                </span>
                <button
                  style={S.publicCommentJoin}


                  onClick={() => navigate("/download")}
                >
                  Sign up free
                </button>
              </div>
            )}

            {/* Comments list */}
            <div style={S.commentsList}>
              {comments.length === 0 ? (
                <p
                  style={{
                    color: "#444",
                    fontSize: "14px",
                    textAlign: "center",
                    padding: "24px 0",
                  }}
                >
                  No comments yet. Be the first.
                </p>
              ) : (
                comments.map((comment) => (
                  <div key={comment.id} style={S.commentCard}>
                    <div style={S.commentUser}>{comment.username}</div>
                    <div style={S.commentText}>{comment.commentText}</div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* ── Public CTA banner ── */}
          {isPublic && (
            <div style={S.ctaBanner}>
              <div style={S.ctaIcon}>
                <SqueezeMark size={32} />
              </div>
              <div>
                <div style={S.ctaTitle}>Get the full experience</div>
                <div style={S.ctaSub}>
                  Personalised news, memes, saved articles & more.
                </div>
              </div>
              <button
                className="sf-login"
                style={S.ctaBtn}
                onClick={() => navigate("/download")}
              >
                Join Free
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

const S = {
  page: {
    background: "#0a0a0a",
    minHeight: "100vh",
    fontFamily: "'DM Sans', sans-serif",
  },
  loadingPage: {
    background: "#0a0a0a",
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  loadingSpinner: {
    width: "28px",
    height: "28px",
    borderRadius: "50%",
    border: "2px solid rgba(255,106,0,0.2)",
    borderTopColor: "#FF6A00",
    animation: "spin 0.8s linear infinite",
  },

  // Public top bar
  publicBar: {
    position: "sticky",
    top: 0,
    zIndex: 100,
    background: "rgba(10,10,10,0.95)",
    backdropFilter: "blur(16px)",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
  },
  publicBarInner: {
    maxWidth: "800px",
    margin: "0 auto",
    padding: "12px 16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  publicLogo: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  logoText: {
    fontFamily: "'Playfair Display', serif",
    fontSize: "18px",
    fontWeight: "800",
    color: "#fff",
    letterSpacing: "-0.3px",
  },
  publicJoinBtn: {
    background: "linear-gradient(135deg, #FF6A00, #cc5200)",
    color: "#fff",
    border: "none",
    padding: "8px 18px",
    borderRadius: "20px",
    fontSize: "13px",
    fontWeight: "700",
    cursor: "pointer",
    letterSpacing: "0.02em",
    transition: "all 0.2s",
  },

  container: {
    maxWidth: "720px",
    margin: "0 auto",
    padding: "24px 16px 60px",
    animation: "fadeUp 0.4s ease both",
  },
  backBtn: {
    background: "none",
    border: "1px solid rgba(255,255,255,0.08)",
    color: "rgba(255,255,255,0.45)",
    padding: "7px 16px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "13px",
    marginBottom: "24px",
    transition: "background 0.2s",
    fontFamily: "inherit",
  },

  article: { marginBottom: "40px" },

  categoryPill: {
    display: "inline-block",
    background: "rgba(255,106,0,0.12)",
    border: "1px solid rgba(255,106,0,0.25)",
    color: "#FF6A00",
    fontSize: "10px",
    fontWeight: "700",
    letterSpacing: "0.1em",
    padding: "4px 12px",
    borderRadius: "20px",
    marginBottom: "16px",
  },

  title: {
    fontFamily: "'Playfair Display', serif",
    color: "#f0ece0",
    fontSize: "clamp(22px, 5vw, 32px)",
    fontWeight: "800",
    lineHeight: "1.3",
    margin: "0 0 16px",
    letterSpacing: "-0.02em",
  },

  vibePill: {
    display: "inline-block",
    color: "#FF6A00",
    fontSize: "13px",
    fontWeight: "600",
    marginBottom: "16px",
    background: "rgba(255,106,0,0.08)",
    padding: "5px 12px",
    borderRadius: "20px",
    border: "1px solid rgba(255,106,0,0.15)",
  },

  meta: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    flexWrap: "wrap",
    marginBottom: "24px",
  },
  metaItem: { color: "#555", fontSize: "13px" },
  metaDot: { color: "#333", fontSize: "13px" },
  langBadge: {
    background: "#1a1a1a",
    border: "1px solid rgba(255,255,255,0.06)",
    color: "#555",
    fontSize: "11px",
    padding: "2px 8px",
    borderRadius: "4px",
    fontWeight: "600",
    letterSpacing: "0.04em",
  },
  shareBtn: {
    marginLeft: "auto",
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)",
    color: "#aaa",
    fontSize: "12px",
    fontWeight: "600",
    padding: "5px 14px",
    borderRadius: "20px",
    cursor: "pointer",
    transition: "filter 0.2s",
    fontFamily: "inherit",
  },

  imageWrap: {
    width: "100%",
    borderRadius: "16px",
    overflow: "hidden",
    marginBottom: "28px",
    background: "#111",
    boxShadow: "0 8px 40px rgba(0,0,0,0.5)",
  },
  image: {
    width: "100%",
    height: "auto",
    objectFit: "contain",
    display: "block",
  },

  summaryBox: {
    display: "flex",
    gap: "16px",
    background: "rgba(255,255,255,0.02)",
    border: "1px solid rgba(255,255,255,0.05)",
    borderRadius: "14px",
    padding: "20px",
    marginBottom: "20px",
  },
  summaryAccent: {
    width: "3px",
    borderRadius: "999px",
    background: "linear-gradient(to bottom, #FF6A00, rgba(255,106,0,0.1))",
    flexShrink: 0,
  },
  summaryText: {
    color: "#888",
    fontSize: "15px",
    lineHeight: "1.75",
    margin: 0,
    fontStyle: "italic",
  },

  readFull: {
    color: "#FF6A00",
    fontSize: "14px",
    fontWeight: "600",
    textDecoration: "none",
    display: "inline-flex",
    alignItems: "center",
    gap: "4px",
    padding: "8px 0",
    borderBottom: "1px solid rgba(255,106,0,0.3)",
    transition: "opacity 0.2s",
  },

  // Comments
  commentsSection: { marginTop: "40px" },
  commentsHeading: {
    color: "#fff",
    fontSize: "17px",
    fontWeight: "700",
    margin: "0 0 20px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontFamily: "'Playfair Display', serif",
  },
  commentCount: {
    background: "rgba(255,106,0,0.12)",
    color: "#FF6A00",
    fontSize: "12px",
    fontWeight: "700",
    padding: "2px 8px",
    borderRadius: "20px",
  },

  commentInputWrap: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    marginBottom: "24px",
  },
  commentInput: {
    width: "100%",
    minHeight: "88px",
    background: "#141414",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: "14px",
    color: "#e0dbd0",
    padding: "14px",
    fontSize: "14px",
    resize: "vertical",
    outline: "none",
    fontFamily: "inherit",
    boxSizing: "border-box",
    lineHeight: "1.5",
  },
  commentPostBtn: {
    alignSelf: "flex-end",
    background: "linear-gradient(135deg, #FF6A00, #cc5200)",
    color: "#fff",
    border: "none",
    padding: "10px 24px",
    borderRadius: "20px",
    fontWeight: "700",
    fontSize: "13px",
    cursor: "pointer",
    transition: "filter 0.2s",
    fontFamily: "inherit",
  },

  publicCommentBanner: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    background: "rgba(255,255,255,0.02)",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: "12px",
    padding: "14px 16px",
    marginBottom: "24px",
  },
  publicCommentJoin: {
    background: "rgba(255,106,0,0.12)",
    border: "1px solid rgba(255,106,0,0.3)",
    color: "#FF6A00",
    fontSize: "13px",
    fontWeight: "700",
    padding: "7px 16px",
    borderRadius: "20px",
    cursor: "pointer",
    fontFamily: "inherit",
  },

  commentsList: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  commentCard: {
    background: "#111",
    border: "1px solid rgba(255,255,255,0.04)",
    borderRadius: "14px",
    padding: "14px 16px",
  },
  commentUser: {
    color: "#FF6A00",
    fontWeight: "700",
    fontSize: "12px",
    letterSpacing: "0.04em",
    marginBottom: "6px",
  },
  commentText: {
    color: "#777",
    lineHeight: "1.55",
    fontSize: "14px",
  },

  // Public CTA
  ctaBanner: {
    marginTop: "48px",
    background:
      "linear-gradient(135deg, rgba(255,106,0,0.08), rgba(255,106,0,0.03))",
    border: "1px solid rgba(255,106,0,0.15)",
    borderRadius: "20px",
    padding: "24px",
    display: "flex",
    alignItems: "center",
    gap: "16px",
    flexWrap: "wrap",
  },
  ctaIcon: { flexShrink: 0 },
  ctaTitle: {
    color: "#fff",
    fontSize: "16px",
    fontWeight: "700",
    marginBottom: "4px",
    fontFamily: "'Playfair Display', serif",
  },
  ctaSub: {
    color: "#555",
    fontSize: "13px",
    lineHeight: "1.4",
  },
  ctaBtn: {
    marginLeft: "auto",
    background: "linear-gradient(135deg, #FF6A00, #cc5200)",
    backgroundSize: "200% auto",
    animation: "shimmer 3s linear infinite",
    color: "#fff",
    border: "none",
    padding: "11px 24px",
    borderRadius: "20px",
    fontWeight: "700",
    fontSize: "14px",
    cursor: "pointer",
    whiteSpace: "nowrap",
    transition: "all 0.2s",
    fontFamily: "inherit",
  },
};
