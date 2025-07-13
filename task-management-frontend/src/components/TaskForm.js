import React, { useState, useEffect, useRef } from "react";
import { FaChevronDown } from "react-icons/fa";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

function TaskForm({ onAdd, onClose }) {
  const [task, setTask] = useState({
    title: "",
    description: "",
    assignee: "",
    dueDate: null,
    status: "Todo",
  });

  const [showAssigneeDropdown, setShowAssigneeDropdown] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const assignees = ["Yashaswini", "Rohit", "Priya", "Anil", "Sara"];
  const assigneeRef = useRef();
  const dateRef = useRef();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (assigneeRef.current && !assigneeRef.current.contains(e.target)) {
        setShowAssigneeDropdown(false);
      }
      if (dateRef.current && !dateRef.current.contains(e.target)) {
        setShowDatePicker(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    onAdd({
      ...task,
      dueDate: task.dueDate ? task.dueDate.toISOString().split("T")[0] : "",
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="p-4 rounded" style={{ backgroundColor: "#343a40", color: "white" }}>
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

        {/* Assignee */}
        <div className="mb-3 position-relative" ref={assigneeRef}>
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
        <div className="mb-3 position-relative" ref={dateRef}>
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

        {/* Buttons */}
        <div className="mb-3 text-end">
          <button type="submit" className="btn btn-primary me-2">
            Add
          </button>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </form>
  );
}

export default TaskForm;
