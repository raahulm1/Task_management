// src/pages/LoginPage.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function LoginPage() {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

const handleLogin = async (e) => {
  e.preventDefault();
  try {
    const res = await fetch("/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, password }),
    });
    if (!res.ok) throw new Error("Login failed");
    const data = await res.json();
    localStorage.setItem("token", data.token);
    navigate("/dashboard");
  } catch (err) {
    alert("Login failed");
  }
};

  return (
    <form onSubmit={handleLogin} style={{ maxWidth: 300, margin: "5rem auto" }}>
      <h2>Login</h2>
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
      <button type="submit" style={{ width: "100%" }}>Login</button>
    </form>
  );
}

export default LoginPage;