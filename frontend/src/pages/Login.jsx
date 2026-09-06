import { auth } from "../firebase/firebaseConfig";
import {
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();

  const loginWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();

      await signInWithPopup(
        auth,
        provider
      );

      // redirect to dashboard
      navigate("/dashboard");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.badge}>
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#4f46e5"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
          </svg>
        </div>

        <h1 style={styles.title}>Gemini Growth Companion</h1>
        <p style={styles.subtitle}>
          Your space for daily reflection, actionable breakdowns, and milestone tracking.
        </p>

        <div style={styles.divider} />

        <button onClick={loginWithGoogle} style={styles.googleButton}>
          <svg style={styles.googleIcon} viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17Z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24Z"
            />
            <path
              fill="#FBBC05"
              d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15Z"
            />
            <path
              fill="#EA4335"
              d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98Z"
            />
          </svg>
          Sign In With Google
        </button>

        <p style={styles.caption}>
          Secure authentication via Firebase
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f8fafc",
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    padding: "24px",
    boxSizing: "border-box",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: "20px",
    padding: "48px 36px",
    maxWidth: "420px",
    width: "100%",
    boxShadow:
      "0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01)",
    border: "1px solid #f1f5f9",
    textAlign: "center",
    boxSizing: "border-box",
  },
  badge: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: "56px",
    height: "56px",
    borderRadius: "16px",
    backgroundColor: "#eef2ff",
    marginBottom: "20px",
  },
  title: {
    fontSize: "24px",
    fontWeight: "800",
    color: "#0f172a",
    margin: "0 0 10px 0",
    letterSpacing: "-0.5px",
  },
  subtitle: {
    fontSize: "14px",
    color: "#64748b",
    lineHeight: "1.5",
    margin: 0,
  },
  divider: {
    height: "1px",
    backgroundColor: "#f1f5f9",
    margin: "28px 0",
  },
  googleButton: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "12px",
    backgroundColor: "#ffffff",
    color: "#1e293b",
    border: "1px solid #cbd5e1",
    borderRadius: "12px",
    padding: "12px 18px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
    transition: "background-color 0.15s ease",
  },
  googleIcon: {
    width: "18px",
    height: "18px",
  },
  caption: {
    fontSize: "12px",
    color: "#94a3b8",
    marginTop: "20px",
    marginBottom: 0,
  },
};