// src/components/Navbar.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../Image/Logo.jpg";
import { Dropdown } from "react-bootstrap";

function Navbar({ keycloak }) {
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);

 const handleLogout = () => {
    localStorage.removeItem("token");
    keycloak.logout({ redirectUri: window.location.origin + '/' });
  };

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  const user = keycloak?.tokenParsed;

  return (
    <nav
      className="d-flex justify-content-between align-items-center px-4 py-2"
      style={{ background: "#1a1a1a", color: "white", height: "64px" }}
    >
      {/* Logo and Title */}
      <div className="d-flex align-items-center gap-2">
        <img
          src={logo}
          alt="Logo"
          style={{ width: "45px", height: "45px", borderRadius: "50%" }}
        />
        <h1 className="mb-0 fs-4">Beacon</h1>
      </div>

      {/* Profile Dropdown */}
      <div className="dropdown">
        <i
          className="bi bi-person-circle fs-4"
          onClick={toggleDropdown}
          style={{ cursor: "pointer" }}
        ></i>

        {showDropdown && (
          <div className="dropdown-menu dropdown-menu-end show mt-2" style={{ right: 0 }}>
            <div className="px-3 py-2 text-dark">
              <strong>{user?.name || "No name"}</strong><br />
              <small>{user?.email || "No email"}</small>
            </div>
            <div className="dropdown-divider"></div>
            <button className="dropdown-item text-danger" onClick={handleLogout}>
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
