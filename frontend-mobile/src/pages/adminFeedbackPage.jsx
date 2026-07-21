import { useEffect, useState } from "react";
import { getAllFeedback, resolveFeedback } from "../services/api";
import Navbar from "../components/navbar";
import { useNavigate } from "react-router-dom";

export default function AdminFeedbackPage() {
  const [feedback, setFeedback] = useState([]);
  const [tab, setTab] = useState("PENDING");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    getAllFeedback(tab)
      .then((res) => setFeedback(res.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [tab]);

  async function markResolved(id) {
    try {
      await resolveFeedback(id);
      setFeedback((prev) => prev.filter((f) => f.id !== id));
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div style={{ background: "#0a0a0a", minHeight: "100vh", fontFamily: "'DM Sans', sans-serif" }}>
      <Navbar />
      <div style={{ padding: "24px 16px", maxWidth: "640px", margin: "0 auto" }}>

        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
          <button
            onClick={() => navigate(-1)}
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.08)",
              color: "#aaa", borderRadius: "999px", width: "36px", height: "36px",
              cursor: "pointer", fontSize: "16px", display: "flex",
              alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}
          >
            ←
          </button>
          <div>
            <h2 style={{ color: "#f0ece0", fontFamily: "'Playfair Display', serif", margin: 0, fontSize: "22px" }}>
              💬 Feedback
            </h2>
            <p style={{ color: "#A0A0A0", fontSize: "12px", margin: "4px 0 0" }}>
              {feedback.length} {tab.toLowerCase()}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "20px" }}>
          {["PENDING", "RESOLVED"].map((t) => (
            <span
              key={t}
              onClick={() => setTab(t)}
              style={{
                cursor: "pointer",
                fontSize: "12px",
                fontWeight: 600,
                padding: "6px 14px",
                borderRadius: "999px",
                color: tab === t ? "#FF6A00" : "#C5C5C5",
                background: tab === t ? "rgba(255,106,0,0.1)" : "transparent",
                border: tab === t ? "1px solid rgba(255,106,0,0.25)" : "1px solid rgba(255,255,255,0.06)",
              }}
            >
              {t === "PENDING" ? "Pending" : "Resolved"}
            </span>
          ))}
        </div>

        {loading && (
          <p style={{ color: "#B5B5B5", textAlign: "center", marginTop: "60px" }}>Loading...</p>
        )}

        {!loading && feedback.length === 0 && (
          <div style={{ textAlign: "center", marginTop: "80px", color: "#8A8A8A", fontSize: "14px" }}>
            <div style={{ fontSize: "40px", marginBottom: "12px" }}>✅</div>
            {tab === "PENDING" ? "All caught up. No pending feedback." : "No resolved feedback yet."}
          </div>
        )}

        {feedback.map((item) => (
          <div
            key={item.id}
            style={{
              background: "#111",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: "16px",
              padding: "18px",
              marginBottom: "12px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
              <span
                style={{
                  color: "#FF6A00", fontWeight: 700, fontSize: "12px",
                  background: "rgba(255,106,0,0.1)", border: "1px solid rgba(255,106,0,0.2)",
                  borderRadius: "999px", padding: "3px 10px",
                }}
              >
                💬 {item.category || "Feedback"} #{item.id}
              </span>
              <span style={{ color: "#A0A0A0", fontSize: "11px" }}>
                {item.createdAt?.slice(0, 10)}
              </span>
            </div>

            <div style={{
              background: "#0a0a0a", borderRadius: "10px", padding: "12px 14px",
              marginBottom: "12px", display: "flex", flexDirection: "column", gap: "6px",
            }}>
              <div style={{ color: "#888", fontSize: "13px" }}>
                👤 <b style={{ color: "#bbb" }}>User:</b> {item.authUserId}
              </div>
              <div style={{ color: "#888", fontSize: "13px" }}>
                📝 <b style={{ color: "#bbb" }}>Message:</b> {item.message}
              </div>
            </div>

            {tab === "PENDING" && (
              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  onClick={() => markResolved(item.id)}
                  style={{
                    background: "rgba(212,175,55,0.1)", border: "1px solid rgba(212,175,55,0.2)",
                    color: "#d4af37", borderRadius: "999px", padding: "7px 16px",
                    cursor: "pointer", fontSize: "12px", fontWeight: 600,
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  Mark as resolved
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}