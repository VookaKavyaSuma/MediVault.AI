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

const generateQR = async () => {
    // Get current logged-in user email
    const email = localStorage.getItem("email"); // Gets your real logged-in email    
    try {
      const res = await fetch("/api/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patientEmail: email }),
      });
      
      const data = await res.json();
      
      if (data.success) {
        setQrToken(data.token);
        setExpiryTime(data.expiresAt);
        setShowQR(true);
      } else {
        alert("Failed to generate QR code");
      }
    } catch (error) {
      console.error("QR Error:", error);
    }
  };

  // Update the QR Value to point to your new page
// Uses the current browser URL (e.g., http://192.168.1.5:5173)
  const qrValue = qrToken
    ? `${window.location.origin}/shared/${qrToken}` 
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
            
            {/* Display QR Code */}
            {qrValue && <QRCodeSVG value={qrValue} size={180} />}
            
            <p className="qr-note" style={{color: "green", fontWeight: "bold", marginTop: "15px"}}>
              ✅ Permanent Access Link
            </p>
            <p style={{fontSize: "12px", color: "#666"}}>
              Anyone with this code can view your records anytime.
            </p>

            <button onClick={() => setShowQR(false)} style={{marginTop: "10px"}}>
              Close
            </button>
          </div>
        </div>
      )}

      {/* Chatbot goes here */}
      <Chatbot />   
    </div>
  );
}

export default Home;
