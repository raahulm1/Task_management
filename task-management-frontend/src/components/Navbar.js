import React from "react";
import { useNavigate } from "react-router-dom";
import logo from "../Image/Logo.jpg";

function Navbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <nav
      style={{
        padding: "0.5rem 1rem",
        borderBottom: "1px solid #444",
        display: "flex",
        alignItems: "center",
        gap: "1rem",
        background: "#1a1a1a", // dark charcoal black
        backgroundSize: "cover",
        backgroundPosition: "center",
        color: "white",
        height: "64px"
      }}
    >
      <img
        src={logo}
        alt="Logo"
        style={{
          width: "45px",
          height: "45px",
          objectFit: "contain",
          borderRadius: "50%"
        }}
      />
      <h1
        style={{
          margin: 0,
          color: "white",
          fontSize: "28px",
          fontWeight: "500"
        }}
      >
        Beacon
      </h1>
    </nav>
  );
}

export default Navbar;
