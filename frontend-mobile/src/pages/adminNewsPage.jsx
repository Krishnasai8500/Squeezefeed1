import { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";

const IMGBB_API_KEY = "8ce7b976f5aa7056cfb52f304b241928";
const EDITED_IDS_KEY = "admin_edited_article_ids";

function getEditedIds() {
  try {
    return new Set(JSON.parse(localStorage.getItem(EDITED_IDS_KEY) || "[]"));
  } catch {
    return new Set();
  }
}
function addEditedId(id) {
  const ids = getEditedIds();
  ids.add(Number(id));
  localStorage.setItem(EDITED_IDS_KEY, JSON.stringify([...ids]));
}

const LANGUAGES = [
  { label: "English", value: "ENGLISH", code: "en" },
  { label: "Telugu", value: "TELUGU", code: "te" },
  { label: "Hindi", value: "HINDI", code: "hi" },
];
const CATEGORIES = [
  "POLITICS",
  "SPORTS",
  "FINANCE",
  "TECHNOLOGY",
  "INTERNATIONAL",
  "ENTERTAINMENT",
  "HEALTH",
  "SCIENCE",
  "BUSINESS",
  "GENERAL",
];
const CATEGORY_COLORS = {
  POLITICS: "#3b82f6",
  SPORTS: "#f97316",
  FINANCE: "#22c55e",
  TECHNOLOGY: "#a855f7",
  INTERNATIONAL: "#06b6d4",
  ENTERTAINMENT: "#ec4899",
  HEALTH: "#84cc16",
  SCIENCE: "#14b8a6",
  BUSINESS: "#eab308",
  GENERAL: "#6b7280",
};
const PAGE_SIZE = 10;

function cacheKey(tab, langValue, page) {
  return `admin_${tab}_${langValue}_${page}`;
}
function readCache(key) {
  try {
    const r = sessionStorage.getItem(key);
    return r ? JSON.parse(r) : null;
  } catch {
    return null;
  }
}
function writeCache(key, data) {
  try {
    sessionStorage.setItem(key, JSON.stringify(data));
  } catch {}
}
function clearCacheForTab(tab, langValue) {
  let page = 0;
  while (true) {
    const key = cacheKey(tab, langValue, page);
    if (!sessionStorage.getItem(key)) break;
    sessionStorage.removeItem(key);
    page++;
  }
}

const pickText = (mapOrStr, fallback, langCode) => {
  if (!mapOrStr) return fallback || "";
  if (typeof mapOrStr === "string") return mapOrStr;
  if (typeof mapOrStr === "object") {
    if (langCode && mapOrStr[langCode]) return mapOrStr[langCode];
    const vals = Object.values(mapOrStr).filter(Boolean);
    return vals.length > 0 ? vals[0] : fallback || "";
  }
  return fallback || "";
};
const cleanText = (t) =>
  t
    ? t
        .replace(/\.{2,}/g, "")
        .replace(/\s{2,}/g, " ")
        .trim()
    : "";
const getLangStr = (lang) => {
  if (!lang) return "";
  if (typeof lang === "string") return lang.toUpperCase();
  if (typeof lang === "object")
    return (lang.name || lang.value || "").toUpperCase();
  return String(lang).toUpperCase();
};

function apiClient() {
  const token = localStorage.getItem("token");
  return axios.create({
    baseURL: "https://api.squeezefeed.com/api/content",
    headers: { Authorization: `Bearer ${token}` },
  });
}

async function uploadToImgBB(file) {
  const base64 = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(",")[1]);
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
  const form = new FormData();
  form.append("image", base64);
  const res = await fetch(
    `https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`,
    { method: "POST", body: form },
  );
  const json = await res.json();
  if (!json.success)
    throw new Error(json.error?.message || "ImgBB upload failed");
  return json.data.url;
}

// ══════════════════════════════════════════════════════════════════════════════
// ROOT PAGE
// ══════════════════════════════════════════════════════════════════════════════
export default function AdminNewsPage() {
  const [activeTab, setActiveTab] = useState("live");
  const [selectedLang, setSelectedLang] = useState(LANGUAGES[0]);
  const [searchId, setSearchId] = useState("");
  const [searchResult, setSearchResult] = useState(null);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState(null);

  const handleSearch = async () => {
    const id = searchId.trim();
    if (!id) return;
    setSearching(true);
    setSearchError(null);
    setSearchResult(null);
    try {
      const res = await apiClient().get(`/admin/${id}`);
      setSearchResult(res.data);
    } catch (err) {
      setSearchError(
        err?.response?.status === 404
          ? `No article found with ID ${id}`
          : "Search failed: " + (err?.response?.data?.message || err.message),
      );
    } finally {
      setSearching(false);
    }
  };

  const TABS = [
    { key: "live", label: "Live News", icon: "◉" },
    { key: "removed", label: "Removed", icon: "⊗" },
    { key: "modified", label: "Modified", icon: "✎" },
  ];

  return (
    <>
      <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Mono:wght@400;500&family=DM+Sans:wght@400;500;600&display=swap');
                * { box-sizing: border-box; }
                ::-webkit-scrollbar { width: 4px; }
                ::-webkit-scrollbar-track { background: #080808; }
                ::-webkit-scrollbar-thumb { background: #222; border-radius: 4px; }
                input:focus, textarea:focus, select:focus { outline: none; border-color: #3b82f6 !important; }
                .news-card:hover .card-title { color: #fff !important; }
                .act-btn:hover { filter: brightness(1.15); }
                .lang-opt:hover { background: #141414 !important; }
            `}</style>

      <div style={S.root}>
        {/* ── Top Header ── */}
        <div style={S.topBar}>
          <button onClick={() => window.history.back()} style={S.backBtn}>
            ← Back
          </button>
          <div style={S.topLogo}>
            <span style={S.topLogoIcon}>⚙</span>
            <span style={S.topLogoText}>Admin</span>
          </div>
          <div style={S.topRight}>
            {/* Tab switcher */}
            <div style={S.tabRow}>
              {TABS.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setActiveTab(t.key)}
                  style={{
                    ...S.topTab,
                    ...(activeTab === t.key ? S.topTabActive : {}),
                  }}
                >
                  <span style={{ opacity: 0.7 }}>{t.icon}</span> {t.label}
                </button>
              ))}
            </div>
            {/* Language selector */}
            <div style={S.langPills}>
              {LANGUAGES.map((l) => (
                <button
                  key={l.value}
                  className="lang-opt"
                  onClick={() => setSelectedLang(l)}
                  style={{
                    ...S.langPill,
                    ...(selectedLang.value === l.value ? S.langPillActive : {}),
                  }}
                >
                  {l.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Search Bar ── */}
        <div style={S.searchSection}>
          <div style={S.searchLabel}>Search by Article ID</div>
          <div style={S.searchRow}>
            <input
              value={searchId}
              onChange={(e) => {
                setSearchId(e.target.value);
                setSearchResult(null);
                setSearchError(null);
              }}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="e.g. 10546"
              style={S.searchInput}
              type="number"
            />
            <button
              onClick={handleSearch}
              disabled={searching || !searchId.trim()}
              style={S.searchBtn}
            >
              {searching ? "…" : "Search"}
            </button>
            {(searchResult || searchError) && (
              <button
                onClick={() => {
                  setSearchResult(null);
                  setSearchError(null);
                  setSearchId("");
                }}
                style={S.clearBtn}
              >
                ✕
              </button>
            )}
          </div>
          {searchError && <div style={S.searchError}>{searchError}</div>}
          {searchResult && (
            <SearchResultCard
              article={searchResult}
              lang={selectedLang}
              onUpdate={(u) => setSearchResult(u)}
            />
          )}
        </div>

        {/* ── Panels ── */}
        <div style={S.panelArea}>
          <div style={{ display: activeTab === "live" ? "block" : "none" }}>
            <LivePanel lang={selectedLang} />
          </div>
          <div style={{ display: activeTab === "removed" ? "block" : "none" }}>
            <RemovedPanel lang={selectedLang} />
          </div>
          <div style={{ display: activeTab === "modified" ? "block" : "none" }}>
            <ModifiedPanel lang={selectedLang} />
          </div>
        </div>
      </div>
    </>
  );
}

// ── SearchResultCard ──────────────────────────────────────────────────────
function SearchResultCard({ article, lang, onUpdate }) {
  const [editing, setEditing] = useState(false);
  const [toast, setToast] = useState(null);
  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };
  const getTitle = (a) =>
    lang.value === "ENGLISH"
      ? a.title || ""
      : pickText(a.translatedTitle, a.title, lang.code);
  const getSummary = (a) =>
    cleanText(
      lang.value === "ENGLISH"
        ? a.description || a.summary || ""
        : pickText(a.translatedSummary, a.description || a.summary, lang.code),
    );
  return (
    <div style={{ marginTop: 14 }}>
      {toast && <Toast toast={toast} />}
      <NewsCard
        article={article}
        title={getTitle(article)}
        summary={getSummary(article)}
        badge="SEARCH"
        badgeColor="#1e3a5f"
        badgeTextColor="#93c5fd"
        actions={[
          { label: "Edit", color: "#2563eb", onClick: () => setEditing(true) },
        ]}
      />
      {editing && (
        <EditModal
          article={article}
          onSave={async (updated) => {
            await doSave(updated);
            onUpdate({ ...article, ...updated });
            setEditing(false);
            showToast("Saved!");
          }}
          onClose={() => setEditing(false)}
        />
      )}
    </div>
  );
}

async function doSave(updated) {
  if (updated.imageUrl?.startsWith("data:"))
    throw new Error("Image upload still in progress.");
  const payload = {
    title: updated.title || "",
    description: updated.description || "",
    summary: updated.summary || updated.description || "",
    fullContent: updated.fullContent || "",
    imageUrl: updated.imageUrl || "",
    author: updated.author || "",
    sourceUrl: updated.sourceUrl || "",
    category: updated.category || "",
    language: updated.language || "ENGLISH",
    tags: updated.tags || [],
    isPublished: updated.isPublished ?? true,
    isTrending: updated.isTrending ?? false,
  };
  await apiClient().put(`/admin/${updated.id}`, payload);
  addEditedId(updated.id);
}

// ── useInfiniteNews ───────────────────────────────────────────────────────
function useInfiniteNews(tab, fetchFn, lang) {
  const [articles, setArticles] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const pageRef = useRef(0);
  const fetchedPages = useRef(new Set());
  const langRef = useRef(lang);

  useEffect(() => {
    langRef.current = lang;
    fetchedPages.current = new Set();
    pageRef.current = 0;
    let cached = [],
      page = 0;
    while (true) {
      const c = readCache(cacheKey(tab, lang.value, page));
      if (!c) break;
      cached = [...cached, ...c];
      fetchedPages.current.add(page);
      pageRef.current = page;
      page++;
    }
    if (cached.length > 0) {
      setArticles(cached);
      setHasMore(true);
      setLoading(false);
    } else {
      setArticles([]);
      setHasMore(true);
      setLoading(false);
      doFetch(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang.value]);

  const doFetch = useCallback(
    async (pageNum) => {
      if (fetchedPages.current.has(pageNum)) return;
      fetchedPages.current.add(pageNum);
      setLoading(true);
      try {
        const raw = await fetchFn(langRef.current, pageNum, PAGE_SIZE);
        let items, more;
        if (Array.isArray(raw)) {
          items = raw;
          more = raw.length >= PAGE_SIZE;
        } else {
          items = raw.items ?? [];
          more = raw.hasMore ?? false;
        }
        if (!more || items.length === 0) setHasMore(false);
        if (items.length > 0) {
          writeCache(cacheKey(tab, langRef.current.value, pageNum), items);
          setArticles((prev) => {
            const ids = new Set(prev.map((a) => a.id));
            return [...prev, ...items.filter((a) => !ids.has(a.id))];
          });
        }
      } catch (err) {
        console.error("fetch error:", err);
        fetchedPages.current.delete(pageNum);
      } finally {
        setLoading(false);
      }
    },
    [fetchFn, tab],
  );

  const loadMore = useCallback(() => {
    if (!hasMore || loading) return;
    pageRef.current += 1;
    doFetch(pageRef.current);
  }, [hasMore, loading, doFetch]);
  const removeById = useCallback(
    (id) => setArticles((p) => p.filter((a) => a.id !== id)),
    [],
  );
  const updateById = useCallback(
    (id, changes) =>
      setArticles((p) =>
        p.map((a) => (a.id === id ? { ...a, ...changes } : a)),
      ),
    [],
  );

  return { articles, hasMore, loading, loadMore, removeById, updateById };
}

// ── LivePanel ─────────────────────────────────────────────────────────────
const fetchLiveNews = async (lang, page, size) => {
  const res = await apiClient().get(`/language/${lang.value}`, {
    params: { page, size },
  });
  const data = Array.isArray(res.data) ? res.data : (res.data.content ?? []);
  const edited = getEditedIds();
  return data.filter((a) => !edited.has(Number(a.id)));
};

function LivePanel({ lang }) {
  const [editing, setEditing] = useState(null);
  const [toast, setToast] = useState(null);
  const [localSearch, setLocalSearch] = useState("");
  const { articles, hasMore, loading, loadMore, removeById } = useInfiniteNews(
    "live",
    fetchLiveNews,
    lang,
  );
  const sentinelRef = useRef(null);

  useEffect(() => {
    if (!sentinelRef.current) return;
    const obs = new IntersectionObserver(
      (e) => {
        if (e[0].isIntersecting) loadMore();
      },
      { rootMargin: "600px" },
    );
    obs.observe(sentinelRef.current);
    return () => obs.disconnect();
  }, [loadMore]);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };
  const handleRemove = async (article) => {
    try {
      await apiClient().put(`/admin/${article.id}/remove`, {});
      removeById(article.id);
      showToast("Article removed.");
    } catch (err) {
      showToast(
        "Failed: " + (err?.response?.data?.message || err.message),
        "error",
      );
    }
  };
  const handleSave = async (updated) => {
    try {
      await doSave(updated);
      removeById(updated.id);
      clearCacheForTab("live", lang.value);
      clearCacheForTab("modified", lang.value);
      setEditing(null);
      showToast("Saved! Moved to Modified.");
    } catch (err) {
      throw err;
    }
  };
  const getTitle = (a) =>
    lang.value === "ENGLISH"
      ? a.title || ""
      : pickText(a.translatedTitle, a.title, lang.code);
  const getSummary = (a) =>
    cleanText(
      lang.value === "ENGLISH"
        ? a.summary || a.description || ""
        : pickText(a.translatedSummary, a.summary || a.description, lang.code),
    );
  const filtered = localSearch.trim()
    ? articles.filter(
        (a) =>
          String(a.id).includes(localSearch.trim()) ||
          (a.title || "")
            .toLowerCase()
            .includes(localSearch.trim().toLowerCase()),
      )
    : articles;

  return (
    <>
      {toast && <Toast toast={toast} />}
      <PanelFilter
        value={localSearch}
        onChange={setLocalSearch}
        count={filtered.length}
      />
      <div style={S.grid}>
        {filtered.map((a) => (
          <NewsCard
            key={a.id}
            article={a}
            title={getTitle(a)}
            summary={getSummary(a)}
            actions={[
              {
                label: "Edit",
                color: "#2563eb",
                onClick: async () => {
                  try {
                    const r = await apiClient().get(`/admin/${a.id}`);
                    setEditing(r.data);
                  } catch {
                    setEditing(a);
                  }
                },
              },
              {
                label: "Remove",
                color: "#dc2626",
                onClick: () => handleRemove(a),
              },
            ]}
          />
        ))}
      </div>
      <div ref={sentinelRef} style={{ height: 1 }} />
      {loading && <Spinner />}
      {!hasMore && articles.length > 0 && <EndMsg text="All caught up" />}
      {!loading && articles.length === 0 && <EndMsg text="No articles found" />}
      {editing && (
        <EditModal
          article={editing}
          onSave={handleSave}
          onClose={() => setEditing(null)}
        />
      )}
    </>
  );
}

// ── RemovedPanel ──────────────────────────────────────────────────────────
const fetchRemovedNews = async (lang, page, size) => {
  const res = await apiClient().get("/admin/removed", {
    params: { page, size, language: lang.value },
  });
  const data = Array.isArray(res.data) ? res.data : (res.data.content ?? []);
  return data.filter((a) => getLangStr(a.language) === lang.value);
};

function RemovedPanel({ lang }) {
  const [toast, setToast] = useState(null);
  const [localSearch, setLocalSearch] = useState("");
  const { articles, hasMore, loading, loadMore, removeById } = useInfiniteNews(
    "removed",
    fetchRemovedNews,
    lang,
  );
  const sentinelRef = useRef(null);
  useEffect(() => {
    if (!sentinelRef.current) return;
    const obs = new IntersectionObserver(
      (e) => {
        if (e[0].isIntersecting) loadMore();
      },
      { rootMargin: "600px" },
    );
    obs.observe(sentinelRef.current);
    return () => obs.disconnect();
  }, [loadMore]);
  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };
  const handleRestore = async (a) => {
    try {
      await apiClient().put(`/admin/${a.id}/restore`, {});
      removeById(a.id);
      showToast("Restored.");
    } catch (err) {
      showToast(
        "Failed: " + (err?.response?.data?.message || err.message),
        "error",
      );
    }
  };
  const handleDelete = async (a) => {
    if (!window.confirm("Permanently delete? Cannot be undone.")) return;
    try {
      await apiClient().delete(`/admin/${a.id}`);
      removeById(a.id);
      showToast("Deleted permanently.");
    } catch (err) {
      showToast(
        "Failed: " + (err?.response?.data?.message || err.message),
        "error",
      );
    }
  };
  const getTitle = (a) =>
    lang.value === "ENGLISH"
      ? a.title || ""
      : pickText(a.translatedTitle, a.title, lang.code);
  const getSummary = (a) =>
    cleanText(
      lang.value === "ENGLISH"
        ? a.summary || a.description || ""
        : pickText(a.translatedSummary, a.summary || a.description, lang.code),
    );
  const filtered = localSearch.trim()
    ? articles.filter(
        (a) =>
          String(a.id).includes(localSearch.trim()) ||
          (a.title || "")
            .toLowerCase()
            .includes(localSearch.trim().toLowerCase()),
      )
    : articles;
  return (
    <>
      {toast && <Toast toast={toast} />}
      <PanelFilter
        value={localSearch}
        onChange={setLocalSearch}
        count={filtered.length}
      />
      <div style={S.grid}>
        {filtered.map((a) => (
          <NewsCard
            key={a.id}
            article={a}
            title={getTitle(a)}
            summary={getSummary(a)}
            badge="REMOVED"
            badgeColor="#450a0a"
            badgeTextColor="#f87171"
            actions={[
              {
                label: "Restore",
                color: "#16a34a",
                onClick: () => handleRestore(a),
              },
              {
                label: "Delete ∞",
                color: "#7f1d1d",
                onClick: () => handleDelete(a),
              },
            ]}
          />
        ))}
      </div>
      <div ref={sentinelRef} style={{ height: 1 }} />
      {loading && <Spinner />}
      {!hasMore && articles.length > 0 && (
        <EndMsg text="End of removed articles" />
      )}
      {!loading && articles.length === 0 && (
        <EndMsg text="No removed articles" />
      )}
    </>
  );
}

// ── ModifiedPanel ─────────────────────────────────────────────────────────
const fetchModifiedNews = async (lang, page) => {
  if (page > 0) return { items: [], hasMore: false };
  const editedIds = getEditedIds();
  if (editedIds.size === 0) return { items: [], hasMore: false };
  const res = await apiClient().get(`/language/${lang.value}`, {
    params: { page: 0, size: 200 },
  });
  const data = Array.isArray(res.data) ? res.data : (res.data.content ?? []);
  const items = data.filter((a) => editedIds.has(Number(a.id)));
  return { items, hasMore: false };
};

function ModifiedPanel({ lang }) {
  const [editing, setEditing] = useState(null);
  const [toast, setToast] = useState(null);
  const [localSearch, setLocalSearch] = useState("");
  const { articles, loading, updateById } = useInfiniteNews(
    "modified",
    fetchModifiedNews,
    lang,
  );
  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };
  const handleSave = async (updated) => {
    try {
      await doSave(updated);
      updateById(updated.id, {
        title: updated.title,
        description: updated.description,
        summary: updated.summary || updated.description,
        imageUrl: updated.imageUrl,
        category: updated.category,
        updatedAt: new Date().toISOString(),
      });
      clearCacheForTab("modified", lang.value);
      clearCacheForTab("live", lang.value);
      setEditing(null);
      showToast("Saved!");
    } catch (err) {
      throw err;
    }
  };
  const getTitle = (a) =>
    lang.value === "ENGLISH"
      ? a.title || ""
      : pickText(a.translatedTitle, a.title, lang.code);
  const getSummary = (a) =>
    cleanText(
      lang.value === "ENGLISH"
        ? a.summary || a.description || ""
        : pickText(a.translatedSummary, a.summary || a.description, lang.code),
    );
  const formatDate = (iso) =>
    iso
      ? new Date(iso).toLocaleString("en-IN", {
          day: "2-digit",
          month: "short",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "";
  const filtered = localSearch.trim()
    ? articles.filter(
        (a) =>
          String(a.id).includes(localSearch.trim()) ||
          (a.title || "")
            .toLowerCase()
            .includes(localSearch.trim().toLowerCase()),
      )
    : articles;
  return (
    <>
      {toast && <Toast toast={toast} />}
      <div style={S.modifiedHint}>
        {articles.length} article{articles.length !== 1 ? "s" : ""} edited in
        this session
      </div>
      <PanelFilter
        value={localSearch}
        onChange={setLocalSearch}
        count={filtered.length}
      />
      <div style={S.grid}>
        {filtered.map((a) => (
          <NewsCard
            key={a.id}
            article={a}
            title={getTitle(a)}
            summary={getSummary(a)}
            badge="MODIFIED"
            badgeColor="#422006"
            badgeTextColor="#fb923c"
            subInfo={formatDate(a.updatedAt)}
            actions={[
              {
                label: "Edit",
                color: "#2563eb",
                onClick: async () => {
                  try {
                    const r = await apiClient().get(`/admin/${a.id}`);
                    setEditing(r.data);
                  } catch {
                    setEditing(a);
                  }
                },
              },
            ]}
          />
        ))}
      </div>
      {loading && <Spinner />}
      {!loading && articles.length === 0 && (
        <EndMsg text="No edits yet — edit from Live News" />
      )}
      {editing && (
        <EditModal
          article={editing}
          onSave={handleSave}
          onClose={() => setEditing(null)}
        />
      )}
    </>
  );
}

// ── NewsCard ──────────────────────────────────────────────────────────────
function NewsCard({
  article,
  title,
  summary,
  badge,
  badgeColor,
  badgeTextColor,
  subInfo,
  actions,
}) {
  const cat = (
    typeof article.category === "string" ? article.category : "GENERAL"
  ).toUpperCase();
  const catColor = CATEGORY_COLORS[cat] || "#6b7280";

  return (
    <div className="news-card" style={S.card}>
      {article.imageUrl && (
        <div style={S.cardImgWrap}>
          <img
            src={article.imageUrl}
            alt={title}
            style={S.cardImg}
            onError={(e) => {
              e.target.parentElement.style.display = "none";
            }}
          />
          <div style={S.cardImgGrad} />
        </div>
      )}
      <div style={S.cardBody}>
        <div style={S.cardTopRow}>
          <span style={S.idTag}>#{article.id}</span>
          <span
            style={{
              ...S.catTag,
              background: catColor + "22",
              color: catColor,
              borderColor: catColor + "44",
            }}
          >
            {cat}
          </span>
          {badge && (
            <span
              style={{
                ...S.statusBadge,
                background: badgeColor || "#450a0a",
                color: badgeTextColor || "#f87171",
              }}
            >
              {badge}
            </span>
          )}
          {article.isTrending && <span style={S.trendingTag}>🔥</span>}
        </div>
        {subInfo && <div style={S.subInfo}>{subInfo}</div>}
        <h3 className="card-title" style={S.cardTitle}>
          {title || "—"}
        </h3>
        <p style={S.cardDesc}>{summary || "—"}</p>
        <div style={S.cardActions}>
          {actions.map((a) => (
            <button
              key={a.label}
              className="act-btn"
              onClick={a.onClick}
              style={{ ...S.actBtn, background: a.color }}
            >
              {a.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── PanelFilter ───────────────────────────────────────────────────────────
function PanelFilter({ value, onChange, count }) {
  return (
    <div style={S.filterBar}>
      <div style={S.filterInputWrap}>
        <span style={S.filterIcon}>⌕</span>
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Filter by ID or title…"
          style={S.filterInput}
        />
        {value && (
          <button onClick={() => onChange("")} style={S.filterClear}>
            ✕
          </button>
        )}
      </div>
      {value && (
        <span style={S.filterCount}>
          {count} result{count !== 1 ? "s" : ""}
        </span>
      )}
    </div>
  );
}

// ── EditModal ─────────────────────────────────────────────────────────────
function EditModal({ article, onSave, onClose }) {
  const [title, setTitle] = useState(article.title || "");
  const [summary, setSummary] = useState(
    article.summary || article.description || "",
  );
  const [fullContent, setFullContent] = useState(article.fullContent || "");
  const [imageUrl, setImageUrl] = useState(article.imageUrl || "");
  const [author, setAuthor] = useState(article.author || "");
  const [sourceUrl, setSourceUrl] = useState(article.sourceUrl || "");
  const [category, setCategory] = useState(
    typeof article.category === "string"
      ? article.category.toUpperCase()
      : "GENERAL",
  );
  const initLang = getLangStr(article.language) || "ENGLISH";
  const [selectedLangs, setSelectedLangs] = useState(new Set([initLang]));
  const [isTrending, setIsTrending] = useState(article.isTrending ?? false);
  const [isPublished, setIsPublished] = useState(article.isPublished ?? true);
  const [imgTab, setImgTab] = useState("url");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [uploadedUrl, setUploadedUrl] = useState(null);
  const [previewSrc, setPreviewSrc] = useState(article.imageUrl || "");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const fileRef = useRef(null);

  const toggleLang = (value) => {
    setSelectedLangs((prev) => {
      const next = new Set(prev);
      if (next.has(value)) {
        if (next.size > 1) next.delete(value);
      } else {
        next.add(value);
      }
      return next;
    });
  };

  const handleFileChange = async (file) => {
    if (!file) return;
    setPreviewSrc(URL.createObjectURL(file));
    setUploadError(null);
    setUploadedUrl(null);
    setUploading(true);
    try {
      const url = await uploadToImgBB(file);
      setImageUrl(url);
      setUploadedUrl(url);
    } catch (err) {
      setUploadError("Upload failed: " + err.message);
      setImageUrl(article.imageUrl || "");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      setSaveError("Title cannot be empty.");
      return;
    }
    if (uploading) {
      setSaveError("Wait for image upload to finish.");
      return;
    }
    setSaving(true);
    setSaveError(null);
    try {
      const primaryLang = [...selectedLangs][0];
      await onSave({
        ...article,
        title: title.trim(),
        description: summary.trim(),
        summary: summary.trim(),
        fullContent: fullContent.trim(),
        imageUrl,
        author: author.trim(),
        sourceUrl: sourceUrl.trim(),
        category,
        language: primaryLang,
        isTrending,
        isPublished,
      });
    } catch (err) {
      setSaveError(
        "Save failed: " +
          (err?.response?.data?.message ||
            err?.response?.data ||
            err?.message ||
            "Unknown error."),
      );
    } finally {
      setSaving(false);
    }
  };

  const catColor = CATEGORY_COLORS[category] || "#6b7280";

  return (
    <div
      style={S.overlay}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div style={S.modal}>
        {/* Modal header */}
        <div style={S.modalHead}>
          <div>
            <div style={S.modalTitle}>Edit Article</div>
            <div style={S.modalSubtitle}>ID #{article.id}</div>
          </div>
          <button onClick={onClose} style={S.modalClose}>
            ✕
          </button>
        </div>

        {/* Image preview */}
        {(previewSrc || imageUrl) && (
          <div
            style={{
              position: "relative",
              borderRadius: 10,
              overflow: "hidden",
            }}
          >
            <img
              src={previewSrc || imageUrl}
              alt="preview"
              style={S.modalPreview}
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
            {uploading && <div style={S.uploadOverlay}>⏳ Uploading…</div>}
            {uploadedUrl && !uploading && (
              <div style={S.uploadBadge}>✓ Uploaded</div>
            )}
          </div>
        )}

        {/* Image tabs */}
        <div style={S.imgTabRow}>
          {[
            ["url", "🔗 URL"],
            ["upload", "📁 Upload"],
          ].map(([t, label]) => (
            <button
              key={t}
              onClick={() => {
                setImgTab(t);
                setUploadError(null);
              }}
              style={{
                ...S.imgTabBtn,
                ...(imgTab === t ? S.imgTabBtnActive : {}),
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {imgTab === "url" ? (
          <>
            <Label>Image URL</Label>
            <input
              value={imageUrl}
              onChange={(e) => {
                setImageUrl(e.target.value);
                setPreviewSrc(e.target.value);
                setUploadedUrl(null);
              }}
              style={S.input}
              placeholder="https://example.com/image.jpg"
            />
          </>
        ) : (
          <>
            <Label>Upload Image → ImgBB</Label>
            {uploadError && <div style={S.errorBox}>❌ {uploadError}</div>}
            <div
              style={{
                ...S.dropZone,
                borderColor: uploading
                  ? "#3b82f6"
                  : uploadError
                    ? "#dc2626"
                    : "#1e1e1e",
              }}
              onClick={() => !uploading && fileRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                if (!uploading) handleFileChange(e.dataTransfer.files[0]);
              }}
            >
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={(e) => handleFileChange(e.target.files[0])}
              />
              <span style={{ color: "#555", fontSize: 13 }}>
                {uploading
                  ? "⏳ Uploading…"
                  : uploadedUrl
                    ? "✓ Done — click to replace"
                    : "Click or drag & drop image"}
              </span>
            </div>
            {uploadedUrl && (
              <p
                style={{
                  fontSize: 11,
                  color: "#22c55e",
                  margin: 0,
                  wordBreak: "break-all",
                }}
              >
                {uploadedUrl}
              </p>
            )}
          </>
        )}

        <Label>Title</Label>
        <input
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            setSaveError(null);
          }}
          style={S.input}
          placeholder="Article title"
        />

        <Label>Summary</Label>
        <textarea
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          style={{ ...S.input, minHeight: 90, resize: "vertical" }}
          placeholder="Short summary…"
        />

        <Label>Full Content</Label>
        <textarea
          value={fullContent}
          onChange={(e) => setFullContent(e.target.value)}
          style={{ ...S.input, minHeight: 120, resize: "vertical" }}
          placeholder="Full article content…"
        />

        <Label>Author</Label>
        <input
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          style={S.input}
          placeholder="Author name"
        />

        <Label>Source URL</Label>
        <input
          value={sourceUrl}
          onChange={(e) => setSourceUrl(e.target.value)}
          style={S.input}
          placeholder="https://source.com/article"
        />

        <Label>Category</Label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          style={{
            ...S.input,
            cursor: "pointer",
            color: catColor,
            borderColor: catColor + "44",
          }}
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <Label>Language</Label>
        <div style={S.langCheckRow}>
          {LANGUAGES.map((l) => (
            <label
              key={l.value}
              style={{
                ...S.langCheck,
                background: selectedLangs.has(l.value) ? "#0f172a" : "#0d0d0d",
                borderColor: selectedLangs.has(l.value) ? "#3b82f6" : "#1e1e1e",
                color: selectedLangs.has(l.value) ? "#93c5fd" : "#555",
              }}
            >
              <input
                type="checkbox"
                checked={selectedLangs.has(l.value)}
                onChange={() => toggleLang(l.value)}
                style={{ display: "none" }}
              />
              {selectedLangs.has(l.value) ? "✓ " : ""}
              {l.label}
            </label>
          ))}
        </div>

        <div style={S.toggleRow}>
          {[
            ["isTrending", "🔥 Trending", isTrending, setIsTrending],
            ["isPublished", "✓ Published", isPublished, setIsPublished],
          ].map(([key, label, val, setter]) => (
            <label key={key} style={S.toggleLabel} onClick={() => setter(!val)}>
              <div
                style={{
                  ...S.togglePill,
                  background: val ? "#3b82f6" : "#1e1e1e",
                }}
              >
                <div
                  style={{
                    ...S.toggleThumb,
                    transform: val ? "translateX(16px)" : "translateX(0)",
                  }}
                />
              </div>
              {label}
            </label>
          ))}
        </div>

        {saveError && <div style={S.errorBox}>{saveError}</div>}

        <div style={S.modalFooter}>
          <button
            onClick={handleSave}
            disabled={saving || uploading}
            style={{ ...S.saveBtn, opacity: saving || uploading ? 0.6 : 1 }}
          >
            {saving
              ? "Saving…"
              : uploading
                ? "Upload in progress…"
                : "Save Changes"}
          </button>
          <button onClick={onClose} disabled={saving} style={S.cancelBtn}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Tiny helpers ──────────────────────────────────────────────────────────
function Label({ children }) {
  return (
    <div
      style={{
        fontSize: 11,
        color: "#444",
        fontWeight: 600,
        textTransform: "uppercase",
        letterSpacing: "0.06em",
        marginBottom: -6,
      }}
    >
      {children}
    </div>
  );
}
function Toast({ toast }) {
  return (
    <div
      style={{
        ...S.toast,
        background: toast.type === "error" ? "#3d0000" : "#003d1a",
        borderColor: toast.type === "error" ? "#ff4444" : "#22c55e",
      }}
    >
      {toast.type === "error" ? "✗" : "✓"} {toast.msg}
    </div>
  );
}
function Spinner() {
  return (
    <div
      style={{ textAlign: "center", padding: 24, color: "#333", fontSize: 13 }}
    >
      Loading…
    </div>
  );
}
function EndMsg({ text }) {
  return (
    <div
      style={{
        textAlign: "center",
        padding: 24,
        color: "#2a2a2a",
        fontSize: 12,
        fontFamily: "'DM Mono', monospace",
      }}
    >
      — {text} —
    </div>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────
const S = {
  root: {
    minHeight: "100vh",
    background: "#080808",
    color: "#e8e8e8",
    fontFamily: "'DM Sans', sans-serif",
  },

  // Header
  topBar: {
    display: "flex",
    alignItems: "center",
    gap: 14,
    padding: "12px 20px",
    background: "#0d0d0d",
    borderBottom: "1px solid #141414",
    flexWrap: "wrap",
    position: "sticky",
    top: 0,
    zIndex: 100,
  },
  backBtn: {
    padding: "7px 14px",
    borderRadius: 8,
    border: "1px solid #1e1e1e",
    background: "transparent",
    color: "#555",
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 600,
  },
  topLogo: { display: "flex", alignItems: "center", gap: 8 },
  topLogoIcon: { fontSize: 18, color: "#3b82f6" },
  topLogoText: {
    fontFamily: "'Syne', sans-serif",
    fontWeight: 800,
    fontSize: 16,
    color: "#e8e8e8",
    letterSpacing: "-0.01em",
  },
  topRight: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    marginLeft: "auto",
    flexWrap: "wrap",
  },
  tabRow: { display: "flex", gap: 4 },
  topTab: {
    padding: "7px 14px",
    borderRadius: 8,
    border: "1px solid #1e1e1e",
    background: "transparent",
    color: "#555",
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 600,
    fontFamily: "'DM Sans', sans-serif",
    transition: "all 0.15s",
    display: "flex",
    alignItems: "center",
    gap: 6,
  },
  topTabActive: {
    background: "#141414",
    color: "#e8e8e8",
    borderColor: "#2a2a2a",
  },
  langPills: { display: "flex", gap: 4 },
  langPill: {
    padding: "6px 12px",
    borderRadius: 7,
    border: "1px solid #1e1e1e",
    background: "transparent",
    color: "#444",
    cursor: "pointer",
    fontSize: 12,
    fontWeight: 600,
    transition: "all 0.15s",
  },
  langPillActive: {
    background: "#0f172a",
    color: "#93c5fd",
    borderColor: "#1e3a5f",
  },

  // Search
  searchSection: {
    padding: "14px 20px",
    borderBottom: "1px solid #141414",
    background: "#0a0a0a",
  },
  searchLabel: {
    fontSize: 11,
    color: "#333",
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    marginBottom: 8,
    fontFamily: "'DM Mono', monospace",
  },
  searchRow: {
    display: "flex",
    gap: 8,
    alignItems: "center",
    flexWrap: "wrap",
  },
  searchInput: {
    flex: 1,
    minWidth: 160,
    padding: "10px 14px",
    borderRadius: 10,
    border: "1px solid #1e1e1e",
    background: "#0d0d0d",
    color: "#e8e8e8",
    fontSize: 14,
    fontFamily: "'DM Mono', monospace",
  },
  searchBtn: {
    padding: "10px 20px",
    borderRadius: 10,
    border: "none",
    background: "#3b82f6",
    color: "#fff",
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 700,
    whiteSpace: "nowrap",
  },
  clearBtn: {
    padding: "10px 12px",
    borderRadius: 10,
    border: "1px solid #1e1e1e",
    background: "transparent",
    color: "#555",
    cursor: "pointer",
    fontSize: 13,
  },
  searchError: {
    marginTop: 8,
    fontSize: 12,
    color: "#f87171",
    padding: "8px 12px",
    background: "#450a0a",
    borderRadius: 8,
    border: "1px solid #dc2626",
  },

  // Panel
  panelArea: { padding: "0" },
  filterBar: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "14px 20px",
    maxWidth: 900,
    margin: "0 auto",
  },
  filterInputWrap: {
    flex: 1,
    position: "relative",
    display: "flex",
    alignItems: "center",
  },
  filterIcon: {
    position: "absolute",
    left: 12,
    color: "#333",
    fontSize: 16,
    pointerEvents: "none",
  },
  filterInput: {
    width: "100%",
    padding: "9px 36px",
    borderRadius: 10,
    border: "1px solid #1e1e1e",
    background: "#0d0d0d",
    color: "#e8e8e8",
    fontSize: 14,
  },
  filterClear: {
    position: "absolute",
    right: 10,
    padding: "2px 6px",
    border: "none",
    background: "transparent",
    color: "#444",
    cursor: "pointer",
    fontSize: 13,
  },
  filterCount: {
    fontSize: 12,
    color: "#444",
    fontFamily: "'DM Mono', monospace",
    whiteSpace: "nowrap",
  },
  modifiedHint: {
    textAlign: "center",
    fontSize: 11,
    color: "#2a2a2a",
    padding: "10px 20px",
    fontFamily: "'DM Mono', monospace",
  },

  // Card
  grid: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
    padding: "16px 20px",
    maxWidth: 900,
    margin: "0 auto",
  },
  card: {
    background: "#0d0d0d",
    borderRadius: 14,
    overflow: "hidden",
    border: "1px solid #141414",
    transition: "border-color 0.15s",
  },
  cardImgWrap: { position: "relative", height: 200, overflow: "hidden" },
  cardImg: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
  },
  cardImgGrad: {
    position: "absolute",
    inset: 0,
    background: "linear-gradient(to bottom, transparent 40%, #0d0d0d)",
  },
  cardBody: {
    padding: "12px 16px 14px",
    display: "flex",
    flexDirection: "column",
    gap: 7,
  },
  cardTopRow: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    flexWrap: "wrap",
  },
  idTag: {
    fontFamily: "'DM Mono', monospace",
    fontSize: 11,
    color: "#3b82f6",
    background: "#0a1628",
    padding: "2px 8px",
    borderRadius: 5,
    border: "1px solid #1e3a5f",
  },
  catTag: {
    fontSize: 10,
    fontWeight: 700,
    padding: "2px 8px",
    borderRadius: 5,
    border: "1px solid",
    letterSpacing: "0.06em",
  },
  statusBadge: {
    fontSize: 10,
    fontWeight: 700,
    padding: "2px 8px",
    borderRadius: 5,
    letterSpacing: "0.06em",
  },
  trendingTag: { fontSize: 12 },
  subInfo: { fontSize: 11, color: "#333", fontFamily: "'DM Mono', monospace" },
  cardTitle: {
    margin: 0,
    fontSize: 15,
    fontWeight: 600,
    lineHeight: 1.4,
    color: "#ccc",
    transition: "color 0.15s",
  },
  cardDesc: {
    margin: 0,
    fontSize: 13,
    color: "#444",
    lineHeight: 1.6,
    display: "-webkit-box",
    WebkitLineClamp: 3,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
  },
  cardActions: { display: "flex", gap: 6, marginTop: 4, flexWrap: "wrap" },
  actBtn: {
    padding: "7px 16px",
    borderRadius: 8,
    border: "none",
    color: "#fff",
    cursor: "pointer",
    fontSize: 12,
    fontWeight: 700,
    fontFamily: "'DM Sans', sans-serif",
    transition: "filter 0.15s",
  },

  // Toast
  toast: {
    position: "fixed",
    bottom: 24,
    left: "50%",
    transform: "translateX(-50%)",
    padding: "10px 18px",
    borderRadius: 10,
    border: "1px solid",
    color: "#e8e8e8",
    fontSize: 13,
    fontWeight: 600,
    zIndex: 99999,
    whiteSpace: "nowrap",
    boxShadow: "0 4px 24px rgba(0,0,0,.6)",
    fontFamily: "'DM Sans', sans-serif",
  },

  // Modal
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,.9)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
    padding: 16,
  },
  modal: {
    width: "100%",
    maxWidth: 520,
    background: "#0d0d0d",
    borderRadius: 18,
    padding: 22,
    display: "flex",
    flexDirection: "column",
    gap: 10,
    maxHeight: "90vh",
    overflowY: "auto",
    border: "1px solid #1e1e1e",
  },
  modalHead: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 2,
  },
  modalTitle: {
    fontFamily: "'Syne', sans-serif",
    fontSize: 18,
    fontWeight: 800,
    color: "#e8e8e8",
    letterSpacing: "-0.01em",
  },
  modalSubtitle: {
    fontSize: 11,
    color: "#444",
    fontFamily: "'DM Mono', monospace",
    marginTop: 2,
  },
  modalClose: {
    width: 30,
    height: 30,
    borderRadius: "50%",
    border: "1px solid #1e1e1e",
    background: "transparent",
    color: "#555",
    cursor: "pointer",
    fontSize: 13,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  modalPreview: {
    width: "100%",
    height: 160,
    objectFit: "cover",
    display: "block",
  },
  uploadOverlay: {
    position: "absolute",
    inset: 0,
    background: "rgba(0,0,0,.7)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#93c5fd",
    fontSize: 13,
    fontWeight: 600,
  },
  uploadBadge: {
    position: "absolute",
    bottom: 8,
    right: 8,
    background: "#14532d",
    border: "1px solid #16a34a",
    color: "#4ade80",
    fontSize: 11,
    fontWeight: 600,
    padding: "3px 8px",
    borderRadius: 6,
  },
  imgTabRow: { display: "flex", gap: 6 },
  imgTabBtn: {
    flex: 1,
    padding: "8px",
    borderRadius: 8,
    border: "1px solid #1e1e1e",
    background: "transparent",
    color: "#444",
    cursor: "pointer",
    fontSize: 12,
    fontWeight: 600,
    fontFamily: "'DM Sans', sans-serif",
  },
  imgTabBtnActive: {
    background: "#0f172a",
    color: "#93c5fd",
    borderColor: "#1e3a5f",
  },
  dropZone: {
    border: "2px dashed",
    borderRadius: 10,
    padding: "20px",
    textAlign: "center",
    background: "#080808",
    cursor: "pointer",
    transition: "border-color 0.2s",
  },
  input: {
    padding: "10px 13px",
    borderRadius: 10,
    border: "1px solid #1e1e1e",
    background: "#080808",
    color: "#e8e8e8",
    fontSize: 14,
    width: "100%",
    boxSizing: "border-box",
    fontFamily: "'DM Sans', sans-serif",
    transition: "border-color 0.15s",
  },
  langCheckRow: { display: "flex", gap: 6, flexWrap: "wrap" },
  langCheck: {
    display: "flex",
    alignItems: "center",
    padding: "8px 14px",
    borderRadius: 9,
    border: "1px solid",
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 600,
    transition: "all 0.15s",
    userSelect: "none",
  },
  toggleRow: { display: "flex", gap: 20, flexWrap: "wrap", padding: "4px 0" },
  toggleLabel: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    cursor: "pointer",
    fontSize: 13,
    color: "#9ca3af",
    userSelect: "none",
  },
  togglePill: {
    width: 36,
    height: 20,
    borderRadius: 99,
    position: "relative",
    transition: "background 0.2s",
    flexShrink: 0,
  },
  toggleThumb: {
    position: "absolute",
    top: 2,
    left: 2,
    width: 16,
    height: 16,
    borderRadius: "50%",
    background: "#fff",
    transition: "transform 0.2s",
  },
  errorBox: {
    padding: "10px 14px",
    borderRadius: 8,
    background: "#1a0000",
    border: "1px solid #dc262644",
    color: "#f87171",
    fontSize: 12,
    lineHeight: 1.5,
  },
  modalFooter: { display: "flex", gap: 8, marginTop: 4 },
  saveBtn: {
    flex: 1,
    padding: "11px",
    borderRadius: 10,
    border: "none",
    background: "#3b82f6",
    color: "#fff",
    cursor: "pointer",
    fontSize: 14,
    fontWeight: 700,
    fontFamily: "'Syne', sans-serif",
    transition: "opacity 0.2s",
  },
  cancelBtn: {
    flex: 1,
    padding: "11px",
    borderRadius: 10,
    border: "1px solid #1e1e1e",
    background: "transparent",
    color: "#555",
    cursor: "pointer",
    fontSize: 14,
    fontWeight: 600,
  },
};
