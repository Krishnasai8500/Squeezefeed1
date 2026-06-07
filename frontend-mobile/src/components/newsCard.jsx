import { useNavigate } from "react-router-dom";

const FALLBACK_IMAGE = "https://placehold.co/400x200/1a1a1a/e63946?text=NewsAI";

const CATEGORY_IMAGES = {
  GENERAL: "https://picsum.photos/seed/general/400/200",
  POLITICS: "https://picsum.photos/seed/politics/400/200",
  SPORTS: "https://picsum.photos/seed/sports/400/200",
  TECHNOLOGY: "https://picsum.photos/seed/tech/400/200",
  BUSINESS: "https://picsum.photos/seed/business/400/200",
  ENTERTAINMENT: "https://picsum.photos/seed/entertainment/400/200",
};
const selectedLanguage = localStorage.getItem("selectedLanguage") || "en";

export default function NewsCard({ article }) {
  const navigate = useNavigate();

  if (!article) return null;

  const categoryImage =
    CATEGORY_IMAGES[article.category?.toUpperCase()] || FALLBACK_IMAGE;

  const imageSrc = article.imageUrl || categoryImage;

  return (
    <div
      style={styles.card}
      onClick={() => navigate(`/article/${article.id}`)}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-4px)";
        e.currentTarget.style.boxShadow = "0 8px 24px rgba(230,57,70,0.15)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      {/* Image */}
      <div style={styles.imagePlaceholder}>
        <img
          src={imageSrc}
          alt={article.title || "News"}
          style={styles.image}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src =
              categoryImage !== imageSrc ? categoryImage : FALLBACK_IMAGE;
          }}
        />
        <span style={styles.categoryBadge}>
          {article.category || "GENERAL"}
        </span>
        {article.isTrending && (
          <span style={styles.trendingBadge}>🔥 Trending</span>
        )}
      </div>

      {/* Content */}
      <div style={styles.content}>
        <h3 style={styles.title}>
          {article.translatedTitle?.[selectedLanguage] ||
            article.title ||
            "Untitled Article"}
        </h3>
        <p style={styles.summary}>
          {(
            article.translatedSummary?.[selectedLanguage] ||
            article.summary ||
            ""
          ).length > 100
            ? (
                article.translatedSummary?.[selectedLanguage] || article.summary
              ).substring(0, 100) + "..."
            : article.translatedSummary?.[selectedLanguage] ||
              article.summary ||
              "No summary available."}
        </p>
        <div style={styles.meta}>
          <span style={styles.author}>✍️ {article.author || "NewsAI"}</span>
          <span style={styles.date}>
            {article.publishedAt
              ? new Date(article.publishedAt).toLocaleDateString()
              : "N/A"}
          </span>
        </div>
      </div>
    </div>
  );
}

const styles = {
  card: {
    background: "#1a1a1a",
    borderRadius: 0, // ✅ removed rounded corners
    overflow: "hidden",
    cursor: "pointer",
    transition: "all 0.3s ease",
    border: "none", // ✅ removed border
    width: "100%",
    height: "100%", // ✅ fill the snapSlide
    display: "flex",
    flexDirection: "column", // ✅ stack image + content vertically
  },
  imagePlaceholder: {
    position: "relative",
    flex: "0 0 45%", // ✅ image takes 45% of height, not fixed 180px
    background: "#111",
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
  },
  // badges unchanged
  categoryBadge: {
    position: "absolute",
    top: "10px",
    left: "10px",
    background: "#e63946",
    color: "#fff",
    padding: "4px 10px",
    borderRadius: "20px",
    fontSize: "11px",
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  trendingBadge: {
    position: "absolute",
    top: "10px",
    right: "10px",
    background: "#ff9500",
    color: "#fff",
    padding: "4px 10px",
    borderRadius: "20px",
    fontSize: "11px",
    fontWeight: "bold",
  },
  content: {
    padding: "20px",
    flex: 1, // ✅ content fills remaining space
    display: "flex",
    flexDirection: "column",
    justifyContent: "center", // ✅ vertically center text in content area
    overflowY: "auto",
  },
  title: {
    color: "#fff",
    fontSize: "18px", // ✅ slightly bigger for full screen
    fontWeight: "bold",
    marginBottom: "12px",
    lineHeight: "1.4",
  },
  summary: {
    color: "#888",
    fontSize: "14px",
    lineHeight: "1.6",
    marginBottom: "16px",
  },
  meta: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "auto", // ✅ push meta to bottom of content
  },
  author: { color: "#666", fontSize: "12px" },
  date: { color: "#666", fontSize: "12px" },
};
