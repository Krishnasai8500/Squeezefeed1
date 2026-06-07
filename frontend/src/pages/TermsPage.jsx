import { useNavigate } from "react-router-dom";

export default function TermsPage() {
  const navigate = useNavigate();

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#050505",
        color: "#fff",
        padding: "24px"
      }}
    >
      <button
        onClick={() => navigate(-1)}
        style={{
          background: "transparent",
          border: "none",
          color: "#FF6A00",
          fontSize: "18px",
          cursor: "pointer",
          marginBottom: "20px"
        }}
      >
        ← Back
      </button>

      <div
        style={{
          background: "#0B0B0B",
          border: "1px solid rgba(255,106,0,0.15)",
          borderRadius: "20px",
          padding: "24px"
        }}
      >
        <h1
          style={{
            color: "#FF6A00",
            marginBottom: "10px"
          }}
        >
          Terms of Service
        </h1>

        <p
          style={{
            color: "#888",
            marginBottom: "20px"
          }}
        >
          Last Updated: June 2026
        </p>

        <ul
          style={{
            lineHeight: "1.8"
          }}
        >
          <li>Use the platform responsibly.</li>
          <li>Do not post harmful or illegal content.</li>
          <li>Do not attempt unauthorized access.</li>
          <li>Respect community guidelines.</li>
          <li>Respect other users.</li>
        </ul>

        <p
          style={{
            marginTop: "20px",
            color: "#AAA"
          }}
        >
          SqueezeFeed reserves the right to suspend accounts that violate
          these terms.
        </p>
      </div>
    </div>
  );
}