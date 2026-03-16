import Navbar from "../components/Navbar";
import { useState } from "react";
import "./../styles/Home.css";
import "./../styles/AITools.css";

function AITools() {
  const [activeTab, setActiveTab] = useState("symptoms");
  const [input, setInput] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    if (!input) return;
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/ai-predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: activeTab, input }),
      });
      const data = await res.json();
      setResult(data.data);
    } catch (error) {
      console.error("AI Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="home-container">
      <Navbar />
      <div className="home-content">
        <h1>🩺 Doctor's AI Suite</h1>
        <p>Advanced diagnostic support and risk assessment tools.</p>

        {/* Tools Switcher */}
        <div className="tools-switcher">
          <button
            className={`tool-tab ${activeTab === "symptoms" ? "active" : ""}`}
            onClick={() => { setActiveTab("symptoms"); setResult(null); setInput(""); }}
          >
            🦠 Risk Predictor
          </button>
          <button
            className={`tool-tab ${activeTab === "drugs" ? "active" : ""}`}
            onClick={() => { setActiveTab("drugs"); setResult(null); setInput(""); }}
          >
            💊 Drug Interactions
          </button>
        </div>

        {/* Input Area */}
        <div className="input-card">
          <h3>
            {activeTab === "symptoms" ? "Enter Patient Symptoms" : "Enter Two Medicines"}
          </h3>
          <p>
            {activeTab === "symptoms"
              ? "Example: chest pain, shortness of breath, dizziness"
              : "Example: Aspirin, Ibuprofen"}
          </p>

          <textarea
            className="tools-textarea"
            rows="4"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={activeTab === "symptoms" ? "Type symptoms here..." : "Type drug names here..."}
          ></textarea>

          <button
            className="analyze-btn"
            onClick={handleAnalyze}
            disabled={loading}
          >
            {loading ? "Analyzing..." : "Run AI Analysis ⚡"}
          </button>
        </div>

        {/* Results Display */}
        {result && (
          <div className="result-box">
            {activeTab === "symptoms" ? (
              <>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
                  <h2 className="result-header" style={{ margin: 0 }}>Risk: {result.risk} ({result.score}%)</h2>
                  <span style={{ background: "rgba(255,255,255,0.1)", padding: "5px 10px", borderRadius: "10px", fontSize: "0.9rem" }}>CONFIDENCE SCORE</span>
                </div>

                <p style={{ fontSize: "1.2rem", marginBottom: "15px", color: "#fff" }}>Most Likely: <b>{result.condition}</b></p>
                <p style={{ color: "rgba(255,255,255,0.7)", marginBottom: "20px" }}>{result.explanation}</p>

                <div style={{ background: "rgba(0,0,0,0.2)", padding: "15px", borderRadius: "10px" }}>
                  <strong style={{ display: "block", marginBottom: "10px", color: "#60a5fa" }}>Recommended Tests:</strong>
                  <ul style={{ paddingLeft: "20px", margin: 0, color: "rgba(255,255,255,0.8)" }}>
                    {result.tests?.map((test, i) => <li key={i}>{test}</li>)}
                  </ul>
                </div>
              </>
            ) : (
              <>
                <h2 style={{ margin: "0 0 15px 0", color: result.status.includes("Safe") ? "#4ade80" : result.status.includes("Caution") ? "#facc15" : "#f87171" }}>
                  {result.status}
                </h2>
                <p style={{ fontSize: "1.1rem", marginBottom: "15px", fontWeight: "600" }}>{result.message}</p>
                <p style={{ color: "rgba(255,255,255,0.7)", lineHeight: "1.6" }}>{result.details}</p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default AITools;