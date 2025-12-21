import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import "./../styles/Certificates.css";

function Certificates() {
  const role = localStorage.getItem("role");
  const [certificates, setCertificates] = useState([]);

  // 1. Fetch Real Certificates from Backend
  useEffect(() => {
    fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
    try {
      const res = await fetch("/api/records");
      const data = await res.json();
      // In a real app, you might filter by type="Certificate"
      // For now, we show all files as certificates for the demo
      setCertificates(data);
    } catch (error) {
      console.error("Error fetching certificates:", error);
    }
  };

  // 2. Handle Upload (For Doctors)
  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      alert("Issuing Certificate... Uploading to Secure Vault.");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (data.success) {
        alert("✅ Certificate Issued Successfully!");
        fetchCertificates(); // Refresh the list
      } else {
        alert("Upload failed.");
      }
    } catch (error) {
      console.error("Error uploading:", error);
      alert("Server Error.");
    }
  };

  return (
    <div className="certificates-container">
      <Navbar />

      <div className="certificates-content">
        <h1>Medical Certificates</h1>

        {/* Doctor-only Upload Button */}
        {role === "doctor" && (
          <label className="upload-btn">
            + Issue New Certificate
            <input type="file" hidden onChange={handleUpload} />
          </label>
        )}

        {certificates.length === 0 ? (
          <p>No certificates found.</p>
        ) : (
          <table className="certificates-table">
            <thead>
              <tr>
                <th>Certificate Name</th>
                <th>Issued By</th>
                <th>Date Issued</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {certificates.map((cert) => (
                <tr key={cert._id}>
                  <td>{cert.fileName}</td>
                  <td>Dr. Ananya Rao</td> {/* Hardcoded for MVP */}
                  <td>{new Date(cert.uploadDate).toLocaleDateString()}</td>
                  <td>
                    <a
                      href={cert.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="view-btn"
                    >
                      View
                    </a>
                    {/* For download, we point to the same URL */}
                    <a
                      href={cert.fileUrl}
                      download
                      className="download-btn"
                    >
                      Download
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default Certificates;