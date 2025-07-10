import axios from "axios";

const API_URL = "http://localhost:8080/projects";

export const getProjects = async (token) => {
  const res = await axios.get(API_URL, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};

export const createProject = async (name, token) => {
  const res = await axios.post(API_URL, { name }, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};