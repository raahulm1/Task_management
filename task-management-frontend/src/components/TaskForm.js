import React, { useState, useEffect } from "react";
import { FaChevronDown } from "react-icons/fa";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { createSection } from "../api/sections";

function TaskForm({ onAdd, onClose, sections = [], users = [], token, projectId, onSectionCreated }) {
  const [task, setTask] = useState({
    title: "",
    description: "",
    assignedTo: "",
    dueDate: null,
    status: "Todo",
    sectionId: sections && sections.length > 0 ? sections[0].id : "",
    priority: "",
    newSectionName: ""
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [sectionOptions, setSectionOptions] = useState(sections);
  const [sectionLoading, setSectionLoading] = useState(false);
  const [sectionError, setSectionError] = useState("");
  const statuses = ["Todo", "In Progress", "Completed"];

  useEffect(() => {
    setSectionOptions([...sections]);
    // eslint-disable-next-line
  }, [JSON.stringify(sections)]);

  const handleFieldChange = (field, value) => {
    setTask((prev) => ({ ...prev, [field]: value }));
  };

  const handleSectionInput = (e) => {
    const value = e.target.value;
    setTask((prev) => ({ ...prev, newSectionName: value, sectionId: value }));
  };

  const handleCreateSection = async () => {
    if (!task.newSectionName || !projectId || !token) return;
    setSectionLoading(true);
    setSectionError("");
    try {
      const newSection = await createSection({ name: task.newSectionName, projectId }, token);
      setSectionOptions((prev) => [...prev, newSection]);
      setTask((prev) => ({ ...prev, sectionId: newSection.id, newSectionName: "" }));
      if (onSectionCreated) onSectionCreated();
    } catch (err) {
      setSectionError("Failed to create section");
    } finally {
      setSectionLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (sectionOptions && sectionOptions.length > 0 && !task.sectionId) return;
    onAdd({
      ...task,
      dueDate: task.dueDate ? task.dueDate.toISOString().split("T")[0] : "",
      sectionId: task.sectionId,
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
            onChange={(e) => handleFieldChange("title", e.target.value)}
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
            onChange={(e) => handleFieldChange("description", e.target.value)}
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
            onChange={(e) => handleFieldChange("status", e.target.value)}
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

        {/* Assignee Dropdown */}
        <div className="mb-3">
          <label className="form-label">Assignee</label>
          <select
            className="form-control"
            value={task.assignedTo}
            onChange={e => handleFieldChange("assignedTo", e.target.value)}
            required
          >
            <option value="">Select assignee</option>
            {users.map(u => (
              <option key={u.id || u.keycloakId} value={u.id || u.keycloakId}>{u.name} ({u.email})</option>
            ))}
          </select>
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
                  handleFieldChange("dueDate", date);
                  setShowDatePicker(false);
                }}
                inline
              />
            </div>
          )}
        </div>

        {/* Section Dropdown with add new */}
        <div className="mb-3">
          <label className="form-label">Section</label>
          <input
            className="form-control mb-2"
            type="text"
            placeholder="Type or select section"
            value={task.newSectionName || sectionOptions.find(s => s.id === task.sectionId)?.name || ""}
            onChange={handleSectionInput}
            list="section-list"
          />
          <datalist id="section-list">
            {sectionOptions.map(s => (
              <option key={s.id} value={s.name} />
            ))}
          </datalist>
          {/* If typed section doesn't exist, show create button */}
          {task.newSectionName && !sectionOptions.some(s => s.name === task.newSectionName) && (
            <button type="button" className="btn btn-sm btn-outline-primary mt-2" onClick={handleCreateSection} disabled={sectionLoading}>
              {sectionLoading ? "Creating..." : `Create section "${task.newSectionName}"`}
            </button>
          )}
          {sectionError && <div className="text-danger mt-1">{sectionError}</div>}
        </div>

        {/* Priority */}
        <div className="mb-3">
          <label className="form-label">Priority</label>
          <select
            className="form-control"
            value={task.priority}
            onChange={e => handleFieldChange("priority", e.target.value)}
          >
            <option value="">Select priority</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>

        {/* Buttons */}
        <div className="mb-3 text-end">
          <button type="submit" className="btn btn-primary me-2" disabled={sectionOptions && sectionOptions.length > 0 && !task.sectionId}>
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
