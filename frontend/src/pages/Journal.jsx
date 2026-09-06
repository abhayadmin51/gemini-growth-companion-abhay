import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../api/apiClient";

export default function Journal() {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [conversationId, setConversationId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [summary, setSummary] = useState(null);

  const navigate = useNavigate();

  const loadHistory = async () => {
    try {
      const response = await apiClient.get("/api/conversations");
      setHistory(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const generateSummary = async () => {
    if (!conversationId) return;

    try {
      const response = await apiClient.post("/api/summarize", {
        conversation_id: conversationId,
      });
      setSummary(response.data.summary);
    } catch (error) {
      console.error(error);
    }
  };

  const sendMessage = async () => {
    if (!message.trim()) return;
    setLoading(true);
    try {
      const response = await apiClient.post("/api/chat", {
        message,
        conversation_id: conversationId,
      });

      setMessages((prev) => [
        ...prev,
        {
          role: "user",
          content: message,
        },
        {
          role: "model",
          content: response.data.response,
        },
      ]);

      setConversationId(response.data.conversation_id);
      setMessage("");
      loadHistory();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <div>
          <h1 style={styles.title}>Personal Gemini Journal</h1>
          <p style={styles.subtitle}>
            Reflect on your progress, capture takeaways, and synthesize action items.
          </p>
        </div>
        <button onClick={() => navigate("/dashboard")} style={styles.backButton}>
          Back to Dashboard
        </button>
      </header>

      <div style={styles.grid}>
        {/* Left Sidebar: Previous Journals */}
        <aside style={styles.sidebarCard}>
          <h3 style={styles.cardTitle}>Previous Journals</h3>
          {history.length === 0 ? (
            <p style={styles.mutedText}>No saved reflections yet.</p>
          ) : (
            <div style={styles.historyList}>
              {history.map((item) => (
                <div
                  key={item.conversation_id}
                  style={{
                    ...styles.historyItem,
                    ...(conversationId === item.conversation_id
                      ? styles.historyItemActive
                      : {}),
                  }}
                  onClick={() => setConversationId(item.conversation_id)}
                >
                  <p style={styles.historyTitle}>{item.title || "Untitled reflection"}</p>
                </div>
              ))}
            </div>
          )}
        </aside>

        {/* Right Content Area */}
        <main style={styles.mainContent}>
          {/* Conversation Messages */}
          {messages.length > 0 && (
            <div style={styles.card}>
              <h3 style={styles.cardTitle}>Conversation</h3>
              <div style={styles.messageList}>
                {messages.map((msg, index) => (
                  <div
                    key={index}
                    style={
                      msg.role === "user"
                        ? styles.userMessageRow
                        : styles.modelMessageRow
                    }
                  >
                    <div
                      style={
                        msg.role === "user"
                          ? styles.userBubble
                          : styles.modelBubble
                      }
                    >
                      <span style={styles.bubbleRole}>
                        {msg.role === "user" ? "You" : "Gemini"}
                      </span>
                      <p style={styles.bubbleContent}>{msg.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Prompt Entry Box */}
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Write Reflection</h3>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="What did you learn, build, or reflect on today?"
              rows={5}
              style={styles.textarea}
            />

            <div style={styles.buttonGroup}>
              <button
                disabled={loading}
                onClick={sendMessage}
                style={styles.primaryButton}
              >
                {loading ? "Thinking..." : "Send"}
              </button>

              <button
                disabled={!conversationId}
                onClick={generateSummary}
                style={{
                  ...styles.secondaryButton,
                  opacity: !conversationId ? 0.6 : 1,
                }}
              >
                Generate Summary
              </button>
            </div>
          </div>

          {/* Generated Structured Summary */}
          {summary && (
            <div style={styles.card}>
              <h2 style={styles.summaryHeading}>{summary.title}</h2>
              <p style={styles.summaryBody}>{summary.summary}</p>

              <div style={styles.summaryGrid}>
                {summary.achievements?.length > 0 && (
                  <div style={styles.summarySection}>
                    <h4 style={styles.summarySectionHeader}>Achievements</h4>
                    <ul style={styles.summaryList}>
                      {summary.achievements.map((a, i) => (
                        <li key={i} style={styles.summaryListItem}>
                          {a}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {summary.challenges?.length > 0 && (
                  <div style={styles.summarySection}>
                    <h4 style={styles.summarySectionHeader}>Challenges</h4>
                    <ul style={styles.summaryList}>
                      {summary.challenges.map((c, i) => (
                        <li key={i} style={styles.summaryListItem}>
                          {c}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {summary.next_actions?.length > 0 && (
                  <div style={styles.summarySection}>
                    <h4 style={styles.summarySectionHeader}>Next Actions</h4>
                    <ul style={styles.summaryList}>
                      {summary.next_actions.map((n, i) => (
                        <li key={i} style={styles.summaryListItem}>
                          {n}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
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
    marginBottom: "32px",
  },
  title: {
    fontSize: "30px",
    fontWeight: "800",
    color: "#0f172a",
    margin: "0 0 6px 0",
  },
  subtitle: {
    fontSize: "15px",
    color: "#64748b",
    margin: 0,
  },
  backButton: {
    backgroundColor: "#ffffff",
    color: "#334155",
    border: "1px solid #e2e8f0",
    padding: "8px 18px",
    borderRadius: "10px",
    fontWeight: "600",
    fontSize: "13px",
    cursor: "pointer",
    boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "300px 1fr",
    gap: "28px",
    alignItems: "start",
  },
  sidebarCard: {
    backgroundColor: "#ffffff",
    borderRadius: "18px",
    padding: "24px",
    boxShadow:
      "0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01)",
    border: "1px solid #f1f5f9",
    maxHeight: "calc(100vh - 160px)",
    overflowY: "auto",
  },
  mainContent: {
    display: "flex",
    flexDirection: "column",
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
    fontSize: "18px",
    fontWeight: "700",
    color: "#0f172a",
    margin: "0 0 16px 0",
  },
  mutedText: {
    fontSize: "14px",
    color: "#94a3b8",
    margin: 0,
  },
  historyList: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  historyItem: {
    padding: "10px 14px",
    borderRadius: "8px",
    backgroundColor: "#f8fafc",
    border: "1px solid #e2e8f0",
    cursor: "pointer",
    transition: "background-color 0.15s ease",
  },
  historyItemActive: {
    backgroundColor: "#eef2ff",
    borderColor: "#c7d2fe",
  },
  historyTitle: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#1e293b",
    margin: 0,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  textarea: {
    width: "100%",
    padding: "14px",
    borderRadius: "10px",
    border: "1px solid #cbd5e1",
    fontSize: "14px",
    lineHeight: "1.5",
    color: "#0f172a",
    fontFamily: "inherit",
    boxSizing: "border-box",
    outline: "none",
    resize: "vertical",
  },
  buttonGroup: {
    display: "flex",
    gap: "12px",
    marginTop: "16px",
  },
  primaryButton: {
    backgroundColor: "#4f46e5",
    color: "#ffffff",
    border: "none",
    padding: "11px 22px",
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
    padding: "11px 20px",
    borderRadius: "10px",
    fontWeight: "600",
    fontSize: "14px",
    cursor: "pointer",
  },
  messageList: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    maxHeight: "360px",
    overflowY: "auto",
    paddingRight: "6px",
  },
  userMessageRow: {
    display: "flex",
    justifyContent: "flex-end",
  },
  modelMessageRow: {
    display: "flex",
    justifyContent: "flex-start",
  },
  userBubble: {
    backgroundColor: "#4f46e5",
    color: "#ffffff",
    padding: "12px 16px",
    borderRadius: "14px 14px 2px 14px",
    maxWidth: "75%",
  },
  modelBubble: {
    backgroundColor: "#f1f5f9",
    color: "#0f172a",
    padding: "12px 16px",
    borderRadius: "14px 14px 14px 2px",
    maxWidth: "75%",
  },
  bubbleRole: {
    display: "block",
    fontSize: "11px",
    fontWeight: "700",
    textTransform: "uppercase",
    marginBottom: "4px",
    opacity: 0.8,
  },
  bubbleContent: {
    fontSize: "14px",
    margin: 0,
    lineHeight: "1.4",
  },
  summaryHeading: {
    fontSize: "20px",
    fontWeight: "700",
    color: "#0f172a",
    margin: "0 0 8px 0",
  },
  summaryBody: {
    fontSize: "14px",
    color: "#475569",
    lineHeight: "1.6",
    margin: "0 0 20px 0",
  },
  summaryGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "16px",
  },
  summarySection: {
    backgroundColor: "#f8fafc",
    padding: "16px",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
  },
  summarySectionHeader: {
    fontSize: "12px",
    fontWeight: "700",
    color: "#334155",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    margin: "0 0 10px 0",
  },
  summaryList: {
    paddingLeft: "18px",
    margin: 0,
  },
  summaryListItem: {
    fontSize: "13px",
    color: "#475569",
    marginBottom: "6px",
    lineHeight: "1.4",
  },
};