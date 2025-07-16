import React, { useState, useEffect, useRef } from "react";
import { FaChevronDown } from "react-icons/fa";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

function TaskForm({ onAdd, onClose, sections = [], users = [] }) {
  const [task, setTask] = useState({
    title: "",
    description: "",
    assignedTo: users && users.length > 0 ? users[0].id : "",
    dueDate: null,
    status: "Todo",
    sectionId: sections && sections.length > 0 ? sections[0].id : ""
  });

  // Ensure sectionId is set to the first section if sections change
  useEffect(() => {
    if (sections && sections.length > 0) {
      setTask((prev) => ({ ...prev, sectionId: prev.sectionId || sections[0].id }));
    }
  }, [sections]);

  const [showAssigneeDropdown, setShowAssigneeDropdown] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

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
    if (sections && sections.length > 0 && !task.sectionId) return;
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

        {/* Assignee Dropdown */}
        <div className="mb-3">
          <label className="form-label">Assignee</label>
          <select
            className="form-control"
            value={task.assignedTo}
            onChange={e => setTask({ ...task, assignedTo: e.target.value })}
            required
          >
            <option value="">Select assignee</option>
            {users.map(u => (
              <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
            ))}
          </select>
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

        {/* Section Dropdown */}
        {sections && sections.length > 0 && (
          <div className="mb-3">
            <label className="form-label">Section</label>
            <select
              className="form-control"
              value={task.sectionId}
              onChange={e => setTask({ ...task, sectionId: e.target.value })}
              required
            >
              {sections.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
        )}

        {/* Buttons */}
        <div className="mb-3 text-end">
          <button type="submit" className="btn btn-primary me-2" disabled={sections && sections.length > 0 && !task.sectionId}>
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
