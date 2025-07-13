import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import TaskForm from "../components/TaskForm";
import Sidebar from "../components/Sidebar";

function AddTaskPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const handleAddTask = async (task) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/tasks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...task, projectId: id }),
      });

      if (!response.ok) throw new Error("Failed to add task");
      navigate(`/project/${id}`);
    } catch (error) {
      console.error(error);
      alert("Task creation failed");
    }
  };

  return (
    <div className="d-flex min-vh-100" style={{ backgroundColor: "#1e1e1e", color: "white" }}>
      <Sidebar collapsed={false} setCollapsed={() => {}} projects={[]} showProjects={false} loading={false} error={null} />

      <div className="flex-grow-1 p-4">
        <div className="p-4 rounded shadow-sm" style={{ backgroundColor: "rgba(0, 0, 0, 0.3)" }}>
          <h2 className="mb-4 text-center">Add Task to Project {id}</h2>
          <TaskForm onAdd={handleAddTask} onClose={() => navigate(`/project/${id}`)} />
        </div>
      </div>
    </div>
  );
}

export default AddTaskPage;