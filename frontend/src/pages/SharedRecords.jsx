import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "./../styles/Records.css"; // Reuse styles

function SharedRecords() {
  const { token } = useParams(); // Get token from URL
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verify Token and Get Data
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/share/${token}`);
        const result = await res.json();

        if (result.success) {
          setData(result);
        } else {
          setError(result.message); // "Expired" or "Invalid"
        }
      } catch (err) {
        setError("Server Error");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  if (loading) return <div style={{padding: "50px", textAlign: "center"}}>Verifying Secure Link...</div>;

  if (error) return (
    <div style={{padding: "50px", textAlign: "center", color: "red"}}>
      <h1>🚫 Access Denied</h1>
      <p>{error}</p>
    </div>
  );

  return (
    <div className="records-container" style={{paddingTop: "20px"}}>
      <div className="records-content">
        <header style={{marginBottom: "30px", borderBottom: "1px solid #ddd", paddingBottom: "20px"}}>
          <h1 style={{color: "#2e7d32"}}>MediVault Secure Access</h1>
          <p>You are viewing the shared medical records of <b>{data.patientName}</b>.</p>
          <span style={{fontSize: "12px", background: "#fff3e0", padding: "5px 10px", borderRadius: "4px"}}>
            ⚠️ This session is read-only and temporary.
          </span>
        </header>

        <div className="records-table">
          <table>
            <thead>
              <tr>
                <th>File Name</th>
                <th>Type</th>
                <th>Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {data.records.map((rec) => (
                <tr key={rec._id}>
                  <td>{rec.fileName}</td>
                  <td>{rec.fileType}</td>
                  <td>{new Date(rec.uploadDate).toLocaleDateString()}</td>
                  <td>
                    <button 
                      onClick={() => window.open(rec.fileUrl, "_blank")}
                      style={{background: "#1e88e5", color: "white", padding: "5px 10px", border: "none", borderRadius: "4px", cursor: "pointer"}}
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default SharedRecords;