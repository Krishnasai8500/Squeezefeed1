export default function DownloadPage() {
  const handleDownload = () => {
    window.location.href =
      "https://share.squeezefeed.com/downloads/SqueezeFeed.apk";
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0b0b0b",
        color: "#fff",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        padding: 24,
        textAlign: "center",
      }}
    >
      <h1>SqueezeFeed</h1>

      <p>
        Download the latest Android APK and experience personalised news,
        memes and AI-powered summaries.
      </p>

      <button
        onClick={handleDownload}
        style={{
          marginTop: 20,
          background: "#ff6a00",
          color: "#fff",
          border: "none",
          padding: "14px 30px",
          borderRadius: "12px",
          fontSize: "16px",
          cursor: "pointer",
        }}
      >
        Download APK
      </button>
    </div>
  );
}