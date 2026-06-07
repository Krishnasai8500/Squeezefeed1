import { useState, useEffect } from "react";

let showToastFn = null;

export function showToast(msg, type = "success") {
  if (showToastFn) showToastFn(msg, type);
}

export default function Toast() {
  const [toast, setToast] = useState(null);

  useEffect(() => {
    showToastFn = (msg, type) => {
      setToast({ msg, type });
      setTimeout(() => setToast(null), 3000);
    };
    return () => {
      showToastFn = null;
    };
  }, []);

  if (!toast) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: "90px",
        left: "50%",
        transform: "translateX(-50%)",
        background:
          toast.type === "error"
            ? "rgba(239,68,68,0.95)"
            : toast.type === "warning"
              ? "rgba(234,179,8,0.95)"
              : "rgba(255,106,0,0.95)",
        color: "#fff",
        padding: "12px 24px",
        borderRadius: "999px",
        fontSize: "13px",
        fontWeight: "600",
        zIndex: 999999,
        boxShadow: "0 4px 24px rgba(0,0,0,0.5)",
        whiteSpace: "nowrap",
        fontFamily: "'DM Sans', sans-serif",
        letterSpacing: "0.02em",
      }}
    >
      {toast.type === "error" ? "⚠ " : toast.type === "warning" ? "⚡ " : "✓ "}
      {toast.msg}
    </div>
  );
}
