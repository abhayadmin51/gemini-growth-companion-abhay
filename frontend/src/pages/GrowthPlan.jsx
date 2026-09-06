import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import apiClient from "../api/apiClient";

const initialForm = {
  goal: "",
  currentExperience: "",
  targetDate: "",
  weeklyHours: 5,
};

export default function GrowthPlan() {
  const navigate = useNavigate();

  const [form, setForm] = useState(initialForm);
  const [plan, setPlan] = useState(null);
  const [planId, setPlanId] = useState(null);
  const [savedPlans, setSavedPlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] =
    useState(true);
  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]:
        name === "weeklyHours"
          ? Number(value)
          : value,
    }));
  };

const loadSavedPlans = async () => {
    setHistoryLoading(true);

    try {
      const response = await apiClient.get(
        "/api/growth-plans"
      );

      setSavedPlans(response.data);
    } catch (requestError) {
      console.error(requestError);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    loadSavedPlans();
  }, []);

  const generatePlan = async (event) => {
    event.preventDefault();

    setError("");
    setPlan(null);
    setPlanId(null);

    if (
      !form.goal.trim() ||
      !form.currentExperience.trim() ||
      !form.targetDate
    ) {
      setError("Complete all required fields.");
      return;
    }

    setLoading(true);

    try {
      const response = await apiClient.post(
        "/api/growth-plans",
        {
          goal: form.goal.trim(),
          current_experience:
            form.currentExperience.trim(),
          target_date: form.targetDate,
          weekly_hours: form.weeklyHours,
        }
      );

      setPlan(response.data.plan);
      setPlanId(response.data.plan_id);

      await loadSavedPlans();
    } catch (requestError) {
      console.error(requestError);

      const backendDetail =
        requestError.response?.data?.detail;

      if (Array.isArray(backendDetail)) {
        setError(
          backendDetail
            .map((item) => item.msg)
            .join(" ")
        );
      } else {
        setError(
          backendDetail ||
            "Unable to generate the growth plan."
        );
      }
    } finally {
      setLoading(false);
    }
  };

return (
    <main style={styles.page}>
      <header style={styles.header}>
        <div>
          <p style={styles.eyebrow}>
            ORIGINAL AI ENHANCEMENT
          </p>

          <h1 style={styles.title}>
            AI Growth Plan
          </h1>

          <p style={styles.subtitle}>
            Convert a long-term goal into measurable
            milestones and immediate actions.
          </p>
        </div>

        <div style={styles.headerActions}>
          <button
            type="button"
            style={styles.secondaryButton}
            onClick={() => navigate("/journal")}
          >
            Journal
          </button>

          <button
            type="button"
            style={styles.secondaryButton}
            onClick={() => navigate("/dashboard")}
          >
            Dashboard
          </button>
        </div>
      </header>

      <section style={styles.layout}>
        <aside style={styles.sidebar}>
          <h2 style={styles.sectionTitle}>
            Saved Plans
          </h2>

          {historyLoading && (
            <p style={styles.muted}>
              Loading plans...
            </p>
          )}

          {!historyLoading &&
            savedPlans.length === 0 && (
              <p style={styles.muted}>
                No saved growth plans yet.
              </p>
            )}

          {savedPlans.map((savedPlan) => (
            <article
              key={savedPlan.plan_id}
              style={styles.historyCard}
            >
              <strong>
                {savedPlan.plan_title}
              </strong>

              <p style={styles.historySummary}>
                {savedPlan.goal_summary}
              </p>

              <small style={styles.muted}>
                Target: {savedPlan.target_date}
                {" · "}
                {savedPlan.weekly_hours} hours/week
              </small>
            </article>
          ))}
        </aside>

<div style={styles.content}>
          <form
            style={styles.card}
            onSubmit={generatePlan}
          >
            <h2 style={styles.sectionTitle}>
              Define Your Goal
            </h2>

            <label style={styles.label}>
              Goal
              <textarea
                name="goal"
                value={form.goal}
                onChange={handleChange}
                maxLength={500}
                rows={4}
                required
                style={styles.input}
                placeholder={
                  "Example: Become ready for a " +
                  "cloud architect role by building " +
                  "strong architecture, security, " +
                  "AI, and leadership evidence."
                }
              />
            </label>

            <label style={styles.label}>
              Current experience
              <input
                name="currentExperience"
                value={form.currentExperience}
                onChange={handleChange}
                maxLength={100}
                required
                style={styles.input}
                placeholder={
                  "Example: Senior integration " +
                  "engineer with cloud experience"
                }
              />
            </label>

<div style={styles.formGrid}>
              <label style={styles.label}>
                Target date
                <input
                  type="date"
                  name="targetDate"
                  value={form.targetDate}
                  onChange={handleChange}
                  required
                  style={styles.input}
                />
              </label>

              <label style={styles.label}>
                Weekly available hours
                <input
                  type="number"
                  name="weeklyHours"
                  value={form.weeklyHours}
                  onChange={handleChange}
                  min="1"
                  max="40"
                  required
                  style={styles.input}
                />
              </label>
            </div>

            {error && (
              <p style={styles.error}>
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                ...styles.primaryButton,
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading
                ? "Building your plan..."
                : "Generate and Save Growth Plan"}
            </button>
          </form>

          {plan && (
            <section style={styles.card}>
              <p style={styles.success}>
                Plan securely saved with reference:
                {" "}
                {planId}
              </p>

              <h2 style={styles.planTitle}>
                {plan.plan_title}
              </h2>

              <p>{plan.goal_summary}</p>

              <PlanList
                title="Skill Gaps"
                items={plan.skill_gaps}
              />

              <h3>Milestones</h3>

              <div style={styles.cardGrid}>
                {plan.milestones?.map(
                  (milestone, index) => (
                    <article
                      key={`${milestone.title}-${index}`}
                      style={styles.innerCard}
                    >
                      <h4>{milestone.title}</h4>

                      <strong>
                        {milestone.target_period}
                      </strong>

                      <p>{milestone.description}</p>

                      <ul>
                        {milestone.completion_criteria
                          ?.map((criterion, itemIndex) => (
                            <li key={itemIndex}>
                              {criterion}
                            </li>
                          ))}
                      </ul>
                    </article>
                  )
                )}
              </div>

<h3>Four-Week Action Sequence</h3>

              <div style={styles.cardGrid}>
                {plan.weekly_actions?.map(
                  (week, index) => (
                    <article
                      key={`${week.week}-${index}`}
                      style={styles.innerCard}
                    >
                      <h4>{week.week}</h4>
                      <strong>{week.focus}</strong>

                      <ul>
                        {week.actions?.map(
                          (action, itemIndex) => (
                            <li key={itemIndex}>
                              {action}
                            </li>
                          )
                        )}
                      </ul>
                    </article>
                  )
                )}
              </div>

              <PlanList
                title="Success Measures"
                items={plan.success_measures}
              />

              <h3>Risks and Mitigations</h3>

              {plan.risks?.map((item, index) => (
                <article
                  key={index}
                  style={styles.riskCard}
                >
                  <strong>{item.risk}</strong>
                  <p>{item.mitigation}</p>
                </article>
              ))}

              <section style={styles.actionPanel}>
                <h3 style={{ marginTop: 0 }}>
                  Start With These Three Actions
                </h3>

                <ol>
                  {plan.first_three_actions?.map(
                    (action, index) => (
                      <li key={index}>
                        {action}
                      </li>
                    )
                  )}
                </ol>
              </section>
            </section>
          )}
        </div>
      </section>
    </main>
  );
}

function PlanList({ title, items = [] }) {
  return (
    <section>
      <h3>{title}</h3>

      <ul>
        {items.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
    </section>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f4f7fb",
    color: "#172033",
    padding: "32px",
    fontFamily:
      "Inter, system-ui, -apple-system, sans-serif",
  },
  header: {
    maxWidth: "1280px",
    margin: "0 auto 28px",
    display: "flex",
    justifyContent: "space-between",
    gap: "24px",
    alignItems: "flex-start",
  },
  headerActions: {
    display: "flex",
    gap: "10px",
  },
  eyebrow: {
    color: "#5669ff",
    fontSize: "12px",
    fontWeight: 800,
    letterSpacing: "1.5px",
  },
  title: {
    margin: "6px 0",
    fontSize: "38px",
  },
  subtitle: {
    color: "#667085",
    maxWidth: "670px",
  },
  layout: {
    maxWidth: "1280px",
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns:
      "minmax(240px, 300px) minmax(0, 1fr)",
    gap: "24px",
  },
sidebar: {
    background: "#ffffff",
    borderRadius: "18px",
    padding: "20px",
    boxShadow: "0 12px 30px rgba(15,23,42,0.07)",
    alignSelf: "start",
  },
  content: {
    display: "grid",
    gap: "24px",
  },
  card: {
    background: "#ffffff",
    borderRadius: "18px",
    padding: "26px",
    boxShadow: "0 12px 30px rgba(15,23,42,0.07)",
  },
  sectionTitle: {
    marginTop: 0,
  },
  label: {
    display: "grid",
    gap: "8px",
    marginBottom: "18px",
    fontWeight: 700,
  },
  input: {
    font: "inherit",
    padding: "12px",
    border: "1px solid #cfd5e1",
    borderRadius: "10px",
    background: "#ffffff",
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "16px",
  },
  primaryButton: {
    border: 0,
    borderRadius: "10px",
    padding: "13px 18px",
    background: "#5669ff",
    color: "#ffffff",
    cursor: "pointer",
    fontWeight: 800,
  },
  secondaryButton: {
    border: "1px solid #cfd5e1",
    borderRadius: "10px",
    padding: "10px 14px",
    background: "#ffffff",
    cursor: "pointer",
    fontWeight: 700,
  },
  historyCard: {
    borderTop: "1px solid #e7eaf0",
    padding: "14px 0",
  },
  historySummary: {
    color: "#49546a",
    fontSize: "13px",
  },
  muted: {
    color: "#7a8497",
  },
  error: {
    background: "#fff1f2",
    color: "#b42318",
    borderRadius: "10px",
    padding: "12px",
  },
  success: {
    background: "#ecfdf3",
    color: "#027a48",
    borderRadius: "10px",
    padding: "12px",
    overflowWrap: "anywhere",
  },
  planTitle: {
    fontSize: "30px",
    marginBottom: "8px",
  },
  cardGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(230px, 1fr))",
    gap: "14px",
  },
  innerCard: {
    border: "1px solid #e3e7ef",
    borderRadius: "14px",
    padding: "16px",
    background: "#fafbff",
  },
  riskCard: {
    borderLeft: "4px solid #f59e0b",
    padding: "10px 14px",
    marginBottom: "10px",
    background: "#fffbeb",
  },
  actionPanel: {
    marginTop: "24px",
    borderRadius: "14px",
    background: "#eef0ff",
    padding: "20px",
  },
};