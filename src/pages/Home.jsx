import Navbar from "../components/Navbar";
import Chatbot from "../components/ChatBot";
import "./../styles/Home.css";
import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";

function Home() {
  const role = localStorage.getItem("role");
  const patientName = localStorage.getItem("patientName") || "Patient";

  const [showQR, setShowQR] = useState(false);
  const [expiryTime, setExpiryTime] = useState(null);

  const generateQR = () => {
    const token = Math.random().toString(36).substring(2);
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    const qrData = {
      token,
      patientName,
      expiresAt
    };

    localStorage.setItem("qrAccess", JSON.stringify(qrData));
    setExpiryTime(expiresAt);
    setShowQR(true);
  };

  const qrValue = expiryTime
    ? `https://medivault.ai/share?token=${JSON.parse(
        localStorage.getItem("qrAccess")
      )?.token}`
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
                onClick={() => setShowQR(true)}
              >
                🔗 Share access
              </button>
              <button className="notification">🔔</button>
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
            <QRCodeSVG value={qrValue} size={180} />
            <p className="qr-note">
              Valid until: {new Date(expiryTime).toLocaleTimeString()} • Read-only access
            </p>
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
