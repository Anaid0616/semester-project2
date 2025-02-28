import { headers } from '../api/headers.mjs';
import { showAlert } from '../utilities/alert.mjs';

let unauthorizedAlertShown = false;
/**
 * A reusable fetch function.
 *
 * @param {string} url - The API endpoint URL.
 * @param {Object} options - Fetch options such as method, body, etc.
 * @param {boolean} [useAuth=true] - Whether to include authentication-related headers.
 * @returns {Promise<any>} A promise that resolves to the response data.
 * @throws {Error} An error if the request fails.
 */
export async function doFetch(url, options = {}, useAuth = true) {
  try {
    // Set up headers, optionally including auth headers
    const customHeaders = useAuth
      ? headers()
      : new Headers({ 'Content-Type': 'application/json' });

    const fetchOptions = {
      ...options,
      headers: customHeaders,
    };

    const response = await fetch(url, fetchOptions);

    // Handle empty responses (like 204 No Content)
    if (response.status === 204) {
      return response; // No content to parse
    }

    // Check for unsuccessful responses
    if (!response.ok) {
      if (response.status === 401) {
        console.warn('Unauthorized access. User may not be logged in.');

        // Only show alert if it hasn't been shown already
        // Check if on the login page
        const isOnLoginPage = window.location.pathname === '/login/';
        if (!unauthorizedAlertShown && !isOnLoginPage) {
          showAlert(
            'error',
            'You need to be logged in to access this page. Redirecting to login...'
          );
          unauthorizedAlertShown = true;

          setTimeout(() => {
            window.location.href = '/login/';
            unauthorizedAlertShown = false; // Reset after redirect
          }, 3000);
        }
        return null; // Prevent further execution
      }

      const errorData = await response.json();
      throw new Error(errorData.message || 'An error occurred');
    }

    return await response.json(); // Parse and return JSON response
  } catch (error) {
    console.error('Error in doFetch:', error.message);
    throw error;
  }
}
