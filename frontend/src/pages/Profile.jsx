import Navbar from "../components/Navbar";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./../styles/Home.css"; // Reuse main styles
import toast from 'react-hot-toast';

function Profile() {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // State for form data
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "",
    bloodGroup: "",
    allergies: "",
    emergencyContact: "",
    hospitalName: "",
    specializedIn: ""
  });

  // Fetch Data on Load
  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    const email = localStorage.getItem("email");
    if (!email) return navigate("/");

    try {
      const res = await fetch(`/api/profile?email=${email}`);
      const data = await res.json();
      if (data.success) {
        setFormData(data.user);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const res = await fetch("/api/profile/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        toast.success("Profile Updated Successfully! 🎉");
        setIsEditing(false);
        // Update local storage for immediate name changes
        localStorage.setItem("patientName", formData.name);
      } else {
        toast.error("Update failed.");
      }
    } catch (error) {
      toast.error("Server Error");
    }
  };

  const handleLogout = () => {
    if(confirm("Are you sure you want to logout?")) {
        localStorage.clear();
        navigate("/");
    }
  };

  if (loading) return <div className="home-container" style={{display:"flex", justifyContent:"center", alignItems:"center"}}>Loading...</div>;

  return (
    <div className="home-container">
      <Navbar />
      
      <div className="profile-wrapper" style={{ 
        maxWidth: "600px", 
        margin: "80px auto 20px", 
        padding: "20px" 
      }}>
        
        {/* HEADER SECTION */}
        <div className="profile-header" style={{ textAlign: "center", marginBottom: "30px" }}>
          <div className="avatar-circle" style={{
            width: "120px", height: "120px", 
            borderRadius: "50%", 
            background: "linear-gradient(135deg, #6366f1, #a855f7)", 
            margin: "0 auto 20px",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "3rem", fontWeight: "bold", color: "white",
            boxShadow: "0 10px 25px rgba(99, 102, 241, 0.4)"
          }}>
            {formData.name.charAt(0).toUpperCase()}
          </div>
          
          <h2 style={{ fontSize: "2rem", marginBottom: "5px" }}>{formData.name}</h2>
          <span style={{ 
            background: formData.role === 'doctor' ? "rgba(59, 130, 246, 0.2)" : "rgba(16, 185, 129, 0.2)", 
            color: formData.role === 'doctor' ? "#60a5fa" : "#34d399",
            padding: "5px 15px", borderRadius: "20px", fontSize: "0.9rem", textTransform: "capitalize"
          }}>
            {formData.role} Account
          </span>
        </div>

        {/* DETAILS CARD */}
        <div className="profile-card" style={{
          background: "#1e1e24", 
          borderRadius: "16px", 
          padding: "30px",
          border: "1px solid rgba(255,255,255,0.05)"
        }}>
          
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <h3 style={{ margin: 0, color: "#aaa", fontSize: "1rem", textTransform: "uppercase", letterSpacing: "1px" }}>Personal Details</h3>
            {!isEditing ? (
              <button onClick={() => setIsEditing(true)} style={{ background: "transparent", color: "#6366f1", border: "none", cursor: "pointer", fontSize: "0.9rem" }}>
                Edit ✏️
              </button>
            ) : (
               <div style={{ display: "flex", gap: "10px" }}>
                 <button onClick={() => setIsEditing(false)} style={{ background: "transparent", color: "#aaa", border: "none", cursor: "pointer", fontSize: "0.9rem" }}>Cancel</button>
                 <button onClick={handleSave} style={{ background: "#6366f1", color: "white", border: "none", padding: "5px 15px", borderRadius: "8px", cursor: "pointer", fontSize: "0.9rem" }}>Save</button>
               </div>
            )}
          </div>

          <div className="fields-grid" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            
            {/* EMAIL (Read Only) */}
            <div className="field-group">
              <label style={{ display: "block", color: "#666", fontSize: "0.85rem", marginBottom: "5px" }}>Email</label>
              <input type="text" value={formData.email} disabled style={inputStyle(false)} />
            </div>

            {/* ROLE SPECIFIC FIELDS */}
            {formData.role === 'patient' ? (
                <>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                        <div className="field-group">
                            <label style={labelStyle}>Blood Group</label>
                            {isEditing ? (
                                <select 
                                    value={formData.bloodGroup} 
                                    onChange={(e) => setFormData({...formData, bloodGroup: e.target.value})}
                                    style={inputStyle(true)}
                                >
                                    <option value="Unknown">Select...</option>
                                    <option value="A+">A+</option>
                                    <option value="A-">A-</option>
                                    <option value="B+">B+</option>
                                    <option value="O+">O+</option>
                                    <option value="O-">O-</option>
                                    <option value="AB+">AB+</option>
                                </select>
                            ) : (
                                <div style={valueStyle}>{formData.bloodGroup || "Not Set"}</div>
                            )}
                        </div>
                        <div className="field-group">
                            <label style={labelStyle}>Emergency Contact</label>
                            {isEditing ? (
                                <input type="text" value={formData.emergencyContact} onChange={(e) => setFormData({...formData, emergencyContact: e.target.value})} style={inputStyle(true)} />
                            ) : (
                                <div style={valueStyle}>{formData.emergencyContact || "Not Set"}</div>
                            )}
                        </div>
                    </div>
                    <div className="field-group">
                        <label style={labelStyle}>Allergies</label>
                        {isEditing ? (
                            <input type="text" value={formData.allergies} onChange={(e) => setFormData({...formData, allergies: e.target.value})} style={inputStyle(true)} />
                        ) : (
                            <div style={valueStyle}>{formData.allergies || "None"}</div>
                        )}
                    </div>
                </>
            ) : (
                /* DOCTOR FIELDS */
                <>
                    <div className="field-group">
                        <label style={labelStyle}>Hospital Name</label>
                        {isEditing ? (
                            <input type="text" value={formData.hospitalName} onChange={(e) => setFormData({...formData, hospitalName: e.target.value})} style={inputStyle(true)} />
                        ) : (
                            <div style={valueStyle}>{formData.hospitalName || "Not Set"}</div>
                        )}
                    </div>
                    <div className="field-group">
                        <label style={labelStyle}>Specialization</label>
                        {isEditing ? (
                            <input type="text" value={formData.specializedIn} onChange={(e) => setFormData({...formData, specializedIn: e.target.value})} style={inputStyle(true)} />
                        ) : (
                            <div style={valueStyle}>{formData.specializedIn || "Not Set"}</div>
                        )}
                    </div>
                </>
            )}

          </div>

          <div style={{ marginTop: "40px", paddingTop: "20px", borderTop: "1px solid #333" }}>
             <button onClick={handleLogout} style={{ width: "100%", padding: "12px", background: "rgba(239, 68, 68, 0.1)", color: "#ef4444", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "600" }}>
                Log Out
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Styles Helper
const labelStyle = { display: "block", color: "#666", fontSize: "0.85rem", marginBottom: "5px" };
const valueStyle = { padding: "10px", color: "white", fontSize: "1rem", fontWeight: "500" };
const inputStyle = (enabled) => ({
    width: "100%", 
    padding: "10px", 
    background: enabled ? "#2a2a35" : "transparent", 
    border: enabled ? "1px solid #444" : "none", 
    color: enabled ? "white" : "#888",
    borderRadius: "8px",
    outline: "none"
});

export default Profile;