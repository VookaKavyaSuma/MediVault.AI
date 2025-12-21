import Navbar from "../components/Navbar";
import "./../styles/Records.css";
import { useState, useEffect, useRef } from "react";

function Records() {
  const [records, setRecords] = useState([]);
  const [uploading, setUploading] = useState(false); // UI State for Spinner
  const fileInputRef = useRef(null); // Reference to hidden file input

  // 1. Fetch Records from Backend on Load
  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    try {
      // Note: We use /api because of the Proxy we set up!
      const res = await fetch("/api/records");
      const data = await res.json();
      setRecords(data);
    } catch (error) {
      console.error("Error fetching records:", error);
    }
  };

  // 2. Handle File Selection
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    setUploading(true); // <--- START LOADING ⏳

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (data.success) {
        // Notification logic handles the alert now
        // Refresh the list to show the new file
        fetchRecords(); 
      } else {
        alert("Upload failed.");
      }
    } catch (error) {
      console.error("Error uploading:", error);
      alert("Server Error.");
    } finally {
      setUploading(false); // <--- STOP LOADING 🛑
    }
  };

  // 3. Handle Delete (Connected to Backend)
  const handleDelete = async (id) => {
    // Confirm before deleting
    const confirmDelete = window.confirm("Are you sure you want to delete this record?");
    if (!confirmDelete) return;

    try {
      // Call Backend API
      const res = await fetch(`/api/records/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (data.success) {
        // Update UI (Remove from list without refreshing)
        setRecords(records.filter((rec) => rec._id !== id));
        alert("🗑️ Record deleted successfully.");
      } else {
        alert("Failed to delete record.");
      }
    } catch (error) {
      console.error("Error deleting:", error);
      alert("Server error. Could not delete.");
    }
  };

  // Trigger the hidden file input
  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  const handleView = (url) => {
    window.open(url, "_blank");
  };

  return (
    <div className="records-container">
      <Navbar />

      <div className="records-content">
        <div className="records-header">
          <h1>My Records</h1>
          
          {/* Hidden Input for File Upload */}
          <input 
            type="file" 
            ref={fileInputRef} 
            style={{ display: "none" }} 
            onChange={handleFileChange} 
            accept="application/pdf,image/*"
          />

          <button className="upload-btn" onClick={handleUploadClick}>
            Upload New Record
          </button>
        </div>
        <p>Manage and view all your medical records securely.</p>

        {/* Records Table */}
        <div className="records-table">
          {records.length === 0 ? (
            <p style={{ textAlign: "center", padding: "20px" }}>No records found. Upload one!</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>File Name</th>
                  <th>Date Uploaded</th>
                  <th>Type</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {records.map((rec) => (
                  <tr key={rec._id}>
                    <td>{rec.fileName}</td>
                    <td>{new Date(rec.uploadDate).toLocaleDateString()}</td>
                    <td>{rec.fileType}</td>
                    <td>
                      <button onClick={() => handleView(rec.fileUrl)}>View File</button>
                      <button 
                        className="delete-btn" 
                        style={{ marginLeft: "10px", backgroundColor: "#e53935", color: "white" }}
                        onClick={() => handleDelete(rec._id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* LOADING OVERLAY - Shows when uploading */}
      {uploading && (
        <div className="spinner-overlay">
          <div className="spinner"></div>
          <div className="loading-text">Analyzing Medical Record... 🤖</div>
        </div>
      )}
    </div>
  );
}

export default Records;