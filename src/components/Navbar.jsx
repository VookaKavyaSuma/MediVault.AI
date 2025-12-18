import { useState, useEffect  } from "react";
import { useNavigate } from "react-router-dom";
import "./../styles/Navbar.css";

function Navbar() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const role = localStorage.getItem("role"); // doctor | patient
  
  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("role"); 
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
              <li>Doctor Dashboard</li>
              <li>Patients</li>
              <li>Certificates</li>
              <li>AI Tools</li>
            </>
          )}
          {role === "patient" && (
            <>
              <li>My Dashboard</li>
              <li>My Records</li>
              <li>Certificates</li>
              <li>AI Summary</li>
            </>
          )}
          <li onClick={handleLogout}>Logout</li>
        </ul>
      </nav>

      {/* Mobile Menu */}
      <div className={`mobile-menu ${open ? "open" : ""}`}>

      {role === "doctor" && (
        <>
          <p onClick={() => setOpen(false)}>Doctor Dashboard</p>
          <p onClick={() => setOpen(false)}>Patients</p>
          <p onClick={() => setOpen(false)}>Certificates</p>
          <p onClick={() => setOpen(false)}>AI Tools</p>
        </>
      )}

      {role === "patient" && (
        <>
          <p onClick={() => setOpen(false)}>My Dashboard</p>
          <p onClick={() => setOpen(false)}>My Records</p>
          <p onClick={() => setOpen(false)}>Certificates</p>
          <p onClick={() => setOpen(false)}>AI Summary</p>
        </>
      )}

      <p className="logout" onClick={handleLogout}>Logout</p>
    </div>

    </>
  );
}

export default Navbar;
