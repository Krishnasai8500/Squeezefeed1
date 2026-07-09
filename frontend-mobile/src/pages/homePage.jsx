import { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getFeed, getTrending, updateLocation } from "../services/api";
import Navbar from "../components/navbar";
import ArticleCard from "../components/ArticleCard";
import axios from "axios";
import { setSavedCache } from "../services/savedCache";
import BottomNav from "../components/bottomNav";

const HEADER_H = 96;
const PAGE_SIZE = 20;
// Cache expires after 2 minutes so fresh articles always appear on revisit
const CACHE_TTL_MS = 2 * 60 * 1000;

export default function HomePage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [articles, setArticles] = useState([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [fetchingMore, setFetchingMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [achievementPopup, setAchievementPopup] = useState(null);
  const [bottomNavH, setBottomNavH] = useState(70);

  // Prevent duplicate in-flight fetches for the same page
  const fetchingPages = useRef(new Set());
  const articleRefs = useRef({});
  const feedRef = useRef(null);

  const refreshFeed = async () => {
    try {
      sessionStorage.removeItem("feedCache");

      const authUserId = localStorage.getItem("authUserId");

      const feedRes = await getFeed(authUserId, 0, PAGE_SIZE);

      const raw = Array.isArray(feedRes.data)
        ? feedRes.data
        : (feedRes.data?.content ?? feedRes.data?.articles ?? []);

      const sorted = [...raw].sort(
        (a, b) =>
          new Date(b.publishedAt || b.createdAt || 0) -
          new Date(a.publishedAt || a.createdAt || 0),
      );

      setArticles(sorted);
      setPage(0);

      if (feedRef.current) {
        feedRef.current.scrollTop = 0;
      }
    } catch (err) {
      console.error(err);
    }
  };

  // REPLACE WITH:
  const scrollRestoredRef = useRef(false);

  useEffect(() => {
    if (scrollRestoredRef.current) return; // only restore once
    if (!feedRef.current || articles.length === 0) return;

    const savedScroll = sessionStorage.getItem("homeScrollPosition");
    if (savedScroll) {
      // rAF ensures the DOM has fully painted the articles before scrolling
      requestAnimationFrame(() => {
        feedRef.current.scrollTop = Number(savedScroll);
        scrollRestoredRef.current = true;
      });
    }
  }, [articles]);

  // ── bottom-nav height ──────────────────────────────────────────
  useEffect(() => {
    const el = document.querySelector("[data-bottomnav]");
    if (el) setBottomNavH(el.offsetHeight);
  }, []);

  // ── achievement popup ──────────────────────────────────────────
  useEffect(() => {
    const popup = localStorage.getItem("achievementPopup");
    if (popup) {
      setAchievementPopup(popup);
      setTimeout(() => {
        setAchievementPopup(null);
        localStorage.removeItem("achievementPopup");
      }, 4000);
    }
  }, [articles]);

  useEffect(() => {
    const handler = () => {
      const popup = localStorage.getItem("achievementPopup");
      if (popup) {
        setAchievementPopup(popup);
        setTimeout(() => {
          setAchievementPopup(null);
          localStorage.removeItem("achievementPopup");
        }, 4000);
      }
    };
    window.addEventListener("badgeUnlocked", handler);
    return () => window.removeEventListener("badgeUnlocked", handler);
  }, []);

  // ── lock body scroll ───────────────────────────────────────────
  useEffect(() => {
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    };
  }, []);

  // ── one-time setup: auth check + saved articles + location ─────
  // Separated from the feed fetch so it doesn't run on every page change
  useEffect(() => {
    const token = localStorage.getItem("token");
    const authUserId = localStorage.getItem("authUserId");

    if (!token) {
      navigate("/login");
      return;
    }

    // Saved articles cache (non-blocking)
    if (authUserId) {
      axios
        .get(`https://api.squeezefeed.com/api/content/saved/${authUserId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
          const map = {};
          (res.data || []).forEach((a) => {
            map[a.id] = true;
          });
          setSavedCache(map);
        })
        .catch(console.error);

      // Location update (only once per session)
      if (localStorage.getItem("locationAsked") !== "true") {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            localStorage.setItem("locationAsked", "true");
            try {
              const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.coords.latitude}&lon=${position.coords.longitude}`,
              );
              const data = await response.json();
              await updateLocation({
                authUserId,
                city:
                  data.address.city ||
                  data.address.town ||
                  data.address.village,
                state: data.address.state,
                country: data.address.country,
              });
            } catch (err) {
              console.error(err);
            }
          },
          () => {
            localStorage.setItem("locationAsked", "true");
          },
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
        );
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // ← runs ONCE only

  // ── feed fetch — runs when `page` changes ──────────────────────
  useEffect(() => {
    const token = localStorage.getItem("token");
    const authUserId = localStorage.getItem("authUserId");
    if (!token) return;

    // Guard: don't double-fetch the same page
    if (fetchingPages.current.has(page)) return;
    fetchingPages.current.add(page);

    const isFirstPage = page === 0;

    // For page 0: show cache instantly, then refresh silently
    if (isFirstPage) {
      try {
        const raw = sessionStorage.getItem("feedCache");
        if (raw) {
          const parsed = JSON.parse(raw);
          const age = Date.now() - (parsed.ts || 0);
          // Only use cache if it's fresh AND we have articles
          if (parsed.articles?.length > 0 && age < CACHE_TTL_MS) {
            setArticles(parsed.articles);
            setLoading(false);
            // Still fetch fresh in background — don't return early
          } else {
            // Cache is stale — wipe it so user sees fresh data
            sessionStorage.removeItem("feedCache");
          }
        }
      } catch {
        sessionStorage.removeItem("feedCache");
      }
    }

    getFeed(authUserId, page, PAGE_SIZE)
      .then((feedRes) => {
        // Normalise response shape — handle array, { content }, { articles }
        const raw = Array.isArray(feedRes.data)
          ? feedRes.data
          : (feedRes.data?.content ?? feedRes.data?.articles ?? []);

        // Sort newest first
        const sorted = [...raw].sort(
          (a, b) =>
            new Date(b.publishedAt || b.createdAt || 0) -
            new Date(a.publishedAt || a.createdAt || 0),
        );

        if (sorted.length < PAGE_SIZE) setHasMore(false);
        if (sorted.length === 0 && isFirstPage) {
          setError("No articles found. Please try again.");
          return;
        }

        setArticles((prev) => {
          let combined;
          if (isFirstPage) {
            // Always replace page-0 results with the freshest data
            combined = sorted;
          } else {
            // Append, dedup by id
            const existingIds = new Set(prev.map((a) => a.id));
            combined = [
              ...prev,
              ...sorted.filter((a) => !existingIds.has(a.id)),
            ];
          }

          // ✅ Write cache ONCE, inside setArticles, with a timestamp
          // Only cache first 30 articles to keep sessionStorage light
          sessionStorage.setItem(
            "feedCache",
            JSON.stringify({ articles: combined.slice(0, 30), ts: Date.now() }),
          );

          return combined;
        });
      })
      .catch((err) => {
        console.error("Feed fetch error:", err);
        if (err?.response?.status === 401) {
          localStorage.clear();
          navigate("/login");
        } else {
          setArticles((prev) => {
            if (prev.length === 0)
              setError("Failed to load news. Please refresh.");
            return prev;
          });
        }
      })
      .finally(() => {
        setLoading(false);
        setFetchingMore(false);
      });
  }, [page]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── scroll handler ─────────────────────────────────────────────
  const handleScroll = (e) => {
    sessionStorage.setItem("homeScrollPosition", e.target.scrollTop);
    const el = e.target;
    const nearBottom = el.scrollHeight - el.scrollTop <= el.clientHeight + 300;
    if (nearBottom && hasMore && !fetchingMore) {
      setFetchingMore(true);
      setPage((prev) => prev + 1);
    }
  };

  useEffect(() => {
    const articleId = location.state?.targetArticleId;

    if (!articleId || articles.length === 0) return;

    const element = articleRefs.current[articleId];

    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [articles, location.state]);

  // ── renders ────────────────────────────────────────────────────
  if (loading && articles.length === 0) {
    return (
      <>
        <style>{`
                            @keyframes spinRing { to { transform: rotate(360deg); } }
                            @keyframes sfPulse { 0%,100% { opacity:0.4; transform:scaleY(0.6); } 50% { opacity:1; transform:scaleY(1); } }
                            @keyframes shimmerSlide { 0% { background-position: -400px 0; } 100% { background-position: 400px 0; } }
                            @keyframes fadeInUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
                        `}</style>
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "#080808",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "0",
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          {/* Logo */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "48px",
              animation: "fadeInUp 0.5s ease both",
            }}
          >
            <svg width="18" height="23" viewBox="0 0 64 80" fill="none">
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
            <span
              style={{
                fontSize: "22px",
                fontWeight: "800",
                letterSpacing: "-0.4px",
                color: "#fff",
              }}
            >
              Squeeze<span style={{ color: "#FF6A00" }}>Feed</span>
            </span>
          </div>

          {/* Spinner ring */}
          <div
            style={{
              width: "52px",
              height: "52px",
              borderRadius: "50%",
              border: "3px solid rgba(255,106,0,0.15)",
              borderTopColor: "#FF6A00",
              animation: "spinRing 0.9s linear infinite",
              marginBottom: "32px",
            }}
          />

          {/* Skeleton cards */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "12px",
              width: "80%",
              maxWidth: "320px",
              animation: "fadeInUp 0.6s ease 0.2s both",
            }}
          >
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                style={{
                  background: "#111",
                  border: "1px solid rgba(255,255,255,0.04)",
                  borderRadius: "14px",
                  padding: "14px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                }}
              >
                <div
                  style={{
                    height: "12px",
                    borderRadius: "6px",
                    width: `${70 - i * 10}%`,
                    backgroundImage:
                      "linear-gradient(90deg,#1a1a1a 25%,#242424 50%,#1a1a1a 75%)",
                    backgroundSize: "400px 100%",
                    animation: `shimmerSlide 1.4s infinite linear ${i * 0.15}s`,
                  }}
                />
                <div
                  style={{
                    height: "10px",
                    borderRadius: "6px",
                    width: "45%",
                    backgroundImage:
                      "linear-gradient(90deg,#1a1a1a 25%,#242424 50%,#1a1a1a 75%)",
                    backgroundSize: "400px 100%",
                    animation: `shimmerSlide 1.4s infinite linear ${i * 0.2}s`,
                  }}
                />
              </div>
            ))}
          </div>

          {/* Tagline */}
          <p
            style={{
              color: "#333",
              fontSize: "12px",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              marginTop: "32px",
              animation: "fadeInUp 0.6s ease 0.4s both",
            }}
          >
            Curating your feed...
          </p>
        </div>
      </>
    );
  }

  if (error && articles.length === 0) {
    return (
      <div
        style={{
          background: "#080808",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Navbar onRefresh={refreshFeed} />
        <div style={styles.error}>{error}</div>
        <BottomNav /> {/* ← was missing */}
      </div>
    );
  }

  return (
    <>
      <style>{`
                .snap-feed::-webkit-scrollbar { display: none; }

                @keyframes slideUp {
                    from { transform: translate(-50%, 30px); opacity: 0; }
                    to   { transform: translate(-50%, 0);   opacity: 1; }
                }

                @keyframes articleFadeIn {
                    from {
                        opacity: 0;
                        transform: translateY(12px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            `}</style>

      <div style={styles.appShell}>
        <Navbar onRefresh={refreshFeed} />

        {achievementPopup && (
          <div style={styles.achievementPopup}>{achievementPopup}</div>
        )}

        <div
          ref={feedRef}
          className="snap-feed"
          style={{
            ...styles.snapFeed,
            bottom: `${bottomNavH}px`,
          }}
          onScroll={handleScroll}
        >
          {articles.map((article) => (
            <div
              key={article.id}
              ref={(el) => {
                if (el) {
                  articleRefs.current[article.id] = el;
                }
              }}
              style={{
                ...styles.snapSlide,
                animation: "articleFadeIn 0.35s ease",
              }}
            >
              <ArticleCard article={article} navigate={navigate} />
            </div>
          ))}

          {fetchingMore && <div style={styles.loadingMore}>Loading more…</div>}

          {!hasMore && articles.length > 0 && (
            <div style={styles.loadingMore}>You're all caught up ✓</div>
          )}
        </div>

        <BottomNav />
      </div>
    </>
  );
}

const styles = {
  appShell: {
     minHeight: "100dvh",
    background: "#080808",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  },
  snapFeed: {
    height: `calc(100dvh - ${HEADER_H}px)`,
    overflowY: "scroll",
    scrollSnapType: "y mandatory",
    msOverflowStyle: "none",
    scrollbarWidth: "none",
    WebkitOverflowScrolling: "touch",
  },
  snapSlide: {
    height: `calc(100dvh - ${HEADER_H}px)`,
    width: "100%",
    scrollSnapAlign: "start",
    scrollSnapStop: "always",
    display: "flex",
    alignItems: "stretch",
    padding: 0,
    boxSizing: "border-box",
    background: "#080808",
    flexShrink: 0,
  },
  loading: {
    color: "#fff",
    textAlign: "center",
    padding: "100px",
    background: "#080808",
    minHeight: "100vh",
  },
  loadingMore: {
    color: "#555",
    textAlign: "center",
    padding: "24px",
    fontSize: "14px",
  },
  error: {
    color: "#e63946",
    textAlign: "center",
    padding: "60px",
    fontSize: "16px",
  },
  achievementPopup: {
    position: "fixed",
    bottom: "90px",
    left: "50%",
    transform: "translateX(-50%)",
    background: "#ff9500",
    color: "#000",
    padding: "14px 22px",
    borderRadius: "18px",
    fontWeight: "bold",
    zIndex: 99999,
    boxShadow: "0 0 20px rgba(255,149,0,0.7)",
    animation: "slideUp 0.35s ease",
  },
};