import { signOut } from "firebase/auth";
import { auth } from "../firebase/firebaseConfig";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const logout = async () => {
    await signOut(auth);
  };

  const printToken = async () => {
    if (currentUser) {
      const token = await currentUser.getIdToken();
      console.log(token);
    }
  };

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <div>
          <h1 style={styles.title}>Gemini Growth Companion</h1>
          <p style={styles.subtitle}>
            Empower your daily reflections and track your long-term goals.
          </p>
        </div>

        <button onClick={logout} style={styles.logoutButton}>
          Logout
        </button>
      </header>

      <div style={styles.grid}>
        {/* User Card */}
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Account Overview</h3>
          <p style={styles.userEmail}>{currentUser?.email}</p>
          <p style={styles.cardMuted}>
            Logged in securely via Firebase Authentication.
          </p>

          <button onClick={printToken} style={styles.secondaryButton}>
            Print Token
          </button>
        </div>

        {/* Action Navigation Card */}
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Quick Navigation</h3>
          <p style={styles.cardMuted}>
            Jump directly into your interactive companion workflows:
          </p>

          <div style={styles.buttonGroup}>
            <button
              onClick={() => navigate("/journal")}
              style={styles.primaryButton}
            >
              Open Journal
            </button>

            <button
              onClick={() => navigate("/growth-plan")}
              style={styles.primaryButton}
            >
              Create AI Growth Plan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    backgroundColor: "#f8fafc",
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    padding: "40px 60px",
    boxSizing: "border-box",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "36px",
  },
  title: {
    fontSize: "32px",
    fontWeight: "800",
    color: "#0f172a",
    margin: "0 0 8px 0",
  },
  subtitle: {
    fontSize: "15px",
    color: "#64748b",
    margin: 0,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1.5fr",
    gap: "24px",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: "18px",
    padding: "28px",
    boxShadow:
      "0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01)",
    border: "1px solid #f1f5f9",
  },
  cardTitle: {
    fontSize: "20px",
    fontWeight: "700",
    color: "#0f172a",
    margin: "0 0 12px 0",
  },
  userEmail: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#334155",
    margin: "0 0 6px 0",
  },
  cardMuted: {
    fontSize: "14px",
    color: "#94a3b8",
    margin: "0 0 20px 0",
  },
  buttonGroup: {
    display: "flex",
    gap: "14px",
    flexWrap: "wrap",
  },
  primaryButton: {
    backgroundColor: "#4f46e5",
    color: "#ffffff",
    border: "none",
    padding: "12px 22px",
    borderRadius: "10px",
    fontWeight: "600",
    fontSize: "14px",
    cursor: "pointer",
    boxShadow: "0 4px 6px -1px rgba(79, 70, 229, 0.2)",
  },
  secondaryButton: {
    backgroundColor: "#f1f5f9",
    color: "#334155",
    border: "none",
    padding: "10px 18px",
    borderRadius: "8px",
    fontWeight: "600",
    fontSize: "13px",
    cursor: "pointer",
  },
  logoutButton: {
    backgroundColor: "#ffffff",
    color: "#ef4444",
    border: "1px solid #fecaca",
    padding: "8px 18px",
    borderRadius: "8px",
    fontWeight: "600",
    fontSize: "13px",
    cursor: "pointer",
  },
};