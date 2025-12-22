import Navbar from "../components/Navbar";
import { useEffect, useState } from "react";
import "./../styles/Records.css"; // Re-using table styles

function Patients() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const res = await fetch("/api/patients");
      const data = await res.json();
      setPatients(data);
    } catch (error) {
      console.error("Error fetching patients:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="records-container">
      <Navbar />

      <div className="records-content">
        <h1>Patient Directory</h1>
        <p>List of all registered patients in MediVault.</p>

        {loading ? (
           <p>Loading patients...</p>
        ) : patients.length === 0 ? (
           <p>No patients registered yet.</p>
        ) : (
          <div className="records-table">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Joined Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {patients.map((p) => (
                  <tr key={p._id}>
                    <td>
                      <div style={{fontWeight: "bold", color: "#1e88e5"}}>
                        {p.name}
                      </div>
                    </td>
                    <td>{p.email}</td>
                    <td>{new Date(p.dateJoined).toLocaleDateString()}</td>
                    <td>
                      <span style={{
                        backgroundColor: "#e8f5e9", 
                        color: "#2e7d32", 
                        padding: "4px 8px", 
                        borderRadius: "12px",
                        fontSize: "12px"
                      }}>
                        Active
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default Patients;