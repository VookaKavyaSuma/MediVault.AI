import Navbar from "../components/Navbar";
import "./../styles/Records.css";
import { useState } from "react";

function Records() {
  // Dummy data for now
  const [records, setRecords] = useState([
    { id: 1, name: "Blood Test", date: "2025-12-01", type: "PDF" },
    { id: 2, name: "X-Ray Chest", date: "2025-11-20", type: "Image" },
    { id: 3, name: "Prescription", date: "2025-12-10", type: "PDF" },
  ]);

  const handleDelete = (id) => {
    const confirmed = window.confirm("Are you sure you want to delete this record?");
    if (confirmed) {
        setRecords(records.filter((rec) => rec.id !== id));
    }
  };

  const handleUpload = () => {
    alert("Upload new record clicked!");
  };

  return (
    <div className="records-container">
      <Navbar />

      <div className="records-content">
        <div className="records-header">
        <h1>My Records</h1>
        
       <button className="upload-btn" onClick={handleUpload}>Upload New Record</button>
       </div>
        <p>Manage and view all your medical records securely.</p>

        {/* Records Table */}
        <div className="records-table">
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
                <tr key={rec.id}>
                  <td>{rec.name}</td>
                  <td>{rec.date}</td>
                  <td>{rec.type}</td>
                  <td>
                    <button onClick={() => handleView(rec)}>View</button>
                    <button
                    className="delete-btn"
                    onClick={() => handleDelete(rec.id)}
                    >
                    Delete
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

export default Records;
