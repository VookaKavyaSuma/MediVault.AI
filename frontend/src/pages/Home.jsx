import Navbar from "../components/Navbar";
import Chatbot from "../components/ChatBot";
import "./../styles/Home.css";
import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { useNavigate } from "react-router-dom";

function Home() {
  const role = localStorage.getItem("role");
  const patientName = localStorage.getItem("patientName") || "Patient";

  const [showQR, setShowQR] = useState(false);
  const [expiryTime, setExpiryTime] = useState(null);
  const [qrToken, setQrToken] = useState("");

  const navigate = useNavigate();

  const generateQR = () => {
    const token = Math.random().toString(36).substring(2);
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    const qrData = {
      token,
      patientName,
      expiresAt
    };

    localStorage.setItem("qrAccess", JSON.stringify(qrData));
    
    setQrToken(token);
    setExpiryTime(expiresAt);
    setShowQR(true);
  };

  const qrValue = qrToken
    ? `https://medivault.ai/share?token=${qrToken}`
    : "";

  return (
    <div className="home-container">
      <Navbar />

      <div className="home-content">
        {/* Doctor View */}
        {role === "doctor" ? (
          <>
            <h1>Doctor Dashboard</h1>
            <p>
              Manage your patients, view certificates, and access AI-powered
              tools to streamline healthcare management.
            </p>
          </>
        ) : (
          <>
            {/* Patient View */}
            <div className="home-header">
              <h1>Hello {patientName} 👋</h1>

              <button
                className="share-access-btn"
                onClick={generateQR}
              >
                🔗 Share access
              </button>
              <button
                className="notification"
                onClick={() => navigate("/notifications")}
              >
                🔔
              </button>

            </div>

            <p>
              View your medical records, manage certificates, and get
              AI-generated summaries instantly.
            </p>
          </>
        )}
      </div>

      {/* QR Modal */}
      {showQR && (
        <div className="qr-modal-overlay">
          <div className="qr-modal">
            <h3>Scan to View Records</h3>
            {qrValue && <QRCodeSVG value={qrValue} size={180} />}
            {expiryTime && (
            <p className="qr-note">
              Valid until: {" "} 
              {new Date(expiryTime).toLocaleTimeString()} • Read-only access
            </p>
            )}
            <button onClick={() => setShowQR(false)}>Close</button>
          </div>
        </div>
      )}

      {/* Chatbot goes here */}
      <Chatbot />   
    </div>
  );
}

export default Home;
