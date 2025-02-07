import { API_KEY } from './constants.mjs';

/**
 * Generates headers for API requests.
 * Includes Authorization and API key headers if available.
 *
 * @returns {Headers} - Configured headers for fetch requests.
 */
export function headers() {
  const headers = new Headers();

  // Add API key to headers
  if (API_KEY) {
    headers.append('X-Noroff-API-Key', API_KEY);
  }

  // Add Authorization token if it exists in local storage
  const token = localStorage.getItem('token');
  if (token) {
    headers.append('Authorization', `Bearer ${token}`);
  }

  // Set content type for JSON data
  headers.append('Content-Type', 'application/json');
  return headers;
}
