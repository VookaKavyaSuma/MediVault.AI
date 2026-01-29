import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "./../styles/Records.css";

function SharedRecords() {
  const { token } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/share/${token}`);
        const result = await res.json();

        if (result.success) {
          setData(result);
        } else {
          setError(result.message);
        }
      } catch (err) {
        console.error(err);
        setError("Server Error");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  // 🛠️ HELPER: Fix URLs for Mobile
  // Converts "http://localhost:5001/uploads/..." -> "/uploads/..."
  // This lets the Vite Proxy handle it, working on ANY device.
  const getSafeUrl = (url) => {
    if (!url) return "";
    if (url.includes("localhost:5001")) {
      return url.replace("http://localhost:5001", ""); 
    }
    return url;
  };

  if (loading) return <div style={{ padding: "50px", textAlign: "center" }}>Verifying Secure Link...</div>;

  if (error) return (
    <div style={{ padding: "50px", textAlign: "center", color: "red" }}>
      <h1>🚫 Access Denied</h1>
      <p>{error}</p>
    </div>
  );

  return (
    <div className="records-container" style={{ paddingTop: "20px", paddingBottom: "40px" }}>
      <style>{`
          @media (max-width: 600px) {
            .emergency-card { padding: 15px !important; }
            .emergency-header { flex-direction: column; align-items: flex-start !important; }
            .emergency-grid { grid-template-columns: 1fr 1fr !important; gap: 15px !important; }
            .emergency-contact-box { flex-direction: column; align-items: flex-start !important; gap: 10px; }
            .records-content { width: 95% !important; padding: 0 10px; }
            .file-card { padding: 15px !important; }
          }
        `}</style>

      <div className="records-content" style={{ maxWidth: "800px", margin: "0 auto" }}>
        {/* EMERGENCY CARD (Same as before) */}
        <div className="emergency-card" style={{
          background: "linear-gradient(135deg, #ef4444, #b91c1c)",
          borderRadius: "16px",
          padding: "30px",
          marginBottom: "30px",
          color: "white",
          boxShadow: "0 10px 30px rgba(239, 68, 68, 0.4)",
          position: "relative",
          overflow: "hidden"
        }}>
          {/* ... (Keep existing layout) ... */}
          <div style={{ position: "relative", zIndex: 2 }}>
            <h2 className="emergency-header" style={{ margin: "0 0 20px 0", fontSize: "1.5rem", display: "flex", alignItems: "center", gap: "10px" }}>
              🚨 Emergency Medical ID
            </h2>

            <div className="emergency-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: "20px" }}>
              <div>
                <span style={{ display: "block", fontSize: "0.75rem", opacity: "0.8", textTransform: "uppercase", letterSpacing: "1px" }}>NAME</span>
                <span style={{ fontSize: "1.3rem", fontWeight: "700" }}>{data.patientName}</span>
              </div>
              <div>
                <span style={{ display: "block", fontSize: "0.75rem", opacity: "0.8", textTransform: "uppercase", letterSpacing: "1px" }}>BLOOD GROUP</span>
                <span style={{ fontSize: "1.3rem", fontWeight: "800", background: "white", color: "#b91c1c", padding: "2px 8px", borderRadius: "4px", display: "inline-block", marginTop: "4px" }}>
                  {data.patientValues?.bloodGroup || "Unknown"}
                </span>
              </div>
              <div style={{ gridColumn: "span 2" }}>
                <span style={{ display: "block", fontSize: "0.75rem", opacity: "0.8", textTransform: "uppercase", letterSpacing: "1px" }}>ALLERGIES</span>
                <span style={{ fontSize: "1.1rem", fontWeight: "500" }}>
                  {data.patientValues?.allergies || "None Known"}
                </span>
              </div>
            </div>

            <div className="emergency-contact-box" style={{ marginTop: "25px", padding: "15px", background: "rgba(0,0,0,0.2)", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <span style={{ display: "block", fontSize: "0.75rem", opacity: "0.9", textTransform: "uppercase", letterSpacing: "1px" }}>EMERGENCY CONTACT</span>
                <span style={{ fontSize: "1.2rem", fontWeight: "600" }}>{data.patientValues?.emergencyContact || "Not Listed"}</span>
              </div>
              {data.patientValues?.emergencyContact && (
                <a href={`tel:${data.patientValues.emergencyContact}`} style={{ background: "white", color: "#b91c1c", padding: "10px 20px", borderRadius: "30px", textDecoration: "none", fontWeight: "bold", fontSize: "0.95rem", boxShadow: "0 4px 10px rgba(0,0,0,0.2)" }}>
                  📞 Call Now
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="records-list">
          <h3 style={{ color: "white", marginBottom: "20px", fontSize: "1.2rem" }}>📂 Shared Medical Records</h3>
          {data.records.length === 0 ? (
            <p style={{ color: "rgba(255,255,255,0.6)", textAlign: "center", padding: "20px" }}>No records shared.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
              {data.records.map((rec) => (
                <div key={rec._id} className="file-card" style={{
                  background: "#1e1e24",
                  borderRadius: "12px",
                  padding: "20px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  border: "1px solid rgba(255,255,255,0.1)"
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "15px", overflow: "hidden" }}>
                    <div style={{ fontSize: "2rem" }}>
                      {rec.fileType.includes("pdf") ? "📄" : "📷"}
                    </div>
                    <div style={{ overflow: "hidden" }}>
                      <h4 style={{ margin: "0 0 5px 0", color: "white", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "200px" }}>{rec.fileName}</h4>
                      <span style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.5)" }}>{new Date(rec.uploadDate).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* 🆕 UPDATED BUTTON: Uses Safe URL */}
                  <button
                    onClick={() => window.open(getSafeUrl(rec.fileUrl), "_blank")}
                    style={{ background: "#2563eb", color: "white", padding: "8px 16px", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "600", whiteSpace: "nowrap" }}
                  >
                    View
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SharedRecords;