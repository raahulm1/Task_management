// ✅ ProjectPage.jsx with Redux
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchTasks, createTask, updateTaskStatus } from "../features/tasks/tasksSlice";
import Sidebar from "../components/Sidebar";
import KanbanBoard from "../components/KanbanBoard";
import ListView from "../components/ListView";
import Overview from "../components/Overview";
import ProjectNavigation from "../components/ProjectNavigation";
import EditTaskModal from "../components/EditTaskModal";
import { getProjectById } from "../api/projects";
import { useKeycloak } from '@react-keycloak/web';

function ProjectPage() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { keycloak } = useKeycloak();

  const { list: tasks, loading, error } = useSelector((state) => state.tasks);
  const [showTaskDropdown, setShowTaskDropdown] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [activeView, setActiveView] = useState("board"); // Default to board view
  const [collapsed, setCollapsed] = useState(false);

  const fetchProjectName = async () => {
    try {
      const project = await getProjectById(id, keycloak.token);
      setProjectName(project.name);
    } catch (err) {
      setProjectName("");
    }
  };

  useEffect(() => {
    if (keycloak.authenticated) {
      dispatch(fetchTasks({ projectId: id, token: keycloak.token }));
    }
  }, [dispatch, id, keycloak]);

  useEffect(() => {
    fetchProjectName();
    // eslint-disable-next-line
  }, [id, keycloak.token]);

  const handleAddTask = async (task) => {
    await dispatch(createTask({ task, projectId: id, token: keycloak.token }));
  };

  const handleStatusChange = (taskId, newStatus) => {
    dispatch(updateTaskStatus({ taskId, newStatus, projectId: id, token: keycloak.token }));
  };

  const renderView = () => {
    if (loading) {
      return <p className="text-center">Loading tasks...</p>;
    }
    
    if (error) {
      return <p className="text-danger text-center">{error}</p>;
    }

    switch (activeView) {
      case "overview":
        return <Overview tasks={tasks} projectName={projectName} />;
      case "list":
        return <ListView tasks={tasks} onStatusChange={handleStatusChange} />;
      case "board":
        return <KanbanBoard tasks={tasks} onStatusChange={handleStatusChange} />;
      default:
        return <KanbanBoard tasks={tasks} onStatusChange={handleStatusChange} />;
    }
  };

  return (
    <div className="d-flex min-vh-100" style={{ backgroundColor: "#1e1e1e", color: "white" }}>
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} projects={[]} loading={false} error={null} showProjects={false} />

      <div className="flex-grow-1 p-4">
        <div className="p-4 rounded shadow-sm" style={{ backgroundColor: "rgba(0, 0, 0, 0.3)" }}>
          <ProjectNavigation 
            activeView={activeView} 
            onViewChange={setActiveView} 
            projectName={projectName}
          />

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

          {renderView()}
        </div>
      </div>
      
      {/* Edit Task Modal */}
      <EditTaskModal />
    </div>
  );
}

export default ProjectPage;