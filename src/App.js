import React, { useState, useEffect } from "react";
import axios from "axios";

function App() {
  const [log, setLog] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [incidents, setIncidents] = useState([]);

  useEffect(() => {
    const fetchIncidents = async () => {
      try {
        const response = await axios.get("https://ai-incident-response-y63e.onrender.com/incidents");

        setIncidents(response.data);

        if (response.data.length > 0) {
          setResult(response.data[0]);
        }
      } catch (error) {
        console.error("Error fetching incidents:", error);
      }
    };

    fetchIncidents();

    const interval = setInterval(fetchIncidents, 5000);

    return () => clearInterval(interval);
  }, []);

  const analyzeLog = async () => {
    if (!log.trim()) {
      alert("Please enter a log first");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post("https://ai-incident-response-y63e.onrender.com/analyze", {
        log: log,
      });

      const newIncident = {
        ...response.data,
        time: new Date().toLocaleString(),
      };

      setResult(newIncident);
      setIncidents((prev) => [newIncident, ...prev]);
      setLog("");
    } catch (error) {
      console.error(error);
      alert("Error connecting to backend");
    }

    setLoading(false);
  };

  const getSeverityColor = (severity) => {
    if (!severity) return "#888";

    const value = severity.toLowerCase();

    if (value.includes("critical")) return "#dc2626";
    if (value.includes("high")) return "#ff4d4f";
    if (value.includes("medium")) return "#faad14";
    return "#52c41a";
  };

  const incidentsToday = incidents.length;

  const criticalAlerts = incidents.filter((item) => {
    const severity = item.severity?.toLowerCase();
    return severity?.includes("critical") || severity?.includes("high");
  }).length;

  const systemUptime =
    incidentsToday === 0
      ? "100%"
      : `${Math.max(95, 100 - criticalAlerts * 0.8).toFixed(1)}%`;

  return (
    <div style={styles.page}>
      <div style={styles.overlay}></div>

      <div style={styles.container}>
        <div style={styles.headerCard}>
          <h1 style={styles.title}>AI Incident Response Orchestrator</h1>

          <p style={styles.subtitle}>
            Real-Time AI Powered Incident Detection & Root Cause Analysis
          </p>
        </div>

        <div style={styles.mainGrid}>
          <div style={styles.leftPanel}>
            <div style={styles.card}>
              <h2 style={styles.sectionTitle}>Manual Log Analysis</h2>

              <textarea
                rows="10"
                placeholder="Paste production logs, API errors, deployment failures, timeout issues..."
                value={log}
                onChange={(e) => setLog(e.target.value)}
                style={styles.textarea}
              />

              <button onClick={analyzeLog} style={styles.button}>
                {loading ? "Analyzing..." : "Analyze Incident"}
              </button>

              <p style={styles.helperText}>
                Automatic logs are also monitored from <strong>server.log</strong>{" "}
                every few seconds.
              </p>
            </div>

            <div style={styles.metricsGrid}>
              <div style={styles.metricCard}>
                <h3 style={styles.metricValue}>{incidentsToday}</h3>
                <p style={styles.metricLabel}>Incidents Detected</p>
              </div>

              <div style={styles.metricCard}>
                <h3 style={styles.metricValue}>{criticalAlerts}</h3>
                <p style={styles.metricLabel}>Critical Alerts</p>
              </div>

              <div style={styles.metricCard}>
                <h3 style={styles.metricValue}>{systemUptime}</h3>
                <p style={styles.metricLabel}>System Uptime</p>
              </div>
            </div>

            <div style={styles.historyCard}>
              <div style={styles.feedHeader}>
                <h2 style={styles.sectionTitle}>Live Incident Feed</h2>
                <span style={styles.liveBadge}>LIVE</span>
              </div>

              {incidents.length === 0 ? (
                <p style={styles.emptyText}>No incidents detected yet.</p>
              ) : (
                incidents.slice(0, 6).map((incident, index) => (
                  <div
                    key={index}
                    style={styles.feedItem}
                    onClick={() => setResult(incident)}
                  >
                    <div>
                      <p style={styles.feedTitle}>{incident.category}</p>
                      <p style={styles.feedLog}>{incident.log}</p>
                      <p style={styles.feedTime}>{incident.time}</p>
                    </div>

                    <span
                      style={{
                        ...styles.feedBadge,
                        backgroundColor: getSeverityColor(incident.severity),
                      }}
                    >
                      {incident.severity}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div style={styles.rightPanel}>
            {!result ? (
              <div style={styles.emptyCard}>
                <h2 style={styles.emptyTitle}>No Incident Analyzed Yet</h2>

                <p style={styles.emptyText}>
                  Add a new log to <strong>server.log</strong> or submit one
                  manually to generate AI-powered root cause analysis.
                </p>
              </div>
            ) : (
              <div style={styles.resultCard}>
                <div style={styles.resultHeader}>
                  <h2 style={styles.resultTitle}>Incident Analysis</h2>

                  <div
                    style={{
                      ...styles.severityBadge,
                      backgroundColor: getSeverityColor(result.severity),
                    }}
                  >
                    {result.severity}
                  </div>
                </div>

                <div style={styles.infoBox}>
                  <h3 style={styles.infoTitle}>Incident Category</h3>
                  <p style={styles.infoText}>{result.category}</p>
                </div>

                <div style={styles.infoBox}>
                  <h3 style={styles.infoTitle}>Detected Time</h3>
                  <p style={styles.logText}>{result.time}</p>
                </div>

                <div style={styles.infoBox}>
                  <h3 style={styles.infoTitle}>Original Log</h3>
                  <p style={styles.logText}>{result.log}</p>
                </div>

                <div style={styles.analysisBox}>
                  <h3 style={styles.analysisTitle}>AI Root Cause Analysis</h3>

                  <pre style={styles.analysisText}>{result.analysis}</pre>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #0f172a, #111827, #1e293b)",
    position: "relative",
    overflow: "hidden",
    fontFamily: "Arial, sans-serif",
    color: "white",
    padding: "40px",
  },

  overlay: {
    position: "absolute",
    inset: 0,
    background:
      "radial-gradient(circle at top right, rgba(59,130,246,0.25), transparent 30%), radial-gradient(circle at bottom left, rgba(139,92,246,0.25), transparent 30%)",
  },

  container: {
    position: "relative",
    zIndex: 1,
    maxWidth: "1400px",
    margin: "0 auto",
  },

  headerCard: {
    background: "rgba(255,255,255,0.08)",
    backdropFilter: "blur(10px)",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: "24px",
    padding: "30px",
    marginBottom: "30px",
    boxShadow: "0 8px 32px rgba(0,0,0,0.25)",
  },

  title: {
    fontSize: "42px",
    marginBottom: "10px",
    fontWeight: "bold",
  },

  subtitle: {
    color: "#cbd5e1",
    fontSize: "18px",
  },

  mainGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "30px",
  },

  leftPanel: {
    display: "flex",
    flexDirection: "column",
    gap: "25px",
  },

  rightPanel: {
    display: "flex",
  },

  card: {
    background: "rgba(255,255,255,0.08)",
    borderRadius: "24px",
    padding: "28px",
    border: "1px solid rgba(255,255,255,0.12)",
    boxShadow: "0 8px 32px rgba(0,0,0,0.25)",
  },

  sectionTitle: {
    fontSize: "24px",
    marginBottom: "20px",
  },

  textarea: {
    width: "100%",
    height: "220px",
    background: "rgba(15,23,42,0.8)",
    border: "1px solid rgba(255,255,255,0.15)",
    borderRadius: "16px",
    padding: "18px",
    color: "white",
    fontSize: "15px",
    outline: "none",
    resize: "none",
    boxSizing: "border-box",
  },

  button: {
    marginTop: "20px",
    width: "100%",
    padding: "16px",
    border: "none",
    borderRadius: "16px",
    background: "linear-gradient(135deg, #2563eb, #7c3aed)",
    color: "white",
    fontSize: "16px",
    fontWeight: "bold",
    cursor: "pointer",
  },

  helperText: {
    color: "#cbd5e1",
    fontSize: "13px",
    marginTop: "14px",
  },

  metricsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "18px",
  },

  metricCard: {
    background: "rgba(255,255,255,0.08)",
    borderRadius: "20px",
    padding: "20px",
    textAlign: "center",
    border: "1px solid rgba(255,255,255,0.12)",
  },

  metricValue: {
    fontSize: "28px",
    marginBottom: "8px",
  },

  metricLabel: {
    color: "#cbd5e1",
  },

  historyCard: {
    background: "rgba(255,255,255,0.08)",
    borderRadius: "24px",
    padding: "24px",
    border: "1px solid rgba(255,255,255,0.12)",
    boxShadow: "0 8px 32px rgba(0,0,0,0.25)",
  },

  feedHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },

  liveBadge: {
    background: "#ef4444",
    padding: "6px 12px",
    borderRadius: "999px",
    fontSize: "12px",
    fontWeight: "bold",
  },

  feedItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    background: "rgba(15,23,42,0.6)",
    padding: "14px",
    borderRadius: "14px",
    marginBottom: "12px",
    cursor: "pointer",
  },

  feedTitle: {
    margin: 0,
    textTransform: "capitalize",
    fontWeight: "bold",
  },

  feedLog: {
    margin: "6px 0",
    color: "#cbd5e1",
    fontSize: "13px",
    maxWidth: "360px",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },

  feedTime: {
    margin: "5px 0 0",
    fontSize: "12px",
    color: "#94a3b8",
  },

  feedBadge: {
    padding: "8px 12px",
    borderRadius: "999px",
    fontSize: "12px",
    fontWeight: "bold",
    color: "white",
  },

  emptyCard: {
    width: "100%",
    background: "rgba(255,255,255,0.08)",
    borderRadius: "24px",
    padding: "40px",
    border: "1px solid rgba(255,255,255,0.12)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
  },

  emptyTitle: {
    fontSize: "28px",
    marginBottom: "16px",
  },

  emptyText: {
    color: "#cbd5e1",
    lineHeight: 1.8,
  },

  resultCard: {
    width: "100%",
    background: "rgba(255,255,255,0.08)",
    borderRadius: "24px",
    padding: "28px",
    border: "1px solid rgba(255,255,255,0.12)",
    boxShadow: "0 8px 32px rgba(0,0,0,0.25)",
  },

  resultHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "24px",
  },

  resultTitle: {
    fontSize: "28px",
  },

  severityBadge: {
    padding: "10px 18px",
    borderRadius: "999px",
    fontWeight: "bold",
    color: "white",
  },

  infoBox: {
    marginBottom: "20px",
    background: "rgba(15,23,42,0.6)",
    borderRadius: "16px",
    padding: "18px",
  },

  infoTitle: {
    marginBottom: "10px",
    color: "#93c5fd",
  },

  infoText: {
    fontSize: "18px",
    textTransform: "capitalize",
  },

  logText: {
    color: "#e2e8f0",
  },

  analysisBox: {
    marginTop: "25px",
  },

  analysisTitle: {
    marginBottom: "14px",
    color: "#93c5fd",
  },

  analysisText: {
    whiteSpace: "pre-wrap",
    lineHeight: 1.7,
    color: "#e2e8f0",
    background: "rgba(15,23,42,0.6)",
    padding: "20px",
    borderRadius: "18px",
    overflowX: "auto",
    maxHeight: "420px",
  },
};

export default App;