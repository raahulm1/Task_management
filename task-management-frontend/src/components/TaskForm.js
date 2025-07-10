// src/components/TaskForm.js
import React, { useState } from "react";

function TaskForm({ onAdd, onClose }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("Low");
  const [assignee, setAssignee] = useState("");
  const [dueDate, setDueDate] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onAdd({
      title,
      description,
      priority,
      assignee,
      dueDate,
      status: "todo",
    });
  };

  return (
    <form onSubmit={handleSubmit} style={{ background: "#fff", padding: 20, borderRadius: 4, margin: "1rem 0" }}>
      <h3>Add Task</h3>
      <input
        type="text"
        placeholder="Title"
        value={title}
        onChange={e => setTitle(e.target.value)}
        required
        style={{ width: "100%", marginBottom: 10 }}
      />
      <textarea
        placeholder="Description"
        value={description}
        onChange={e => setDescription(e.target.value)}
        style={{ width: "100%", marginBottom: 10 }}
      />
      <select value={priority} onChange={e => setPriority(e.target.value)} style={{ width: "100%", marginBottom: 10 }}>
        <option>Low</option>
        <option>Medium</option>
        <option>High</option>
      </select>
      <input
        type="text"
        placeholder="Assignee"
        value={assignee}
        onChange={e => setAssignee(e.target.value)}
        style={{ width: "100%", marginBottom: 10 }}
      />
      <input
        type="date"
        value={dueDate}
        onChange={e => setDueDate(e.target.value)}
        style={{ width: "100%", marginBottom: 10 }}
      />
      <button type="submit" style={{ marginRight: 10 }}>Add</button>
      <button type="button" onClick={onClose}>Cancel</button>
    </form>
  );
}

export default TaskForm;