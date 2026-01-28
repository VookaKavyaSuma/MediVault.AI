import Navbar from "../components/Navbar";
import Chatbot from "../components/Chatbot";
import "./../styles/Home.css";
import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { useNavigate } from "react-router-dom";

function Home() {
  const role = localStorage.getItem("role");
  const patientName = localStorage.getItem("patientName") || "Patient";

  const [showQR, setShowQR] = useState(false);
  const [qrToken, setQrToken] = useState("");

  // 🆕 Profile State
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileData, setProfileData] = useState({
    bloodGroup: "Unknown",
    allergies: "",
    emergencyContact: ""
  });

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
        // setExpiryTime(data.expiresAt);
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
            <div className="hero-section">
              <h1>Doctor Dashboard</h1>
              <p>
                Manage your patients, view certificates, and access AI-powered
                tools to streamline healthcare management.
              </p>
            </div>
            {/* We could add doctor specific cards here later */}
          </>
        ) : (
          <>
            {/* Patient View - Redesigned */}
            <div className="hero-section">
              <div className="hero-text">
                <h1>Hello, <span className="gradient-text">{patientName}</span> 👋</h1>
                <p>Your personal health command center.</p>
              </div>

              <div className="hero-actions">
                <button className="share-btn" onClick={generateQR}>
                  🔗 Share Access
                </button>
                <button
                  className="share-btn"
                  onClick={() => setShowProfileModal(true)}
                >
                  ✏️ Edit Profile
                </button>
                <button className="notif-btn" onClick={() => navigate("/notifications")}>
                  🔔
                </button>
              </div>
            </div>

            {/* Quick Actions Grid */}
            <div className="action-cards">
              <div className="card" onClick={() => navigate("/documents?tab=records")}>
                <div className="card-icon">📂</div>
                <h3>My Records</h3>
                <p>Upload and view your medical history.</p>
              </div>

              <div className="card" onClick={() => navigate("/documents?tab=certificates")}>
                <div className="card-icon">📜</div>
                <h3>Certificates</h3>
                <p>Manage your health certificates.</p>
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

      {/* QR Modal */}
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

      {/* 🆕 PROFILE EDIT MODAL */}
      {showProfileModal && (
        <div className="qr-modal-overlay">
          <div className="qr-modal" style={{ maxWidth: "500px", textAlign: "left" }}>
            <h3 style={{ marginBottom: "20px" }}>✏️ Edit Medical Profile</h3>

            <label style={{ display: "block", marginBottom: "5px", fontSize: "0.9rem" }}>Blood Group</label>
            <select
              value={profileData.bloodGroup}
              onChange={(e) => setProfileData({ ...profileData, bloodGroup: e.target.value })}
              style={{ width: "100%", padding: "10px", marginBottom: "15px", borderRadius: "8px", border: "1px solid #444", background: "#222", color: "white" }}
            >
              <option value="Unknown">Select...</option>
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
            </select>

            <label style={{ display: "block", marginBottom: "5px", fontSize: "0.9rem" }}>Allergies</label>
            <input
              type="text"
              placeholder="e.g. Peanuts, Penicillin"
              value={profileData.allergies}
              onChange={(e) => setProfileData({ ...profileData, allergies: e.target.value })}
              style={{ width: "100%", padding: "10px", marginBottom: "15px", borderRadius: "8px", border: "1px solid #444", background: "#222", color: "white" }}
            />

            <label style={{ display: "block", marginBottom: "5px", fontSize: "0.9rem" }}>Emergency Contact</label>
            <input
              type="text"
              placeholder="Phone Number"
              value={profileData.emergencyContact}
              onChange={(e) => setProfileData({ ...profileData, emergencyContact: e.target.value })}
              style={{ width: "100%", padding: "10px", marginBottom: "20px", borderRadius: "8px", border: "1px solid #444", background: "#222", color: "white" }}
            />

            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
              <button onClick={() => setShowProfileModal(false)} style={{ background: "transparent", border: "1px solid #666" }}>Cancel</button>
              <button
                onClick={async () => {
                  const email = localStorage.getItem("email");
                  const res = await fetch("/api/profile/update", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email, ...profileData }),
                  });
                  if (res.ok) {
                    alert("Profile Updated!");
                    setShowProfileModal(false);
                    // Ideally refresh data
                  } else {
                    alert("Update failed.");
                  }
                }}
                style={{ background: "#2563eb", border: "none" }}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Chatbot */}
      <Chatbot />
    </div>
  );
}

export default Home;
