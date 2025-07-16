import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useKeycloak } from '@react-keycloak/web';
import {
  updateTaskStatus,
  deleteTask,
  startEditingTask,
} from "../features/tasks/tasksSlice";

function KanbanBoard({ tasks }) {
  const dispatch = useDispatch();
  const { keycloak } = useKeycloak();
  const statuses = ["Todo", "In Progress", "Completed"];
  const [messageTaskId, setMessageTaskId] = useState(null);
  const [messageText, setMessageText] = useState("");

  const handleDragStart = (e, taskId) => {
    e.dataTransfer.setData("taskId", taskId);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, newStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData("taskId");
    const projectId = tasks[0]?.projectId;
    dispatch(updateTaskStatus({ taskId, newStatus, projectId, token: keycloak.token }));

    setMessageTaskId(taskId);
    setMessageText(`Moved to ${newStatus}`);
    setTimeout(() => {
      setMessageTaskId(null);
      setMessageText("");
    }, 2500);
  };

  // ✅ Border color based on status
  const getStatusBorder = (status) => {
    switch ((status || "").toLowerCase()) {
      case "todo":
        return "3px solid #0d6efd"; // Blue
      case "in progress":
        return "3px solid #ffc107"; // Yellow
      case "completed":
        return "3px solid #28a745"; // Green
      default:
        return "1px solid #6c757d"; // Gray
    }
  };

  const handleDelete = (taskId) => {
    dispatch(deleteTask({ taskId, projectId: tasks[0]?.projectId }));
  };

  const handleEdit = (task) => {
    dispatch(startEditingTask(task));
  };

  return (
    <div className="row">
      {statuses.map((status) => {
        const filteredTasks = tasks.filter(
          (task) =>
            (task.status || "").toLowerCase() === status.toLowerCase()
        );

        return (
          <div
            key={status}
            className="col-md-4 mb-3"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, status)}
          >
            <div
              className="h-100"
              style={{
                backgroundColor: "rgba(0, 0, 0, 0.3)", // SAME BG for all columns ✅
                color: "white",
                borderRadius: "0.75rem",
                padding: "1rem",
                minHeight: "450px",
              }}
            >
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h4 className="mb-0">{status}</h4>
                <span className="badge bg-light text-dark">
                  {filteredTasks.length}
                </span>
              </div>

              {filteredTasks.map((task) => (
                <div
                  key={task.id}
                  className="mb-3 p-3 rounded task-hover"
                  draggable
                  onDragStart={(e) => handleDragStart(e, task.id)}
                  style={{
                    backgroundColor: "#343a40",
                    color: "white",
                    border: getStatusBorder(task.status),
                    transition: "all 0.3s ease",
                  }}
                >
                  <div className="d-flex justify-content-between align-items-center">
                    <h5 className="mb-1">{task.title}</h5>
                    <div>
                      <button
                        className="btn btn-sm btn-outline-light me-1"
                        onClick={() => handleEdit(task)}
                      >
                        <i className="bi bi-pencil-fill"></i>
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleDelete(task.id)}
                      >
                        <i className="bi bi-trash-fill"></i>
                      </button>
                    </div>
                  </div>

                  {status !== "Completed" && (
                    <p className="mb-1">{task.description}</p>
                  )}
                  {task.priority && (
                    <small className="text-muted">
                      Priority: {task.priority}
                    </small>
                  )}

                  {messageTaskId === task.id && (
                    <div
                      className="mt-2 text-success"
                      style={{ fontSize: "0.9rem" }}
                    >
                      {messageText}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default KanbanBoard;
