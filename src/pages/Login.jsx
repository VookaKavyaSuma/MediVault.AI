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

  const handleLogin = (e) => {
    e.preventDefault();

    if (email === correctEmail && password === correctPassword) {
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("role", "doctor");
      navigate("/home"); 
    } else if (email === "patient@medivault.ai" && password === "patient123") {
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("role", "patient");
        localStorage.setItem("patientName", "Kavya Suma"); // store patient name
        navigate("/home");
    } else {
        setError("Invalid email or password");
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
