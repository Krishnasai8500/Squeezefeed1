import { useNavigate } from "react-router-dom";

export default function AboutPage() {
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
          About SqueezeFeed
        </h1>

        <p style={{ color: "#B0B0B0", lineHeight: "1.8" }}>
          SqueezeFeed is a modern news platform designed to help users
          discover high-quality content while filtering out unnecessary
          noise.
        </p>

        <p style={{ color: "#B0B0B0", lineHeight: "1.8" }}>
          Our goal is to make news consumption smarter, faster and more
          personalized through intelligent recommendations and clean
          reading experiences.
        </p>

        <div
          style={{
            marginTop: "20px",
            color: "#777"
          }}
        >
          Version 1.0.0
        </div>
      </div>
    </div>
  );
}