import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./../styles/Login.css"; // We reuse the Login styles

function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("patient"); // Default role
  const [error, setError] = useState("");
  
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role }),
      });

      const data = await res.json();

      if (data.success) {
        alert("✅ Account created successfully! Redirecting to Login...");
        navigate("/"); // Go back to Login page
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError("Server error. Please try again.");
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2 className="title">Join MediVault AI</h2>
        <p className="subtitle">Create your secure account</p>

        <form onSubmit={handleSignup}>
          <input
            type="text"
            placeholder="Full Name"
            className="input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          
          <input
            type="email"
            placeholder="Email Address"
            className="input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Create Password"
            className="input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {/* Simple Role Selection */}
          <div style={{marginBottom: "15px", textAlign: "left", fontSize: "14px"}}>
            <label style={{marginRight: "10px"}}>I am a:</label>
            <select 
              value={role} 
              onChange={(e) => setRole(e.target.value)}
              style={{padding: "5px", borderRadius: "4px"}}
            >
              <option value="patient">Patient</option>
              <option value="doctor">Doctor</option>
            </select>
          </div>

          {error && <p style={{ color: "red", fontSize: "13px" }}>{error}</p>}

          <button className="login-btn">Sign Up</button>
        </form>

        <p className="footer-text">
          Already have an account? <span onClick={() => navigate("/")}>Login</span>
        </p>
      </div>
    </div>
  );
}

export default Signup;