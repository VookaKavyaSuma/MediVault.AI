import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./../styles/Navbar.css";

function Navbar() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const role = localStorage.getItem("role"); // doctor | patient

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("role");
    localStorage.removeItem("patientName");
    setOpen(false);
    navigate("/");
  };

  // Close mobile menu if resizing to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Navigation function for links
  const handleNavigation = (path) => {
    navigate(path);
    setOpen(false);
  };

  return (
    <>
      <nav className="navbar">
        <div className="nav-left">
          <span className="menu-icon" onClick={() => setOpen(!open)}>
            ☰
          </span>
          <h2>MediVault AI</h2>
        </div>

        {/* Desktop Navbar */}
        <ul className="nav-links">
          {role === "doctor" && (
            <>
              <li onClick={() => handleNavigation("/home")}>Doctor Dashboard</li>
              <li onClick={() => handleNavigation("/patients")}>Patients</li>
              <li onClick={() => handleNavigation("/documents?tab=certificates")}>Documents</li>
              <li onClick={() => handleNavigation("/ai-tools")}>AI Tools</li>
            </>
          )}
          {role === "patient" && (
            <>
              <li onClick={() => handleNavigation("/home")}>Dashboard</li>
              <li onClick={() => handleNavigation("/documents?tab=records")}>Documents</li>
              <li onClick={() => handleNavigation("/ai-summary")}>AI Summary</li>
            </>
          )}
          <li className="logout-btn" onClick={handleLogout}>Logout</li>
        </ul>
      </nav>

      {/* Mobile Menu */}
      <div className={`mobile-menu ${open ? "open" : ""}`}>

        {role === "doctor" && (
          <>
            <p onClick={() => { navigate("/home"); setOpen(false); }}>Doctor Dashboard</p>
            <p onClick={() => { navigate("/patients"); setOpen(false); }}>Patients</p>
            <p onClick={() => { navigate("/documents?tab=certificates"); setOpen(false); }}>Documents</p>
            <p onClick={() => { navigate("/ai-tools"); setOpen(false); }}>AI Tools</p>
          </>
        )}

        {role === "patient" && (
          <>
            <p onClick={() => { navigate("/home"); setOpen(false); }}>My Dashboard</p>
            <p onClick={() => { navigate("/documents?tab=records"); setOpen(false); }}>Documents</p>
            <p onClick={() => { navigate("/ai-summary"); setOpen(false); }}>AI Summary</p>
          </>
        )}

        <p className="logout" onClick={handleLogout}>Logout</p>
      </div>

    </>
  );
}

export default Navbar;
