import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import keycloak from '../keycloak';

function Sidebar({ collapsed, setCollapsed, projects = [], loading, error, showProjects = true }) {
  const navigate = useNavigate();
  const [projectDropdownOpen, setProjectDropdownOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    keycloak.logout({ redirectUri: window.location.origin + '/' });
  };

  return (
    <div
      className="d-flex flex-column text-white"
      style={{
        backgroundColor: "#1f1f1f",
        width: collapsed ? "70px" : "220px",
        transition: "width 0.3s ease",
        padding: "1rem 0.5rem",
        overflowY: "auto",
      }}
    >
      {/* Toggle & Logo */}
      <div className="d-flex align-items-center mb-4 px-2">
        <button
          className="btn btn-sm btn-outline-light me-2"
          onClick={() => setCollapsed(!collapsed)}
        >
          <i className={`bi ${collapsed ? "bi-arrow-right" : "bi-arrow-left"}`}></i>
        </button>
        {!collapsed && (
          <span className="fw-bold" style={{ fontSize: "1.1rem" }}>
            CMart
          </span>
        )}
      </div>

      {/* Navigation */}
      <ul className="nav flex-column mb-3">
        {[
          { icon: "bi-house", label: "Home", path: "/dashboard" },
          { icon: "bi-check2-square", label: "My projects", path: "/projects" },
          { icon: "bi-list-task", label: "My Tasks", path: "/my-tasks" },
          { icon: "bi-inbox", label: "Inbox", path: "/inbox" },
        ].map((item, i) => (
          <li key={i} className="nav-item">
            <button
              className="nav-link text-white d-flex align-items-center"
              onClick={() => navigate(item.path)}
              style={{ padding: "0.5rem", borderRadius: "5px" }}
            >
              <i className={`${item.icon} me-2`}></i>
              {!collapsed && item.label}
            </button>
          </li>
        ))}
      </ul>

      <hr className="border-secondary my-2" />

      {/* Insights */}
      {!collapsed && <h6 className="text-muted px-2">Insights</h6>}
      <ul className="nav flex-column mb-3">
        {[
          { icon: "bi-graph-up", label: "Reporting", path: "/reports" },
          { icon: "bi-diagram-3", label: "Portfolios", path: "/portfolios" },
          { icon: "bi-bullseye", label: "Goals", path: "/goals" },
        ].map((item, i) => (
          <li key={i} className="nav-item">
            <button
              className="nav-link text-white d-flex align-items-center"
              onClick={() => navigate(item.path)}
              style={{ padding: "0.5rem", borderRadius: "5px" }}
            >
              <i className={`${item.icon} me-2`}></i>
              {!collapsed && item.label}
            </button>
          </li>
        ))}
      </ul>

      {/* My Projects Dropdown */}
      {!collapsed && showProjects && (
        <>
          <h6
            className="text-muted d-flex justify-content-between align-items-center px-2"
            style={{ cursor: "pointer" }}
            onClick={() => setProjectDropdownOpen(!projectDropdownOpen)}
          >
            <span className="d-flex align-items-center">
              <i className="bi bi-person me-2"></i>
              My Projects
            </span>
            <i className={`bi ${projectDropdownOpen ? "bi-chevron-up" : "bi-chevron-down"}`}></i>
          </h6>

          {projectDropdownOpen && (
            <ul className="list-unstyled mb-3 ps-3">
              {loading ? (
                <li className="text-white-50">Loading...</li>
              ) : error ? (
                <li className="text-danger">{error}</li>
              ) : projects.length === 0 ? (
                <li className="text-white-50">No projects found.</li>
              ) : (
                projects.map((proj) => (
                  <li
                    key={proj.id}
                    className="mb-1 text-white"
                    style={{ cursor: "pointer" }}
                    onClick={() => navigate(`/project/${proj.id}`)}
                  >
                    {proj.name}
                  </li>
                ))
              )}
            </ul>
          )}
        </>
      )}

      {/* Footer */}
      {!collapsed && (
        <button
          className="btn btn-outline-light w-100 mt-auto"
          onClick={() => alert("Invite teammates feature")}
        >
          <i className="bi bi-person-plus me-2"></i> Invite teammates
        </button>
      )}

      <button
        className={`btn btn-danger mt-2 ${collapsed ? "mx-auto" : ""}`}
        onClick={handleLogout}
      >
        <i className="bi bi-box-arrow-right"></i>
        {!collapsed && <span className="ms-2">Logout</span>}
      </button>
    </div>
  );
}

export default Sidebar;
