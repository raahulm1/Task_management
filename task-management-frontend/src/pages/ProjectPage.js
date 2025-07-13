// ✅ ProjectPage.jsx with Redux
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchTasks, createTask, updateTaskStatus } from "../features/tasks/tasksSlice";
import Sidebar from "../components/Sidebar";
import KanbanBoard from "../components/KanbanBoard";
import { getProjectById } from "../api/projects";

function ProjectPage() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { list: tasks, loading, error } = useSelector((state) => state.tasks);
  const [showTaskDropdown, setShowTaskDropdown] = useState(false);
  const [projectName, setProjectName] = useState("");

  const fetchProjectName = async () => {
    try {
      const token = localStorage.getItem("token");
      const project = await getProjectById(id, token);
      setProjectName(project.name);
    } catch (err) {
      setProjectName("");
    }
  };

  useEffect(() => {
    dispatch(fetchTasks(id));
  }, [dispatch, id]);

  useEffect(() => {
    fetchTasks();
    fetchProjectName();
    // eslint-disable-next-line
  }, [id]);

  const handleAddTask = async (task) => {
    await dispatch(createTask({ task, projectId: id }));
  };

  const handleStatusChange = (taskId, newStatus) => {
    dispatch(updateTaskStatus({ taskId, newStatus }));
  };

  return (
    <div className="d-flex min-vh-100" style={{ backgroundColor: "#1e1e1e", color: "white" }}>
      <Sidebar collapsed={false} setCollapsed={() => {}} projects={[]} loading={false} error={null} showProjects={false} />

      <div className="flex-grow-1 p-4">
        <div className="p-4 rounded shadow-sm" style={{ backgroundColor: "rgba(0, 0, 0, 0.3)" }}>
          <h2 className="mb-4 text-center">{projectName} - Kanban Board</h2>

          <div className="text-center mb-3 position-relative d-flex justify-content-center">
            <button className="btn btn-primary d-flex align-items-center" onClick={() => navigate(`/project/${id}/add-task`)}>
              <i className="bi bi-plus-lg me-2"></i> Add Task
            </button>
            <button className="btn btn-dark ms-2 d-flex align-items-center" onClick={() => setShowTaskDropdown((prev) => !prev)}>
              <i className="bi bi-caret-down-fill"></i>
            </button>

            {showTaskDropdown && (
              <div className="position-absolute mt-5 bg-dark text-white p-3 rounded shadow" style={{ top: "100%", zIndex: 10 }}>
                <div>
                  <strong>Task: Design UI</strong>
                  <ul className="mb-2">
                    <li>Subtask: Create wireframes</li>
                    <li>Subtask: Choose color palette</li>
                  </ul>
                </div>
              </div>
            )}
          </div>

          {loading ? (
            <p className="text-center">Loading tasks...</p>
          ) : error ? (
            <p className="text-danger text-center">{error}</p>
          ) : (
            <KanbanBoard tasks={tasks} onStatusChange={handleStatusChange} />
          )}
        </div>
      </div>
    </div>
  );
}

export default ProjectPage;