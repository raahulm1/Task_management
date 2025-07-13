import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/auth.css";

function RegisterPage() {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, password }),
      });
      if (!res.ok) throw new Error("Register failed");
      navigate("/login");
    } catch (err) {
      alert("Register failed");
    }
  };

  return (
    <div className="auth-page">
      <form className="auth-container" onSubmit={handleRegister}>
        <h2 style={{ color: "white" }}>Register</h2>
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={e => setName(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        <button type="submit">Register</button>
      </form>
    </div>
  );
}

export default RegisterPage;
