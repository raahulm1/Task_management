import axios from "axios";

const API_URL = "http://localhost:8080/tasks";

// ✅ Get tasks by project ID
export const getTasks = async (projectId, token) => {
  const res = await axios.get(`${API_URL}/${projectId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};

// ✅ Add a task
export const addTask = async (task, token) => {
  const res = await axios.post(API_URL, task, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};

// ✅ Update a task
export const updateTask = async (id, task) => {
  const res = await axios.put(`${API_URL}/${id}`, task);
  return res.data;
};

// ✅ Delete a task
export const deleteTask = async (id, token) => {
  const res = await axios.delete(`${API_URL}/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};
