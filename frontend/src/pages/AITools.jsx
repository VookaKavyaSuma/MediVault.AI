import Navbar from "../components/Navbar";
import { useState } from "react";
import "./../styles/Home.css"; // Reuse home styles for layout

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
        <div style={{ display: "flex", gap: "15px", marginBottom: "20px" }}>
          <button
            onClick={() => { setActiveTab("symptoms"); setResult(null); setInput(""); }}
            style={{
              background: activeTab === "symptoms" ? "#1e88e5" : "#e0e0e0",
              color: activeTab === "symptoms" ? "white" : "black"
            }}
          >
            🦠 Risk Predictor
          </button>
          <button
            onClick={() => { setActiveTab("drugs"); setResult(null); setInput(""); }}
            style={{
              background: activeTab === "drugs" ? "#1e88e5" : "#e0e0e0",
              color: activeTab === "drugs" ? "white" : "black"
            }}
          >
            💊 Drug Interactions
          </button>
        </div>

        {/* Input Area */}
        <div style={{ background: "white", padding: "25px", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
          <h3>
            {activeTab === "symptoms" ? "Enter Patient Symptoms" : "Enter Two Medicines"}
          </h3>
          <p style={{ fontSize: "13px", color: "#666", marginBottom: "10px" }}>
            {activeTab === "symptoms" 
              ? "Example: chest pain, shortness of breath, dizziness" 
              : "Example: Aspirin, Ibuprofen"}
          </p>
          
          <textarea
            rows="3"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #ccc", fontSize: "16px" }}
            placeholder={activeTab === "symptoms" ? "Type symptoms here..." : "Type drug names here..."}
          ></textarea>

          <button 
            onClick={handleAnalyze} 
            disabled={loading}
            style={{ marginTop: "15px", width: "100%", background: loading ? "#90caf9" : "#2e7d32", color: "white" }}
          >
            {loading ? "Analyzing..." : "Run AI Analysis ⚡"}
          </button>
        </div>

        {/* Results Display */}
        {result && (
          <div style={{ marginTop: "25px", padding: "20px", background: "#f1f8e9", borderLeft: "5px solid #2e7d32", borderRadius: "8px" }}>
            {activeTab === "symptoms" ? (
              <>
                <h2 style={{ margin: 0, color: "#2e7d32" }}>Risk Level: {result.risk} ({result.score}%)</h2>
                <p style={{ fontSize: "18px", marginTop: "10px" }}>Potential Condition: <b>{result.condition}</b></p>
              </>
            ) : (
              <>
                <h2 style={{ margin: 0, color: result.status.includes("Safe") ? "green" : "red" }}>
                  {result.status}
                </h2>
                <p style={{ fontSize: "18px", marginTop: "10px" }}>{result.message}</p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default AITools;