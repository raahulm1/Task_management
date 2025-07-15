import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import TaskForm from "../components/TaskForm";
import Sidebar from "../components/Sidebar";
import { getProjectById } from "../api/projects";
import { addTask } from "../api/tasks";
import { useState } from "react";
import { useKeycloak } from '@react-keycloak/web';

function AddTaskPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [projectName, setProjectName] = React.useState("");
  const [collapsed, setCollapsed] = useState(false);
  const { keycloak } = useKeycloak();

  React.useEffect(() => {
    const fetchProjectName = async () => {
      try {
        const project = await getProjectById(id, keycloak.token);
        setProjectName(project.name);
      } catch (err) {
        setProjectName("");
      }
    };
    fetchProjectName();
  }, [id, keycloak.token]);

  const handleAddTask = async (task) => {
    try {
      await addTask({ ...task, projectId: id }, keycloak.token);
      navigate(`/project/${id}`);
    } catch (error) {
      console.error(error);
      alert("Task creation failed");
    }
  };

  return (
    <div className="d-flex min-vh-100" style={{ backgroundColor: "#1e1e1e", color: "white" }}>
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} projects={[]} loading={false} error={null} showProjects={false} />

      <div className="flex-grow-1 p-4">
        <div className="p-4 rounded shadow-sm" style={{ backgroundColor: "rgba(0, 0, 0, 0.3)" }}>
          <h2 className="mb-4 text-center">Add Task to {projectName || id}</h2>
          <TaskForm onAdd={handleAddTask} onClose={() => navigate(`/project/${id}`)} />
        </div>
      </div>
    </div>
  );
}

export default AddTaskPage;