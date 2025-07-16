import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { deleteTask, startEditingTask } from '../features/tasks/tasksSlice';
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
  //users = [], // array of user objects
}) {
  const dispatch = useDispatch();
  const { keycloak } = useKeycloak();
  const [showSectionModal, setShowSectionModal] = useState(false);
  const [sectionName, setSectionName] = useState("");
  const [sectionLoading, setSectionLoading] = useState(false);
  const [sectionError, setSectionError] = useState("");
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [taskSectionId, setTaskSectionId] = useState("");
  const [users, setUsers] = useState([]);

  useEffect(() => {
    if (showTaskModal && keycloak?.token) {
      getUsers(keycloak.token).then(setUsers).catch(() => setUsers([]));
    }
  }, [showTaskModal, keycloak]);

  const handleDelete = (taskId) => {
    dispatch(deleteTask({ taskId, projectId: tasks[0]?.projectId }));
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

  // Helper to get user name by id
    const getUserName = (userId) => {
      const user = users.find(u => u.keycloakId === userId);
      return user ? user.name : 'Unassigned';
    };
  return (
    <div className="listview-container">
      {/* Action bar: Only right-aligned search/filter/sort/options */}
      <div className="d-flex align-items-center justify-content-end mb-2">
        <div className="d-flex align-items-center gap-2">
          <input type="text" className="form-control form-control-sm" placeholder="Search..." style={{ maxWidth: 150 }} onChange={onSearch} />
          <button className="btn btn-outline-light btn-sm" onClick={onFilter} title="Filter"><i className="bi bi-funnel"></i></button>
          <button className="btn btn-outline-light btn-sm" onClick={onSort} title="Sort"><i className="bi bi-sort-alpha-down"></i></button>
          <button className="btn btn-outline-light btn-sm" onClick={onOptions} title="Options"><i className="bi bi-three-dots-vertical"></i></button>
        </div>
      </div>
      {/* 3. Table headers */}
      <div className="table-responsive">
        <table className="table table-dark table-hover align-middle mb-0">
          <thead>
            <tr>
              <th scope="col">Task Name</th>
              <th scope="col">Assigned By</th>
              <th scope="col">Due Date</th>
              <th scope="col">Status</th>
              <th scope="col">RAG</th>
              <th scope="col">Actions</th>
            </tr>
          </thead>
          <tbody>
            {/* 4. Sections and tasks */}
            {groupedSections.map((section, idx) => (
              <React.Fragment key={section.name}>
                <tr className="table-secondary">
                  <td colSpan={7} className="fw-bold">{section.name}</td>
                </tr>
                {section.tasks.length === 0 && (
                  <tr><td colSpan={7} className="text-center text-muted">No tasks in this section.</td></tr>
                )}
                {section.tasks.map((task) => (
                  <tr key={task.id}>
                    <td>
                      <div>
                        <strong>{task.title}</strong>
                        {task.description && (
                          <div>{task.description}</div>
                        )}
                        {/* Subtasks (future: if task.subtasks) */}
                        {task.subtasks && Array.isArray(task.subtasks) && task.subtasks.length > 0 && (
                          <ul className="list-unstyled ms-3 mt-2">
                            {task.subtasks.map((sub, i) => (
                              <li key={i} className="border-start ps-2 mb-1">
                                <span className="fw-normal">{sub.title}</span>
                                {sub.dueDate && <span className="ms-2 text-muted small">({sub.dueDate})</span>}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </td>
                    <td>{getUserName(task.assignedTo)}</td>
                    <td>{task.dueDate || 'No due date'}</td>
                    <td>
                      <span className={getStatusBadgeClass(task.status)}>
                        {task.status || 'Todo'}
                      </span>
                    </td>
                    <td>
                      <span className="badge bg-info">Dummy RAG</span>
                    </td>
                    <td>
                      <div className="btn-group btn-group-sm" role="group">
                        <button
                          className="btn btn-outline-light"
                          onClick={() => handleEdit(task)}
                          title="Edit"
                        >
                          <i className="bi bi-pencil-fill"></i>
                        </button>
                        <button
                          className="btn btn-outline-danger"
                          onClick={() => handleDelete(task.id)}
                          title="Delete"
                        >
                          <i className="bi bi-trash-fill"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {/* 4b. Add Task at end of section */}
                <tr>
                  <td colSpan={7} className="text-center">
                    <button className="btn btn-link text-success" onClick={() => handleAddTaskToSection(section.id)}>
                      <i className="bi bi-plus-lg"></i> Add Task
                    </button>
                  </td>
                </tr>
              </React.Fragment>
            ))}
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