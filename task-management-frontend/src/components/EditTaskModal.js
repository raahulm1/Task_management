import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { clearEditingTask, updateTaskAsync, deleteTask } from "../features/tasks/tasksSlice";
import { patchTaskAsync } from "../features/tasks/tasksSlice";
import { FaChevronDown } from "react-icons/fa";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useKeycloak } from '@react-keycloak/web';

function EditTaskModal({ users = [], sections = [], currentUser }) {
  const dispatch = useDispatch();
  const { keycloak } = useKeycloak();
  const editingTask = useSelector((state) => state.tasks.editingTask);
  const [task, setTask] = useState({});
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [changedFields, setChangedFields] = useState({});

  const statuses = ["Todo", "In Progress", "Completed"];

  useEffect(() => {
    if (editingTask) {
      setTask({
        name: editingTask.name || editingTask.title || "",
        description: editingTask.description || "",
        assignedTo: editingTask.assignedTo || editingTask.assignee || currentUser?.id || "",
        assignedBy: editingTask.assignedBy || currentUser?.id || "",
        dueDate: editingTask.dueDate ? new Date(editingTask.dueDate) : null,
        status: editingTask.status || "Todo",
        sectionId: editingTask.sectionId || "",
        priority: editingTask.priority || "",
      });
      setChangedFields({});
    }
  }, [editingTask, currentUser]);

  // Helper to track changes
  const handleFieldChange = (field, value) => {
    setTask((prev) => ({ ...prev, [field]: value }));
    setChangedFields((prev) => ({ ...prev, [field]: true }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!editingTask) return;
    setLoading(true);
    try {
      // Build updates object with only changed fields
      const updates = {};
      if (changedFields.name) updates.name = task.name;
      if (changedFields.description) updates.description = task.description;
      if (changedFields.status) updates.status = task.status;
      if (changedFields.assignedTo) updates.assignedTo = task.assignedTo || currentUser?.id || "";
      if (changedFields.assignedBy) updates.assignedBy = task.assignedBy || currentUser?.id || "";
      if (changedFields.dueDate) updates.dueDate = task.dueDate ? task.dueDate.toISOString().split("T")[0] : "";
      if (changedFields.sectionId) updates.sectionId = task.sectionId;
      if (changedFields.priority) updates.priority = task.priority;
      if (Object.keys(updates).length === 0) {
        setLoading(false);
        handleClose();
        return;
      }
      await dispatch(patchTaskAsync({
        taskId: editingTask.id || editingTask._id,
        updates,
        projectId: editingTask.projectId,
        token: keycloak.token,
      }));
      handleClose();
    } catch (error) {
      console.error("Failed to update task:", error);
      alert("Failed to update task");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!editingTask) return;
    setLoading(true);
    try {
      await dispatch(deleteTask({
        taskId: editingTask.id || editingTask._id,
        projectId: editingTask.projectId,
        token: keycloak.token,
      }));
      handleClose();
    } catch (error) {
      alert("Failed to delete task");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    dispatch(clearEditingTask());
  };

  if (!editingTask) return null;

  // Helper for user display
  const getUserDisplay = (user) => user ? `${user.name || user.email || user.id} ${user.email ? `(${user.email})` : ""}` : "Self";
  const selfUser = currentUser ? { id: currentUser.id, name: currentUser.name || "Self", email: currentUser.email } : null;
  const fieldRowStyle = { display: "flex", alignItems: "center", marginBottom: 12 };
  const labelStyle = { minWidth: 120, marginRight: 8, fontWeight: 500 };
  const inputStyle = { flex: 1, backgroundColor: "#1e1e1e", color: "white", border: "1px solid #555" };

  return (
    <div className="modal fade show d-block" style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content bg-dark text-white">
          <div className="modal-header border-secondary">
            <h5 className="modal-title">Edit Task</h5>
            <button type="button" className="btn-close btn-close-white" onClick={handleClose}></button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
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
              {sections && sections.length > 0 && (
                <div style={fieldRowStyle}>
                  <label className="form-label" style={labelStyle}>Section:</label>
                  <select
                    className="form-control"
                    value={task.sectionId}
                    onChange={e => handleFieldChange("sectionId", e.target.value)}
                    style={inputStyle}
                  >
                    {sections.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
              )}
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
            </div>
            <div className="modal-footer border-secondary">
              <button type="button" className="btn btn-secondary" onClick={handleClose} disabled={loading}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? "Updating..." : "Update Task"}</button>
              <button type="button" className="btn btn-danger" onClick={handleDelete} disabled={loading}>Delete</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default EditTaskModal; 