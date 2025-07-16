const API_URL = "http://localhost:8080/users";

export async function getUsers(token) {
  const response = await fetch(API_URL, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  if (!response.ok) throw new Error('Failed to fetch users');
  return response.json();
}

export async function getUserById(keycloakId, token) {
  const response = await fetch(`${API_URL}/${keycloakId}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  if (!response.ok) throw new Error('Failed to fetch user');
  return response.json();
} 