import Navbar from "../components/Navbar";
import Chatbot from "../components/Chatbot";
import "./../styles/Home.css";
import { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import { useNavigate } from "react-router-dom";

function Home() {
  const role = localStorage.getItem("role");
  const userName = localStorage.getItem("patientName") || "User"; // Generic name fallback

  const [showQR, setShowQR] = useState(false);
  const [qrToken, setQrToken] = useState("");

  // Profile State
  const [showProfileModal, setShowProfileModal] = useState(false);
  // We initialize mostly empty; we will fetch real data if needed or just let user overwrite
  const [profileData, setProfileData] = useState({
    // Patient Fields
    bloodGroup: "Unknown",
    allergies: "",
    emergencyContact: "",
    // Doctor Fields
    specializedIn: "",
    hospitalName: ""
  });

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

  // 🆕 HANDLE PROFILE UPDATE
  const handleProfileUpdate = async () => {
    const email = localStorage.getItem("email");
    
    // We reuse the same endpoint. 
    // Note: You might need to update backend to handle 'specializedIn' if it doesn't already.
    // For now, we assume the backend endpoint '/api/profile/update' supports these fields 
    // OR we primarily update patient fields. 
    // If you need doctor fields update, we might need a quick backend tweak.
    
    const res = await fetch("/api/profile/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, ...profileData }),
    });

    if (res.ok) {
      alert("Profile Updated!");
      setShowProfileModal(false);
    } else {
      alert("Update failed.");
    }
  };

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
                 <button className="share-btn" onClick={() => setShowProfileModal(true)}>
                  🏥 Edit Clinic Details
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

            <div className="action-cards">
              <div className="card" onClick={() => navigate("/documents?tab=records")}>
                <div className="card-icon">📂</div>
                <h3>My Records</h3>
                <p>Upload and view your medical history.</p>
              </div>

              <div className="card" onClick={() => navigate("/documents?tab=certificates")}>
                <div className="card-icon">📜</div>
                <h3>Certificates</h3>
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

      {/* QR Modal (Patients Only) */}
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

      {/* Profile Edit Modal (Shared Structure) */}
      {showProfileModal && (
        <div className="qr-modal-overlay">
          <div className="qr-modal" style={{ maxWidth: "500px", textAlign: "left" }}>
            <h3 style={{ marginBottom: "20px" }}>
              {role === 'doctor' ? '🏥 Clinic Details' : '✏️ Edit Medical Profile'}
            </h3>

            {role === 'doctor' ? (
               /* Doctor Fields */
               <>
                <label className="modal-label">Hospital Name</label>
                <input
                  className="modal-input"
                  type="text"
                  placeholder="e.g. Apollo Hospital"
                  value={profileData.hospitalName}
                  onChange={(e) => setProfileData({ ...profileData, hospitalName: e.target.value })}
                />
                 <label className="modal-label">Specialization</label>
                <input
                  className="modal-input"
                  type="text"
                  placeholder="e.g. Cardiologist"
                  value={profileData.specializedIn}
                  onChange={(e) => setProfileData({ ...profileData, specializedIn: e.target.value })}
                />
               </>
            ) : (
              /* Patient Fields */
              <>
                <label className="modal-label">Blood Group</label>
                <select
                  value={profileData.bloodGroup}
                  onChange={(e) => setProfileData({ ...profileData, bloodGroup: e.target.value })}
                  className="modal-input"
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

                <label className="modal-label">Allergies</label>
                <input
                  type="text"
                  className="modal-input"
                  placeholder="e.g. Peanuts, Penicillin"
                  value={profileData.allergies}
                  onChange={(e) => setProfileData({ ...profileData, allergies: e.target.value })}
                />

                <label className="modal-label">Emergency Contact</label>
                <input
                  type="text"
                  className="modal-input"
                  placeholder="Phone Number"
                  value={profileData.emergencyContact}
                  onChange={(e) => setProfileData({ ...profileData, emergencyContact: e.target.value })}
                />
              </>
            )}

            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "20px" }}>
              <button onClick={() => setShowProfileModal(false)} style={{ background: "transparent", border: "1px solid #666" }}>Cancel</button>
              <button
                onClick={handleProfileUpdate}
                style={{ background: "#2563eb", border: "none" }}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Chatbot (Always visible) */}
      <Chatbot />

      {/* Inline Styles for Modal Inputs */}
      <style>{`
        .modal-label { display: block; margin-bottom: 5px; font-size: 0.9rem; color: #ccc; }
        .modal-input { width: 100%; padding: 10px; margin-bottom: 15px; border-radius: 8px; border: 1px solid #444; background: #222; color: white; }
        .doctor-hero h1 { color: #60a5fa; }
      `}</style>
    </div>
  );
}

export default Home;