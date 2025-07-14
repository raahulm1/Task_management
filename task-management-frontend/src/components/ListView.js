import React from 'react';
import { useDispatch } from 'react-redux';
import { deleteTask, startEditingTask } from '../features/tasks/tasksSlice';

function ListView({ tasks, onStatusChange }) {
  const dispatch = useDispatch();

  const handleDelete = (taskId) => {
    dispatch(deleteTask({ taskId, projectId: tasks[0]?.projectId }));
  };

  const handleEdit = (task) => {
    dispatch(startEditingTask(task));
  };

  const getStatusBadgeClass = (status) => {
    switch ((status || "").toLowerCase()) {
      case "todo":
        return "badge bg-primary";
      case "in progress":
        return "badge bg-warning text-dark";
      case "completed":
        return "badge bg-success";
      default:
        return "badge bg-secondary";
    }
  };

  return (
    <div className="table-responsive">
      <table className="table table-dark table-hover">
        <thead>
          <tr>
            <th scope="col">Name</th>
            <th scope="col">Assignee</th>
            <th scope="col">Due Date</th>
            <th scope="col">Status</th>
            <th scope="col">RAG</th>
            <th scope="col">Actions</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((task) => (
            <tr key={task.id}>
              <td>
                <div>
                  <strong>{task.title}</strong>
                  {task.description && (
                    <div className="text-muted small mt-1">{task.description}</div>
                  )}
                </div>
              </td>
              <td>{task.assignee || 'Unassigned'}</td>
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
        </tbody>
      </table>
      {tasks.length === 0 && (
        <div className="text-center py-4">
          <p className="text-muted">No tasks found. Create your first task to get started!</p>
        </div>
      )}
    </div>
  );
}

export default ListView; 