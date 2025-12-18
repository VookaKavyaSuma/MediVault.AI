import Navbar from "../components/Navbar";
import "./../styles/Home.css";

function Home() {

  const role = localStorage.getItem("role");
  return (
    <div className="home-container">
      <Navbar />

      <div className="home-content">
        <h1>{role === "doctor" ? "Doctor Dashboard" : "Patient Dashboard"}</h1>
        {role === "doctor" ? (
        <p>
          Manage your patients, view certificates, and access AI-powered tools to streamline healthcare management.
        </p>
        ) : (
          <p>
            View your medical records, manage certificates, and get AI-generated summaries instantly.
          </p>
          )}
      </div>
    </div>
  );
}

export default Home;
