import Navbar from "../components/Navbar";
import "./../styles/Documents.css";
import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";

function Documents() {
    const [searchParams, setSearchParams] = useSearchParams();
    const initialTab = searchParams.get("tab") === "certificates" ? "certificates" : "records";

    const [activeTab, setActiveTab] = useState(initialTab);
    const [documents, setDocuments] = useState([]);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef(null);

    const role = localStorage.getItem("role");
    const userEmail = localStorage.getItem("email"); // 🆕 Get email

    // Sync tab with URL
    useEffect(() => {
        const tabFromUrl = searchParams.get("tab");
        if (tabFromUrl && tabFromUrl !== activeTab) {
            setActiveTab(tabFromUrl);
        }
    }, [searchParams]);

    const updateTab = (newTab) => {
        setActiveTab(newTab);
        setSearchParams({ tab: newTab });
    };

    useEffect(() => {
        if (userEmail) fetchDocuments();
    }, [activeTab, userEmail]);

    const fetchDocuments = async () => {
        try {
            // 🆕 Filter by userEmail
            const res = await fetch(`/api/records?email=${userEmail}`);
            const data = await res.json();
            setDocuments(data);
        } catch (error) {
            console.error("Error fetching documents:", error);
        }
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("file", file);
        formData.append("userEmail", userEmail);

        // 🆕 Check for Doctor-Target-Email
        const targetEmail = fileInputRef.current.getAttribute("data-target-email");
        if (targetEmail) {
            formData.append("targetEmail", targetEmail);
            formData.append("doctorName", localStorage.getItem("patientName") || "Dr. Medical"); // Use logged in name
            fileInputRef.current.removeAttribute("data-target-email"); // Cleanup
        }


        setUploading(true);

        try {
            const res = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            });

            const data = await res.json();

            if (data.success) {
                alert(activeTab === "certificates" ? "Certificate Issued Successfully!" : "Record Uploaded Successfully!");
                fetchDocuments();
            } else {
                alert("Upload failed.");
            }
        } catch (error) {
            console.error("Error uploading:", error);
            alert("Server Error.");
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this document?")) return;

        try {
            const res = await fetch(`/api/records/${id}`, { method: "DELETE" });
            const data = await res.json();

            if (data.success) {
                setDocuments(documents.filter((doc) => doc._id !== id));
                alert("🗑️ Deleted successfully.");
            } else {
                alert("Failed to delete.");
            }
        } catch (error) {
            console.error("Error deleting:", error);
        }
    };

    const handleUploadClick = () => {
        // 🆕 Doctor Check
        if (role === "doctor" && activeTab === "certificates") {
            const patientEmail = prompt("Enter Patient's Email to issue certificate:");
            if (!patientEmail) return; // Cancelled
            // We need to pass this to file change handler store it temporarily or use a different flow
            // Expanding handleFileChange to look for a hidden input or state would be ideal, 
            // but for a prompt-based flow:
            fileInputRef.current.setAttribute("data-target-email", patientEmail);
        }
        fileInputRef.current.click();
    };

    return (
        <div className="documents-container">
            <Navbar />

            <div className="documents-content">

                {/* Header */}
                <div className="documents-header">
                    <div className="title-section">
                        <h1>My Documents</h1>
                        <p>Manage your medical records and certificates in one place.</p>
                    </div>

                    {/* Action Button: Logic depends on Tab + Role */}
                    {/* Medical Records: Anyone can upload */}
                    {activeTab === "records" && (
                        <button className="upload-btn" onClick={handleUploadClick}>
                            + Upload Record
                        </button>
                    )}

                    {/* Certificates: Only Doctor can issue (upload) */}
                    {activeTab === "certificates" && role === "doctor" && (
                        <button className="upload-btn" onClick={handleUploadClick}>
                            + Issue Certificate
                        </button>
                    )}

                    {/* Hidden File Input */}
                    <input
                        type="file"
                        ref={fileInputRef}
                        style={{ display: "none" }}
                        onChange={handleFileChange}
                        accept="application/pdf,image/*"
                    />
                </div>

                {/* Tab Navigation */}
                <div className="tabs-container">
                    <button
                        className={`tab-btn ${activeTab === "records" ? "active" : ""}`}
                        onClick={() => updateTab("records")}
                    >
                        📂 Medical Records
                    </button>
                    <button
                        className={`tab-btn ${activeTab === "certificates" ? "active" : ""}`}
                        onClick={() => updateTab("certificates")}
                    >
                        📜 Prescriptions
                    </button>
                </div>

                {/* Table Content */}
                <div className="documents-table-wrapper">
                    {documents.length === 0 ? (
                        <p style={{ textAlign: "center", padding: "40px", color: "rgba(255,255,255,0.5)" }}>
                            No documents found.
                        </p>
                    ) : (
                        <table>
                            <thead>
                                <tr>
                                    <th>File Name</th>
                                    {activeTab === "certificates" && <th>Issued By</th>}
                                    <th>Date Uploaded</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {documents
                                    .filter(doc => {
                                        if (activeTab === "certificates") return doc.issuedBy; // Only Doctor uploads
                                        return !doc.issuedBy; // Only Self uploads
                                    })
                                    .map((doc) => (
                                        <tr key={doc._id}>
                                            <td style={{ fontWeight: "500" }}>{doc.fileName}</td>

                                            {/* Real 'Issued By' for Certificates */}
                                            {activeTab === "certificates" && (
                                                <td style={{ color: "#a5b4fc" }}>
                                                    {doc.issuedBy || "Self Upload"}
                                                </td>
                                            )}

                                            <td style={{ color: "rgba(255,255,255,0.7)" }}>
                                                {new Date(doc.uploadDate).toLocaleDateString()}
                                            </td>

                                            <td>
                                                <a href={doc.fileUrl} target="_blank" rel="noreferrer" className="action-btn view-btn">
                                                    View
                                                </a>

                                                {activeTab === "certificates" && (
                                                    <a href={doc.fileUrl} download className="action-btn download-btn">
                                                        Download
                                                    </a>
                                                )}

                                                {/* Delete allowed for Records generally, or if you own the file */}
                                                {/* Simplification: Allow delete for now */}
                                                <button className="action-btn delete-btn" onClick={() => handleDelete(doc._id)}>
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

            {/* Loading Spinner */}
            {uploading && (
                <div className="spinner-overlay">
                    <div className="spinner"></div>
                    <p>Processing Document...</p>
                </div>
            )}
        </div>
    );
}

export default Documents;
