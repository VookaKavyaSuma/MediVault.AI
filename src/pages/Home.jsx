import Navbar from "../components/Navbar";
import "./../styles/Home.css";

function Home() {
  return (
    <div className="home-container">
      <Navbar />

      <div className="home-content">
        <h1>Welcome to MediVault AI</h1>
        <p>
          Securely manage patient records, certificates, and AI-powered insights — all in one place.
        </p>
      </div>
    </div>
  );
}

export default Home;
