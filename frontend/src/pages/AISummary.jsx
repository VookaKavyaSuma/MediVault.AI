import Navbar from "../components/Navbar";
import { useEffect, useState } from "react";
import "./../styles/AISummary.css";

function AISummary() {
  const patientName = localStorage.getItem("patientName") || "Patient";
  const [summaries, setSummaries] = useState([]);

  // Load AI summaries automatically
  useEffect(() => {
    const storedSummaries =
      JSON.parse(localStorage.getItem("aiSummaries")) || [];
    setSummaries(storedSummaries);
  }, []);

  return (
    <div className="ai-page">
      <Navbar />

      <div className="ai-wrapper">
        <h1>AI Health Summary</h1>
        <p className="ai-desc">
          Hello {patientName}, here is an analysis of your uploaded medical records
        </p>

        {summaries.length === 0 ? (
          <p>No records analyzed yet. Upload a certificate to get started.</p>
        ) : (
          summaries.map((summary) => (
            <div key={summary.id} className="ai-summary-card">
              <h2>{summary.certificateName}</h2>
              <span className="ai-date">
                Analyzed on {summary.analyzedOn}
              </span>

              {/* Hospital Visits */}
              <Section title="🏥 Hospital Visits">
                {summary.history.map((h, i) => (
                  <Item key={i}>
                    {h.hospital} — {h.visitDate}
                  </Item>
                ))}
              </Section>

              {/* Tests */}
              <Section title="🧪 Tests Conducted">
                {summary.tests.map((t, i) => (
                  <Item key={i}>
                    {t.name} — {t.result}
                  </Item>
                ))}
              </Section>

              {/* Medicines */}
              <Section title="💊 Medicines Issued">
                {summary.medicines.map((m, i) => (
                  <Item key={i}>
                    {m.name} ({m.dosage})
                  </Item>
                ))}
              </Section>

              {/* Diseases */}
              <Section title="🦠 Diseases / Conditions">
                {summary.diseases.map((d, i) => (
                  <Item key={i}>
                    {d.name} — {d.status}
                  </Item>
                ))}
              </Section>
            </div>
          ))
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
