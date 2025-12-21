import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import "./../styles/Certificates.css";

function Certificates() {
  const role = localStorage.getItem("role");
  const [certificates, setCertificates] = useState([]);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("certificates")) || [];
    setCertificates(stored);
  }, []);

  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const newCertificate = {
      id: Date.now(),
      title: file.name,
      uploadedBy: "Dr. Ananya Rao",
      issuedBy: "Apollo Hospitals",
      dateIssued: new Date().toISOString().split("T")[0],
      fileUrl: URL.createObjectURL(file),
    };

    const updated = [newCertificate, ...certificates];
    setCertificates(updated);
    localStorage.setItem("certificates", JSON.stringify(updated));

    // Trigger AI summary storage
    const aiSummaries =
      JSON.parse(localStorage.getItem("aiSummaries")) || [];

    aiSummaries.unshift({
      id: newCertificate.id,
      certificateName: file.name,
      analyzedOn: new Date().toLocaleDateString(),
      history: [{ hospital: "Apollo Hospitals", visitDate: "Jan 2024" }],
      tests: [{ name: "Blood Test", result: "Normal" }],
      medicines: [{ name: "Vitamin D", dosage: "1000 IU" }],
      diseases: [{ name: "Hypertension", status: "Under control" }],
    });

    localStorage.setItem("aiSummaries", JSON.stringify(aiSummaries));
  };

  return (
    <div className="certificates-container">
      <Navbar />

      <div className="certificates-content">
        <h1>Certificates</h1>

        {/* Doctor-only Upload */}
        {role === "doctor" && (
          <label className="upload-btn">
            Upload Certificate
            <input type="file" hidden onChange={handleUpload} />
          </label>
        )}

        {certificates.length === 0 ? (
          <p>No certificates available.</p>
        ) : (
          <table className="certificates-table">
            <thead>
              <tr>
                <th>Certificate</th>
                <th>Uploaded By</th>
                <th>Hospital</th>
                <th>Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {certificates.map((cert) => (
                <tr key={cert.id}>
                  <td>{cert.title}</td>
                  <td>{cert.uploadedBy}</td>
                  <td>{cert.issuedBy}</td>
                  <td>{cert.dateIssued}</td>
                  <td>
                    <a
                      href={cert.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="view-btn"
                    >
                      View
                    </a>
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
