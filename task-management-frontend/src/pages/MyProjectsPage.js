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
    <div className="d-flex min-vh-100" style={{ background: "#2c2c2c" }}>
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} projects={projects} loading={loading} error={error} />
      <div className="flex-grow-1 p-4 text-white">
        <h4 className="mb-4">My Projects</h4>
        <div className="p-4 rounded shadow-sm" style={{ backgroundColor: "#2a2a2a", maxWidth: "700px", margin: "0 auto" }}>
          <h4 className="text-center mb-4">👤My Projects</h4>
          {loading ? (
            <p className="text-center text-white">Loading projects...</p>
          ) : error ? (
            <p className="text-center text-danger">{error}</p>
          ) : (
            <ul className="list-group">
              {projects.length === 0 ? (
                <li className="list-group-item bg-dark text-white text-center border-0">No projects found.</li>
              ) : (
                projects.map((proj) => (
                  <li key={proj.id} className="list-group-item d-flex justify-content-between align-items-center bg-dark text-white border-secondary">
                    {proj.name}
                    <button onClick={() => navigate(`/project/${proj.id}`)} className="btn btn-sm btn-outline-primary">View</button>
                  </li>
                ))
              )}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

export default MyProjectsPage; 