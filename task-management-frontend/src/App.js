import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useKeycloak } from "@react-keycloak/web";
import LandingPage from "./pages/LandingPage";
import DashboardPage from "./pages/DashboardPage";
import ProjectPage from "./pages/ProjectPage";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'bootstrap-icons/font/bootstrap-icons.css';
import AddTaskPage from "./pages/AddTaskPage";
import MyProjectsPage from "./pages/MyProjectsPage";
import MyTasks from "./pages/MyTasks";
import keycloakInstance from "./keycloak"; // ✅ Renamed

function App() {
  const { keycloak } = useKeycloak(); // ✅ Safe to use now

  return (
    <Router>
      <Navbar keycloak={keycloak} /> {/* ✅ Correct usage */}
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/project/:id"
          element={
            <ProtectedRoute>
              <ProjectPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/project/:id/add-task"
          element={
            <ProtectedRoute>
              <AddTaskPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-projects"
          element={
            <ProtectedRoute>
              <MyProjectsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-tasks"
          element={
            <ProtectedRoute>
              <MyTasks />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
