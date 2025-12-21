import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./../styles/Login.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const correctEmail = "admin@medivault.ai";
  const correctPassword = "admin123";

const handleLogin = async (e) => {
    e.preventDefault();
    setError(""); // Clear previous errors

    try {
      // 1. Call your new Backend API
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success) {
        // 2. Save real data from server
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("role", data.role);
        localStorage.setItem("patientName", data.name);
        
        // 3. Redirect
        navigate("/home");
      } else {
        // Show error from server (e.g., "Invalid Credentials")
        setError(data.message);
      }
    } catch (err) {
      console.error("Login Error:", err);
      setError("Server error. Is the backend running?");
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2 className="title">MediVault AI</h2>
        <p className="subtitle">Secure Healthcare Data Management</p>

        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email"
            className="input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            className="input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {error && <p style={{ color: "red", fontSize: "13px" }}>{error}</p>}

          <button className="login-btn">Login</button>
        </form>

        <p className="footer-text">
          Don’t have an account? <span>Sign up</span>
        </p>
      </div>
    </div>
  );
}

export default Login;
