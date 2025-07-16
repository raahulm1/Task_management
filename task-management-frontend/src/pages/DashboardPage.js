// ✅ DashboardPage.jsx with Redux
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchProjects } from "../features/projects/projectsSlice";
import Sidebar from "../components/Sidebar";
import { useKeycloak } from '@react-keycloak/web';

function DashboardPage() {
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

      <div className="container mt-4">
        <div className="alert alert-info text-center">This is dashboard for time being</div>
      </div>

   </div>
  );
}

export default DashboardPage;