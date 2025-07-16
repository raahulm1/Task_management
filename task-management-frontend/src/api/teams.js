import axios from "axios";

const API_URL = "http://localhost:8080/teams";

export async function getTeams(token) {
  const response = await fetch(API_URL, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  if (!response.ok) throw new Error('Failed to fetch teams');
  return response.json();
}

export async function getTeamById(id, token) {
  const response = await fetch(`${API_URL}/${id}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  if (!response.ok) throw new Error('Failed to fetch team');
  return response.json();
}

export async function createTeam(team, token) {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(team)
  });
  if (!response.ok) throw new Error('Failed to create team');
  return response.json();
}

export async function updateTeam(id, team, token) {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(team)
  });
  if (!response.ok) throw new Error('Failed to update team');
  return response.json();
}

export async function deleteTeam(id, token) {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  if (!response.ok) throw new Error('Failed to delete team');
  return response.ok;
} 