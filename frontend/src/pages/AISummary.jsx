import Navbar from "../components/Navbar";
import { useEffect, useState } from "react";
import "./../styles/AISummary.css";

function AISummary() {
  const patientName = localStorage.getItem("patientName") || "Patient";
  const [summaries, setSummaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDebug, setShowDebug] = useState(false); // Toggle for raw data

  // 1. Fetch Real AI Data from Backend
  useEffect(() => {
    const fetchSummaries = async () => {
      try {
        const res = await fetch("/api/records");
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

  // Helper to check if a section has data
  const hasData = (list) => list && list.length > 0;

  return (
    <div className="ai-page">
      <Navbar />

      <div className="ai-wrapper">
        <div style={{display: "flex", justifyContent: "space-between", alignItems: "center"}}>
          <div>
            <h1>AI Health Summary</h1>
            <p className="ai-desc">
              Hello <span style={{color: "#1e88e5", fontWeight: "bold"}}>{patientName}</span>, 
              here is the AI analysis of your uploaded medical records.
            </p>
          </div>
          <button 
            onClick={() => setShowDebug(!showDebug)} 
            style={{fontSize: "12px", padding: "5px 10px", background: "#ddd", border: "none", borderRadius: "4px", cursor: "pointer"}}
          >
            {showDebug ? "Hide Debug" : "Show Raw Data 🛠️"}
          </button>
        </div>

        {loading ? (
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

              {/* DEBUG VIEW - Shows exactly what the AI returned */}
              {showDebug && (
                <pre style={{background: "#333", color: "#0f0", padding: "15px", borderRadius: "8px", overflowX: "auto", fontSize: "12px"}}>
                  {JSON.stringify(record.aiSummary, null, 2)}
                </pre>
              )}

              {/* 1. Hospital Visits */}
              {hasData(record.aiSummary.hospitalVisits) ? (
                <Section title="🏥 Hospital Visits">
                  {record.aiSummary.hospitalVisits.map((h, i) => (
                    <Item key={i}>
                      <b>{h.hospital}</b> — {h.date}
                    </Item>
                  ))}
                </Section>
              ) : (
                // Only show "Not Found" if NOT in debug mode, to keep UI clean
                showDebug && <p style={{color: "#999", fontStyle: "italic", marginLeft: "20px"}}>No hospital visits found.</p>
              )}

              {/* 2. Tests */}
              {hasData(record.aiSummary.tests) ? (
                <Section title="🧪 Tests Conducted">
                  {record.aiSummary.tests.map((t, i) => (
                    <Item key={i}>
                      <b>{t.name}</b>: <span style={{color: "#1e88e5", fontWeight: "bold"}}>{t.result}</span>
                    </Item>
                  ))}
                </Section>
              ) : (
                <div style={{padding: "10px 20px", color: "#666"}}>
                    {/* Fallback if list is empty */}
                   {/* <i>No specific test results extracted.</i> */}
                </div>
              )}

              {/* 3. Medicines */}
              {hasData(record.aiSummary.medicines) && (
                <Section title="💊 Medicines Prescribed">
                  {record.aiSummary.medicines.map((m, i) => (
                    <Item key={i}>
                      <b>{m.name}</b> — {m.dosage}
                    </Item>
                  ))}
                </Section>
              )}

              {/* 4. Diseases/Conditions */}
              {hasData(record.aiSummary.diseases) && (
                <Section title="🦠 Conditions Detected">
                  {record.aiSummary.diseases.map((d, i) => (
                    <Item key={i}>
                      <b>{d.name}</b> — <span style={{color: d.status.toLowerCase().includes("rule") ? "green" : "red"}}>
                        {d.status || "Detected"}
                      </span>
                    </Item>
                  ))}
                </Section>
              )}
              
              {/* FINAL FALLBACK: If absolutely nothing was found */}
              {!hasData(record.aiSummary.hospitalVisits) && 
               !hasData(record.aiSummary.tests) && 
               !hasData(record.aiSummary.medicines) && 
               !hasData(record.aiSummary.diseases) && !showDebug && (
                 <div style={{padding: "20px", textAlign: "center", color: "#888"}}>
                   <p>The AI read this document but couldn't identify specific medical data points.</p>
                   <p style={{fontSize: "12px"}}>Try uploading a clearer PDF or a different report format.</p>
                 </div>
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