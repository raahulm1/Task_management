import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { clearEditingTask, updateTaskAsync } from "../features/tasks/tasksSlice";
import { FaChevronDown } from "react-icons/fa";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

function EditTaskModal() {
  const dispatch = useDispatch();
  const editingTask = useSelector((state) => state.tasks.editingTask);
  const [task, setTask] = useState({
    title: "",
    description: "",
    assignee: "",
    dueDate: null,
    status: "Todo",
  });
  const [showAssigneeDropdown, setShowAssigneeDropdown] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);

  const assignees = ["Yashaswini", "Rohit", "Priya", "Anil", "Sara"];
  const statuses = ["Todo", "In Progress", "Completed"];

  useEffect(() => {
    if (editingTask) {
      setTask({
        title: editingTask.title || "",
        description: editingTask.description || "",
        assignee: editingTask.assignee || "",
        dueDate: editingTask.dueDate ? new Date(editingTask.dueDate) : null,
        status: editingTask.status || "Todo",
      });
    }
  }, [editingTask]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!editingTask) return;

    setLoading(true);
    try {
      await dispatch(updateTaskAsync({
        taskId: editingTask.id,
        taskData: {
          ...task,
          dueDate: task.dueDate ? task.dueDate.toISOString().split("T")[0] : "",
        },
        projectId: editingTask.projectId,
      }));
      
      handleClose();
    } catch (error) {
      console.error("Failed to update task:", error);
      alert("Failed to update task");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    dispatch(clearEditingTask());
  };

  if (!editingTask) return null;

  return (
    <div className="modal fade show d-block" style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content bg-dark text-white">
          <div className="modal-header border-secondary">
            <h5 className="modal-title">Edit Task</h5>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={handleClose}
            ></button>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              {/* Title */}
              <div className="mb-3">
                <label className="form-label">Title</label>
                <input
                  type="text"
                  value={task.title}
                  onChange={(e) => setTask({ ...task, title: e.target.value })}
                  className="form-control"
                  required
                  style={{
                    backgroundColor: "#1e1e1e",
                    color: "white",
                    border: "1px solid #555",
                  }}
                />
              </div>

              {/* Description */}
              <div className="mb-3">
                <label className="form-label">Description</label>
                <textarea
                  value={task.description}
                  onChange={(e) => setTask({ ...task, description: e.target.value })}
                  className="form-control"
                  required
                  style={{
                    backgroundColor: "#1e1e1e",
                    color: "white",
                    border: "1px solid #555",
                  }}
                />
              </div>

              {/* Status */}
              <div className="mb-3">
                <label className="form-label">Status</label>
                <select
                  value={task.status}
                  onChange={(e) => setTask({ ...task, status: e.target.value })}
                  className="form-control"
                  style={{
                    backgroundColor: "#1e1e1e",
                    color: "white",
                    border: "1px solid #555",
                  }}
                >
                  {statuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>

              {/* Assignee */}
              <div className="mb-3 position-relative">
                <div className="d-flex align-items-center justify-content-between">
                  <label className="form-label mb-0">Assignee</label>
                  <FaChevronDown
                    style={{
                      cursor: "pointer",
                      transform: showAssigneeDropdown ? "rotate(180deg)" : "rotate(0deg)",
                      transition: "transform 0.2s ease",
                    }}
                    onClick={() => setShowAssigneeDropdown((prev) => !prev)}
                  />
                </div>
                <input
                  type="text"
                  readOnly
                  value={task.assignee}
                  className="form-control mt-1"
                  style={{
                    backgroundColor: "#1e1e1e",
                    color: "white",
                    border: "1px solid #555",
                  }}
                />
                {showAssigneeDropdown && (
                  <div
                    className="position-absolute w-100 mt-1"
                    style={{
                      backgroundColor: "#1e1e1e",
                      border: "1px solid #555",
                      zIndex: 1000,
                    }}
                  >
                    {assignees.map((name) => (
                      <div
                        key={name}
                        onClick={() => {
                          setTask({ ...task, assignee: name });
                          setShowAssigneeDropdown(false);
                        }}
                        style={{
                          padding: "8px",
                          cursor: "pointer",
                          color: "white",
                          borderBottom: "1px solid #444",
                        }}
                      >
                        {name}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Due Date */}
              <div className="mb-3 position-relative">
                <div className="d-flex align-items-center justify-content-between">
                  <label className="form-label mb-0">Due Date</label>
                  <FaChevronDown
                    style={{
                      cursor: "pointer",
                      transform: showDatePicker ? "rotate(180deg)" : "rotate(0deg)",
                      transition: "transform 0.2s ease",
                    }}
                    onClick={() => setShowDatePicker((prev) => !prev)}
                  />
                </div>
                <input
                  type="text"
                  readOnly
                  value={task.dueDate ? task.dueDate.toISOString().split("T")[0] : ""}
                  className="form-control mt-1"
                  style={{
                    backgroundColor: "#1e1e1e",
                    color: "white",
                    border: "1px solid #555",
                  }}
                />
                {showDatePicker && (
                  <div className="position-absolute mt-2 z-3">
                    <DatePicker
                      selected={task.dueDate}
                      onChange={(date) => {
                        setTask({ ...task, dueDate: date });
                        setShowDatePicker(false);
                      }}
                      inline
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="modal-footer border-secondary">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleClose}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? "Updating..." : "Update Task"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default EditTaskModal; 