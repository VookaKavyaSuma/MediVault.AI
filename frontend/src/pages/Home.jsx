import Navbar from "../components/Navbar";
import Chatbot from "../components/Chatbot";
import "./../styles/Home.css";
import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { useNavigate } from "react-router-dom";

function Home() {
  const role = localStorage.getItem("role");
  const userName = localStorage.getItem("patientName") || "User"; 

  const [showQR, setShowQR] = useState(false);
  const [qrToken, setQrToken] = useState("");

  const navigate = useNavigate();

  // 🆕 GENERATE QR (Patients Only)
  const generateQR = async () => {
    const email = localStorage.getItem("email");
    try {
      const res = await fetch("/api/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patientEmail: email }),
      });

      const data = await res.json();
      if (data.success) {
        setQrToken(data.token);
        setShowQR(true);
      } else {
        alert("Failed to generate QR code");
      }
    } catch (error) {
      console.error("QR Error:", error);
    }
  };

  const qrValue = qrToken ? `${window.location.origin}/shared/${qrToken}` : "";

  return (
    <div className="home-container">
      <Navbar />

      <div className="home-content">
        
        {/* ==========================
            👨‍⚕️ DOCTOR DASHBOARD
           ========================== */}
        {role === "doctor" ? (
          <>
            <div className="hero-section doctor-hero">
              <div className="hero-text">
                <h1>Welcome, <span className="gradient-text">Dr. {userName}</span> 🩺</h1>
                <p>Manage patients and medical records efficiently.</p>
              </div>
              <div className="hero-actions">
                 {/* 🆕 LINK TO NEW PROFILE PAGE */}
                 <button className="share-btn" onClick={() => navigate("/profile")}>
                  🏥 Clinic Profile
                </button>
              </div>
            </div>

            <div className="action-cards">
              <div className="card" onClick={() => navigate("/patients")}>
                <div className="card-icon" style={{ background: "rgba(59, 130, 246, 0.2)", color: "#60a5fa" }}>👥</div>
                <h3>Patient Directory</h3>
                <p>View registered patients and history.</p>
              </div>

              <div className="card" onClick={() => navigate("/documents?tab=certificates")}>
                <div className="card-icon" style={{ background: "rgba(16, 185, 129, 0.2)", color: "#34d399" }}>✍️</div>
                <h3>Issue Certificates</h3>
                <p>Create and sign medical certificates.</p>
              </div>

              <div className="card" onClick={() => navigate("/ai-tools")}>
                <div className="card-icon" style={{ background: "rgba(244, 63, 94, 0.2)", color: "#fb7185" }}>🔬</div>
                <h3>AI Diagnostics</h3>
                <p>Risk prediction & drug interaction tools.</p>
              </div>
            </div>
          </>
        ) : (
          
          /* ==========================
             👤 PATIENT DASHBOARD
             ========================== */
          <>
            <div className="hero-section">
              <div className="hero-text">
                <h1>Hello, <span className="gradient-text">{userName}</span> 👋</h1>
                <p>Your personal health command center.</p>
              </div>

              <div className="hero-actions">
                <button className="share-btn" onClick={generateQR}>
                  🔗 Share Access
                </button>
                {/* 🆕 LINK TO NEW PROFILE PAGE */}
                <button
                  className="share-btn"
                  onClick={() => navigate("/profile")}
                >
                  👤 My Profile
                </button>
                <button className="notif-btn" onClick={() => navigate("/notifications")}>
                  🔔
                </button>
              </div>
            </div>

            <div className="action-cards">
              <div className="card" onClick={() => navigate("/documents?tab=records")}>
                <div className="card-icon">📂</div>
                <h3>My Records</h3>
                <p>Upload and view your medical history.</p>
              </div>

              <div className="card" onClick={() => navigate("/documents?tab=certificates")}>
                <div className="card-icon">📜</div>
                <h3>Prescriptions</h3>
                <p>View certificates issued by doctors.</p>
              </div>

              <div className="card" onClick={() => navigate("/ai-summary")}>
                <div className="card-icon">✨</div>
                <h3>AI Health Insights</h3>
                <p>Get AI-powered summaries of your health.</p>
              </div>
            </div>
          </>
        )}
      </div>

      {/* QR Modal (Patients Only) - KEPT THIS */}
      {showQR && (
        <div className="qr-modal-overlay">
          <div className="qr-modal">
            <h3>Scan to View Records</h3>
            {qrValue && <QRCodeSVG value={qrValue} size={180} />}
            <p className="qr-note">✅ Permanent Access Link</p>
            <p className="qr-sub">Anyone with this code can view your records anytime.</p>
            <button onClick={() => setShowQR(false)}>Close</button>
          </div>
        </div>
      )}

      {/* Chatbot (Always visible) */}
      <Chatbot />
      
      <style>{`
        .doctor-hero h1 { color: #60a5fa; }
      `}</style>
    </div>
  );
}

export default Home;