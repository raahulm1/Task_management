import axios from "axios";
import { getAuthHeader } from "./auth";

const API_URL = "http://localhost:8080/tasks";

export async function getTasks(projectId, token) {
  const response = await fetch(`${API_URL}/${projectId}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  if (!response.ok) throw new Error('Failed to fetch tasks');
  const data = await response.json();
  // Patch: map _id to id for all tasks
  return Array.isArray(data) ? data.map(task => ({ ...task, id: task.id || task._id })) : data;
}

export async function addTask(task, token) {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(task)
  });
  if (!response.ok) throw new Error('Failed to add task');
  return response.json();
}

export async function updateTask(id, task, token) {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(task)
  });
  if (!response.ok) throw new Error('Failed to update task');
  return response.json();
}

export async function deleteTask(id, token) {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  if (!response.ok) throw new Error('Failed to delete task');
  return response.ok;
}

export async function patchTask(id, updates, token) {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(updates)
  });
  if (!response.ok) throw new Error('Failed to patch task');
  return response.json();
}