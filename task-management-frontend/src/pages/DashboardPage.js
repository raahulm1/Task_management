import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Sidebar from "../components/Sidebar";
import { fetchProjects } from "../features/projects/projectsSlice";

function DashboardPage() {
  const dispatch = useDispatch();
  const { list: projects, loading, error } = useSelector((state) => state.projects);
  const [collapsed, setCollapsed] = useState(false);
  const [tab, setTab] = useState("Upcoming");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const tasks = [
    { id: 1, title: "Prepare Q3 financial report", dueDate: "2025-07-16", status: "Upcoming" },
    { id: 2, title: "UI review for onboarding flow", dueDate: "2025-07-17", status: "Upcoming" },
    { id: 3, title: "Client feedback session", dueDate: "2025-07-19", status: "Upcoming" },
    { id: 4, title: "Fix production bug #2345", dueDate: "2025-07-10", status: "Overdue" },
    { id: 5, title: "Submit final proposal to sales", dueDate: "2025-07-12", status: "Overdue" },
    { id: 6, title: "Review team goals", dueDate: "2025-07-06", status: "Completed" },
    { id: 7, title: "Send thank you email to client", dueDate: "2025-07-05", status: "Completed" },
    { id: 8, title: "Check analytics dashboard", dueDate: "2025-07-14", status: "Upcoming" },
  ];

  const today = new Date();

  const filteredTasks = tasks.filter((task) => {
    const due = new Date(task.dueDate);
    if (tab === "Upcoming") return due > today && task.status === "Upcoming";
    if (tab === "Overdue") return due < today && task.status === "Overdue";
    if (tab === "Completed") return task.status === "Completed";
    return true;
  });

  const handleAction = (action) => {
    alert(`You clicked "${action}"`);
    setDropdownOpen(false);
  };

  return (
    <div className="d-flex min-vh-100" style={{ backgroundColor: "#1e1e1e" }}>
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} projects={projects} loading={loading} error={error} />

      <div className="flex-grow-1 p-4 text-white" style={{ backgroundColor: "#252525", fontFamily: "Segoe UI, sans-serif" }}>
        
        {/* Header Row */}
        <div className="mb-5">
          {/* Top-left Dashboard heading */}
          <div className="d-flex justify-content-between align-items-start">
            <h6 className=" " style={{ fontSize: "20px", letterSpacing: "1px" }}>
              Home
            </h6>
          </div>

          {/* Centered Greeting */}
          <div className="text-center mt-3">
            <p className=" mb-1" style={{ fontSize: "14px" }}>
              {new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })}
            </p>
            <h3 className="fw-bold mb-3">Welcome aboard!</h3>

            <div className="d-flex justify-content-center gap-3 flex-wrap">
              <button className="btn btn-outline-light px-3 py-2">My week</button>
              <button className="btn btn-outline-light px-3 py-2">2 tasks completed</button>
              <button className="btn btn-outline-light px-3 py-2">3 collaborators</button>
            </div>
          </div>
        </div>

        {/* My Tasks Section */}
        <div
          className="p-4 rounded shadow-sm position-relative"
          style={{
            maxWidth: "900px",
            margin: "0 auto",
            border: "1px solid #444",
            backgroundColor: "#2f2f2f"
          }}
        >
          {/* Header with icon and 3-dots */}
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div className="d-flex align-items-center gap-2">
              <i className="bi bi-person-circle" style={{ fontSize: "20px", color: "#ccc" }}></i>
              <h5 className="fw-semibold mb-0">My Tasks</h5>
            </div>
            <div className="position-relative">
              <i
                className="bi bi-three-dots-vertical text-light"
                style={{ cursor: "pointer", fontSize: "18px" }}
                onClick={() => setDropdownOpen(!dropdownOpen)}
              />
              {dropdownOpen && (
                <div
                  className="position-absolute end-0 mt-2 p-2 rounded"
                  style={{
                    backgroundColor: "#444",
                    zIndex: 10,
                    minWidth: "150px",
                    border: "1px solid #555"
                  }}
                >
                  <div className="dropdown-item text-white py-1 px-2" style={{ cursor: "pointer" }} onClick={() => handleAction("Edit")}>
                    ✏️ Edit
                  </div>
                  <div className="dropdown-item text-white py-1 px-2" style={{ cursor: "pointer" }} onClick={() => handleAction("Delete")}>
                    🗑️ Delete
                  </div>
                  <div className="dropdown-item text-white py-1 px-2" style={{ cursor: "pointer" }} onClick={() => handleAction("Mark as Done")}>
                    ✅ Mark as Done
                  </div>
                </div>
              )}
            </div>
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
          {filteredTasks.length === 0 ? (
            <p className="text-secondary mt-4">No {tab.toLowerCase()} tasks found.</p>
          ) : (
            filteredTasks.map((task) => (
              <div
                key={task.id}
                className="d-flex justify-content-between align-items-center py-3"
                style={{
                  borderBottom: "0.5px solid #4c4c4c"
                }}
              >
                <span className="fw-medium">{task.title}</span>
                <small className="text-white" style={{ fontSize: "13px" }}>
                  {new Date(task.dueDate).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric"
                  })}
                </small>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
