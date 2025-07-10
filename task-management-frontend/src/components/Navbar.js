// src/components/Navbar.js
import React from "react";
import { Link, useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear auth (token, etc.)
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <nav style={{ padding: "1rem", borderBottom: "1px solid #ccc" }}>
      <Link to="/dashboard" style={{ marginRight: "1rem" }}>Dashboard</Link>
      <button onClick={handleLogout}>Logout</button>
    </nav>
  );
}

export default Navbar;