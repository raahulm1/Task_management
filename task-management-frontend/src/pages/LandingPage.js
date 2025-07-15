import React from "react";
import { useKeycloak } from '@react-keycloak/web';
import { useNavigate } from "react-router-dom";
import "../styles/landing.css";
import keycloak from '../keycloak';

function LandingPage() {
  const { keycloak: kc, initialized } = useKeycloak();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (initialized && kc.authenticated) {
      navigate("/dashboard");
    }
  }, [initialized, kc.authenticated, navigate]);

  return (
    <div
      className="landing-page"
      style={{
        background: "linear-gradient(135deg, #202224ff, #1a1d23ff)",
        backgroundSize: "400% 400%",
        animation: "gradientMove 20s ease infinite",
        height: "100vh",
        padding: "2rem",
        color: "black",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center"
      }}
    >
      <h1 style={{ fontSize: "40px", marginBottom: "1rem", color:"white" }}>Welcome to Task Management App</h1>

      <p style={{ maxWidth: "600px", marginBottom: "1.5rem", color:"white" }}>
        Stay organized, boost productivity, and manage your team's workflow all in one place.
        Our Task Management Board helps you track progress, assign tasks, and meet deadlines with ease.
      </p>

      <ul style={{ paddingLeft: "1rem", textAlign: "left", maxWidth: "600px", marginBottom: "2rem", color:"white" }}>
        <li>Create, assign, and prioritize tasks easily</li>
        <li>Real-time team collaboration</li>
        <li>Customizable project boards</li>
        <li>Progress tracking and due date reminders</li>
      </ul>

      <div className="button-group" style={{ display: "flex", gap: "1rem" }}>
        <button className="btn btn-primary px-4" onClick={() => keycloak.login()}>Login</button>
        <button className="btn btn-outline-primary px-4" onClick={() => keycloak.register()}>Register</button>
      </div>
    </div>
  );
}

export default LandingPage;
