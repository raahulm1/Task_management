import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchProjects } from "../features/projects/projectsSlice";
import Sidebar from "../components/Sidebar";
import { useKeycloak } from '@react-keycloak/web';

function MyProjectsPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { keycloak } = useKeycloak();
  const { list: projects, loading, error } = useSelector((state) => state.projects);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    if (keycloak.authenticated) {
      dispatch(fetchProjects(keycloak.token));
    }
  }, [dispatch, keycloak]);

  return (
    <div className="d-flex min-vh-100" style={{ backgroundColor: "#1e1e1e" }}>
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} projects={projects} loading={loading} error={error} />
      <div className="flex-grow-1 p-4 text-white" style={{ backgroundColor: "#252525", fontFamily: "Segoe UI, sans-serif" }}>
        
        {/* Projects Section */}
        <div className="p-4 rounded shadow-sm position-relative" style={{ maxWidth: "900px", margin: "0 auto", border: "1px solid #444", backgroundColor: "#2f2f2f" }}>
          <div className="d-flex align-items-center gap-2 mb-3">
            <i className="bi bi-kanban" style={{ fontSize: "20px", color: "#ccc" }}></i>
            <h5 className="fw-semibold mb-0">My Projects</h5>
          </div>
          {loading ? (
            <p className="text-secondary mt-4">Loading projects...</p>
          ) : error ? (
            <p className="text-danger mt-4">{error}</p>
          ) : projects.length === 0 ? (
            <p className="text-secondary mt-4">No projects found.</p>
          ) : (
            projects.map((proj) => (
              <div
                key={proj.id}
                className="d-flex justify-content-between align-items-center py-3"
                style={{ borderBottom: "0.5px solid #4c4c4c" }}
              >
                <span
                  className="fw-medium"
                  style={{ cursor: "pointer", textDecoration: "underline dotted transparent" }}
                  onClick={() => navigate(`/project/${proj.id}`)}
                  onMouseOver={e => e.currentTarget.style.textDecoration = 'underline'}
                  onMouseOut={e => e.currentTarget.style.textDecoration = 'underline dotted transparent'}
                >
                  {proj.name}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default MyProjectsPage; 