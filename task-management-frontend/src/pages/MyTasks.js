import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Sidebar from "../components/Sidebar";
import { fetchProjects } from "../features/projects/projectsSlice";
import { useKeycloak } from '@react-keycloak/web';
import { getTasksForUser } from '../api/tasks';
import TaskDetailsModal from '../components/TaskDetailsModal';

function MyTasks() {
  const dispatch = useDispatch();
  const { keycloak } = useKeycloak();
  const { list: projects, loading: projectsLoading, error: projectsError } = useSelector((state) => state.projects);
  const [collapsed, setCollapsed] = useState(false);
  const [tab, setTab] = useState("Upcoming");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");


  useEffect(() => {
    const fetchTasks = async () => {
      if (!keycloak?.tokenParsed?.sub || !keycloak?.token) return;
      setLoading(true);
      setError("");
      try {
        const data = await getTasksForUser(keycloak.tokenParsed.sub, keycloak.token);
        setTasks(data);
      } catch (err) {
        setError("Failed to fetch tasks");
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, [keycloak]);

  const today = new Date();
  const filteredTasks = tasks.filter((task) => {
    const due = new Date(task.dueDate);
    if (tab === "Upcoming") return due > today && task.status !== 'Completed';
    if (tab === "Overdue") return due < today && task.status !== 'Completed';
    if (tab === "Completed") return task.status === 'Completed';
    return true;
  });

  const handleAction = (action) => {
    alert(`You clicked "${action}"`);
    setDropdownOpen(false);
  };

  return (
    <div className="d-flex min-vh-100" style={{ backgroundColor: "#1e1e1e" }}>
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} projects={projects} loading={projectsLoading} error={projectsError} />

      <div className="flex-grow-1 p-4 text-white" style={{ backgroundColor: "#252525", fontFamily: "Segoe UI, sans-serif" }}>
        {/* Top Heading 
        <div className="mb-4">
          <h6 style={{ fontSize: "20px", letterSpacing: "1px" }}>Tasks</h6>
        </div>  */}

        {/* My Tasks Section */}
        <div className="p-4 rounded shadow-sm position-relative" style={{ maxWidth: "900px", margin: "0 auto", border: "1px solid #444", backgroundColor: "#2f2f2f" }}>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div className="d-flex align-items-center gap-2">
              <i className="bi bi-person-circle" style={{ fontSize: "20px", color: "#ccc" }}></i>
              <h5 className="fw-semibold mb-0">My Tasks</h5>
            </div>
            {/*
            <div className="position-relative">
              <i
                className="bi bi-three-dots-vertical text-light"
                style={{ cursor: "pointer", fontSize: "18px" }}
                onClick={() => setDropdownOpen(!dropdownOpen)}
              />
              {dropdownOpen && (
                <div className="position-absolute end-0 mt-2 p-2 rounded" style={{ backgroundColor: "#444", zIndex: 10, minWidth: "150px", border: "1px solid #555" }}>
                  <div className="dropdown-item text-white py-1 px-2" style={{ cursor: "pointer" }} onClick={() => handleAction("Edit")}>✏️ Edit</div>
                  <div className="dropdown-item text-white py-1 px-2" style={{ cursor: "pointer" }} onClick={() => handleAction("Delete")}>🗑️ Delete</div>
                  <div className="dropdown-item text-white py-1 px-2" style={{ cursor: "pointer" }} onClick={() => handleAction("Mark as Done")}>✅ Mark as Done</div>
                </div>
              )}
            </div>*/}
          </div>

          {/* Tabs */}
          <div className="d-flex mb-4 border-bottom" style={{ gap: "30px", fontSize: "16px", cursor: "pointer" }}>
            {["Upcoming", "Overdue", "Completed"].map((t) => (
              <div
                key={t}
                onClick={() => setTab(t)}
                style={{
                  paddingBottom: "8px",
                  borderBottom: tab === t ? "2px solid white" : "2px solid transparent",
                  color: tab === t ? "#fff" : "#aaa",
                  transition: "border-bottom 0.2s ease"
                }}
              >
                {t}
              </div>
            ))}
          </div>

          {/* Task List */}
          {loading ? (
            <p className="text-secondary mt-4">Loading tasks...</p>
          ) : error ? (
            <p className="text-danger mt-4">{error}</p>
          ) : filteredTasks.length === 0 ? (
            <p className="text-secondary mt-4">No {tab.toLowerCase()} tasks found.</p>
          ) : (
            filteredTasks.map((task) => (
              <div
                key={task.id}
                className="d-flex justify-content-between align-items-center py-3"
                style={{ borderBottom: "0.5px solid #4c4c4c", cursor: "pointer" }}
                onClick={() => {
                  setSelectedTask(task);
                  setShowModal(true);
                }}
              >
                <span className="fw-medium">{task.name || task.title}</span>
                <small className="text-white" style={{ fontSize: "13px" }}>
                  {task.dueDate ? new Date(task.dueDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : ''}
                </small>
              </div>
            ))
          )}
        </div>
      </div>
      {/* Task Modal */}
      {showModal && selectedTask && (
        <TaskDetailsModal
          task={selectedTask}
          onClose={() => setShowModal(false)}
          users={keycloak?.tokenParsed ? [{ id: keycloak.tokenParsed.sub, name: keycloak.tokenParsed.name, email: keycloak.tokenParsed.email }] : []}
        />
      )}
    </div>
  );
}

export default MyTasks;
