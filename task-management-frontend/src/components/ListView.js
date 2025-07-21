import React, { useState, useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { updateTaskAsync, deleteTask, startEditingTask, clearEditingTask } from '../features/tasks/tasksSlice';
import { updateTask, patchTask, getTaskWithSubtasks, addTask } from '../api/tasks';
import { createSection } from '../api/sections';
import { useKeycloak } from '@react-keycloak/web';
import TaskForm from "./TaskForm";
import { getUsers } from '../api/users';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function ListView({
  tasks = [],
  projectName = '',
  onStatusChange,
  onAddTask,
  onFilter,
  onSort,
  onSearch,
  onOptions,
  sections = null,
  projectId = null,
  onSectionCreated = null,
  users = [],
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
  const [activePanel, setActivePanel] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const [expandedSections, setExpandedSections] = useState(() => {
    if (sections) {
      const obj = {};
      sections.forEach(s => { obj[s.id || s.name] = true; });
      return obj;
    }
    return { 'Main Section': true };
  });
  const [expandedTasks, setExpandedTasks] = useState({});
  const [showSubtaskFormFor, setShowSubtaskFormFor] = useState(null);
  const [subtaskFormData, setSubtaskFormData] = useState({});
  const [editingSubtask, setEditingSubtask] = useState({ subtaskId: null, field: null });
  const [subtaskEditValue, setSubtaskEditValue] = useState("");
  const [subtasksMap, setSubtasksMap] = useState({});
  const [hoveredTaskId, setHoveredTaskId] = useState(null);
  const [showTaskDetails, setShowTaskDetails] = useState(null);
  const [showDropdown, setShowDropdown] = useState({ taskId: null, field: null });
  const editableRef = useRef(null);
  const [inlineSubtasks, setInlineSubtasks] = useState({}); // { [parentTaskId]: { name, assignedBy, dueDate } }
  const [inlineMainTasks, setInlineMainTasks] = useState({}); // { [sectionId]: { name, assignedBy, dueDate } }
  const [showInlineMainTaskFor, setShowInlineMainTaskFor] = useState(null);

  useEffect(() => {
    if (!tasks || !Array.isArray(tasks)) return;
    const fetchSubtasks = async () => {
      const map = {};
      for (const task of tasks) {
        if (!task.id && !task._id) continue;
        try {
          const data = await getTaskWithSubtasks(task.id || task._id, keycloak.token);
          map[task.id || task._id] = data.subtasks || [];
        } catch (e) {
          map[task.id || task._id] = [];
          toast.error(`Failed to fetch subtasks for task ${task.name || task.title}`);
        }
      }
      setSubtasksMap(map);
    };
    fetchSubtasks();
    // eslint-disable-next-line
  }, [tasks]);

  useEffect(() => {
    if (editingCell.taskId && editableRef.current) {
      const range = document.createRange();
      const selection = window.getSelection();
      range.selectNodeContents(editableRef.current);
      range.collapse(false);
      selection.removeAllRanges();
      selection.addRange(range);
      editableRef.current.focus();
    }
  }, [editingCell]);

  useEffect(() => {
    if (editingSubtask.subtaskId && editableRef.current) {
      const range = document.createRange();
      const selection = window.getSelection();
      range.selectNodeContents(editableRef.current);
      range.collapse(false);
      selection.removeAllRanges();
      selection.addRange(range);
      editableRef.current.focus();
    }
  }, [editingSubtask]);

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section.id || section.name]: !prev[section.id || section.name]
    }));
  };

  const toggleTask = (taskId) => {
    setExpandedTasks(prev => ({
      ...prev,
      [taskId]: !prev[taskId]
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
      setShowTaskDetails(null);
      toast.success('Task deleted successfully');
    } catch (e) {
      toast.error('Failed to delete task');
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

  const getRagColor = (status) => {
    switch ((status || '').toLowerCase()) {
      case 'todo':
        return '#dc3545';
      case 'in progress':
        return '#ffc107';
      case 'completed':
        return '#28a745';
      default:
        return '#6c757d';
    }
  };

  // Defensive: ensure groupedSections is always an array
  const groupedSections = Array.isArray(sections)
    ? sections
    : (sections ? [sections] : []);

  const filterTasks = (tasks) => {
    let filtered = tasks.filter(task => {
      if (filters.status && task.status !== filters.status) return false;
      if (filters.dueDate && (!task.dueDate || task.dueDate.split('T')[0] !== filters.dueDate)) return false;
      if (filters.assignedTo && task.assignedTo !== filters.assignedTo) return false;
      return true;
    });
    if (searchTerm) {
      filtered = filtered.filter(task =>
        (task.name || task.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (task.description || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
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
      toast.success('Section created successfully');
    } catch (err) {
      setSectionError("Failed to create section");
      toast.error('Failed to create section');
    } finally {
      setSectionLoading(false);
    }
  };

  const handleAddTaskToSection = (sectionId) => {
    setTaskSectionId(sectionId);
    setShowTaskModal(true);
  };

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
      dispatch(clearEditingTask());
      if (onStatusChange) onStatusChange();
      toast.success('Task updated successfully');
    } catch (e) {
      toast.error('Failed to update task');
    } finally {
      setSaving(false);
    }
  };

  const handleEditCancel = () => {
    setEditTaskId(null);
    setEditTaskData({});
  };

  const handleToggleComplete = async (task) => {
    const newStatus = (task.status || '').toLowerCase() === 'completed' ? 'Todo' : 'Completed';
    setSaving(true);
    try {
      await updateTask(task.id || task._id, { status: newStatus }, keycloak.token);
      if (onStatusChange) onStatusChange();
      setShowTaskDetails(prev => prev ? { ...prev, status: newStatus } : null);
      setSubtasksMap(prev => ({
        ...prev,
        [task.id || task._id]: prev[task.id || task._id]?.map(s =>
          (s.id || s._id) === (task.id || task._id) ? { ...s, status: newStatus } : s
        ) || prev[task.id || task._id]
      }));
      toast.success('Task status updated');
    } catch (e) {
      toast.error('Failed to update status');
    } finally {
      setSaving(false);
    }
  };

  const handleCellDoubleClick = (task, field, e) => {
    e.stopPropagation();
    setEditingCell({ taskId: task.id || task._id, field });
    setCellValue(field === 'name' ? (task.name || task.title) : task[field] || '');
    if (['assignedTo', 'status', 'priority'].includes(field)) {
      setShowDropdown({ taskId: task.id || task._id, field });
    }
  };

  const handleCellInput = (e, task, field) => {
    const value = e.target.innerText;
    setCellValue(value);
    if (['assignedTo', 'status', 'priority'].includes(field)) {
      const options = getDropdownOptions(field);
      if (options.includes(value)) {
        handleCellBlurOrEnter(task, field, value);
      }
    }
  };

  const handleCellBlurOrEnter = async (task, field, value = cellValue) => {
    if (value !== (field === 'name' ? (task.name || task.title) : task[field] || '')) {
      try {
        if (field === 'status' && !['Todo', 'In Progress', 'Completed'].includes(value)) return;
        if (field === 'priority' && value && !['None', 'High', 'Medium', 'Low'].includes(value)) return;
        if (field === 'assignedTo') {
          const user = users.find(u => u.name === value);
          if (!user && value !== '') return;
          value = user ? user.keycloakId || user.id : '';
        }
        await patchTask(task.id || task._id, { [field]: value }, keycloak.token);
        if (onStatusChange) onStatusChange();
        setShowTaskDetails(prev => prev && prev.id === (task.id || task._id) ? { ...prev, [field]: value } : prev);
        setSubtasksMap(prev => ({
          ...prev,
          [task.id || task._id]: prev[task.id || task._id]?.map(s =>
            (s.id || s._id) === (task.id || task._id) ? { ...s, [field]: value } : s
          ) || prev[task.id || task._id]
        }));
        toast.success('Task updated successfully');
      } catch (e) {
        toast.error('Failed to update task');
      }
    }
    setEditingCell({ taskId: null, field: null });
    setCellValue("");
    setShowDropdown({ taskId: null, field: null });
  };

  const handleToggleSubtaskComplete = async (subtask) => {
    const newStatus = (subtask.status || '').toLowerCase() === 'completed' ? 'Todo' : 'Completed';
    setSaving(true);
    try {
      await patchTask(subtask.id || subtask._id, { status: newStatus }, keycloak.token);
      if (onStatusChange) onStatusChange();
      setSubtasksMap(prev => ({
        ...prev,
        [subtask.parentTaskId]: prev[subtask.parentTaskId].map(s =>
          (s.id || s._id) === (subtask.id || subtask._id) ? { ...s, status: newStatus } : s
        )
      }));
      toast.success('Subtask status updated');
    } catch (e) {
      toast.error('Failed to update subtask status');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSubtask = async (subtask) => {
    setSaving(true);
    try {
      await dispatch(deleteTask({ taskId: subtask.id || subtask._id, projectId: subtask.projectId, token: keycloak.token }));
      if (onStatusChange) onStatusChange();
      setSubtasksMap(prev => ({
        ...prev,
        [subtask.parentTaskId]: prev[subtask.parentTaskId].filter(s => (s.id || s._id) !== (subtask.id || subtask._id))
      }));
      toast.success('Subtask deleted successfully');
    } catch (e) {
      toast.error('Failed to delete subtask');
    } finally {
      setSaving(false);
    }
  };

  const handleSubtaskCellDoubleClick = (subtask, field, value, e) => {
    e.stopPropagation();
    setEditingSubtask({ subtaskId: subtask.id || subtask._id, field });
    setSubtaskEditValue(value || '');
    if (field === 'status') {
      setShowDropdown({ taskId: subtask.id || subtask._id, field });
    }
  };

  const handleSubtaskCellInput = (e, subtask, field) => {
    const value = e.target.innerText;
    setSubtaskEditValue(value);
    if (field === 'status') {
      const options = ['Todo', 'In Progress', 'Completed'];
      if (options.includes(value)) {
        handleSubtaskCellBlurOrEnter(subtask, field, value);
      }
    }
  };

  const handleSubtaskCellBlurOrEnter = async (subtask, field, value = subtaskEditValue) => {
    if (value !== (subtask[field] || '')) {
      setSaving(true);
      try {
        if (field === 'status' && !['Todo', 'In Progress', 'Completed'].includes(value)) return;
        await patchTask(subtask.id || subtask._id, { [field]: value }, keycloak.token);
        if (onStatusChange) onStatusChange();
        setSubtasksMap(prev => ({
          ...prev,
          [subtask.parentTaskId]: prev[subtask.parentTaskId].map(s =>
            (s.id || s._id) === (subtask.id || subtask._id) ? { ...s, [field]: value } : s
          )
        }));
        toast.success('Subtask updated successfully');
      } catch (e) {
        toast.error('Failed to update subtask');
      } finally {
        setSaving(false);
      }
    }
    setEditingSubtask({ subtaskId: null, field: null });
    setSubtaskEditValue("");
    setShowDropdown({ taskId: null, field: null });
  };

  const getUserName = (userId) => {
    const user = users.find(u => u.keycloakId === userId || u.id === userId);
    return user ? user.name : 'Unassigned';
  };

  // Helper for assignedBy display
  const getAssignedByDisplay = (userId) => {
    if (!userId) return 'Unassigned';
    if (keycloak?.tokenParsed?.sub && userId === keycloak.tokenParsed.sub) return 'Self';
    return getUserName(userId);
  };

  const handleShowSubtaskForm = (taskId) => {
    setShowSubtaskFormFor(taskId);
    setSubtaskFormData({
      name: '',
      description: '',
      assignedTo: '',
      dueDate: '',
      status: 'Todo',
      priority: '',
    });
  };

  const handleSubtaskFormChange = (field, value) => {
    setSubtaskFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddSubtask = async (newSubtask) => {
    setSaving(true);
    try {
      await addTask(newSubtask, keycloak.token);
      if (onStatusChange) onStatusChange();
      setShowSubtaskFormFor(null);
      setSubtaskFormData({});
      toast.success('Subtask added successfully');
    } catch (e) {
      toast.error('Failed to add subtask');
    } finally {
      setSaving(false);
    }
  };

  const handleInlineSubtaskChange = (parentTaskId, field, value) => {
    setInlineSubtasks(prev => ({
      ...prev,
      [parentTaskId]: {
        ...prev[parentTaskId],
        [field]: value,
      },
    }));
  };
  const handleInlineSubtaskAdd = async (parentTask, inlineSubtask) => {
    if (!inlineSubtask.name) return;
    await handleAddSubtask({
      ...inlineSubtask,
      parentTaskId: parentTask.id || parentTask._id,
      projectId: parentTask.projectId,
      sectionId: parentTask.sectionId,
      status: 'Todo',
    });
    setInlineSubtasks(prev => ({ ...prev, [parentTask.id || parentTask._id]: { name: '', assignedBy: keycloak?.tokenParsed?.sub || '', dueDate: '' } }));
    setShowSubtaskFormFor(null);
  };

  const handleTaskClick = (task) => {
    toggleTask(task.id || task._id);
    setShowTaskDetails({
      id: task.id || task._id,
      name: task.name || task.title,
      description: task.description || '',
      assignedBy: task.assignedBy || '',
      dueDate: task.dueDate || '',
      status: task.status || 'Todo',
      priority: task.priority || '',
      projectId: task.projectId,
      sectionId: task.sectionId,
    });
  };

  const getDropdownOptions = (field) => {
    if (field === 'status') return ['Todo', 'In Progress', 'Completed'];
    if (field === 'priority') return ['None', 'High', 'Medium', 'Low'];
    if (field === 'assignedTo') return ['Unassigned', ...users.map(u => u.name)];
    return [];
  };

  const handleDropdownSelect = (task, field, value) => {
    setCellValue(value);
    handleCellBlurOrEnter(task, field, value);
  };

  const handleSubtaskDropdownSelect = (subtask, field, value) => {
    setSubtaskEditValue(value);
    handleSubtaskCellBlurOrEnter(subtask, field, value);
  };

  const handleOutsideClick = (e) => {
    if (showSectionModal && !e.target.closest('.modal-content')) {
      setShowSectionModal(false);
    }
    if (showTaskModal && !e.target.closest('.modal-content')) {
      setShowTaskModal(false);
    }
    if (showTaskDetails && !e.target.closest('.offcanvas')) {
      setShowTaskDetails(null);
    }
  };

  const handleInlineMainTaskChange = (sectionId, field, value) => {
    setInlineMainTasks(prev => ({
      ...prev,
      [sectionId]: {
        ...prev[sectionId],
        [field]: value,
      },
    }));
  };
  const handleInlineMainTaskAdd = async (section, inlineTask) => {
    if (!inlineTask.name) return;
    await onAddTask({
      ...inlineTask,
      sectionId: section.id,
      status: 'Todo',
    });
    setInlineMainTasks(prev => ({ ...prev, [section.id]: { name: '', assignedBy: keycloak?.tokenParsed?.sub || '', dueDate: '' } }));
    setShowInlineMainTaskFor(null);
  };
  const handleInlineMainTaskKeyDown = (e, section, inlineTask) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleInlineMainTaskAdd(section, inlineTask);
    } else if (e.key === 'Escape') {
      setShowInlineMainTaskFor(null);
    }
  };
  const handleInlineMainTaskBlur = () => {
    setShowInlineMainTaskFor(null);
  };

  return (
    <div className="listview-container" onClick={handleOutsideClick}>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
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
            onClick={() => setActivePanel(activePanel === 'filter' ? null : 'filter')}
            title="Filter"
          >
            <i className="bi bi-funnel"></i>
          </button>
          <button
            className="btn btn-outline-light btn-sm"
            onClick={() => setActivePanel(activePanel === 'sort' ? null : 'sort')}
            title="Sort"
          >
            <i className="bi bi-sort-alpha-down"></i>
          </button>
        </div>
      </div>
      {activePanel === 'filter' && (
        <div className="card mb-2 p-2" style={{ background: '#23272b', color: 'white', maxWidth: 900 }}>
          <div className="row g-2 align-items-center">
            <div className="col-auto">
              <select
                className="form-control form-control-sm"
                value={filters.status}
                onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}
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
                onChange={e => setFilters(f => ({ ...f, dueDate: e.target.value }))}
              />
            </div>
            <div className="col-auto">
              <select
                className="form-control form-control-sm"
                value={filters.assignedTo}
                onChange={e => setFilters(f => ({ ...f, assignedTo: e.target.value }))}
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
      {activePanel === 'sort' && (
        <div className="card mb-2 p-2" style={{ background: '#23272b', color: 'white', maxWidth: 600 }}>
          <div className="row g-2 align-items-center">
            <label className="form-label mb-0 me-2">Sort by:</label>
            <div className="col-auto">
              <select
                className="form-control form-control-sm"
                value={sortField}
                onChange={e => setSortField(e.target.value)}
              >
                <option value="">None</option>
                <option value="name">Name</option>
                <option value="dueDate">Due Date</option>
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
      <div className="table-responsive">
        <table style={{ width: '100%', color: 'white', borderCollapse: 'collapse', background: 'none' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #444', background: 'none' }}>
              <th style={{ fontWeight: 600, padding: '10px 8px', background: 'none' }}>Task Name</th>
              <th style={{ fontWeight: 600, padding: '10px 8px', background: 'none' }}>Assigned By</th>
              <th style={{ fontWeight: 600, padding: '10px 8px', background: 'none' }}>Due Date</th>
              <th style={{ fontWeight: 600, padding: '10px 8px', background: 'none' }}>RAG</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(groupedSections) && groupedSections.flatMap((section, idx) => {
              // Defensive: skip if section is not an object or has no tasks array
              if (!section || typeof section !== 'object' || !Array.isArray(section.tasks)) return [];
              const rows = [
                <tr key={`section-header-${section.id || section.name}`}>
                  <td colSpan={4} style={{ fontWeight: 600, fontSize: 15, padding: '10px 0', color: '#aaa', background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => toggleSection(section)}>
                    <span style={{ marginRight: 8 }}>
                      {expandedSections[section.id || section.name] ? <i className="bi bi-caret-down-fill"></i> : <i className="bi bi-caret-right-fill"></i>}
                    </span>
                    {section.name}
                  </td>
                </tr>
              ];
              if (expandedSections[section.id || section.name]) {
                // In the main table rendering, filter mainTasks to only those with no parentTaskId
                const mainTasks = section.tasks.filter(t => !t.parentTaskId);
                const filtered = filterTasks(mainTasks);
                if (filtered.length === 0) {
                  rows.push(
                    <tr key={`empty-${section.id || section.name}`}> <td colSpan={4} style={{ textAlign: 'center', color: '#666', background: 'none', border: 'none', padding: '12px 0' }}>No tasks in this section.</td></tr>
                  );
                } else {
                  rows.push(...filtered.map((task) => {
                    const taskId = task.id || task._id;
                    const taskRow = (
                      <tr
                        key={taskId}
                        onMouseEnter={() => setHoveredTaskId(taskId)}
                        onMouseLeave={() => setHoveredTaskId(null)}
                        onClick={() => handleTaskClick(task)}
                        style={{ cursor: 'pointer', background: 'none', borderBottom: '1px solid #333' }}
                      >
                        <td style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'none', border: 'none', padding: '10px 8px' }}>
                          <input
                            type="checkbox"
                            checked={(task.status || '').toLowerCase() === 'completed'}
                            onChange={(e) => { e.stopPropagation(); handleToggleComplete(task); }}
                            disabled={saving}
                            style={{
                              appearance: 'none',
                              width: '14px',
                              height: '14px',
                              borderRadius: '4px',
                              border: '1px solid #6c757d',
                              background: 'transparent',
                              cursor: 'pointer',
                              position: 'relative',
                              flexShrink: 0,
                            }}
                            className="custom-checkbox"
                            onMouseOver={(e) => e.target.style.borderColor = '#0d6efd'}
                            onMouseOut={(e) => e.target.style.borderColor = '#6c757d'}
                          />
                          {editingCell.taskId === taskId && editingCell.field === 'name' ? (
                            <div
                              contentEditable
                              suppressContentEditableWarning
                              onInput={(e) => handleCellInput(e, task, 'name')}
                              onBlur={() => handleCellBlurOrEnter(task, 'name')}
                              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleCellBlurOrEnter(task, 'name'); } }}
                              style={{
                                outline: 'none',
                                borderBottom: '1px solid #0d6efd',
                                background: 'transparent',
                                color: 'white',
                                fontWeight: 'bold',
                                padding: '2px 4px',
                                minWidth: '100px',
                              }}
                              ref={editableRef}
                            >
                              {cellValue}
                            </div>
                          ) : (
                            <strong onDoubleClick={(e) => handleCellDoubleClick(task, 'name', e)}>
                              {task.name || task.title}
                            </strong>
                          )}
                        </td>
                        <td style={{ background: 'none', border: 'none', padding: '10px 8px' }}>
                          <span>{getAssignedByDisplay(task.assignedBy)}</span>
                        </td>
                        <td style={{ background: 'none', border: 'none', padding: '10px 8px' }}>
                          {editingCell.taskId === taskId && editingCell.field === 'dueDate' ? (
                            <div
                              contentEditable
                              suppressContentEditableWarning
                              onInput={(e) => handleCellInput(e, task, 'dueDate')}
                              onBlur={() => handleCellBlurOrEnter(task, 'dueDate')}
                              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleCellBlurOrEnter(task, 'dueDate'); } }}
                              style={{
                                outline: 'none',
                                borderBottom: '1px solid #0d6efd',
                                background: 'transparent',
                                color: 'white',
                                padding: '2px 4px',
                                minWidth: '100px',
                              }}
                              ref={editableRef}
                            >
                              {cellValue || (task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date')}
                            </div>
                          ) : (
                            <span>{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}</span>
                          )}
                        </td>
                        <td style={{ background: 'none', border: 'none', padding: '10px 8px' }}>
                          <span
                            style={{
                              display: 'inline-block',
                              width: 16,
                              height: 16,
                              borderRadius: 16,
                              backgroundColor: getRagColor(task.status),
                              border: '1px solid #444',
                            }}
                            title={task.status}
                          />
                        </td>
                      </tr>
                    );
                    // Always show subtasks under the parent
                    const subtasks = Array.isArray(subtasksMap[taskId]) ? subtasksMap[taskId] : [];
                    const subtaskRows = subtasks.map((subtask, subIdx) => (
                      <tr key={subtask.id || subtask._id || `${taskId}-subtask-${subIdx}`} style={{ background: '#23272b', cursor: 'pointer' }}
                          onClick={() => handleTaskClick(subtask)}>
                        <td style={{ display: 'flex', alignItems: 'center', gap: '4px', paddingLeft: 32 }}>
                          <input
                            type="checkbox"
                            checked={(subtask.status || '').toLowerCase() === 'completed'}
                            onChange={(e) => { e.stopPropagation(); handleToggleSubtaskComplete(subtask); }}
                            disabled={saving}
                            style={{
                              appearance: 'none',
                              width: '14px',
                              height: '14px',
                              borderRadius: '4px',
                              border: '1px solid #6c757d',
                              background: 'transparent',
                              cursor: 'pointer',
                              position: 'relative',
                              flexShrink: 0,
                            }}
                            className="custom-checkbox"
                            onMouseOver={(e) => e.target.style.borderColor = '#0d6efd'}
                            onMouseOut={(e) => e.target.style.borderColor = '#6c757d'}
                          />
                          {editingSubtask.subtaskId === (subtask.id || subtask._id) && editingSubtask.field === 'name' ? (
                            <div
                              contentEditable
                              suppressContentEditableWarning
                              onInput={(e) => handleSubtaskCellInput(e, subtask, 'name')}
                              onBlur={() => handleSubtaskCellBlurOrEnter(subtask, 'name')}
                              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleSubtaskCellBlurOrEnter(subtask, 'name'); } }}
                              style={{
                                outline: 'none',
                                borderBottom: '1px solid #0d6efd',
                                background: 'transparent',
                                color: 'white',
                                fontWeight: 'bold',
                                padding: '2px 4px',
                                minWidth: '100px',
                              }}
                              ref={editableRef}
                            >
                              {subtaskEditValue}
                            </div>
                          ) : (
                            <strong onDoubleClick={(e) => handleSubtaskCellDoubleClick(subtask, 'name', subtask.name || subtask.title, e)}>
                              {subtask.name || subtask.title}
                            </strong>
                          )}
                        </td>
                        <td style={{ background: 'none', border: 'none', padding: '10px 8px' }}>
                          <span>{getAssignedByDisplay(subtask.assignedBy)}</span>
                        </td>
                        <td style={{ background: 'none', border: 'none', padding: '10px 8px' }}>
                          <span>{subtask.dueDate ? new Date(subtask.dueDate).toLocaleDateString() : 'No due date'}</span>
                        </td>
                        <td style={{ background: 'none', border: 'none', padding: '10px 8px' }}>
                          <span
                            style={{
                              display: 'inline-block',
                              width: 16,
                              height: 16,
                              borderRadius: 16,
                              backgroundColor: getRagColor(subtask.status),
                              border: '1px solid #444',
                            }}
                            title={subtask.status}
                          />
                        </td>
                      </tr>
                    ));
                    // Inline add subtask row
                    const showInlineSubtaskForm = showSubtaskFormFor === taskId;
                    const inlineSubtask = inlineSubtasks[taskId] || { name: '', assignedBy: keycloak?.tokenParsed?.sub || '', dueDate: '' };
                    const inlineSubtaskRow = showInlineSubtaskForm ? (
                      <tr key={`inline-subtask-form-${taskId}`} style={{ background: '#23272b' }}>
                        <td style={{ paddingLeft: 32 }}>
                          <input
                            type="text"
                            className="form-control form-control-sm"
                            placeholder="Subtask Name"
                            value={inlineSubtask.name}
                            onChange={e => handleInlineSubtaskChange(taskId, 'name', e.target.value)}
                            required
                            style={{ maxWidth: 120 }}
                          />
                        </td>
                        <td>
                          <select
                            className="form-control form-control-sm"
                            value={inlineSubtask.assignedBy}
                            onChange={e => handleInlineSubtaskChange(taskId, 'assignedBy', e.target.value)}
                            style={{ maxWidth: 120 }}
                          >
                            <option value={keycloak?.tokenParsed?.sub || ''}>Self</option>
                            {users.filter(u => u.id !== keycloak?.tokenParsed?.sub).map(u => (
                              <option key={u.id || u.keycloakId} value={u.id || u.keycloakId}>{u.name}</option>
                            ))}
                          </select>
                        </td>
                        <td>
                          <input
                            type="date"
                            className="form-control form-control-sm"
                            value={inlineSubtask.dueDate}
                            onChange={e => handleInlineSubtaskChange(taskId, 'dueDate', e.target.value)}
                            style={{ maxWidth: 120 }}
                          />
                        </td>
                        <td>
                          <button className="btn btn-sm btn-success" onClick={() => handleInlineSubtaskAdd(task, inlineSubtask)}>Add</button>
                          <button className="btn btn-sm btn-secondary ms-2" onClick={() => setShowSubtaskFormFor(null)}>Cancel</button>
                        </td>
                      </tr>
                    ) : null;
                    // Add subtask button row
                    const addSubtaskRow = (
                      <tr key={`add-subtask-row-${taskId}`}>
                        <td colSpan={4} style={{ paddingLeft: 32, border: 'none', paddingTop: 2, paddingBottom: 2, lineHeight: 1 }}>
                          {!showInlineSubtaskForm && (
                            <button
                              className="btn btn-link text-secondary p-0"
                              style={{ fontSize: '0.95rem', lineHeight: 1, verticalAlign: 'middle' }}
                              onClick={(e) => { e.stopPropagation(); setShowSubtaskFormFor(taskId); }}
                            >
                              <i className="bi bi-plus-lg"></i> Add Subtask
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                    return [taskRow, ...subtaskRows, inlineSubtaskRow, addSubtaskRow];
                  }));
                }
                rows.push(
                  <tr key={`add-task-${section.id || section.name}`}>
                    <td colSpan={4} className="">
                      <button className="btn btn-link text-secondary" onClick={e => { e.stopPropagation(); handleAddTaskToSection(section.id); }}>
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
      <div className="">
        <button className="btn btn-link text-secondary" onClick={() => setShowSectionModal(true)}>+ Create Section</button>
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
                    if (onAddTask) onAddTask({ ...task, sectionId: taskSectionId });
                    setShowTaskModal(false);
                    toast.success('Task added successfully');
                  }}
                  onClose={() => setShowTaskModal(false)}
                  currentUser={keycloak?.tokenParsed ? { id: keycloak.tokenParsed.sub, name: keycloak.tokenParsed.name, email: keycloak.tokenParsed.email } : null}
                />
              </div>
            </div>
          </div>
          </div>
        )}
      {showTaskDetails && (
        <div className="offcanvas offcanvas-end show" style={{ width: 400, backgroundColor: '#23272b', color: 'white' }} tabIndex="-1">
          <div className="offcanvas-header border-bottom border-secondary">
            <h5 className="offcanvas-title">Task Details</h5>
            <button type="button" className="btn-close btn-close-white" onClick={() => setShowTaskDetails(null)}></button>
          </div>
          <div className="offcanvas-body">
            <div className="mb-3">
              <label className="form-label">Name</label>
              {editingCell.taskId === showTaskDetails.id && editingCell.field === 'name' ? (
                <div
                  contentEditable
                  suppressContentEditableWarning
                  onInput={(e) => handleCellInput(e, showTaskDetails, 'name')}
                  onBlur={() => handleCellBlurOrEnter(showTaskDetails, 'name')}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleCellBlurOrEnter(showTaskDetails, 'name'); } }}
                  style={{
                    outline: 'none',
                    borderBottom: '1px solid #0d6efd',
                    background: 'transparent',
                    color: 'white',
                    fontWeight: 'bold',
                    padding: '2px 4px',
                    minWidth: '100px',
                  }}
                  ref={editableRef}
                >
                  {cellValue}
                </div>
              ) : (
                <div onDoubleClick={(e) => handleCellDoubleClick(showTaskDetails, 'name', e)} className="border-bottom py-1">
                  <strong>{showTaskDetails.name}</strong>
                </div>
              )}
            </div>
            <div className="mb-3">
              <label className="form-label">Assigned By</label>
              <div className="border-bottom py-1">
                {getAssignedByDisplay(showTaskDetails.assignedBy)}
              </div>
            </div>
            <div className="mb-3">
              <label className="form-label">Due Date</label>
              {editingCell.taskId === showTaskDetails.id && editingCell.field === 'dueDate' ? (
                <div
                  contentEditable
                  suppressContentEditableWarning
                  onInput={(e) => handleCellInput(e, showTaskDetails, 'dueDate')}
                  onBlur={() => handleCellBlurOrEnter(showTaskDetails, 'dueDate')}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleCellBlurOrEnter(showTaskDetails, 'dueDate'); } }}
                  style={{
                    outline: 'none',
                    borderBottom: '1px solid #0d6efd',
                    background: 'transparent',
                    color: 'white',
                    padding: '2px 4px',
                    minWidth: '100px',
                  }}
                  ref={editableRef}
                >
                  {cellValue || (showTaskDetails.dueDate ? new Date(showTaskDetails.dueDate).toLocaleDateString() : 'No due date')}
                </div>
              ) : (
                <div onDoubleClick={(e) => handleCellDoubleClick(showTaskDetails, 'dueDate', e)} className="border-bottom py-1">
                  {showTaskDetails.dueDate ? new Date(showTaskDetails.dueDate).toLocaleDateString() : 'No due date'}
                </div>
              )}
            </div>
            <div className="mb-3">
              <label className="form-label">Status</label>
              {editingCell.taskId === showTaskDetails.id && editingCell.field === 'status' ? (
                <>
                  <div
                    contentEditable
                    suppressContentEditableWarning
                    onInput={(e) => handleCellInput(e, showTaskDetails, 'status')}
                    onBlur={() => handleCellBlurOrEnter(showTaskDetails, 'status')}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleCellBlurOrEnter(showTaskDetails, 'status'); } }}
                    style={{
                      outline: 'none',
                      borderBottom: '1px solid #0d6efd',
                      background: 'transparent',
                      color: 'white',
                      padding: '2px 4px',
                      minWidth: '100px',
                    }}
                    ref={editableRef}
                  >
                    {cellValue || showTaskDetails.status || 'Todo'}
                  </div>
                  {showDropdown.taskId === showTaskDetails.id && showDropdown.field === 'status' && (
                    <ul
                      className="dropdown-menu show"
                      style={{
                        position: 'absolute',
                        zIndex: 1000,
                        backgroundColor: '#343a40',
                        color: 'white',
                        minWidth: '100px',
                      }}
                    >
                      {getDropdownOptions('status').map(option => (
                        <li
                          key={option}
                          className="dropdown-item"
                          onClick={(e) => { e.stopPropagation(); handleDropdownSelect(showTaskDetails, 'status', option); }}
                          style={{ cursor: 'pointer' }}
                        >
                          {option}
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              ) : (
                <div onDoubleClick={(e) => handleCellDoubleClick(showTaskDetails, 'status', e)} className="border-bottom py-1">
                  <span className={getStatusBadgeClass(showTaskDetails.status)}>
                    {showTaskDetails.status || 'Todo'}
                  </span>
                </div>
              )}
            </div>
            <div className="mb-3">
              <label className="form-label">Priority</label>
              {editingCell.taskId === showTaskDetails.id && editingCell.field === 'priority' ? (
                <>
                  <div
                    contentEditable
                    suppressContentEditableWarning
                    onInput={(e) => handleCellInput(e, showTaskDetails, 'priority')}
                    onBlur={() => handleCellBlurOrEnter(showTaskDetails, 'priority')}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleCellBlurOrEnter(showTaskDetails, 'priority'); } }}
                    style={{
                      outline: 'none',
                      borderBottom: '1px solid #0d6efd',
                      background: 'transparent',
                      color: 'white',
                      padding: '2px 4px',
                      minWidth: '100px',
                    }}
                    ref={editableRef}
                  >
                    {cellValue || showTaskDetails.priority || 'None'}
                  </div>
                  {showDropdown.taskId === showTaskDetails.id && showDropdown.field === 'priority' && (
                    <ul
                      className="dropdown-menu show"
                      style={{
                        position: 'absolute',
                        zIndex: 1000,
                        backgroundColor: '#343a40',
                        color: 'white',
                        minWidth: '100px',
                      }}
                    >
                      {getDropdownOptions('priority').map(option => (
                        <li
                          key={option}
                          className="dropdown-item"
                          onClick={(e) => { e.stopPropagation(); handleDropdownSelect(showTaskDetails, 'priority', option); }}
                          style={{ cursor: 'pointer' }}
                        >
                          {option}
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              ) : (
                <div onDoubleClick={(e) => handleCellDoubleClick(showTaskDetails, 'priority', e)} className="border-bottom py-1">
                  {showTaskDetails.priority || 'None'}
                </div>
              )}
            </div>
            <div className="mb-3">
              <label className="form-label">Subtasks</label>
              {Array.isArray(subtasksMap[showTaskDetails.id]) && subtasksMap[showTaskDetails.id].length > 0 ? (
                <ul className="list-group list-group-flush">
                  {subtasksMap[showTaskDetails.id].map((subtask) => (
                    <li key={subtask.id || subtask._id} className="list-group-item bg-dark text-white border-secondary d-flex align-items-center">
                      <input
                        type="checkbox"
                        checked={(subtask.status || '').toLowerCase() === 'completed'}
                        onChange={(e) => { e.stopPropagation(); handleToggleSubtaskComplete(subtask); }}
                        disabled={saving}
                        className="me-2 custom-checkbox"
                        style={{
                          appearance: 'none',
                          width: '14px',
                          height: '14px',
                          borderRadius: '4px',
                          border: '1px solid #6c757d',
                          background: 'transparent',
                          cursor: 'pointer',
                          position: 'relative',
                          flexShrink: 0,
                        }}
                        onMouseOver={(e) => e.target.style.borderColor = '#0d6efd'}
                        onMouseOut={(e) => e.target.style.borderColor = '#6c757d'}
                      />
                      {editingSubtask.subtaskId === (subtask.id || subtask._id) && editingSubtask.field === 'name' ? (
                        <div
                          contentEditable
                          suppressContentEditableWarning
                          onInput={(e) => handleSubtaskCellInput(e, subtask, 'name')}
                          onBlur={() => handleSubtaskCellBlurOrEnter(subtask, 'name')}
                          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleSubtaskCellBlurOrEnter(subtask, 'name'); } }}
                          style={{
                            outline: 'none',
                            borderBottom: '1px solid #0d6efd',
                            background: 'transparent',
                            color: 'white',
                            fontWeight: 'bold',
                            padding: '2px 4px',
                            minWidth: '100px',
                          }}
                          ref={editableRef}
                        >
                          {subtaskEditValue}
                        </div>
                      ) : (
                        <span
                          onDoubleClick={(e) => handleSubtaskCellDoubleClick(subtask, 'name', subtask.name || subtask.title, e)}
                          className="flex-grow-1"
                        >
                          {subtask.name || subtask.title}
                        </span>
                      )}
                      <button
                        className="btn btn-outline-danger btn-sm ms-auto"
                        onClick={(e) => { e.stopPropagation(); handleDeleteSubtask(subtask); }}
                        title="Delete Subtask"
                      >
                        <i className="bi bi-trash-fill"></i>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-muted">No subtasks</div>
              )}
            </div>
            <div className="mb-3">
              <label className="form-label">Description</label>
              {editingCell.taskId === showTaskDetails.id && editingCell.field === 'description' ? (
                <div
                  contentEditable
                  suppressContentEditableWarning
                  onInput={(e) => handleCellInput(e, showTaskDetails, 'description')}
                  onBlur={() => handleCellBlurOrEnter(showTaskDetails, 'description')}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleCellBlurOrEnter(showTaskDetails, 'description'); } }}
                  style={{
                    outline: 'none',
                    borderBottom: '1px solid #0d6efd',
                    background: 'transparent',
                    color: 'white',
                    padding: '2px 4px',
                    minWidth: '100px',
                  }}
                  ref={editableRef}
                >
                  {cellValue}
                </div>
              ) : (
                <div onDoubleClick={(e) => handleCellDoubleClick(showTaskDetails, 'description', e)} className="border-bottom py-1">
                  {showTaskDetails.description || 'No description'}
                </div>
              )}
            </div>
            <button
              className="btn btn-outline-danger btn-sm"
              onClick={(e) => { e.stopPropagation(); handleDelete(showTaskDetails); }}
              disabled={saving}
            >
              Delete Task
            </button>
          </div>
        </div>
      )}
      <style jsx>{`
        .custom-checkbox:checked::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 8px;
          height: 8px;
          border-radius: 2px;
          background-color: #0d6efd;
        }
      `}</style>
    </div>
  );
}

export default ListView;