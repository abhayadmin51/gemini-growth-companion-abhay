import { useState, useEffect } from "react";
import apiClient from "../api/apiClient";

export default function Journal() {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [conversationId, setConversationId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [summary, setSummary] = useState(null);

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
    <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
      <h1>Personal Gemini Journal</h1>

      <div>
        {messages.map((msg, index) => (
          <div key={index} style={{ marginBottom: "12px" }}>
            <strong>{msg.role}</strong>
            <p>{msg.content}</p>
          </div>
        ))}
      </div>

      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        rows={5}
        style={{ width: "100%", boxSizing: "border-box" }}
      />

      <div style={{ marginTop: "10px", display: "flex", gap: "10px" }}>
        <button disabled={loading} onClick={sendMessage}>
          {loading ? "Thinking..." : "Send"}
        </button>

        <button onClick={generateSummary}>Generate Summary</button>
      </div>

      <div style={{ marginTop: "24px" }}>
        <h3>Previous Journals</h3>
        {history.map((item) => (
          <div key={item.conversation_id}>{item.title}</div>
        ))}
      </div>

      {summary && (
        <div style={{ marginTop: "24px", borderTop: "1px solid #ccc", paddingTop: "16px" }}>
          <h2>{summary.title}</h2>
          <p>{summary.summary}</p>

          <h3>Achievements</h3>
          <ul>
            {summary.achievements.map((a, i) => (
              <li key={i}>{a}</li>
            ))}
          </ul>

          <h3>Challenges</h3>
          <ul>
            {summary.challenges.map((c, i) => (
              <li key={i}>{c}</li>
            ))}
          </ul>

          <h3>Next Actions</h3>
          <ul>
            {summary.next_actions.map((n, i) => (
              <li key={i}>{n}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}