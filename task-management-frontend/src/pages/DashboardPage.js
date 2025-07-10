// src/pages/DashboardPage.js
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getProjects } from "../api/projects";

function DashboardPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("Not authenticated");
        const data = await getProjects(token);
        setProjects(data);
      } catch (err) {
        setError("Failed to load projects");
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  if (loading) return <div>Loading projects...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div style={{ maxWidth: 600, margin: "2rem auto" }}>
      <h2>Your Projects</h2>
      <ul>
        {projects.length === 0 ? (
          <li>No projects found.</li>
        ) : (
          projects.map(proj => (
            <li key={proj.id} style={{ margin: "1rem 0" }}>
              <button onClick={() => navigate(`/project/${proj.id}`)}>
                {proj.name}
              </button>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}

export default DashboardPage;