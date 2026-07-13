import { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
  saveArticle,
  unsaveArticle,
  getComments,
  createComment,
} from "../services/api";
import { markSaved, markUnsaved, isSaved } from "../services/savedCache";
import { showToast } from "../components/Toast";
import { App as CapacitorApp } from "@capacitor/app";
const languageMap = { ENGLISH: "en", TELUGU: "te", HINDI: "hi" };
const trackedReads = JSON.parse(sessionStorage.getItem("trackedReads") || "[]");
const FALLBACK_IMAGE = "https://placehold.co/800x400/111/d4af37?text=VISUALLY";

// Add these two:
const CATEGORY_GRADIENTS = {
  sports: "135deg, #f093fb, #f5576c",
  finance: "135deg, #4facfe, #00f2fe",
  tech: "135deg, #43e97b, #38f9d7",
  entertainment: "135deg, #fa709a, #fee140",
  world: "135deg, #a18cd1, #fbc2eb",
  politics: "135deg, #f7971e, #ffd200",
  health: "135deg, #d4fc79, #96e6a1",
  science: "135deg, #667eea, #764ba2",
  crime: "135deg, #2d3436, #636e72",
  general: "135deg, #ffecd2, #fcb69f",
};
const CATEGORY_ICONS = {
  sports: "🏏",
  finance: "📈",
  tech: "💻",
  entertainment: "🎬",
  world: "🌍",
  politics: "🏛️",
  health: "🏥",
  science: "🔬",
  crime: "⚖️",
  general: "📰",
};

export default function ArticleCard({
  article,
  navigate,
  savedArticles,
  setSavedArticles,
  fromSavedPage = false,
}) {
  const role = localStorage.getItem("role");
  const selectedLanguageRaw = localStorage.getItem("selectedLanguage") || "en";
  const selectedLanguage =
    selectedLanguageRaw.length === 2
      ? selectedLanguageRaw
      : languageMap[selectedLanguageRaw] || "en";

  const [flipped, setFlipped] = useState(false);

  const [summaryExpanded, setSummaryExpanded] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [saved, setSaved] = useState(
    savedArticles ? !!savedArticles[article.id] : isSaved(article.id),
  );
  const [saving, setSaving] = useState(false);
  const [tracked, setTracked] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");

  const [showReportModal, setShowReportModal] = useState(false);

  const [reportReason, setReportReason] = useState("");

  const [reportDescription, setReportDescription] = useState("");

  const cardRef = useRef(null);
  const contentRef = useRef(null);
  const titleRef = useRef(null);
  const summaryRef = useRef(null);

  useEffect(() => {
    if (!showComments) return;

    const handler = CapacitorApp.addListener("backButton", ({ canGoBack }) => {
      setShowComments(false);
    });

    return () => {
      handler.remove();
    };
  }, [showComments]);

  useEffect(() => {
    if (!flipped) return;

    const handler = CapacitorApp.addListener("backButton", () => {
      setFlipped(false);
    });

    return () => {
      handler.remove();
    };
  }, [flipped]);
  // ── read-tracking ─────────────────────────────────────
  useEffect(() => {
    if (!cardRef.current || tracked) return;
    const authUserId = localStorage.getItem("authUserId");
    if (!authUserId || trackedReads.includes(article.id)) return;
    let timer = null;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          timer = setTimeout(() => {
            const token = localStorage.getItem("token");
            axios.post(
                "https://api.squeezefeed.com/api/users/track/read",
                {
                    authUserId,
                    contentId: article.id
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            )
              .then((res) => {
                setTracked(true);
                const alreadyShown = JSON.parse(
                  localStorage.getItem("shownBadges") || "[]",
                );
                const newBadges = res.data.newlyEarnedBadges || [];
                const unseenBadges = newBadges.filter(
                  (b) => !alreadyShown.includes(b),
                );
                if (unseenBadges.length > 0) {
                  localStorage.setItem("hasPendingBadges", "true");
                  localStorage.setItem(
                    "achievementPopup",
                    "🏆 New achievement unlocked! Visit profile.",
                  );
                  localStorage.setItem(
                    "shownBadges",
                    JSON.stringify([...alreadyShown, ...unseenBadges]),
                  );
                  window.dispatchEvent(new Event("badgeUnlocked"));
                }
                trackedReads.push(article.id);
                sessionStorage.setItem(
                  "trackedReads",
                  JSON.stringify(trackedReads),
                );
              })
              .catch(console.error);
          }, 6000);
        } else {
          if (timer) clearTimeout(timer);
        }
      },
      { threshold: 0.75 },
    );
    observer.observe(cardRef.current);
    return () => {
      observer.disconnect();
      if (timer) clearTimeout(timer);
    };
  }, [tracked]);

  //Impression
  useEffect(() => {
    if (!cardRef.current) return;

    const authUserId = localStorage.getItem("authUserId");
    const token = localStorage.getItem("token");

    if (!authUserId || !token) return;

    let trackedImpression = false;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !trackedImpression) {
          trackedImpression = true;

          axios
            .post(
              `https://api.squeezefeed.com/api/users/track/impression/${authUserId}`,
              {
                contentId: article.id,
              },
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              },
            )
            .catch(console.error);
        }
      },
      {
        threshold: 0.5,
      },
    );

    observer.observe(cardRef.current);

    return () => observer.disconnect();
  }, [article.id]);

  // ── save toggle ───────────────────────────────────────
  async function handleSaveToggle() {
    if (saving) return;
    setSaving(true);
    const authUserId = localStorage.getItem("authUserId");
    if (!authUserId) {
      setSaving(false);
      return;
    }
    const nowSaved = !saved;
    setSaved(nowSaved);
    nowSaved ? markSaved(article.id) : markUnsaved(article.id);
    if (setSavedArticles)
      setSavedArticles((prev) => ({ ...prev, [article.id]: nowSaved }));
    try {
      nowSaved
        ? await saveArticle(authUserId, article.id)
        : await unsaveArticle(authUserId, article.id);
    } catch {
      setSaved(!nowSaved);
      nowSaved ? markUnsaved(article.id) : markSaved(article.id);
      if (setSavedArticles)
        setSavedArticles((prev) => ({ ...prev, [article.id]: !nowSaved }));
    } finally {
      setSaving(false);
    }
  }

  function getLocalizedTitle() {
    if (selectedLanguage === "en") {
      return article.translatedTitle?.en || article.title;
    }

    return article.translatedTitle?.[selectedLanguage] || article.title;
  }
  function getLocalizedSummary() {
    if (selectedLanguage === "en") {
      return article.translatedSummary?.en || article.summary;
    }

    return article.translatedSummary?.[selectedLanguage] || article.summary;
  }

  //     const summaryText = getLocalizedSummary() || "";

  const summaryText = (getLocalizedSummary() || "")
    .replace(/\s*[\u2026\.]{3}\s*/g, " ")
    .replace(/\s*…\s*/g, " ");

  //isClamped measures whether the text is actually overflowing the 3-line clamp — no false positives

  const [isClamped, setIsClamped] = useState(false);

  useEffect(() => {
    const el = summaryRef.current;
    if (!el) return;
    const id = setTimeout(() => {
      setIsClamped(el.scrollHeight > el.clientHeight + 2);
    }, 100);
    return () => clearTimeout(id);
  }, [summaryText, selectedLanguage]);

  return (
    <>
      <style>{`
               @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap');
               .action-btn:hover { background: rgba(212,175,55,0.12) !important; border-color: rgba(212,175,55,0.3) !important; }
               .read-btn:hover   { background: #c9a227 !important; }
               .save-btn-saved:hover { background: #145228 !important; }
               .flip-container { perspective: 1200px; width: 100%; height: 100%; }
               .flip-inner {
                   position: relative; width: 100%; height: 100%;
                   transform-style: preserve-3d;
                   transition: transform 0.55s cubic-bezier(0.4,0.2,0.2,1);
               }
               .flip-inner.flipped { transform: rotateY(180deg); }
               .flip-front, .flip-back {
                   position: absolute; inset: 0;
                   backface-visibility: hidden;
                   -webkit-backface-visibility: hidden;
               }
               .flip-back { transform: rotateY(180deg); }
           `}</style>

      <div className="flip-container">
        <div className={`flip-inner ${flipped ? "flipped" : ""}`}>
          {/* ── FRONT ── */}
          <div className="flip-front">
            <div ref={cardRef} style={S.card}>
              {/* Image */}
              <div style={S.imageBox}>
                {imgError || !article.imageUrl ? (
                  <div
                    style={{
                      background: `linear-gradient(${CATEGORY_GRADIENTS[article.category?.toLowerCase()] || CATEGORY_GRADIENTS.general})`,
                      width: "100%",
                      height: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "64px",
                    }}
                  >
                    {CATEGORY_ICONS[article.category?.toLowerCase()] || "📰"}
                  </div>
                ) : (
                  <img
                    src={article.imageUrl}
                    loading="lazy"
                    alt={article.title}
                    style={S.image}
                    onError={() => setImgError(true)}
                  />
                )}
                <div style={S.imageOverlay} />
              </div>

              {/* Admin badge */}
              {role === "ADMIN" && (
                <span style={S.adminBadge}>#{article.id}</span>
              )}

              {/* Content */}
              <div style={S.content} ref={contentRef}>
                <h2
                  ref={titleRef}
                  style={{
                    ...S.title,
                    fontSize:
                      selectedLanguage === "te"
                        ? "15px"
                        : "clamp(16px, 4.2vw, 22px)",
                    lineHeight: selectedLanguage === "te" ? "1.6" : "1.3",
                  }}
                >
                  {getLocalizedTitle()}
                </h2>

                <p
                  ref={summaryRef}
                  style={{
                    ...S.summary,
                    fontSize:
                      selectedLanguage === "te"
                        ? "13px"
                        : "clamp(13px, 3.5vw, 15px)",
                    WebkitLineClamp: 3,
                    overflow: "hidden",
                    display: "-webkit-box",
                  }}
                >
                  {summaryText}
                </p>

                {/* Tap to read more hint */}
                {isClamped && (
                  <div onClick={() => setFlipped(true)} style={S.flipHint}>
                    <span>📖 Tap to read full summary</span>
                    <span style={{ fontSize: "16px" }}>↩</span>
                  </div>
                )}
              </div>

              {/* Action row */}
              <div style={S.actionRow}>
                <button
                  className="action-btn"
                  style={S.iconBtn}
                  onClick={async () => {
                    setShowComments(true);
                    try {
                      const res = await getComments(article.id);
                      setComments(res.data || []);
                    } catch (err) {
                      console.error(err);
                    }
                  }}
                >
                  <CommentIcon />
                  <span style={S.btnLabel}>{article.commentCount || 0}</span>
                </button>

                <button
                  className={saved ? "action-btn save-btn-saved" : "action-btn"}
                  style={{
                    ...S.iconBtn,
                    background: saved ? "rgba(22,163,74,0.15)" : "transparent",
                    borderColor: saved
                      ? "rgba(22,163,74,0.4)"
                      : "rgba(255,255,255,0.08)",
                    paddingLeft: "14px",
                    paddingRight: "14px",
                    gap: "6px",
                  }}
                  onClick={handleSaveToggle}
                  disabled={saving}
                >
                  <BookmarkIcon filled={saved} />
                  <span
                    style={{ ...S.btnLabel, color: saved ? "#4ade80" : "#666" }}
                  >
                    {saved ? "Saved" : "Save"}
                  </span>
                </button>

                <button
                  className="action-btn"
                  style={S.iconBtn}
                  onClick={() => {
                    const token = localStorage.getItem("token");
                    if (!token) {
                      navigate("/login");
                      return;
                    }
                    const authUserId = localStorage.getItem("authUserId");
                    // FIXED:
                    const shareUrl = `https://squeezefeed.com/article/${article.id}?ref=${authUserId}`;
                    navigator.clipboard.writeText(shareUrl);
                    showToast("Link copied!", "success");
                  }}
                >
                  <ShareIcon />
                </button>

                <button
                  className="action-btn"
                  style={S.iconBtn}
                  onClick={() => setShowReportModal(true)}
                >
                  <FlagIcon />
                </button>

                {role === "ADMIN" && (
                  <button
                    className="action-btn"
                    style={S.iconBtn}
                    onClick={async () => {
                      const token = localStorage.getItem("token");
                      try {
                        await axios.put(
                          `https://api.squeezefeed.com/api/content/admin/${article.id}/remove`,
                          {},
                          { headers: { Authorization: `Bearer ${token}` } },
                        );
                        window.location.reload();
                      } catch (err) {
                        console.error(err);
                      }
                    }}
                  >
                    🗑️
                  </button>
                )}

                <button
                  className="read-btn"
                  style={S.readBtn}
                  onClick={() => {
                    if (fromSavedPage) {
                      navigate("/", { state: { targetArticleId: article.id } });
                    } else {
                      window.open(article.sourceUrl, "_blank");
                    }
                  }}
                >
                  {fromSavedPage ? "Feed ↗" : "Read Article"}
                </button>
              </div>
            </div>
          </div>

          {/* ── BACK ── */}
          <div className="flip-back">
            <div style={{ ...S.card, background: "#0d0d0d" }}>
              {/* Header */}
              <div style={S.backHeader}>
                <h2
                  style={{
                    ...S.title,
                    fontSize: "clamp(15px, 4vw, 19px)",
                    flex: 1,
                  }}
                >
                  {getLocalizedTitle()}
                </h2>
                <button
                  onClick={() => setFlipped(false)}
                  style={S.flipBackBtn}
                  title="Flip back"
                >
                  ↩
                </button>
              </div>

              {/* Full summary scrollable */}
              <div style={S.backContent}>
                <p style={S.backSummary}>{summaryText}</p>
              </div>

              {/* Bottom read button */}
              <div style={S.backFooter}>
                <button
                  style={S.readBtn}
                  onClick={() => window.open(article.sourceUrl, "_blank")}
                >
                  Read Full Article ↗
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Comment sheet */}
      {showComments && (
        <div className="comment-overlay" style={S.commentOverlay}>
          <div style={S.commentModal}>
            <div style={S.commentHeader}>
              <span style={S.commentTitle}>Comments</span>
              <button style={S.closeBtn} onClick={() => setShowComments(false)}>
                ✕
              </button>
            </div>
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Share your thoughts..."
              style={S.commentInput}
            />
            <button
              style={S.postBtn}
              onClick={async () => {
                const authUserId = localStorage.getItem("authUserId");
                const username = localStorage.getItem("username");
                try {
                  const res = await createComment({
                    contentId: article.id,
                    authUserId: Number(authUserId),
                    username,
                    commentText,
                  });
                  setComments((prev) => [res.data, ...prev]);
                  setCommentText("");
                } catch (err) {
                  console.error(err);
                }
              }}
            >
              Post
            </button>
            <div style={S.commentList}>
              {comments.map((comment) => (
                <div key={comment.id} style={S.commentCard}>
                  <div style={S.commentUser}>{comment.username}</div>
                  <div style={S.commentText}>{comment.commentText}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Report modal */}
      {showReportModal && (
        <div className="report-overlay" style={S.commentOverlay}>
          <div style={S.commentModal}>
            <div style={S.commentHeader}>
              <span style={S.commentTitle}>Report Article</span>
              <button
                style={S.closeBtn}
                onClick={() => setShowReportModal(false)}
              >
                ✕
              </button>
            </div>
            <select
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              style={S.commentInput}
            >
              <option value="">Select Reason</option>
              <option value="MISINFORMATION">Misinformation</option>
              <option value="SPAM">Spam</option>
              <option value="HATE_SPEECH">Hate Speech</option>
              <option value="OFFENSIVE">Offensive Content</option>
              <option value="HARASSMENT">Harassment</option>
              <option value="COPYRIGHT">Copyright Violation</option>
              <option value="OTHER">Other</option>
            </select>
            {reportReason === "OTHER" && (
              <textarea
                value={reportDescription}
                onChange={(e) => setReportDescription(e.target.value)}
                placeholder="Please explain the issue"
                style={{ ...S.commentInput, marginTop: "12px" }}
              />
            )}
            <button
              style={S.postBtn}
              onClick={async () => {
                const authUserId = localStorage.getItem("authUserId");
                const token = localStorage.getItem("token");
                if (!reportReason) {
                  showToast("Please select a reason", "error");
                  return;
                }
                if (
                  reportReason === "OTHER" &&
                  reportDescription.trim().length < 5
                ) {
                  showToast(
                    "Please explain the issue in at least 5 characters",
                    "error",
                  );
                  return;
                }
                try {
                  await axios.post(
                    "https://api.squeezefeed.com/api/reports",
                    {
                      contentId: article.id,
                      reason: reportReason,
                      description: reportDescription,
                    },
                    {
                      headers: {
                        Authorization: `Bearer ${token}`,
                        "X-Auth-User-Id": authUserId,
                      },
                    },
                  );
                  showToast("Report submitted successfully", "success");
                  setShowReportModal(false);
                  setReportReason("");
                  setReportDescription("");
                } catch (err) {
                  showToast(
                    "Failed to submit report. Please try again.",
                    "error",
                  );
                }
              }}
            >
              Submit Report
            </button>
          </div>
        </div>
      )}
    </>
  );
}

// ── SVG Icons ─────────────────────────────────────────────────
function CommentIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
        stroke="#666"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function BookmarkIcon({ filled }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path
        d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"
        fill={filled ? "#4ade80" : "none"}
        stroke={filled ? "#4ade80" : "#666"}
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function ShareIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M16 6l-4-4-4 4M12 2v13"
        stroke="#666"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function FlagIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path
        d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"
        stroke="#e05252"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <line
        x1="4"
        y1="22"
        x2="4"
        y2="15"
        stroke="#e05252"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

// ── Styles ────────────────────────────────────────────────────
const S = {
  card: {
    width: "100%",
    height: "100%",
    background: "#0a0a0a",
    display: "flex",
    flexDirection: "column",
    position: "relative",
    overflow: "hidden",
    fontFamily: "'DM Sans', sans-serif",
  },
  imageBox: {
    width: "100%",
    flex: "0 0 42%",
    overflow: "hidden",
    background: "#111",
    position: "relative",
    flexShrink: 0,
  },
  image: {
    width: "100%",
    height: "100%",
    objectFit: "contain",
    display: "block",
    transition: "transform 0.4s ease",
  },
  imageOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "40%",
    background: "linear-gradient(to bottom, transparent, #0a0a0a)",
    pointerEvents: "none",
  },
  adminBadge: {
    position: "absolute",
    top: "12px",
    left: "12px",
    fontSize: "10px",
    fontWeight: 700,
    color: "#60a5fa",
    background: "#0f172a",
    border: "1px solid #1e3a5f",
    borderRadius: "5px",
    padding: "2px 8px",
    fontFamily: "monospace",
    letterSpacing: 0.3,
    zIndex: 2,
  },
  content: {
    flex: 1,
    padding: "16px 18px 0",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    minHeight: 0,
    gap: "10px",
  },
  title: {
    color: "#f0ece0",
    fontFamily: "'Playfair Display', serif",
    fontWeight: "800",
    margin: 0,
    flexShrink: 0,
    letterSpacing: "-0.01em",
  },
  summary: {
    color: "#6b6560",
    lineHeight: "1.65",
    margin: 0,
    display: "-webkit-box",
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
    textOverflow: "clip", // ← ADD THIS
    flex: 1,
    minHeight: 0,
  },
  moreBtn: {
    color: "#d4af37",
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: "600",
  },
  actionRow: {
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "12px 16px 82px",
    background: "linear-gradient(to top, #0a0a0a 65%, transparent)",
    marginTop: "auto",
  },
  iconBtn: {
    height: "38px",
    minWidth: "38px",
    borderRadius: "999px",
    border: "1px solid rgba(255,255,255,0.08)",
    background: "transparent",
    color: "#fff",
    cursor: "pointer",
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "5px",
    padding: "0 10px",
    transition: "all 0.2s",
  },
  btnLabel: {
    fontSize: "12px",
    fontWeight: "600",
    color: "#555",
    letterSpacing: "0.02em",
  },
  readBtn: {
    marginLeft: "auto",
    background: "#d4af37",
    color: "#0a0a0a",
    border: "none",
    padding: "10px 12px",
    borderRadius: "999px",
    cursor: "pointer",
    fontWeight: "700",
    fontSize: "12px",
    letterSpacing: "0.02em",
    flexShrink: 1,
    whiteSpace: "nowrap",
  },
  // Comment sheet
  commentOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.88)",
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-end",
    zIndex: 99999,
  },
  commentModal: {
    width: "100%",
    maxWidth: "520px",
    maxHeight: "76vh",
    overflowY: "auto",
    background: "#0f0f0f",
    borderRadius: "24px 24px 0 0",
    padding: "20px 20px 32px",
    borderTop: "1px solid rgba(212,175,55,0.15)",
  },
  commentHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "16px",
  },
  commentTitle: {
    fontFamily: "'Playfair Display', serif",
    color: "#f0ece0",
    fontSize: "18px",
    fontWeight: "700",
  },
  closeBtn: {
    background: "rgba(255,255,255,0.06)",
    border: "none",
    color: "#888",
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    cursor: "pointer",
    fontSize: "14px",
  },
  commentInput: {
    width: "100%",
    minHeight: "80px",
    background: "#161616",
    color: "#e0dbd0",
    border: "1px solid rgba(212,175,55,0.15)",
    borderRadius: "14px",
    padding: "12px 14px",
    fontSize: "14px",
    boxSizing: "border-box",
    resize: "none",
    outline: "none",
    fontFamily: "'DM Sans', sans-serif",
  },
  postBtn: {
    marginTop: "10px",
    background: "#d4af37",
    color: "#0a0a0a",
    border: "none",
    padding: "10px 24px",
    borderRadius: "999px",
    cursor: "pointer",
    fontWeight: "700",
    fontSize: "13px",
    fontFamily: "'DM Sans', sans-serif",
    letterSpacing: "0.04em",
  },
  commentList: {
    marginTop: "20px",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  commentCard: {
    background: "#161616",
    border: "1px solid rgba(255,255,255,0.04)",
    borderRadius: "14px",
    padding: "12px 14px",
  },
  commentUser: {
    color: "#d4af37",
    fontWeight: "600",
    marginBottom: "4px",
    fontSize: "12px",
    letterSpacing: "0.04em",
  },
  commentText: {
    color: "#7a7570",
    lineHeight: "1.55",
    fontSize: "14px",
  },

  flipHint: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    background: "rgba(212,175,55,0.08)",
    border: "1px solid rgba(212,175,55,0.2)",
    borderRadius: "10px",
    padding: "8px 14px",
    cursor: "pointer",
    flexShrink: 0,
    color: "#d4af37",
    fontSize: "12px",
    fontWeight: "600",
    letterSpacing: "0.02em",
  },
  backHeader: {
    display: "flex",
    alignItems: "flex-start",
    gap: "12px",
    padding: "20px 18px 12px",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
    flexShrink: 0,
  },
  flipBackBtn: {
    background: "rgba(212,175,55,0.1)",
    border: "1px solid rgba(212,175,55,0.3)",
    color: "#d4af37",
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    cursor: "pointer",
    fontSize: "16px",
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  backContent: {
    flex: 1,
    overflowY: "auto",
    padding: "20px 18px",
    scrollbarWidth: "none",
  },
  backSummary: {
    color: "#c8c3b8",
    lineHeight: "1.8",
    fontSize: "clamp(14px, 3.8vw, 16px)",
    margin: 0,
  },
  backFooter: {
    flexShrink: 0,
    padding: "12px 18px 20px",
    borderTop: "1px solid rgba(255,255,255,0.06)",
    display: "flex",
    justifyContent: "flex-end",
  },
};
