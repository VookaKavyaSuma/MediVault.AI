import { useState } from "react";
import "./../styles/Navbar.css";

function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <nav className="navbar">
        <div className="nav-left">
          <span className="menu-icon" onClick={() => setOpen(!open)}>
            ☰
          </span>
          <h2>MediVault AI</h2>
        </div>

        <ul className="nav-links">
          <li>Dashboard</li>
          <li>Vault</li>
          <li>Patients</li>
          <li>AI Tools</li>
          <li>Logout</li>
        </ul>
      </nav>

      {/* Mobile Menu */}
      {open && (
        <div className="mobile-menu">
          <p>Dashboard</p>
          <p>Vault</p>
          <p>Patients</p>
          <p>AI Tools</p>
          <p className="logout">Logout</p>
        </div>
      )}
    </>
  );
}

export default Navbar;
