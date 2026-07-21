import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const BASE_URL = "https://api.squeezefeed.com";

// ── Auth header helper ────────────────────────────────────────
const auth = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
});

// ── Squeeze mark ─────────────────────────────────────────────
function SqueezeMark({ size = 20 }) {
  return (
    <svg width={size} height={size * 1.25} viewBox="0 0 64 80" fill="none">
      <rect x="4" y="6" width="56" height="7" rx="3.5" fill="#FF6A00" />
      <rect
        x="10"
        y="19"
        width="44"
        height="7"
        rx="3.5"
        fill="#FF6A00"
        opacity="0.82"
      />
      <rect
        x="18"
        y="32"
        width="28"
        height="7"
        rx="3.5"
        fill="#FF6A00"
        opacity="0.62"
      />
      <rect
        x="24"
        y="45"
        width="16"
        height="7"
        rx="3.5"
        fill="#FF6A00"
        opacity="0.42"
      />
      <rect
        x="28"
        y="56"
        width="8"
        height="7"
        rx="3.5"
        fill="#FF6A00"
        opacity="0.25"
      />
      <circle cx="32" cy="72" r="4" fill="#FF6A00" />
    </svg>
  );
}

// ── Simple bar chart (pure CSS/SVG — no recharts needed) ──────
function BarChart({
  data,
  xKey,
  yKey,
  color = "#FF6A00",
  height = 160,
  label = "",
}) {
  if (!data || data.length === 0)
    return <div style={C.emptyChart}>No data yet</div>;
  const max = Math.max(...data.map((d) => Number(d[yKey]) || 0), 1);
  return (
    <div style={{ width: "100%" }}>
      {label && <div style={C.chartLabel}>{label}</div>}
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          gap: "4px",
          height: `${height}px`,
          width: "100%",
          overflowX: "auto",
        }}
      >
        {data.map((d, i) => {
          const val = Number(d[yKey]) || 0;
          const pct = max > 0 ? (val / max) * 100 : 0;
          return (
            <div
              key={i}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                flex: 1,
                minWidth: "28px",
                gap: "4px",
              }}
            >
              <div
                style={{ fontSize: "9px", color: "#B5B5B5", fontWeight: "600" }}
              >
                {val}
              </div>
              <div
                style={{
                  width: "100%",
                  borderRadius: "4px 4px 0 0",
                  background: color,
                  height: `${Math.max(pct, 2)}%`,
                  opacity: 0.85 + (i / data.length) * 0.15,
                  transition: "height 0.6s ease",
                  minHeight: "3px",
                }}
              />
              <div
                style={{
                  fontSize: "9px",
                  color: "#A0A0A0",
                  transform: "rotate(-40deg)",
                  transformOrigin: "top center",
                  whiteSpace: "nowrap",
                  marginTop: "4px",
                  maxWidth: "40px",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {String(d[xKey]).length > 6
                  ? String(d[xKey]).slice(-5)
                  : d[xKey]}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Stat card ─────────────────────────────────────────────────
function StatCard({ label, value, icon, sub, color = "#FF6A00", delay = 0 }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    setTimeout(() => setVisible(true), delay);
  }, [delay]);
  return (
    <div
      style={{
        ...C.statCard,
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(16px)",
        transition: "opacity 0.5s ease, transform 0.5s ease",
        borderColor: color + "22",
      }}
    >
      <div style={{ fontSize: "22px", marginBottom: "8px" }}>{icon}</div>
      <div style={{ ...C.statValue, color }}>{value}</div>
      <div style={C.statLabel}>{label}</div>
      {sub && <div style={C.statSub}>{sub}</div>}
    </div>
  );
}

// ── Section wrapper ───────────────────────────────────────────
function Section({ title, icon, children }) {
  return (
    <div style={C.section}>
      <div style={C.sectionHead}>
        <span style={{ marginRight: "8px" }}>{icon}</span>
        <span style={C.sectionTitle}>{title}</span>
      </div>
      {children}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────
export default function AdminAnalyticsPage() {
  const navigate = useNavigate();
  const role = localStorage.getItem("role");

  const [overview, setOverview] = useState(null);
  const [engagement, setEngagement] = useState([]);
  const [byCategory, setByCategory] = useState([]);
  const [peakHours, setPeakHours] = useState([]);
  const [userGrowth, setUserGrowth] = useState([]);
  const [topArticles, setTopArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState("overview");
  const [ctr, setCtr] = useState(null);
  const [sessionStats, setSessionStats] = useState(null);
  const [devices, setDevices] = useState(null);
  const [retention, setRetention] = useState(null);
  const [dau, setDau] = useState(null);
  const [referrals, setReferrals] = useState(null);
  const [searches, setSearches] = useState([]);

  useEffect(() => {
    if (role !== "ADMIN") {
      navigate("/");
      return;
    }
    fetchAll();
  }, []);

  async function fetchAll() {
    setLoading(true);
    setError(null);
    try {
      const [
        o,
        e,
        c,
        p,
        g,
        t,
        ctrData,
        sessionData,
        deviceData,
        retentionData,
        dauData,
        referralData,
        searchData,
      ] = await Promise.all([
        axios.get(`${BASE_URL}/api/analytics/overview`, auth()),
        axios.get(
          `${BASE_URL}/api/analytics/engagement/daily?period=14`,
          auth(),
        ),
        axios.get(`${BASE_URL}/api/analytics/content/by-category`, auth()),
        axios.get(`${BASE_URL}/api/analytics/content/peak-hours`, auth()),
        axios.get(`${BASE_URL}/api/analytics/users/growth?period=30`, auth()),
        axios.get(
          `${BASE_URL}/api/analytics/content/top-articles?limit=10`,
          auth(),
        ),

        axios.get(`${BASE_URL}/api/analytics/content/ctr`, auth()),
        axios.get(`${BASE_URL}/api/analytics/users/session`, auth()),
        axios.get(`${BASE_URL}/api/analytics/users/devices`, auth()),
        axios.get(`${BASE_URL}/api/analytics/users/retention`, auth()),
        axios.get(`${BASE_URL}/api/analytics/users/dau`, auth()),
        axios.get(`${BASE_URL}/api/analytics/users/referrals`, auth()),
        axios.get(`${BASE_URL}/api/analytics/users/searches`, auth()),
      ]);
      setOverview(o.data);
      setEngagement(e.data || []);
      setByCategory(c.data || []);
      setPeakHours(p.data || []);
      setUserGrowth(g.data || []);
      setTopArticles(t.data || []);
      setCtr(ctrData.data);
      setSessionStats(sessionData.data);
      setDevices(deviceData.data);
      setRetention(retentionData.data);
      setDau(dauData.data);
      setReferrals(referralData.data);
      setSearches(searchData.data);
    } catch (err) {
      setError(
        "Failed to load analytics. Make sure you are authenticated as ADMIN.",
      );
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  // ── Process engagement data — group by date ───────────────
  const engagementByDate = engagement.reduce((acc, item) => {
    const d = item.date;
    if (!acc[d]) acc[d] = { date: d, reads: 0, shares: 0, comments: 0 };
    if (item.type === "VIEW") acc[d].reads += Number(item.total);
    if (item.type === "SHARE") acc[d].shares += Number(item.total);
    if (item.type === "CLICK") acc[d].comments += Number(item.total);
    return acc;
  }, {});
  const engagementArr = Object.values(engagementByDate).sort((a, b) =>
    a.date > b.date ? 1 : -1,
  );

  // ── Format hour labels ────────────────────────────────────
  const peakWithLabel = peakHours.map((h) => ({
    ...h,
    label: `${h.hour}:00`,
  }));

  const TABS = ["overview", "engagement", "content", "users"];

  if (loading)
    return (
      <div style={C.loadingPage}>
        <div style={C.loadingRing} />
        <div style={C.loadingText}>Loading Analytics...</div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );

  if (error)
    return (
      <div style={C.loadingPage}>
        <div style={{ fontSize: "36px", marginBottom: "16px" }}>⚠️</div>
        <div
          style={{
            color: "#ef4444",
            fontSize: "14px",
            textAlign: "center",
            maxWidth: "300px",
          }}
        >
          {error}
        </div>
        <button onClick={fetchAll} style={C.retryBtn}>
          Retry
        </button>
      </div>
    );

  return (
    <>
      <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap');
                @keyframes spin    { to { transform: rotate(360deg); } }
                @keyframes fadeUp  { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
                @keyframes pulse   { 0%,100%{opacity:0.6} 50%{opacity:1} }
                .tab-btn:hover     { background: rgba(255,106,0,0.08) !important; color: #FF6A00 !important; }
                .refresh-btn:hover { opacity: 0.8; }
                .article-row:hover { background: rgba(255,106,0,0.05) !important; }
            `}</style>

      <div style={C.page}>
        {/* ── Top bar ── */}
        <div style={C.topBar}>
          <div style={C.topBarLeft}>
            <SqueezeMark size={18} />
            <span style={C.topBarTitle}>
              Squeeze<span style={{ color: "#FF6A00" }}>Feed</span>
              <span style={C.topBarSub}> · Analytics</span>
            </span>
          </div>
          <div style={C.topBarRight}>
            <div style={C.liveDot} />
            <span style={C.liveText}>Live</span>
            <button
              className="refresh-btn"
              style={C.refreshBtn}
              onClick={fetchAll}
            >
              ↺ Refresh
            </button>
            <button style={C.backBtn} onClick={() => navigate("/")}>
              ← Home
            </button>
          </div>
        </div>

        <div style={C.container}>
          {/* ── Tab nav ── */}
          <div style={C.tabRow}>
            {TABS.map((t) => (
              <button
                key={t}
                className="tab-btn"
                onClick={() => setTab(t)}
                style={{
                  ...C.tabBtn,
                  ...(tab === t ? C.tabBtnActive : {}),
                }}
              >
                {t === "overview" && "📊 "}
                {t === "engagement" && "📈 "}
                {t === "content" && "📰 "}
                {t === "users" && "👥 "}
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>

          {/* ════════════════════════════════════════
                        TAB: OVERVIEW
                    ════════════════════════════════════════ */}
          {tab === "overview" && overview && (
            <div style={{ animation: "fadeUp 0.4s ease" }}>
              {/* Stat cards */}
              <div style={C.statsGrid}>
                <StatCard
                  label="Total Reads"
                  value={overview.totalReads}
                  icon="📖"
                  color="#FF6A00"
                  delay={0}
                />
                <StatCard
                  label="Total Shares"
                  value={overview.totalShares}
                  icon="↗️"
                  color="#3b82f6"
                  delay={60}
                />
                <StatCard
                  label="Total Comments"
                  value={overview.totalComments}
                  icon="💬"
                  color="#22c55e"
                  delay={120}
                />
                <StatCard
                  label="Total Users"
                  value={overview.totalUsers}
                  icon="👥"
                  color="#a855f7"
                  delay={180}
                />
                <StatCard
                  label="New Today"
                  value={overview.newUsersToday}
                  icon="🌅"
                  color="#f59e0b"
                  delay={240}
                  sub="new users"
                />
                <StatCard
                  label="New This Week"
                  value={overview.newUsersThisWeek}
                  icon="📅"
                  color="#ec4899"
                  delay={300}
                  sub="new users"
                />
                <StatCard
                  label="Today's Active Users"
                  value={
                    Array.isArray(dau) && dau.length > 0
                      ? dau[dau.length - 1]?.activeUsers || 0
                      : 0
                  }
                  icon="🔥"
                  color="#ef4444"
                />
                <StatCard
                  label="CTR"
                  value={ctr?.ctr || "0%"}
                  icon="🎯"
                  color="#3b82f6"
                />
                <StatCard
                  label="D7 Retention"
                  value={retention?.day7Rate || "0%"}
                  icon="🔁"
                  color="#22c55e"
                  sub={`D1: ${retention?.day1Rate || "0%"} · D30: ${retention?.day30Rate || "0%"}`}
                />
                <StatCard
                  label="Referrals"
                  value={referrals?.totalReferrals || 0}
                  icon="🤝"
                  color="#a855f7"
                />
                <StatCard
                  label="Avg Session"
                  value={`${Math.round(sessionStats?.avgSessionSeconds || 0)}s`}
                  icon="⏱️"
                  color="#f59e0b"
                />
              </div>

              {/* Quick charts side by side */}
              <div style={C.twoCol}>
                <div style={C.chartCard}>
                  <div style={C.chartTitle}>Reads by Category</div>
                  <BarChart
                    data={byCategory}
                    xKey="category"
                    yKey="reads"
                    color="#FF6A00"
                    height={140}
                  />
                </div>
                <div style={C.chartCard}>
                  <div style={C.chartTitle}>Peak Reading Hours</div>
                  <BarChart
                    data={peakWithLabel}
                    xKey="label"
                    yKey="reads"
                    color="#f59e0b"
                    height={140}
                  />
                </div>
              </div>
            </div>
          )}

          {/* ════════════════════════════════════════
                        TAB: ENGAGEMENT
                    ════════════════════════════════════════ */}
          {tab === "engagement" && (
            <div style={{ animation: "fadeUp 0.4s ease" }}>
              <Section title="Daily Reads (last 14 days)" icon="📈">
                <div style={C.chartCard}>
                  <BarChart
                    data={engagementArr}
                    xKey="date"
                    yKey="reads"
                    color="#FF6A00"
                    height={180}
                  />
                </div>
              </Section>

              <Section title="Daily Shares (last 14 days)" icon="↗️">
                <div style={C.chartCard}>
                  <BarChart
                    data={engagementArr}
                    xKey="date"
                    yKey="shares"
                    color="#3b82f6"
                    height={180}
                  />
                </div>
              </Section>

              <Section title="Daily Comments (last 14 days)" icon="💬">
                <div style={C.chartCard}>
                  <BarChart
                    data={engagementArr}
                    xKey="date"
                    yKey="comments"
                    color="#22c55e"
                    height={180}
                  />
                </div>
              </Section>

              {/* Engagement summary table */}
              {engagementArr.length > 0 && (
                <Section title="Engagement Table" icon="📋">
                  <div style={C.tableWrap}>
                    <table style={C.table}>
                      <thead>
                        <tr>
                          {["Date", "Reads", "Shares", "Comments"].map((h) => (
                            <th key={h} style={C.th}>
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {engagementArr.map((row, i) => (
                          <tr key={i} className="article-row" style={C.tr}>
                            <td style={C.td}>{row.date}</td>
                            <td
                              style={{
                                ...C.td,
                                color: "#FF6A00",
                                fontWeight: "700",
                              }}
                            >
                              {row.reads}
                            </td>
                            <td
                              style={{
                                ...C.td,
                                color: "#3b82f6",
                                fontWeight: "700",
                              }}
                            >
                              {row.shares}
                            </td>
                            <td
                              style={{
                                ...C.td,
                                color: "#22c55e",
                                fontWeight: "700",
                              }}
                            >
                              {row.comments}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Section>
              )}
            </div>
          )}

          {/* ════════════════════════════════════════
                        TAB: CONTENT
                    ════════════════════════════════════════ */}

          {/* ── CTR Cards ── */}
          {ctr && (
            <Section title="Article Click-Through Rate" icon="🎯">
              <div style={C.twoCol}>
                <div style={C.infoCard}>
                  <div style={C.infoLabel}>Impressions</div>
                  <div style={{ ...C.infoValue, color: "#888" }}>
                    {ctr.impressions}
                  </div>
                </div>
                <div style={C.infoCard}>
                  <div style={C.infoLabel}>Clicks</div>
                  <div style={{ ...C.infoValue, color: "#3b82f6" }}>
                    {ctr.clicks}
                  </div>
                </div>
                <div style={C.infoCard}>
                  <div style={C.infoLabel}>CTR</div>
                  <div style={{ ...C.infoValue, color: "#FF6A00" }}>
                    {ctr.ctr}
                  </div>
                </div>
              </div>
            </Section>
          )}
          {tab === "content" && (
            <div style={{ animation: "fadeUp 0.4s ease" }}>
              <Section title="Reads by Category" icon="🗂️">
                <div style={C.chartCard}>
                  <BarChart
                    data={byCategory}
                    xKey="category"
                    yKey="reads"
                    color="#FF6A00"
                    height={200}
                  />
                </div>
                {/* Category table */}
                <div style={C.tableWrap}>
                  <table style={C.table}>
                    <thead>
                      <tr>
                        <th style={C.th}>Category</th>
                        <th style={C.th}>Reads</th>
                        <th style={C.th}>Share</th>
                      </tr>
                    </thead>
                    <tbody>
                      {byCategory.map((row, i) => {
                        const total = byCategory.reduce(
                          (s, r) => s + Number(r.reads),
                          0,
                        );
                        const pct =
                          total > 0
                            ? ((Number(row.reads) / total) * 100).toFixed(1)
                            : "0.0";
                        return (
                          <tr key={i} className="article-row" style={C.tr}>
                            <td style={C.td}>
                              <span style={C.catPill}>{row.category}</span>
                            </td>
                            <td
                              style={{
                                ...C.td,
                                color: "#FF6A00",
                                fontWeight: "700",
                              }}
                            >
                              {row.reads}
                            </td>
                            <td style={C.td}>{pct}%</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </Section>

              <Section title="Peak Reading Hours" icon="⏰">
                <div style={C.chartCard}>
                  <BarChart
                    data={peakWithLabel}
                    xKey="label"
                    yKey="reads"
                    color="#f59e0b"
                    height={200}
                  />
                </div>
              </Section>

              <Section title="Top Articles" icon="🏆">
                {topArticles.length === 0 ? (
                  <div style={C.emptyState}>No article data yet</div>
                ) : (
                  <div style={C.tableWrap}>
                    <table style={C.table}>
                      <thead>
                        <tr>
                          <th style={C.th}>#</th>
                          <th style={C.th}>Content ID</th>
                          <th style={C.th}>Category</th>
                          <th style={C.th}>Reads</th>
                        </tr>
                      </thead>
                      <tbody>
                        {topArticles.map((row, i) => (
                          <tr key={i} className="article-row" style={C.tr}>
                            <td
                              style={{
                                ...C.td,
                                color: "#B5B5B5",
                                fontFamily: "'DM Mono',monospace",
                              }}
                            >
                              {i + 1}
                            </td>
                            <td
                              style={{
                                ...C.td,
                                fontFamily: "'DM Mono',monospace",
                                color: "#888",
                              }}
                            >
                              #{row.contentId}
                            </td>
                            <td style={C.td}>
                              <span style={C.catPill}>
                                {row.category || "—"}
                              </span>
                            </td>
                            <td
                              style={{
                                ...C.td,
                                color: "#FF6A00",
                                fontWeight: "700",
                              }}
                            >
                              {row.reads}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </Section>
            </div>
          )}

          {/* ════════════════════════════════════════
                        TAB: USERS
                    ════════════════════════════════════════ */}
          {tab === "users" && (
            <div style={{ animation: "fadeUp 0.4s ease" }}>
              <Section title="User Growth (last 30 days)" icon="👥">
                {userGrowth.length === 0 ? (
                  <div style={C.emptyState}>
                    <div style={{ fontSize: "32px", marginBottom: "12px" }}>
                      📭
                    </div>
                    <div>No registration events tracked yet.</div>
                    <div
                      style={{
                        fontSize: "12px",
                        color: "#8A8A8A",
                        marginTop: "8px",
                      }}
                    >
                      New registrations will appear here automatically.
                    </div>
                  </div>
                ) : (
                  <>
                    <div style={C.chartCard}>
                      <BarChart
                        data={userGrowth}
                        xKey="date"
                        yKey="count"
                        color="#a855f7"
                        height={200}
                      />
                    </div>
                    <div style={C.tableWrap}>
                      <table style={C.table}>
                        <thead>
                          <tr>
                            <th style={C.th}>Date</th>
                            <th style={C.th}>New Users</th>
                          </tr>
                        </thead>
                        <tbody>
                          {userGrowth.map((row, i) => (
                            <tr key={i} className="article-row" style={C.tr}>
                              <td style={C.td}>{row.date}</td>
                              <td
                                style={{
                                  ...C.td,
                                  color: "#a855f7",
                                  fontWeight: "700",
                                }}
                              >
                                {row.count}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}
              </Section>
              {/* ── DAU Chart ── */}
              <Section title="Daily Active Users (last 30 days)" icon="🔥">
                {Array.isArray(dau) && dau.length > 0 ? (
                  <div style={C.chartCard}>
                    <BarChart
                      data={dau}
                      xKey="date"
                      yKey="activeUsers"
                      color="#ef4444"
                      height={180}
                    />
                  </div>
                ) : (
                  <div style={C.emptyState}>
                    <div style={{ fontSize: "32px", marginBottom: "12px" }}>
                      📭
                    </div>
                    <div>No session data yet</div>
                  </div>
                )}
              </Section>

              {/* ── Retention ── */}
              {retention && (
                <Section title="User Retention" icon="🔁">
                  <div style={C.twoCol}>
                    <div style={C.infoCard}>
                      <div style={C.infoLabel}>Day 1 Retention</div>
                      <div style={{ ...C.infoValue, color: "#22c55e" }}>
                        {retention.day1Rate}
                      </div>
                      <div
                        style={{
                          fontSize: "11px",
                          color: "#A0A0A0",
                          marginTop: "4px",
                        }}
                      >
                        {retention.day1Retained} users
                      </div>
                    </div>
                    <div style={C.infoCard}>
                      <div style={C.infoLabel}>Day 7 Retention</div>
                      <div style={{ ...C.infoValue, color: "#3b82f6" }}>
                        {retention.day7Rate}
                      </div>
                      <div
                        style={{
                          fontSize: "11px",
                          color: "#A0A0A0",
                          marginTop: "4px",
                        }}
                      >
                        {retention.day7Retained} users
                      </div>
                    </div>
                    <div style={C.infoCard}>
                      <div style={C.infoLabel}>Day 30 Retention</div>
                      <div style={{ ...C.infoValue, color: "#a855f7" }}>
                        {retention.day30Rate}
                      </div>
                      <div
                        style={{
                          fontSize: "11px",
                          color: "#A0A0A0",
                          marginTop: "4px",
                        }}
                      >
                        {retention.day30Retained} users
                      </div>
                    </div>
                    <div style={C.infoCard}>
                      <div style={C.infoLabel}>Total Users</div>
                      <div style={{ ...C.infoValue, color: "#FF6A00" }}>
                        {retention.totalUsers}
                      </div>
                    </div>
                  </div>
                </Section>
              )}

              {/* ── Session stats ── */}
              {sessionStats && (
                <Section title="Session Analytics" icon="⏱️">
                  <div style={C.twoCol}>
                    <div style={C.infoCard}>
                      <div style={C.infoLabel}>Avg Session</div>
                      <div style={{ ...C.infoValue, color: "#f59e0b" }}>
                        {Math.round(sessionStats.avgSessionSeconds || 0)}s
                      </div>
                      <div
                        style={{
                          fontSize: "11px",
                          color: "#A0A0A0",
                          marginTop: "4px",
                        }}
                      >
                        {Math.round((sessionStats.avgSessionSeconds || 0) / 60)}
                        m avg
                      </div>
                    </div>
                    <div style={C.infoCard}>
                      <div style={C.infoLabel}>Total Sessions</div>
                      <div style={{ ...C.infoValue, color: "#22c55e" }}>
                        {sessionStats.totalSessions || 0}
                      </div>
                    </div>
                  </div>
                </Section>
              )}

              {/* ── Referrals ── */}
              {referrals && (
                <Section title="Referrals" icon="🤝">
                  <div style={C.infoCard}>
                    <div style={C.infoLabel}>Total Referral Visits</div>
                    <div style={{ ...C.infoValue, color: "#a855f7" }}>
                      {referrals.totalReferrals || 0}
                    </div>
                  </div>
                </Section>
              )}

              {/* User overview stats */}
              {overview && (
                <Section title="User Stats" icon="📊">
                  <div style={C.twoCol}>
                    <div style={C.infoCard}>
                      <div style={C.infoLabel}>Total Registered</div>
                      <div style={{ ...C.infoValue, color: "#a855f7" }}>
                        {overview.totalUsers}
                      </div>
                    </div>
                    <div style={C.infoCard}>
                      <div style={C.infoLabel}>Joined Today</div>
                      <div style={{ ...C.infoValue, color: "#f59e0b" }}>
                        {overview.newUsersToday}
                      </div>
                    </div>
                    <div style={C.infoCard}>
                      <div style={C.infoLabel}>Joined This Week</div>
                      <div style={{ ...C.infoValue, color: "#22c55e" }}>
                        {overview.newUsersThisWeek}
                      </div>
                    </div>
                    <div style={C.infoCard}>
                      <div style={C.infoLabel}>Total Reads</div>
                      <div style={{ ...C.infoValue, color: "#FF6A00" }}>
                        {overview.totalReads}
                      </div>
                    </div>
                  </div>
                </Section>
              )}

              <Section title="Device Analytics" icon="📱">
                <div style={C.twoCol}>
                  <div style={C.infoCard}>
                    <div style={C.infoLabel}>Mobile</div>
                    <div style={C.infoValue}>{devices?.mobile || 0}</div>
                  </div>
                  <div style={C.infoCard}>
                    <div style={C.infoLabel}>Desktop</div>
                    <div style={C.infoValue}>{devices?.desktop || 0}</div>
                  </div>
                </div>
              </Section>

              <Section title="Top Searches" icon="🔍">
                {searches?.length ? (
                  <div style={C.tableWrap}>
                    <table style={C.table}>
                      <thead>
                        <tr>
                          <th style={C.th}>Search Term</th>
                          <th style={C.th}>Count</th>
                        </tr>
                      </thead>
                      <tbody>
                        {searches.map((s, i) => (
                          <tr key={i} className="article-row" style={C.tr}>
                            <td style={C.td}>{s.query}</td>
                            <td style={C.td}>{s.count}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div style={C.emptyState}>No search data available</div>
                )}
              </Section>
            </div>
          )}

          <div style={{ height: "60px" }} />
        </div>
      </div>
    </>
  );
}

// ── Styles ────────────────────────────────────────────────────
const C = {
  page: {
    minHeight: "100vh",
    background: "#121212",
    fontFamily: "'Space Grotesk', sans-serif",
    color: "#fff",
  },

  // Top bar
  topBar: {
    position: "sticky",
    top: 0,
    zIndex: 100,
    background: "rgba(11,11,11,0.95)",
    backdropFilter: "blur(12px)",
    borderBottom: "1px solid rgba(255,106,0,0.1)",
    padding: "0 20px",
    height: "56px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  topBarLeft: { display: "flex", alignItems: "center", gap: "10px" },
  topBarTitle: {
    fontSize: "17px",
    fontWeight: "800",
    color: "#fff",
    letterSpacing: "-0.3px",
  },
  topBarSub: { color: "#B0B0B0", fontWeight: "500", fontSize: "14px" },
  topBarRight: { display: "flex", alignItems: "center", gap: "10px" },
  liveDot: {
    width: "7px",
    height: "7px",
    borderRadius: "50%",
    background: "#22c55e",
    boxShadow: "0 0 6px #22c55e",
    animation: "pulse 2s ease infinite",
  },
  liveText: {
    color: "#22c55e",
    fontSize: "11px",
    fontWeight: "700",
    letterSpacing: "0.1em",
  },
  refreshBtn: {
    background: "rgba(255,106,0,0.1)",
    border: "1px solid rgba(255,106,0,0.2)",
    color: "#FF6A00",
    padding: "6px 12px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: "600",
    fontFamily: "'Space Grotesk',sans-serif",
    transition: "opacity 0.2s",
  },
  backBtn: {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    color: "#888",
    padding: "6px 12px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: "600",
    fontFamily: "'Space Grotesk',sans-serif",
  },

  container: { maxWidth: "900px", margin: "0 auto", padding: "24px 20px" },

  // Tabs
  tabRow: {
    display: "flex",
    gap: "6px",
    marginBottom: "28px",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
    paddingBottom: "16px",
    flexWrap: "wrap",
  },
  tabBtn: {
    padding: "8px 16px",
    borderRadius: "8px",
    border: "1px solid transparent",
    background: "transparent",
    color: "#A0A0A0",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
    letterSpacing: "0.02em",
    fontFamily: "'Space Grotesk',sans-serif",
    transition: "all 0.2s",
  },
  tabBtnActive: {
    background: "rgba(255,106,0,0.1)",
    border: "1px solid rgba(255,106,0,0.3)",
    color: "#FF6A00",
  },

  // Stats grid
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
    gap: "12px",
    marginBottom: "24px",
  },
  statCard: {
    background: "rgba(255,255,255,0.02)",
    border: "1px solid",
    borderRadius: "14px",
    padding: "20px 16px",
    textAlign: "center",
  },
  statValue: {
    fontSize: "28px",
    fontWeight: "800",
    letterSpacing: "-0.5px",
    lineHeight: 1,
    marginBottom: "6px",
  },
  statLabel: {
    color: "#D4D4D4",
    fontSize: "11px",
    fontWeight: "600",
    letterSpacing: "0.08em",
    textTransform: "uppercase",
  },
  statSub: { color: "#A0A0A0", fontSize: "10px", marginTop: "4px" },

  // Two col layout
  twoCol: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
    gap: "16px",
    marginBottom: "0",
  },

  // Chart card
  chartCard: {
    background: "rgba(255,255,255,0.02)",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: "14px",
    padding: "20px",
    marginBottom: "16px",
  },
  chartTitle: {
    fontSize: "13px",
    fontWeight: "700",
    color: "#E5E5E5",
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    marginBottom: "16px",
  },
  chartLabel: {
    fontSize: "11px",
    color: "#A0A0A0",
    marginBottom: "8px",
    letterSpacing: "0.06em",
  },
  emptyChart: {
    color: "#8A8A8A",
    fontSize: "13px",
    textAlign: "center",
    padding: "40px 0",
  },

  // Section
  section: { marginBottom: "28px" },
  sectionHead: {
    display: "flex",
    alignItems: "center",
    marginBottom: "16px",
  },
  sectionTitle: {
    fontSize: "16px",
    fontWeight: "700",
    color: "#f0ece0",
    letterSpacing: "-0.2px",
  },

  // Table
  tableWrap: {
    borderRadius: "12px",
    border: "1px solid rgba(255,255,255,0.06)",
    overflow: "hidden",
    marginBottom: "16px",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: "13px",
  },
  th: {
    background: "rgba(255,255,255,0.03)",
    color: "#D0D0D0",
    fontSize: "10px",
    fontWeight: "700",
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    padding: "12px 16px",
    textAlign: "left",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
  },
  tr: {
    borderBottom: "1px solid rgba(255,255,255,0.04)",
    transition: "background 0.15s",
  },
  td: {
    padding: "12px 16px",
    color: "#F0F0F0",
    verticalAlign: "middle",
  },
  catPill: {
    background: "rgba(255,106,0,0.08)",
    border: "1px solid rgba(255,106,0,0.15)",
    color: "#FF6A00",
    padding: "3px 10px",
    borderRadius: "999px",
    fontSize: "11px",
    fontWeight: "700",
    letterSpacing: "0.04em",
  },

  // Info cards (users tab)
  infoCard: {
    background: "rgba(255,255,255,0.02)",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: "14px",
    padding: "20px",
    textAlign: "center",
  },
  infoLabel: {
    color: "#A0A0A0",
    fontSize: "11px",
    fontWeight: "600",
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    marginBottom: "8px",
  },
  infoValue: {
    fontSize: "32px",
    fontWeight: "800",
    letterSpacing: "-0.5px",
  },

  // Empty state
  emptyState: {
    textAlign: "center",
    padding: "48px 0",
    color: "#A0A0A0",
    fontSize: "13px",
  },

  // Loading
  loadingPage: {
    background: "#0B0B0B",
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "16px",
    fontFamily: "'Space Grotesk',sans-serif",
  },
  loadingRing: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    border: "2px solid rgba(255,106,0,0.2)",
    borderTopColor: "#FF6A00",
    animation: "spin 0.9s linear infinite",
  },
  loadingText: { color: "#E0E0E0", fontSize: "14px", letterSpacing: "0.06em" },
  retryBtn: {
    marginTop: "8px",
    background: "rgba(255,106,0,0.1)",
    border: "1px solid rgba(255,106,0,0.3)",
    color: "#FF6A00",
    padding: "10px 24px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "600",
    fontFamily: "'Space Grotesk',sans-serif",
  },
};
