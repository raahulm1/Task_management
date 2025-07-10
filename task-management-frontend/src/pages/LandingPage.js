// src/pages/LandingPage.js
import React from "react";
import { Link } from "react-router-dom";

function LandingPage() {
  return (
    <div style={{ textAlign: "center", marginTop: "5rem" }}>
      <h1>Welcome to Task Management App</h1>
      <Link to="/login"><button>Login</button></Link>
      <Link to="/register" style={{ marginLeft: "1rem" }}><button>Register</button></Link>
    </div>
  );
}

export default LandingPage;