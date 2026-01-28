import Navbar from "../components/Navbar";
import { useEffect, useState, useRef } from "react";
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
      const email = localStorage.getItem("email"); // 🆕
      const res = await fetch(`/api/records?email=${email}`);
      const data = await res.json();
      const analyzed = data.filter(record => record.aiSummary);
      setSummaries(analyzed);
    } catch (error) {
      console.error(error);
      toast.error("Could not load medical records.");
    } finally {
      setLoading(false);
    }
  };

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
              <h3>Stable</h3>
            </div>
            <div className="mini-chart">
              <HealthTrendChart />
            </div>
            {/* 🆕 RESTORE BUTTON */}
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
            {summaries.map((record) => (
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

// Simple Sparkline Chart
const HealthTrendChart = () => {
  const data = {
    labels: ['1', '2', '3', '4', '5'],
    datasets: [{
      data: [65, 78, 72, 85, 90],
      borderColor: '#10b981',
      borderWidth: 2,
      pointRadius: 0,
      tension: 0.4
    }]
  };
  const options = { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { display: false }, y: { display: false } } };
  return <Line data={data} options={options} />;
}

export default AISummary;