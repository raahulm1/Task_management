const API_URL = "http://localhost:8080/sections";

export async function createSection(section, token) {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(section)
  });
  if (!response.ok) throw new Error('Failed to create section');
  return response.json();
}

export async function getSections(projectId, token) {
  const response = await fetch(`${API_URL}/project/${projectId}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  if (!response.ok) throw new Error('Failed to fetch sections');
  return response.json();
} 