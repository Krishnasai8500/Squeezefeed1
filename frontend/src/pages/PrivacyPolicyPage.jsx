import { useNavigate } from "react-router-dom";

export default function PrivacyPolicyPage() {
  const navigate = useNavigate();

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#050505",
        color: "#fff",
        padding: "20px"
      }}
    >
      <button
        onClick={() => navigate(-1)}
        style={{
          background: "none",
          border: "none",
          color: "#FF6A00",
          fontSize: "18px",
          marginBottom: "20px",
          cursor: "pointer"
        }}
      >
        ← Back
      </button>

      <div
        style={{
          background: "#0B0B0B",
          borderRadius: "20px",
          padding: "24px",
          border: "1px solid rgba(255,106,0,.15)"
        }}
      >
        <h1 style={{ color: "#FF6A00" }}>
          Privacy Policy
        </h1>

        <p style={{ color: "#888" }}>
          Last Updated: June 2026
        </p>

        <h3>Information We Collect</h3>

        <ul style={{ lineHeight: "1.8", color: "#B0B0B0" }}>
          <li>Email address</li>
          <li>Username</li>
          <li>Reading preferences</li>
          <li>Saved articles</li>
          <li>Usage analytics</li>
        </ul>

        <h3>How We Use Data</h3>

        <ul style={{ lineHeight: "1.8", color: "#B0B0B0" }}>
          <li>Personalize news recommendations</li>
          <li>Improve user experience</li>
          <li>Improve platform performance</li>
          <li>Provide customer support</li>
        </ul>

        <p
          style={{
            marginTop: "20px",
            color: "#AAA"
          }}
        >
          We do not sell your personal information to third parties.
        </p>
      </div>
    </div>
  );
}