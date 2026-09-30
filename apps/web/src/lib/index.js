// TODO: API client, types, constants, and network helpers
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export async function fetchJson(endpoint, options = {}) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });
  if (!response.ok) {
    throw new Error(`API error: ${response.statusText}`);
  }
  return response.json();
}
