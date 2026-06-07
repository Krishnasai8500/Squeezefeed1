import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

export default function PageLoader() {
  const location = useLocation();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
    const timer = setTimeout(() => setVisible(false), 600);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  if (!visible) return null;

  return (
    <>
      <style>{`
                @keyframes loaderSlide {
                    0%   { width: 0%; opacity: 1; }
                    70%  { width: 85%; opacity: 1; }
                    100% { width: 100%; opacity: 0; }
                }
                @keyframes loaderFade {
                    0%   { opacity: 0; }
                    20%  { opacity: 1; }
                    80%  { opacity: 1; }
                    100% { opacity: 0; }
                }
            `}</style>

      {/* Top progress bar */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          height: "2px",
          zIndex: 999999,
          background: "linear-gradient(90deg, #FF6A00, #ffaa00)",
          borderRadius: "999px",
          animation: "loaderSlide 0.6s ease forwards",
          boxShadow: "0 0 8px rgba(255,106,0,0.6)",
        }}
      />

      {/* Corner spinner */}
      <div
        style={{
          position: "fixed",
          top: "12px",
          right: "16px",
          zIndex: 999999,
          animation: "loaderFade 0.6s ease forwards",
        }}
      >
        <div
          style={{
            width: "16px",
            height: "16px",
            borderRadius: "50%",
            border: "2px solid rgba(255,106,0,0.2)",
            borderTopColor: "#FF6A00",
            animation: "spin 0.7s linear infinite",
          }}
        />
      </div>

      <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
            `}</style>
    </>
  );
}
