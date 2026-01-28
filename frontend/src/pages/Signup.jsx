import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./../styles/Login.css"; // We reuse the Login styles

function Signup() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "patient",
    bloodGroup: "", // 🆕
    allergies: "", // 🆕
    emergencyContact: "", // 🆕
    specializedIn: "",
    hospitalName: "",
    licenseNumber: ""
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        alert("✅ Account created successfully! Redirecting to Login...");
        navigate("/");
      } else {
        setError(data.message);
      }
    } catch (err) {
      console.error("Signup Error:", err);
      setError("Server error. Please try again.");
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2 className="title">Join MediVault AI</h2>
        <p className="subtitle">Create your secure account</p>

        <form onSubmit={handleSubmit}>
          <input name="name" type="text" placeholder="Full Name" className="input" onChange={handleChange} required />
          <input name="email" type="email" placeholder="Email Address" className="input" onChange={handleChange} required />
          <input name="password" type="password" placeholder="Create Password" className="input" onChange={handleChange} required />

          <div style={{ marginBottom: "15px", textAlign: "left", fontSize: "14px" }}>
            <label style={{ marginRight: "10px" }}>I am a:</label>
            <select
              name="role"
              onChange={handleChange}
              style={{ padding: "5px", borderRadius: "4px" }}
              value={formData.role}
            >
              <option value="patient">Patient</option>
              <option value="doctor">Doctor</option>
            </select>
          </div>

          {formData.role === "doctor" ? (
            <>
              <input name="specializedIn" type="text" placeholder="Specialization" className="input" onChange={handleChange} />
              <input name="hospitalName" type="text" placeholder="Hospital Name" className="input" onChange={handleChange} />
              <input name="licenseNumber" type="text" placeholder="License Number" className="input" onChange={handleChange} />
            </>
          ) : (
            /* 🆕 Patient Fields */
            <>
              <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
                <select name="bloodGroup" onChange={handleChange} className="input" style={{ flex: 1, padding: "10px" }}>
                  <option value="">Blood Group</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                </select>
                <input name="emergencyContact" type="text" placeholder="Emergency Contact" className="input" onChange={handleChange} style={{ flex: 2 }} />
              </div>
              <input name="allergies" type="text" placeholder="Allergies (comma separated)" className="input" onChange={handleChange} />
            </>
          )}

          {error && <p style={{ color: "red", fontSize: "13px" }}>{error}</p>}

          <button type="submit" className="login-btn">Sign Up</button>
        </form>

        <p className="footer-text">
          Already have an account? <span onClick={() => navigate("/")}>Login</span>
        </p>
      </div>
    </div>
  );
}

export default Signup;