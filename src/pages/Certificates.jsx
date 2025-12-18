import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import "./../styles/Certificates.css";

function Certificates() {
  const [certificates, setCertificates] = useState([]);

  // For demo purposes, using dummy data
  useEffect(() => {
    const dummyCertificates = [
      {
        id: 1,
        title: "Vaccination Certificate",
        uploadedBy: "Dr. Ananya Rao",
        issuedBy: "City Hospital",
        dateIssued: "2025-11-15",
        fileUrl: "/certificates/vaccine-john.pdf",
      },
      {
        id: 2,
        title: "Blood Test Report",
        uploadedBy: "Dr. Rahul Mehta",
        issuedBy: "LabCorp Diagnostics",
        dateIssued: "2025-12-01",
        fileUrl: "/certificates/bloodtest-john.pdf",
      },
    ];
    setCertificates(dummyCertificates);
  }, []);

  return (
    <div className="certificates-container">
      <Navbar />
      <div className="certificates-content">
        <h1>My Certificates</h1>
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
                      rel="noopener noreferrer"
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
