import { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../components/navbar";
import { useNavigate } from "react-router-dom";

export default function AdminReportsPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    axios
      .get("https://api.squeezefeed.com/api/reports/admin", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        console.log("REPORTS RESPONSE:", res.data); // ← ADD THIS
        setReports(res.data || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  async function dismissReport(reportId) {
    const token = localStorage.getItem("token");
    try {
      await axios.delete(
        `https://api.squeezefeed.com/api/reports/admin/${reportId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setReports((prev) => prev.filter((r) => r.id !== reportId));
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div
      style={{
        background: "#0a0a0a",
        minHeight: "100vh",
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      <Navbar />
      <div
        style={{ padding: "24px 16px", maxWidth: "640px", margin: "0 auto" }}
      >
        {/* ── Header row ── */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginBottom: "24px",
          }}
        >
          <button
            onClick={() => navigate(-1)}
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.08)",
              color: "#aaa",
              borderRadius: "999px",
              width: "36px",
              height: "36px",
              cursor: "pointer",
              fontSize: "16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            ←
          </button>
          <div>
            <h2
              style={{
                color: "#f0ece0",
                fontFamily: "'Playfair Display', serif",
                margin: 0,
                fontSize: "22px",
              }}
            >
              🚩 User Reports
            </h2>
            <p style={{ color: "#444", fontSize: "12px", margin: "4px 0 0" }}>
              {reports.length} report{reports.length !== 1 ? "s" : ""} pending
            </p>
          </div>
        </div>

        {loading && (
          <p style={{ color: "#555", textAlign: "center", marginTop: "60px" }}>
            Loading...
          </p>
        )}

        {!loading && reports.length === 0 && (
          <div
            style={{
              textAlign: "center",
              marginTop: "80px",
              color: "#333",
              fontSize: "14px",
            }}
          >
            <div style={{ fontSize: "40px", marginBottom: "12px" }}>✅</div>
            No reports yet. All clear!
          </div>
        )}

        {reports.map((r) => (
          <div
            key={r.id}
            style={{
              background: "#111",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: "16px",
              padding: "18px",
              marginBottom: "12px",
            }}
          >
            {/* Report header */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "12px",
              }}
            >
              <span
                style={{
                  color: "#e05252",
                  fontWeight: "700",
                  fontSize: "12px",
                  background: "rgba(224,82,82,0.1)",
                  border: "1px solid rgba(224,82,82,0.2)",
                  borderRadius: "999px",
                  padding: "3px 10px",
                }}
              >
                🚩 Report #{r.id}
              </span>
              <span style={{ color: "#444", fontSize: "11px" }}>
                {r.createdAt?.slice(0, 10)}
              </span>
            </div>

            {/* Report details */}
            <div
              style={{
                background: "#0a0a0a",
                borderRadius: "10px",
                padding: "12px 14px",
                marginBottom: "12px",
                display: "flex",
                flexDirection: "column",
                gap: "6px",
              }}
            >
              <div style={{ color: "#888", fontSize: "13px" }}>
                📰 <b style={{ color: "#bbb" }}>Article ID:</b>{" "}
                <span style={{ color: "#d4af37" }}>
                  #{r.contentId ?? r.articleId}
                </span>
              </div>
              <div style={{ color: "#888", fontSize: "13px" }}>
                👤 <b style={{ color: "#bbb" }}>User ID:</b>{" "}
                {r.reportedByUserId}
              </div>
              <div style={{ color: "#888", fontSize: "13px" }}>
                ⚠️ <b style={{ color: "#bbb" }}>Reason:</b>{" "}
                <span
                  style={{
                    color: "#e05252",
                    fontWeight: "600",
                    textTransform: "capitalize",
                  }}
                >
                  {r.reason?.replace(/_/g, " ").toLowerCase() || "—"}
                </span>
              </div>
              {r.description && (
                <div style={{ color: "#888", fontSize: "13px" }}>
                  📝 <b style={{ color: "#bbb" }}>Note:</b> {r.description}
                </div>
              )}
              {r.language && (
                <div style={{ color: "#888", fontSize: "13px" }}>
                  🌐 <b style={{ color: "#bbb" }}>Language:</b> {r.language}
                </div>
              )}
            </div>

            {/* Actions */}
            <div style={{ display: "flex", gap: "8px" }}>
              <button
                onClick={() =>
                  window.open(`/public/article/${r.contentId}`, "_blank")
                }
                style={{
                  background: "rgba(212,175,55,0.1)",
                  border: "1px solid rgba(212,175,55,0.2)",
                  color: "#d4af37",
                  borderRadius: "999px",
                  padding: "7px 16px",
                  cursor: "pointer",
                  fontSize: "12px",
                  fontWeight: "600",
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                View Article
              </button>
              <button
                onClick={() => dismissReport(r.id)}
                style={{
                  background: "transparent",
                  border: "1px solid rgba(255,255,255,0.08)",
                  color: "#555",
                  borderRadius: "999px",
                  padding: "7px 16px",
                  cursor: "pointer",
                  fontSize: "12px",
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                Dismiss
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
