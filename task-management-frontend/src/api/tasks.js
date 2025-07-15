import axios from "axios";
import { getAuthHeader } from "./auth";

const API_URL = "http://localhost:8080/tasks";

export async function getTasks(projectId, token) {
  const response = await fetch(`/tasks/${projectId}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  if (!response.ok) throw new Error('Failed to fetch tasks');
  return response.json();
}

export async function addTask(task, token) {
  const response = await fetch('/tasks', {
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
  const response = await fetch(`/tasks/${id}`, {
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
  const response = await fetch(`/tasks/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  if (!response.ok) throw new Error('Failed to delete task');
  return response.ok;
}