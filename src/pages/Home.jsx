import Navbar from "../components/Navbar";
import "./../styles/Home.css";

function Home() {
  const role = localStorage.getItem("role");
  const patientName = localStorage.getItem("patientName") || "Patient";

  return (
    <div className="home-container">
      <Navbar />

      <div className="home-content">
        {/* Header */}
        {role === "doctor" ? (
          <>
            <h1>Doctor Dashboard</h1>
            <p>
              Manage your patients, view certificates, and access AI-powered tools to streamline healthcare management.
            </p>
          </>
        ) : (
          <>
            <h1>Hello {patientName}</h1>
            <p>
              View your medical records, manage certificates, and get AI-generated summaries instantly.
            </p>
          </>
        )}
      </div>
    </div>
  );
}

export default Home;
