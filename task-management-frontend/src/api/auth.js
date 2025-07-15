import axios from "axios";
import keycloak from '../keycloak';

const API_URL = "http://localhost:8080/auth";

export async function getMe(token) {
  const response = await fetch(`${API_URL}/me`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  if (!response.ok) throw new Error('Failed to fetch user info');
  return response.json();
}


export const getAuthHeader = () => {
  if (keycloak && keycloak.token) {
    return { Authorization: `Bearer ${keycloak.token}` };
  }
  return {};
};