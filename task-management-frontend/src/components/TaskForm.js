import React, { useState, useEffect } from "react";
import { FaChevronDown } from "react-icons/fa";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { createSection } from "../api/sections";

function TaskForm({ onAdd, onClose, sections = [], users = [], token, projectId, onSectionCreated, currentUser }) {
  const [task, setTask] = useState({
    name: "",
    description: "",
    assignedTo: currentUser?.id || "",
    assignedBy: currentUser?.id || "",
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

  // If currentUser changes, update defaults
  useEffect(() => {
    setTask((prev) => ({
      ...prev,
      assignedTo: prev.assignedTo || currentUser?.id || "",
      assignedBy: prev.assignedBy || currentUser?.id || ""
    }));
  }, [currentUser]);

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
    if (!task.name) return; // Enforce name
    // Default assignedTo/assignedBy to self if blank
    const assignedTo = task.assignedTo || currentUser?.id || "";
    const assignedBy = task.assignedBy || currentUser?.id || "";
    onAdd({
      ...task,
      assignedTo,
      assignedBy,
      dueDate: task.dueDate ? task.dueDate.toISOString().split("T")[0] : "",
      sectionId: task.sectionId,
    });
  };

  // Helper for user display
  const getUserDisplay = (user) => user ? `${user.name || user.email || user.id} ` : "Self";

  // Find self user object for dropdown
  const selfUser = currentUser ? { id: currentUser.id, name: currentUser.name || "Self", email: currentUser.email } : null;

  // Compact horizontal field style
  const fieldRowStyle = { display: "flex", alignItems: "center", marginBottom: 12 };
  const labelStyle = { minWidth: 120, marginRight: 8, fontWeight: 500 };
  const inputStyle = { flex: 1, backgroundColor: "#1e1e1e", color: "white", border: "1px solid #555" };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 500, margin: "0 auto" }}>
      <div className="p-3 rounded" style={{ backgroundColor: "#343a40", color: "white" }}>
        {/* Name */}
        <div style={fieldRowStyle}>
          <label className="form-label" style={labelStyle}>Name<span style={{color:'red'}}>*</span>:</label>
          <input
            type="text"
            value={task.name}
            onChange={(e) => handleFieldChange("name", e.target.value)}
            className="form-control"
            required
            style={inputStyle}
          />
        </div>
        {/* Description */}
        <div style={fieldRowStyle}>
          <label className="form-label" style={labelStyle}>Description:</label>
          <input
            type="text"
            value={task.description}
            onChange={(e) => handleFieldChange("description", e.target.value)}
            className="form-control"
            style={inputStyle}
          />
        </div>
        {/* Status */}
        <div style={fieldRowStyle}>
          <label className="form-label" style={labelStyle}>Status:</label>
          <select
            value={task.status}
            onChange={(e) => handleFieldChange("status", e.target.value)}
            className="form-control"
            style={inputStyle}
          >
            {statuses.map((status) => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>
        {/* Assigned To */}
        <div style={fieldRowStyle}>
          <label className="form-label" style={labelStyle}>Assigned To:</label>
          <select
            className="form-control"
            value={task.assignedTo || ""}
            onChange={e => handleFieldChange("assignedTo", e.target.value)}
            style={inputStyle}
          >
            {selfUser && <option value={selfUser.id}>Self ({getUserDisplay(selfUser)})</option>}
            {users.filter(u => u.id !== selfUser?.id).map(u => (
              <option key={u.id || u.keycloakId} value={u.id || u.keycloakId}>{getUserDisplay(u)}</option>
            ))}
          </select>
        </div>
        {/* Assigned By */}
        <div style={fieldRowStyle}>
          <label className="form-label" style={labelStyle}>Assigned By:</label>
          <select
            className="form-control"
            value={task.assignedBy || ""}
            onChange={e => handleFieldChange("assignedBy", e.target.value)}
            style={inputStyle}
          >
            {selfUser && <option value={selfUser.id}>Self ({getUserDisplay(selfUser)})</option>}
            {users.filter(u => u.id !== selfUser?.id).map(u => (
              <option key={u.id || u.keycloakId} value={u.id || u.keycloakId}>{getUserDisplay(u)}</option>
            ))}
          </select>
        </div>
        {/* Due Date */}
        <div style={fieldRowStyle}>
          <label className="form-label" style={labelStyle}>Due Date:</label>
          <div style={{ flex: 1, position: "relative" }}>
            <input
              type="text"
              readOnly
              value={task.dueDate ? task.dueDate.toISOString().split("T")[0] : ""}
              className="form-control"
              style={{ ...inputStyle, cursor: "pointer" }}
              onClick={() => setShowDatePicker((prev) => !prev)}
            />
            {showDatePicker && (
              <div style={{ position: "absolute", zIndex: 10, top: 38 }}>
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
        </div>
        {/* Section */}
        <div style={fieldRowStyle}>
          <label className="form-label" style={labelStyle}>Section:</label>
          <input
            className="form-control mb-2"
            type="text"
            placeholder="Type or select section"
            value={task.newSectionName || sectionOptions.find(s => s.id === task.sectionId)?.name || ""}
            onChange={handleSectionInput}
            list="section-list"
            style={inputStyle}
          />
          <datalist id="section-list">
            {sectionOptions.map(s => (
              <option key={s.id} value={s.name} />
            ))}
          </datalist>
          {task.newSectionName && !sectionOptions.some(s => s.name === task.newSectionName) && (
            <button type="button" className="btn btn-sm btn-outline-primary ms-2" onClick={handleCreateSection} disabled={sectionLoading}>
              {sectionLoading ? "Creating..." : `Create section "${task.newSectionName}"`}
            </button>
          )}
          {sectionError && <div className="text-danger mt-1">{sectionError}</div>}
        </div>
        {/* Priority */}
        <div style={fieldRowStyle}>
          <label className="form-label" style={labelStyle}>Priority:</label>
          <select
            className="form-control"
            value={task.priority}
            onChange={e => handleFieldChange("priority", e.target.value)}
            style={inputStyle}
          >
            <option value="">Select priority</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>
        {/* Buttons */}
        <div className="text-end mt-3">
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
