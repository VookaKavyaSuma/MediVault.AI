import Navbar from "../components/Navbar";
import { useEffect, useState, useRef, useMemo } from "react";
import "./../styles/AISummary.css";
import toast from 'react-hot-toast';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

function AISummary() {
  const patientName = localStorage.getItem("patientName") || "Patient";
  const [summaries, setSummaries] = useState([]);
  const [loading, setLoading] = useState(true);

  // Slide-Over Chat State
  const [activeReport, setActiveReport] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMsg, setInputMsg] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    fetchSummaries();
  }, []);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchSummaries = async () => {
    try {
      const email = localStorage.getItem("email");
      const res = await fetch(`/api/records?email=${email}`);
      const data = await res.json();
      // Filter for records that actually have AI analysis
      const analyzed = data.filter(record => record.aiSummary);
      // Sort by date (Oldest -> Newest) for the chart to look right
      analyzed.sort((a, b) => new Date(a.uploadDate) - new Date(b.uploadDate));
      setSummaries(analyzed);
    } catch (error) {
      console.error(error);
      toast.error("Could not load medical records.");
    } finally {
      setLoading(false);
    }
  };

  // 🧠 ALGORITHM: Calculate Health Score Trend
  const chartData = useMemo(() => {
    if (summaries.length === 0) return null;

    const labels = [];
    const scores = [];

    summaries.forEach((record) => {
      let score = 100; // Start with perfect health

      // Penalty: -10 per Disease detected
      if (record.aiSummary.diseases) {
        score -= (record.aiSummary.diseases.length * 10);
      }

      // Penalty: -2 per Medicine (Minor impact for maintenance meds)
      if (record.aiSummary.medicines) {
        score -= (record.aiSummary.medicines.length * 2);
      }

      // Clamp score between 0 and 100
      score = Math.max(0, Math.min(score, 100));

      // Add to data arrays
      const date = new Date(record.uploadDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      labels.push(date);
      scores.push(score);
    });

    return { labels, scores };
  }, [summaries]);

  // Determine Overall Status based on latest score
  const latestScore = chartData?.scores[chartData.scores.length - 1] || 100;
  const healthStatus = latestScore > 80 ? "Excellent" : latestScore > 50 ? "Stable" : "Critical Attention Needed";
  const statusColor = latestScore > 80 ? "#10b981" : latestScore > 50 ? "#facc15" : "#ef4444";


  const handleSendMessage = async () => {
    if (!inputMsg.trim()) return;

    const userMsg = { role: "user", content: inputMsg };
    setMessages(prev => [...prev, userMsg]);
    const question = inputMsg;
    setInputMsg("");
    setChatLoading(true);

    try {
      const res = await fetch("/api/chat-document", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recordId: activeReport._id, question }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: "ai", content: data.reply }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: "ai", content: "Connection error. Please try again." }]);
    } finally {
      setChatLoading(false);
    }
  };

  const openDrawer = (record) => {
    setActiveReport(record);
    setMessages([{ role: "ai", content: `Reviewing **${record.fileName}**. \nWhat specific detail would you like to check?` }]);
  };

  return (
    <div className="dashboard-container">
      <Navbar />

      <main className="main-content">
        {/* HEADER SECTION */}
        <header className="dashboard-header">
          <div className="header-text">
            <h1>Medical Intelligence</h1>
            <p>Welcome back, <span className="text-primary">{patientName}</span>. Your AI health overview.</p>
          </div>
          <div className="health-score-card">
            <div className="score-info">
              <span>Overall Health Trend</span>
              <h3 style={{ color: statusColor }}>{healthStatus}</h3>
              <small style={{ opacity: 0.6 }}>Score: {latestScore}/100</small>
            </div>
            <div className="mini-chart">
              {/* Pass real data to chart */}
              <HealthTrendChart dataPoints={chartData} />
            </div>
            {/* RESTORE BUTTON */}
            <button
              onClick={async () => {
                const email = localStorage.getItem("email");
                if (!email) return alert("Please login again.");
                if (confirm("This will move all old 'doc-less' files to your account. Proceed?")) {
                  await fetch(`/api/records?migrate=true&email=${email}`);
                  window.location.reload();
                }
              }}
              style={{ marginLeft: "15px", fontSize: "10px", background: "rgba(255,255,255,0.1)", border: "1px solid white", padding: "5px 10px", borderRadius: "20px", cursor: "pointer" }}
            >
              ↻ Restore Missing Files
            </button>
          </div>
        </header>

        {/* REPORTS GRID */}
        {loading ? (
          <div className="loader-container"><div className="loader"></div><p>Syncing Medical Data...</p></div>
        ) : summaries.length === 0 ? (
          <div className="empty-state">
            <h3>No Records Analyzed</h3>
            <p>Upload your medical PDFs in the Records tab to generate AI insights.</p>
          </div>
        ) : (
          <div className="reports-grid">
            {/* We map REVERSED summaries to show newest first in the grid */}
            {[...summaries].reverse().map((record) => (
              <div key={record._id} className="report-card">
                <div className="card-top">
                  <div className="icon-box">📄</div>
                  <div className="meta">
                    <h4>{record.fileName}</h4>
                    <span>{new Date(record.uploadDate).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="card-summary">
                  {/* Smart Tags based on content */}
                  {record.aiSummary.diseases?.length > 0 && (
                    <span className="badge warning">{record.aiSummary.diseases[0].name}</span>
                  )}
                  {record.aiSummary.medicines?.length > 0 && (
                    <span className="badge info">{record.aiSummary.medicines.length} Meds</span>
                  )}
                  {(!record.aiSummary.diseases?.length && !record.aiSummary.medicines?.length) && (
                    <span className="badge neutral">Routine Checkup</span>
                  )}
                </div>

                <div className="card-actions">
                  <button className="btn-primary" onClick={() => openDrawer(record)}>
                    Open Analysis & Chat →
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* SLIDE-OVER DRAWER (The "Chat") */}
      <div className={`drawer-overlay ${activeReport ? 'open' : ''}`} onClick={() => setActiveReport(null)}></div>
      <div className={`chat-drawer ${activeReport ? 'open' : ''}`}>
        {activeReport && (
          <>
            <div className="drawer-header">
              <h3>{activeReport.fileName}</h3>
              <button className="close-btn" onClick={() => setActiveReport(null)}>×</button>
            </div>

            {/* Quick Summary View inside Drawer */}
            <div className="drawer-content">
              <div className="ai-highlight-box">
                <h5>📝 AI Findings</h5>
                <ul>
                  {activeReport.aiSummary.diseases?.map((d, i) => <li key={i}>Detected: <b>{d.name}</b> ({d.status})</li>)}
                  {activeReport.aiSummary.medicines?.map((m, i) => <li key={i + 99}>Rx: <b>{m.name}</b> - {m.dosage}</li>)}
                  {activeReport.aiSummary.tests?.length === 0 && <li>No critical issues found in summary.</li>}
                </ul>
              </div>

              <div className="chat-interface">
                <div className="messages-list">
                  {messages.map((m, i) => (
                    <div key={i} className={`chat-bubble ${m.role}`}>
                      {m.content}
                    </div>
                  ))}
                  {chatLoading && <div className="chat-bubble ai typing">● ● ●</div>}
                  <div ref={chatEndRef} />
                </div>
              </div>
            </div>

            <div className="drawer-footer">
              <input
                type="text"
                placeholder="Ask about this report (e.g. 'Is the sugar level high?')"
                value={inputMsg}
                onChange={(e) => setInputMsg(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              />
              <button onClick={handleSendMessage}>Send</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// 🆕 UPDATED: Dynamic Sparkline Chart
const HealthTrendChart = ({ dataPoints }) => {
  // Fallback for empty state
  const labels = dataPoints?.labels?.length ? dataPoints.labels : ['No Data'];
  const scores = dataPoints?.scores?.length ? dataPoints.scores : [100];

  const data = {
    labels: labels,
    datasets: [{
      data: scores,
      borderColor: '#10b981', // Green line
      backgroundColor: 'rgba(16, 185, 129, 0.2)', // Slight fill under line
      borderWidth: 2,
      pointRadius: 3, // Show points
      tension: 0.4, // Smooth curves
      fill: true
    }]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context) => `Health Score: ${context.raw}`
        }
      }
    },
    scales: {
      x: { display: false }, // Hide dates for clean look (tooltip shows them)
      y: { display: false, min: 0, max: 110 } // Keep scale consistent
    }
  };

  return <Line data={data} options={options} />;
}

export default AISummary;