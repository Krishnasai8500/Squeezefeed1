import { fireConfetti } from "../utils/confetti";

export default function BadgeUnlockPopup({ badge, onClaim }) {
    if (!badge) return null;

    return (
        <>
            {/* Keyframe style injected inline */}
            <style>{`
                @keyframes popupScale {
                    from { transform: scale(0.8); opacity: 0; }
                    to   { transform: scale(1);   opacity: 1; }
                }
            `}</style>

            <div style={styles.overlay}>
                <div style={styles.popup}>
                    <div style={styles.glow} />

                    <div style={styles.icon}>🏆</div>

                    <h1 style={styles.title}>Badge Unlocked!</h1>

                    <h2 style={styles.badgeName}>{badge}</h2>

                    <p style={styles.text}>Your progression just evolved.</p>

                    <button
                        style={styles.button}
                        onClick={() => {
                            fireConfetti();
                            setTimeout(() => {
                                onClaim();
                            }, 500);
                        }}
                    >
                        Claim Badge
                    </button>
                </div>
            </div>
        </>
    );
}

const styles = {
    overlay: {
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.7)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 99999
    },
    popup: {
        position: "relative",
        width: "90%",
        maxWidth: "420px",
        background: "#181818",
        borderRadius: "24px",
        padding: "32px",
        textAlign: "center",
        overflow: "hidden",
        animation: "popupScale 0.4s ease"
    },
    glow: {
        position: "absolute",
        inset: "-30%",
        background: "radial-gradient(circle, rgba(255,149,0,0.35), transparent 70%)",
        zIndex: 0
    },
    icon: {
        position: "relative",
        zIndex: 1,
        fontSize: "64px"
    },
    title: {
        position: "relative",
        zIndex: 1,
        color: "#fff",
        marginTop: "16px"
    },
    badgeName: {
        position: "relative",
        zIndex: 1,
        color: "#ff9500",
        marginTop: "12px"
    },
    text: {
        position: "relative",
        zIndex: 1,
        color: "#aaa",
        marginTop: "14px"
    },
    button: {
        position: "relative",
        zIndex: 1,
        marginTop: "24px",
        width: "100%",
        background: "#ff9500",
        color: "#000",
        border: "none",
        padding: "14px",
        borderRadius: "12px",
        fontWeight: "bold",
        fontSize: "16px",
        cursor: "pointer"
    }
};