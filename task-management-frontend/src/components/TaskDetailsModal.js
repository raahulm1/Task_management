import React, { useState, useRef } from "react";

function TaskDetailsModal({ task, onClose, users = [], onUpdate, onDelete, subtasks = [], onToggleSubtaskComplete, onEditSubtask, onDeleteSubtask }) {
  const [editingField, setEditingField] = useState(null);
  const [editValue, setEditValue] = useState("");
  const editableRef = useRef(null);

  if (!task) return null;

  const getAssignedByDisplay = (userId) => {
    if (!userId) return 'Unassigned';
    if (users && users.length > 0) {
      const user = users.find(u => u.keycloakId === userId || u.id === userId);
      return user ? user.name : 'Self';
    }
    return userId;
  };
  const getStatusBadgeClass = (status) => {
    switch ((status || '').toLowerCase()) {
      case 'todo':
        return 'badge bg-primary';
      case 'in progress':
        return 'badge bg-warning text-dark';
      case 'completed':
        return 'badge bg-success';
      default:
        return 'badge bg-secondary';
    }
  };
  const handleFieldDoubleClick = (field) => {
    setEditingField(field);
    setEditValue(task[field] || "");
    setTimeout(() => {
      if (editableRef.current) editableRef.current.focus();
    }, 0);
  };
  const handleFieldInput = (e) => {
    setEditValue(e.target.innerText);
  };
  const handleFieldBlurOrEnter = (field, e) => {
    if (e && e.type === 'keydown' && e.key !== 'Enter') return;
    if (onUpdate && editValue !== task[field]) {
      onUpdate({ ...task, [field]: editValue });
    }
    setEditingField(null);
    setEditValue("");
  };
  return (
    <div className="offcanvas offcanvas-end show" style={{ width: 400, backgroundColor: '#23272b', color: 'white' }} tabIndex="-1">
      <div className="offcanvas-header border-bottom border-secondary">
        <h5 className="offcanvas-title">Task Details</h5>
        <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
      </div>
      <div className="offcanvas-body">
        <div className="mb-3">
          <label className="form-label">Name</label>
          {editingField === 'name' ? (
            <div
              contentEditable
              suppressContentEditableWarning
              onInput={handleFieldInput}
              onBlur={e => handleFieldBlurOrEnter('name', e)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleFieldBlurOrEnter('name', e); } }}
              style={{ outline: 'none', borderBottom: '1px solid #0d6efd', background: 'transparent', color: 'white', fontWeight: 'bold', padding: '2px 4px', minWidth: '100px' }}
              ref={editableRef}
            >
              {editValue}
            </div>
          ) : (
            <div onDoubleClick={() => handleFieldDoubleClick('name')} className="border-bottom py-1">
              <strong>{task.name}</strong>
            </div>
          )}
        </div>
        <div className="mb-3">
          <label className="form-label">Assigned By</label>
          <div className="border-bottom py-1">
            {getAssignedByDisplay(task.assignedBy)}
          </div>
        </div>
        <div className="mb-3">
          <label className="form-label">Due Date</label>
          {editingField === 'dueDate' ? (
            <input
              type="date"
              value={editValue}
              onChange={e => setEditValue(e.target.value)}
              onBlur={e => handleFieldBlurOrEnter('dueDate', e)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleFieldBlurOrEnter('dueDate', e); } }}
              className="form-control form-control-sm"
              style={{ background: 'none', color: 'white', border: 'none', boxShadow: 'none' }}
              ref={editableRef}
            />
          ) : (
            <div onDoubleClick={() => handleFieldDoubleClick('dueDate')} className="border-bottom py-1">
              {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}
            </div>
          )}
        </div>
        <div className="mb-3">
          <label className="form-label">Status</label>
          {editingField === 'status' ? (
            <select
              value={editValue}
              onChange={e => setEditValue(e.target.value)}
              onBlur={e => handleFieldBlurOrEnter('status', e)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleFieldBlurOrEnter('status', e); } }}
              className="form-control form-control-sm"
              style={{ background: 'none', color: 'white', border: 'none', boxShadow: 'none' }}
              ref={editableRef}
            >
              <option value="Todo">Todo</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          ) : (
            <div onDoubleClick={() => handleFieldDoubleClick('status')} className="border-bottom py-1">
              <span className={getStatusBadgeClass(task.status)}>
                {task.status || 'Todo'}
              </span>
            </div>
          )}
        </div>
        <div className="mb-3">
          <label className="form-label">Priority</label>
          {editingField === 'priority' ? (
            <select
              value={editValue}
              onChange={e => setEditValue(e.target.value)}
              onBlur={e => handleFieldBlurOrEnter('priority', e)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleFieldBlurOrEnter('priority', e); } }}
              className="form-control form-control-sm"
              style={{ background: 'none', color: 'white', border: 'none', boxShadow: 'none' }}
              ref={editableRef}
            >
              <option value="">None</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          ) : (
            <div onDoubleClick={() => handleFieldDoubleClick('priority')} className="border-bottom py-1">
              {task.priority || 'None'}
            </div>
          )}
        </div>
        <div className="mb-3">
          <label className="form-label">Description</label>
          {editingField === 'description' ? (
            <div
              contentEditable
              suppressContentEditableWarning
              onInput={handleFieldInput}
              onBlur={e => handleFieldBlurOrEnter('description', e)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleFieldBlurOrEnter('description', e); } }}
              style={{ outline: 'none', borderBottom: '1px solid #0d6efd', background: 'transparent', color: 'white', padding: '2px 4px', minWidth: '100px' }}
              ref={editableRef}
            >
              {editValue}
            </div>
          ) : (
            <div onDoubleClick={() => handleFieldDoubleClick('description')} className="border-bottom py-1">
              {task.description || 'No description'}
            </div>
          )}
        </div>
        {onDelete && (
          <button className="btn btn-outline-danger btn-sm" onClick={() => onDelete(task)}>
            Delete Task
          </button>
        )}
      </div>
    </div>
  );
}

export default TaskDetailsModal; 