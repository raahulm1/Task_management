// src/pages/RegisterPage.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

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
    <form onSubmit={handleRegister} style={{ maxWidth: 300, margin: "5rem auto" }}>
      <h2>Register</h2>
      <input
        type="text"
        placeholder="Name"
        value={name}
        onChange={e => setName(e.target.value)}
        required
        style={{ width: "100%", marginBottom: 10 }}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        required
        style={{ width: "100%", marginBottom: 10 }}
      />
      <button type="submit" style={{ width: "100%" }}>Register</button>
    </form>
  );
}

export default RegisterPage;