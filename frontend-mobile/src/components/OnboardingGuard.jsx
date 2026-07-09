import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const BASE_URL = "https://api.squeezefeed.com";

export default function OnboardingGuard({ children }) {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    async function check() {
      const token = localStorage.getItem("token");
      const authUserId = localStorage.getItem("authUserId");

      if (!token || !authUserId) {
        navigate("/login");
        return;
      }

      try {
        const res = await axios.get(
          `${BASE_URL}/api/users/profile/${authUserId}`,
          { headers: { Authorization: `Bearer ${token}` } },
        );

        if (res.data.onboardingCompleted === true) {
          navigate("/");
        } else {
          setChecking(false);
        }
      } catch {
        navigate("/login");
      }
    }
    check();
  }, []);

  if (checking) {
    return (
      <div
        style={{
          background: "#080808",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            width: "32px",
            height: "32px",
            border: "3px solid rgba(255,106,0,0.2)",
            borderTop: "3px solid #FF6A00",
            borderRadius: "50%",
            animation: "spin 0.7s linear infinite",
          }}
        />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return children;
}
