import { API_AUTH_LOGIN } from '../constants.mjs';
import { doFetch } from '../../api/doFetch.mjs';
import { initializeFormHandler } from '../../utilities/formHandler.mjs';

// Call the function to attach the form submission logic
initializeFormHandler();

/**
 * Logs in a user with the provided email and password.
 *
 * @param {Object} data - The login data.
 * @param {string} data.email - The user's email address.
 * @param {string} data.password - The user's password.
 * @returns {Promise<Object>} A promise that resolves to the user's login response.
 * @throws {Error} Error if the login fails.
 */
export async function login({ email, password }) {
  const options = {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  };

  try {
    return await doFetch(API_AUTH_LOGIN, options, false); // Pass `false` for no auth headers
  } catch (error) {
    console.error('Error during login:', error);
    throw error;
  }
}
