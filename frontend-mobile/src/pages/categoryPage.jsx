import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getByCategory } from "../services/api";
import NewsCard from "../components/newsCard";
import Navbar from "../components/navbar";

export default function CategoryPage() {
  const { category } = useParams();
  const navigate = useNavigate();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getByCategory(category)
      .then((res) => setArticles(res.data))
      .catch(() => navigate("/"))
      .finally(() => setLoading(false));
  }, [category]);

  if (loading)
    return (
      <div
        style={{
          color: "#fff",
          textAlign: "center",
          padding: "100px",
          background: "#0f0f0f",
          minHeight: "100vh",
        }}
      >
        Loading...
      </div>
    );

  return (
    <div style={{ background: "#0f0f0f", minHeight: "100vh" }}>
      <Navbar />
      <div
        style={{ maxWidth: "1200px", margin: "0 auto", padding: "24px 16px" }}
      >
        <h2 style={{ color: "#fff", marginBottom: "24px" }}>
          <span style={{ color: "#e63946" }}>{category}</span> News
        </h2>
        {articles.length === 0 ? (
          <p style={{ color: "#666" }}>No articles found for this category.</p>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: "20px",
            }}
          >
            {articles.map((a) => (
              <NewsCard key={a.id} article={a} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
