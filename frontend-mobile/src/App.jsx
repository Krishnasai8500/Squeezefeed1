import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import "./App.css";
import { App as CapacitorApp } from "@capacitor/app";
import { useNavigate, useLocation } from "react-router-dom";

import LoginPage from "./pages/loginPage";
import HomePage from "./pages/homePage";
import ArticlePage from "./pages/articlePage";
import CategoryPage from "./pages/categoryPage";
import MemeFeedPage from "./pages/memeFeedPage";
import AdminMemePage from "./pages/adminMemePage";
import OnboardingPage from "./pages/onboardingPage";
import OnboardingGuard from "./components/OnboardingGuard";
import ProfilePage from "./pages/profilePage";
import BadgesPage from "./pages/badgesPage";
import PublicProfilePage from "./pages/publicProfilePage";
import UserSearchPage from "./pages/userSearchPage";
import SavedPage from "./pages/savedPage";
import AdminNewsPage from "./pages/adminNewsPage";
import SplashScreen from "./components/SplashScreen";
import AdminAnalyticsPage from "./pages/adminAnalyticsPage";
import NotificationsPage from "./pages/notificationsPage";
import SettingsPage from "./pages/settingsPage";
import AboutPage from "./pages/AboutPage";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage";
import TermsPage from "./pages/TermsPage";
import AdminReportsPage from "./pages/adminReportsPage";
import FeedbackPage from "./pages/feedbackPage";
import Toast from "./components/Toast";
import PageLoader from "./components/PageLoader";
// At top of App.jsx
import { preloadAndCache } from "./services/imageCache";

function BackButtonHandler({ onExitRequest }) {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handler = CapacitorApp.addListener("backButton", () => {
      // If on home page — minimize app, don't close
      if (location.pathname === "/") {
        const hasModalOpen =
          document.querySelector(".comment-overlay") ||
          document.querySelector(".report-overlay");

        if (hasModalOpen) {
          return;
        }

        onExitRequest();
        return;
      }
      // Otherwise go back
      navigate(-1);
    });

    return () => {
      handler.remove();
    };
  }, [location.pathname]);

  return null;
}

const ProtectedRoute = ({ children }) => {
  return localStorage.getItem("token") ? (
    children
  ) : (
    <Navigate to="/login" replace />
  );
};

export default function App() {
  const [showExitModal, setShowExitModal] = useState(false);

  const [showSplash, setShowSplash] = useState(() => {
    // Skip splash entirely for public routes
    const isPublicRoute =
      window.location.pathname.startsWith("/public/") ||
      window.location.pathname.startsWith("/u/") ||
      window.location.pathname === "/about" ||
      window.location.pathname === "/privacy" ||
      window.location.pathname === "/terms";

    if (isPublicRoute) return false;

    return !sessionStorage.getItem("splashShown");
  });

  // Inside App component, add this useEffect:
  useEffect(() => {
    // Start preloading memes in background when app opens
    const token = localStorage.getItem("token");
    if (!token) return;

    fetch("https://api.nxtbharat.com/api/content/memes", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((memes) => {
        // Preload first 5 immediately
        memes.slice(0, 5).forEach((m) => {
          const url = m.imageUrl?.replace(
            "http://localhost:8089",
            "https://media.nxtbharat.com",
          );
          preloadAndCache(url);
        });

        // Rest with delay so it doesn't kill bandwidth
        memes.slice(5).forEach((m, i) => {
          setTimeout(
            () => {
              const url = m.imageUrl?.replace(
                "http://localhost:8089",
                "https://media.nxtbharat.com",
              );
              preloadAndCache(url);
            },
            (i + 1) * 500,
          );
        });
      })
      .catch(() => {});
  }, []);

  // Consume login flag + Capacitor pause/resume
  useEffect(() => {
    if (localStorage.getItem("justLoggedIn") === "true") {
      localStorage.removeItem("justLoggedIn");
    }

    // Capacitor: track when app goes to background
    const handlePause = () => {
      sessionStorage.setItem("lastActive", Date.now().toString());
    };

    // Capacitor: when app comes back from background or recents
    const handleResume = () => {
      const lastActive = sessionStorage.getItem("lastActive");
      const now = Date.now();
      const THRESHOLD = 30 * 60 * 1000; // 30 minutes

      if (lastActive && now - parseInt(lastActive) > THRESHOLD) {
        sessionStorage.removeItem("splashShown");
        setShowSplash(true);
      }
    };

    // Capacitor native events (works after you add Capacitor)
    document.addEventListener("pause", handlePause);
    document.addEventListener("resume", handleResume);

    // Browser/PWA fallback (works right now even without Capacitor)
    window.addEventListener("blur", handlePause);
    window.addEventListener("focus", handleResume);

    return () => {
      document.removeEventListener("pause", handlePause);
      document.removeEventListener("resume", handleResume);
      window.removeEventListener("blur", handlePause);
      window.removeEventListener("focus", handleResume);
    };
  }, []);

  function handleSplashDone() {
    sessionStorage.setItem("splashShown", "true");
    setShowSplash(false);
  }

  if (showSplash) {
    return <SplashScreen onDone={handleSplashDone} />;
  }

  return (
    <div style={{ background: "#080808", minHeight: "100vh" }}>
      <BrowserRouter>
        <BackButtonHandler onExitRequest={() => setShowExitModal(true)} />
        <PageLoader />
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route
            path="/"
            element={
              <ProtectedRoute>
                <HomePage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/article/:id"
            element={
              <ProtectedRoute>
                <ArticlePage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/category/:category"
            element={
              <ProtectedRoute>
                <CategoryPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/memes"
            element={
              <ProtectedRoute>
                <MemeFeedPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/memes"
            element={
              <ProtectedRoute>
                <AdminMemePage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/onboarding"
            element={
              <ProtectedRoute>
                <OnboardingGuard>
                  <OnboardingPage />
                </OnboardingGuard>
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/badges"
            element={
              <ProtectedRoute>
                <BadgesPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/saved"
            element={
              <ProtectedRoute>
                <SavedPage />
              </ProtectedRoute>
            }
          />

          <Route path="/public/article/:id" element={<ArticlePage />} />
          <Route path="/u/:userName" element={<PublicProfilePage />} />
          <Route path="/search-users" element={<UserSearchPage />} />
          <Route path="/admin/news" element={<AdminNewsPage />} />

          <Route
            path="/admin/analytics"
            element={
              <ProtectedRoute>
                <AdminAnalyticsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <NotificationsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            }
          />

          <Route path="/about" element={<AboutPage />} />
          <Route path="/privacy" element={<PrivacyPolicyPage />} />
          <Route path="/terms" element={<TermsPage />} />

          <Route
            path="/admin/reports"
            element={
              <ProtectedRoute>
                <AdminReportsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/feedback"
            element={
              <ProtectedRoute>
                <FeedbackPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
      {showExitModal && (
        <div className="exit-overlay">
          <div className="exit-modal">
            <h2>Ayo 😭</h2>

            <p>you really leaving SqueezeFeed?</p>

            <div className="exit-actions">
              <button
                className="stay-btn"
                onClick={() => setShowExitModal(false)}
              >
                Nah 😎
              </button>

              <button
                className="exit-btn"
                onClick={() => {
                  sessionStorage.clear();
                  CapacitorApp.exitApp();
                }}
              >
                I'm Out 💀
              </button>
            </div>
          </div>
        </div>
      )}
      <Toast />
    </div>
  );
}
