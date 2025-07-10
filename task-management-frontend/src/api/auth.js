import axios from "axios";

const API_URL = "http://localhost:8080/auth";

export const register = async (name, password) => {
  const res = await axios.post(`${API_URL}/register`, { name, password });
  return res.data;
};

export const login = async (name, password) => {
  const res = await axios.post(`${API_URL}/login`, { name, password });
  return res.data.token; // returns JWT token
};