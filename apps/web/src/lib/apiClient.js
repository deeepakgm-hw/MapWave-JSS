// Thin fetch wrapper reading API base URL from env
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export async function apiClient(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });
  if (!response.ok) {
    throw new Error(`API error (${response.status}): ${response.statusText}`);
  }
  return response.json();
}
