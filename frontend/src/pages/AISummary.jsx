import Navbar from "../components/Navbar";
import { useEffect, useState } from "react";
import "./../styles/AISummary.css";

function AISummary() {
  const patientName = localStorage.getItem("patientName") || "Patient";
  const [summaries, setSummaries] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. Fetch Real AI Data from Backend
  useEffect(() => {
    const fetchSummaries = async () => {
      try {
        const res = await fetch("/api/records"); // Re-using the get-all-records API
        const data = await res.json();
        
        // Filter only records that have an AI Summary generated
        const analyzedRecords = data.filter(record => record.aiSummary);
        setSummaries(analyzedRecords);
      } catch (error) {
        console.error("Error fetching summaries:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSummaries();
  }, []);

  return (
    <div className="ai-page">
      <Navbar />

      <div className="ai-wrapper">
        <h1>AI Health Summary</h1>
        <p className="ai-desc">
          Hello <span style={{color: "#1e88e5", fontWeight: "bold"}}>{patientName}</span>, 
          here is the AI analysis of your uploaded medical records.
        </p>

        {loading ? (
          // SPINNER UI for Loading State
          <div className="spinner-container" style={{textAlign: "center", padding: "50px"}}>
             <div className="spinner" style={{margin: "0 auto"}}></div>
             <p style={{marginTop: "20px", color: "#666"}}>Fetching AI Insights...</p>
          </div>
        ) : summaries.length === 0 ? (
          <div className="empty-state">
            <p>No records analyzed yet.</p>
            <p style={{fontSize: "13px", color: "#888"}}>
              Go to "My Records" and upload a file to generate a summary.
            </p>
          </div>
        ) : (
          summaries.map((record) => (
            <div key={record._id} className="ai-summary-card">
              <div className="card-header">
                <h2>📄 Analysis for: {record.fileName}</h2>
                <span className="ai-date">
                  Analyzed on {new Date(record.uploadDate).toLocaleDateString()}
                </span>
              </div>

              {/* 1. Hospital Visits */}
              {record.aiSummary.hospitalVisits && record.aiSummary.hospitalVisits.length > 0 && (
                <Section title="🏥 Hospital Visits">
                  {record.aiSummary.hospitalVisits.map((h, i) => (
                    <Item key={i}>
                      <b>{h.hospital}</b> — {h.date}
                    </Item>
                  ))}
                </Section>
              )}

              {/* 2. Tests */}
              {record.aiSummary.tests && record.aiSummary.tests.length > 0 && (
                <Section title="🧪 Tests Conducted">
                  {record.aiSummary.tests.map((t, i) => (
                    <Item key={i}>
                      <b>{t.name}</b>: {t.result}
                    </Item>
                  ))}
                </Section>
              )}

              {/* 3. Medicines */}
              {record.aiSummary.medicines && record.aiSummary.medicines.length > 0 && (
                <Section title="💊 Medicines Prescribed">
                  {record.aiSummary.medicines.map((m, i) => (
                    <Item key={i}>
                      <b>{m.name}</b> — {m.dosage}
                    </Item>
                  ))}
                </Section>
              )}

              {/* 4. Diseases/Conditions */}
              {record.aiSummary.diseases && record.aiSummary.diseases.length > 0 && (
                <Section title="🦠 Conditions Detected">
                  {record.aiSummary.diseases.map((d, i) => (
                    <Item key={i}>
                      <b>{d.name}</b> — <span style={{color: "green"}}>{d.status || "Detected"}</span>
                    </Item>
                  ))}
                </Section>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

/* Reusable Components for clean UI */
function Section({ title, children }) {
  return (
    <div className="ai-section">
      <h3>{title}</h3>
      <div className="section-content">{children}</div>
    </div>
  );
}

function Item({ children }) {
  return <div className="ai-item">{children}</div>;
}

export default AISummary;