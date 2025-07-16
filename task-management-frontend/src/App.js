
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import DashboardPage from "./pages/DashboardPage";
import ProjectPage from "./pages/ProjectPage";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'bootstrap-icons/font/bootstrap-icons.css';
import AddTaskPage from "./pages/AddTaskPage";
//import MyTasksPage from "./pages/MyTasksPage";
import MyProjectsPage from "./pages/MyProjectsPage";


function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        } />
        <Route path="/project/:id" element={
          <ProtectedRoute>
            <ProjectPage />
          </ProtectedRoute>
        } />
        <Route path="/project/:id/add-task" element={
          <ProtectedRoute>
            <AddTaskPage />
          </ProtectedRoute>
        } />
        <Route path="/my-projects" element={
          <ProtectedRoute>
            <MyProjectsPage />
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
}

export default App;