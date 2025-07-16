import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { updateTaskAsync, deleteTask, startEditingTask, clearEditingTask } from '../features/tasks/tasksSlice';
import { updateTask, patchTask } from '../api/tasks';
import { createSection } from '../api/sections';
import { useKeycloak } from '@react-keycloak/web';
import TaskForm from "./TaskForm";
import { getUsers } from '../api/users';

function ListView({
  tasks = [],
  projectName = '',
  onStatusChange,
  onAddTask,
  onFilter,
  onSort,
  onSearch,
  onOptions,
  sections = null, // future: array of { name, tasks: [], ... }
  projectId = null, // pass projectId for section creation
  onSectionCreated = null, // callback after section created
  users = [], // array of user objects from ProjectPage
}) {
  const dispatch = useDispatch();
  const { keycloak } = useKeycloak();
  const [showSectionModal, setShowSectionModal] = useState(false);
  const [sectionName, setSectionName] = useState("");
  const [sectionLoading, setSectionLoading] = useState(false);
  const [sectionError, setSectionError] = useState("");
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [taskSectionId, setTaskSectionId] = useState("");
  const [editTaskId, setEditTaskId] = useState(null);
  const [editTaskData, setEditTaskData] = useState({});
  const [saving, setSaving] = useState(false);
  const [editingCell, setEditingCell] = useState({ taskId: null, field: null });
  const [cellValue, setCellValue] = useState("");
  const [filters, setFilters] = useState({
    status: '',
    dueDate: '',
    assignedTo: '',
  });
  const [showFilterCard, setShowFilterCard] = useState(false);
  const [showSortOptions, setShowSortOptions] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const [expandedSections, setExpandedSections] = useState(() => {
    // By default, all sections expanded
    if (sections) {
      const obj = {};
      sections.forEach(s => { obj[s.id || s.name] = true; });
      return obj;
    }
    return { 'Main Section': true };
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section.id || section.name]: !prev[section.id || section.name]
    }));
  };

  const handleDelete = async (task) => {
    setSaving(true);
    try {
      await dispatch(deleteTask({
        taskId: task.id || task._id,
        projectId: task.projectId,
        token: keycloak.token,
      }));
      if (onStatusChange) onStatusChange();
    } catch (e) {
      alert('Failed to delete task');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (task) => {
    dispatch(startEditingTask(task));
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

  // For now, group all tasks as one section if no section info
  const groupedSections = sections || [
    { name: 'Main Section', tasks: tasks.filter(t => !t.section) }
  ];

  // Filtered and searched tasks logic
  const filterTasks = (tasks) => {
    let filtered = tasks.filter(task => {
      if (filters.status && task.status !== filters.status) return false;
      if (filters.dueDate && (!task.dueDate || task.dueDate.split('T')[0] !== filters.dueDate)) return false;
      if (filters.assignedTo && task.assignedTo !== filters.assignedTo) return false;
      return true;
    });
    // Search
    if (searchTerm) {
      filtered = filtered.filter(task =>
        (task.name || task.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (task.description || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    // Sort
    if (sortField) {
      filtered = [...filtered].sort((a, b) => {
        let aVal = a[sortField] || '';
        let bVal = b[sortField] || '';
        if (sortField === 'dueDate') {
          aVal = aVal ? new Date(aVal) : new Date(0);
          bVal = bVal ? new Date(bVal) : new Date(0);
        }
        if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return filtered;
  };

  const handleCreateSection = async (e) => {
    e.preventDefault();
    setSectionError("");
    if (!sectionName) {
      setSectionError("Section name is required.");
      return;
    }
    setSectionLoading(true);
    try {
      await createSection({ name: sectionName, projectId }, keycloak.token);
      setShowSectionModal(false);
      setSectionName("");
      if (onSectionCreated) onSectionCreated();
      else window.location.reload();
    } catch (err) {
      setSectionError("Failed to create section");
    } finally {
      setSectionLoading(false);
    }
  };

  // Open Task modal for a specific section
  const handleAddTaskToSection = (sectionId) => {
    setTaskSectionId(sectionId);
    setShowTaskModal(true);
  };

  // Inline edit handlers
  const handleEditClick = (task) => {
    setEditTaskId(task.id || task._id);
    setEditTaskData({
      name: task.name || task.title,
      description: task.description,
      dueDate: task.dueDate || '',
      status: task.status || 'Todo',
    });
  };

  const handleEditChange = (field, value) => {
    setEditTaskData((prev) => ({ ...prev, [field]: value }));
  };

  const handleEditSave = async (task) => {
    setSaving(true);
    try {
      await dispatch(updateTaskAsync({
        taskId: task.id || task._id,
        taskData: {
          name: editTaskData.name,
          description: editTaskData.description,
          dueDate: editTaskData.dueDate,
          status: editTaskData.status,
        },
        projectId: task.projectId,
        token: keycloak.token,
      }));
      setEditTaskId(null);
      setEditTaskData({});
      dispatch(clearEditingTask()); // Clear global editing state after edit
      if (onStatusChange) onStatusChange();
    } catch (e) {
      alert('Failed to update task');
    } finally {
      setSaving(false);
    }
  };

  const handleEditCancel = () => {
    setEditTaskId(null);
    setEditTaskData({});
  };

  // Toggle complete
  const handleToggleComplete = async (task) => {
    const newStatus = (task.status || '').toLowerCase() === 'completed' ? 'Todo' : 'Completed';
    setSaving(true);
    try {
      await updateTask(task.id || task._id, { status: newStatus }, keycloak.token);
      if (onStatusChange) onStatusChange();
    } catch (e) {
      alert('Failed to update status');
    } finally {
      setSaving(false);
    }
  };

  // Inline cell edit handlers
  const handleCellDoubleClick = (task, field) => {
    setEditingCell({ taskId: task.id || task._id, field });
    setCellValue(field === 'name' ? (task.name || task.title) : task[field] || '');
  };

  const handleCellChange = (e) => {
    setCellValue(e.target.value);
  };

  const handleCellBlurOrEnter = async (task, field) => {
    if (cellValue !== (field === 'name' ? (task.name || task.title) : task[field] || '')) {
      try {
        await patchTask(task.id || task._id, { [field]: cellValue }, keycloak.token);
        if (onStatusChange) onStatusChange();
      } catch (e) {
        alert('Failed to update task');
      }
    }
    setEditingCell({ taskId: null, field: null });
    setCellValue("");
  };

  // Helper to get user name by id
  const getUserName = (userId) => {
    const user = users.find(u => u.keycloakId === userId || u.id === userId);
    return user ? user.name : 'Unassigned';
  };
  return (
    <div className="listview-container">
      {/* Action bar: Only right-aligned search/filter/sort/options */}
      <div className="d-flex align-items-center justify-content-end mb-2">
        <div className="d-flex align-items-center gap-2">
          <input
            type="text"
            className="form-control form-control-sm"
            placeholder="Search..."
            style={{ maxWidth: 150 }}
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
          <button
            className="btn btn-outline-light btn-sm"
            onClick={() => setShowFilterCard(v => !v)}
            title="Filter"
          >
            <i className="bi bi-funnel"></i>
          </button>
          <button
            className="btn btn-outline-light btn-sm"
            onClick={() => setShowSortOptions(v => !v)}
            title="Sort"
          >
            <i className="bi bi-sort-alpha-down"></i>
          </button>
          <button className="btn btn-outline-light btn-sm" onClick={onOptions} title="Options"><i className="bi bi-three-dots-vertical"></i></button>
        </div>
      </div>
      {/* Filter Card (toggle) */}
      {showFilterCard && (
        <div className="card mb-2 p-2" style={{ background: '#23272b', color: 'white', maxWidth: 900 }}>
          <div className="row g-2 align-items-center">
            <div className="col-auto">
              <select
                className="form-control form-control-sm"
                value={filters.status}
                onChange={e => { setFilters(f => ({ ...f, status: e.target.value })); setShowFilterCard(false); }}
              >
                <option value="">All Statuses</option>
                <option value="Todo">Todo</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
            <div className="col-auto">
              <input
                type="date"
                className="form-control form-control-sm"
                value={filters.dueDate}
                onChange={e => { setFilters(f => ({ ...f, dueDate: e.target.value })); setShowFilterCard(false); }}
              />
            </div>
            <div className="col-auto">
              <select
                className="form-control form-control-sm"
                value={filters.assignedTo}
                onChange={e => { setFilters(f => ({ ...f, assignedTo: e.target.value })); setShowFilterCard(false); }}
              >
                <option value="">All Assignees</option>
                {users.map(u => (
                  <option key={u.keycloakId || u.id} value={u.keycloakId || u.id}>{u.name}</option>
                ))}
              </select>
            </div>
            <div className="col-auto">
              <button className="btn btn-outline-light btn-sm" onClick={() => setFilters({ status: '', dueDate: '', assignedTo: '' })}>Clear</button>
            </div>
          </div>
        </div>
      )}
      {/* Sort Options (toggle) */}
      {showSortOptions && (
        <div className="card mb-2 p-2" style={{ background: '#23272b', color: 'white', maxWidth: 600 }}>
          <div className="row g-2 align-items-center">
            <div className="col-auto">
              <label className="form-label mb-0 me-2">Sort by:</label>
              <select
                className="form-control form-control-sm"
                value={sortField}
                onChange={e => setSortField(e.target.value)}
              >
                <option value="">None</option>
                <option value="name">Name</option>
                <option value="description">Description</option>
                <option value="dueDate">Due Date</option>
                <option value="status">Status</option>
              </select>
            </div>
            <div className="col-auto">
              <select
                className="form-control form-control-sm"
                value={sortOrder}
                onChange={e => setSortOrder(e.target.value)}
              >
                <option value="asc">Ascending</option>
                <option value="desc">Descending</option>
              </select>
            </div>
            <div className="col-auto">
              <button className="btn btn-outline-light btn-sm" onClick={() => { setSortField(""); setSortOrder("asc"); }}>Clear</button>
            </div>
          </div>
        </div>
      )}
      {/* 3. Table headers */}
      <div className="table-responsive">
        <table className="table table-dark table-hover align-middle mb-0">
          <thead>
            <tr>
              <th></th> {/* Checkbox column */}
              <th scope="col">Task Name</th>
              <th scope="col">Description</th>
              <th scope="col">Assigned By</th>
              <th scope="col">Due Date</th>
              <th scope="col">Status</th>
              <th scope="col">RAG</th>
              <th scope="col">Actions</th>
            </tr>
          </thead>
          <tbody>
            {groupedSections.flatMap((section, idx) => {
              const rows = [
                <tr className="table-secondary" style={{ cursor: 'pointer' }} onClick={() => toggleSection(section)} key={`section-header-${section.id || section.name}`}>
                  <td colSpan={8} className="fw-bold">
                    <span style={{ marginRight: 8 }}>
                      {expandedSections[section.id || section.name] ? <i className="bi bi-caret-down-fill"></i> : <i className="bi bi-caret-right-fill"></i>}
                    </span>
                    {section.name}
                  </td>
                </tr>
              ];
              if (expandedSections[section.id || section.name]) {
                const filtered = filterTasks(section.tasks);
                if (filtered.length === 0) {
                  rows.push(
                    <tr key={`empty-${section.id || section.name}`}><td colSpan={8} className="text-center text-muted">No tasks in this section.</td></tr>
                  );
                } else {
                  rows.push(...filtered.map((task) => (
                    <tr key={task.id || task._id}>
                      {/* Checkbox for complete */}
                      <td>
                        <input
                          type="checkbox"
                          checked={(task.status || '').toLowerCase() === 'completed'}
                          onChange={() => handleToggleComplete(task)}
                          disabled={saving}
                        />
                      </td>
                      {/* Name */}
                      <td
                        onDoubleClick={() => handleCellDoubleClick(task, 'name')}
                        style={editingCell.taskId === (task.id || task._id) && editingCell.field === 'name' ? { background: '#222', outline: '2px solid #0d6efd' } : {}}
                      >
                        {editingCell.taskId === (task.id || task._id) && editingCell.field === 'name' ? (
                          <input
                            type="text"
                            className="form-control form-control-sm"
                            value={cellValue}
                            autoFocus
                            onChange={handleCellChange}
                            onBlur={() => handleCellBlurOrEnter(task, 'name')}
                            onKeyDown={e => { if (e.key === 'Enter') handleCellBlurOrEnter(task, 'name'); }}
                          />
                        ) : (
                          <strong>{task.name || task.title}</strong>
                        )}
                      </td>
                      {/* Description */}
                      <td
                        onDoubleClick={() => handleCellDoubleClick(task, 'description')}
                        style={editingCell.taskId === (task.id || task._id) && editingCell.field === 'description' ? { background: '#222', outline: '2px solid #0d6efd' } : {}}
                      >
                        {editingCell.taskId === (task.id || task._id) && editingCell.field === 'description' ? (
                          <input
                            type="text"
                            className="form-control form-control-sm"
                            value={cellValue}
                            autoFocus
                            onChange={handleCellChange}
                            onBlur={() => handleCellBlurOrEnter(task, 'description')}
                            onKeyDown={e => { if (e.key === 'Enter') handleCellBlurOrEnter(task, 'description'); }}
                          />
                        ) : (
                          <span>{task.description}</span>
                        )}
                      </td>
                      {/* Assigned */}
                      <td>{getUserName(task.assignedTo)}</td>
                      {/* Due Date */}
                      <td
                        onDoubleClick={() => handleCellDoubleClick(task, 'dueDate')}
                        style={editingCell.taskId === (task.id || task._id) && editingCell.field === 'dueDate' ? { background: '#222', outline: '2px solid #0d6efd' } : {}}
                      >
                        {editingCell.taskId === (task.id || task._id) && editingCell.field === 'dueDate' ? (
                          <input
                            type="date"
                            className="form-control form-control-sm"
                            value={cellValue}
                            autoFocus
                            onChange={handleCellChange}
                            onBlur={() => handleCellBlurOrEnter(task, 'dueDate')}
                            onKeyDown={e => { if (e.key === 'Enter') handleCellBlurOrEnter(task, 'dueDate'); }}
                          />
                        ) : (
                          <span>{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}</span>
                        )}
                      </td>
                      {/* Status */}
                      <td
                        onDoubleClick={() => handleCellDoubleClick(task, 'status')}
                        style={editingCell.taskId === (task.id || task._id) && editingCell.field === 'status' ? { background: '#222', outline: '2px solid #0d6efd' } : {}}
                      >
                        {editingCell.taskId === (task.id || task._id) && editingCell.field === 'status' ? (
                          <select
                            className="form-control form-control-sm"
                            value={cellValue}
                            autoFocus
                            onChange={handleCellChange}
                            onBlur={() => handleCellBlurOrEnter(task, 'status')}
                            onKeyDown={e => { if (e.key === 'Enter') handleCellBlurOrEnter(task, 'status'); }}
                          >
                            <option value="Todo">Todo</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Completed">Completed</option>
                          </select>
                        ) : (
                          <span className={getStatusBadgeClass(task.status)}>
                            {task.status || 'Todo'}
                          </span>
                        )}
                      </td>
                      {/* RAG */}
                      <td>
                        <span className="badge bg-info">Dummy RAG</span>
                      </td>
                      {/* Actions */}
                      <td>
                        <div className="btn-group btn-group-sm" role="group">
                          <button
                            className="btn btn-outline-danger"
                            onClick={() => handleDelete(task)}
                            title="Delete"
                          >
                            <i className="bi bi-trash-fill"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  )));
                }
                rows.push(
                  <tr key={`add-task-${section.id || section.name}`}>
                    <td colSpan={8} className="text-center">
                      <button className="btn btn-link text-success" onClick={e => { e.stopPropagation(); handleAddTaskToSection(section.id); }}>
                        <i className="bi bi-plus-lg"></i> Add Task
                      </button>
                    </td>
                  </tr>
                );
              }
              return rows;
            })}
          </tbody>
        </table>
      </div>
      {/* 5. Create Section at end */}
      <div className="text-center mt-3">
        <button className="btn btn-outline-primary" onClick={() => setShowSectionModal(true)}>+ Create Section</button>
        {showSectionModal && (
          <div className="modal fade show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
            <div className="modal-dialog">
              <div className="modal-content bg-dark text-white">
                <div className="modal-header border-secondary">
                  <h5 className="modal-title">Create Section</h5>
                  <button type="button" className="btn-close btn-close-white" onClick={() => setShowSectionModal(false)}></button>
                </div>
                <form onSubmit={handleCreateSection}>
                  <div className="modal-body">
                    <div className="mb-3">
                      <label className="form-label">Section Name</label>
                      <input className="form-control" value={sectionName} onChange={e => setSectionName(e.target.value)} required />
                    </div>
                    {sectionError && <div className="alert alert-danger py-1">{sectionError}</div>}
                  </div>
                  <div className="modal-footer border-secondary">
                    <button type="button" className="btn btn-secondary" onClick={() => setShowSectionModal(false)} disabled={sectionLoading}>Cancel</button>
                    <button type="submit" className="btn btn-primary" disabled={sectionLoading || !sectionName}>{sectionLoading ? "Creating..." : "Create"}</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
      {/* Add Task Modal for Section */}
      {showTaskModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog">
            <div className="modal-content bg-dark text-white">
              <div className="modal-header border-secondary">
                <h5 className="modal-title">Add Task</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowTaskModal(false)}></button>
              </div>
              <div className="modal-body">
                <TaskForm
                  users={users}
                  sections={groupedSections.filter(s => s.id === taskSectionId).map(s => ({ id: s.id, name: s.name }))}
                  onAdd={(task) => {
                    // Call onAddTask with sectionId
                    if (onAddTask) onAddTask({ ...task, sectionId: taskSectionId });
                    setShowTaskModal(false);
                  }}
                  onClose={() => setShowTaskModal(false)}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ListView; 