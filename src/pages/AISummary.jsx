import Navbar from "../components/Navbar";
import { useState } from "react";
import "./../styles/AISummary.css";

function AISummary() {
  const patientName = localStorage.getItem("patientName") || "Patient";
  const [summaryData, setSummaryData] = useState(null);
  const [loading, setLoading] = useState(false);

  const generateSummary = () => {
    setLoading(true);

    // Mock AI analysis (later replace with real AI)
    setTimeout(() => {
      setSummaryData({
        hospitals: [
          {
            name: "Apollo Hospitals",
            date: "12 Jan 2024",
            doctor: "Dr. Rajesh Kumar",
            reason: "Chest pain"
          }
        ],
        tests: [
          { name: "Blood Test", date: "13 Jan 2024", result: "Normal" },
          { name: "ECG", date: "13 Jan 2024", result: "Normal" }
        ],
        medicines: [
          { name: "Aspirin", dosage: "75mg", duration: "30 days" },
          { name: "Vitamin D", dosage: "1000 IU", duration: "60 days" }
        ],
        diseases: [
          { name: "Hypertension", diagnosed: "2023", status: "Under control" }
        ]
      });

      setLoading(false);
    }, 1500);
  };

  return (
    <div className="ai-page">
      <Navbar />

      <div className="ai-wrapper">
        <h1>AI Health Summary</h1>
        <p className="ai-desc">
          Hello {patientName}, your uploaded medical records are analyzed below
        </p>

        <button
          className="generate-btn"
          onClick={generateSummary}
          disabled={loading}
        >
          {loading ? "Analyzing file..." : "Analyze Uploaded File"}
        </button>

        {summaryData && (
          <>
            {/* Hospital Visits */}
            <Section title="🏥 Hospital Visits">
              {summaryData.hospitals.map((h, i) => (
                <Item key={i}>
                  <strong>{h.name}</strong> ({h.date})<br />
                  Doctor: {h.doctor}<br />
                  Reason: {h.reason}
                </Item>
              ))}
            </Section>

            {/* Tests */}
            <Section title="🧪 Tests Conducted">
              {summaryData.tests.map((t, i) => (
                <Item key={i}>
                  {t.name} ({t.date}) — {t.result}
                </Item>
              ))}
            </Section>

            {/* Medicines */}
            <Section title="💊 Medicines Issued">
              {summaryData.medicines.map((m, i) => (
                <Item key={i}>
                  {m.name} — {m.dosage}, {m.duration}
                </Item>
              ))}
            </Section>

            {/* Diseases */}
            <Section title="🦠 Diseases / Conditions">
              {summaryData.diseases.map((d, i) => (
                <Item key={i}>
                  {d.name}<br />
                  Diagnosed: {d.diagnosed}<br />
                  Status: {d.status}
                </Item>
              ))}
            </Section>
          </>
        )}
      </div>
    </div>
  );
}

/* Reusable Components */
function Section({ title, children }) {
  return (
    <div className="ai-section">
      <h3>{title}</h3>
      {children}
    </div>
  );
}

function Item({ children }) {
  return <div className="ai-item">{children}</div>;
}

export default AISummary;
