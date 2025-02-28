import { API_AUTH_REGISTER } from '../constants.mjs';
import { doFetch } from '../../api/doFetch.mjs';
import { initializeFormHandler } from '../../utilities/formHandler.mjs';

// Call the function to attach the form submission logic
initializeFormHandler();

/**
 * Registers a new user with the provided details.
 *
 * @param {Object} data - The registration data.
 * @param {string} data.name - The user's name (required).
 * @param {string} data.email - The user's email address (required).
 * @param {string} data.password - The user's password (required).
 *
 * **OPTIONAL VALUES**
 *
 * @param {string} [data.bio] - A brief biography of the user (optional).
 * @param {Object} [data.avatar] - The user's avatar information (optional).
 * @param {string} [data.avatar.url] - URL for the user's avatar image.
 * @param {string} [data.avatar.alt] - Alt text for the user's avatar image.
 * @param {Object} [data.banner] - The user's banner information (optional).
 * @param {string} [data.banner.url] - URL for the user's banner image.
 * @param {string} [data.banner.alt] - Alt text for the user's banner image.
 * @param {boolean} [data.venueManager] - Indicates if the user is a venue manager (optional, used for holidaze).
 * @returns {Promise<Object>} A promise that resolves to the user's registration response.
 */
export async function register({ name, email, password, bio, avatar, banner }) {
  try {
    const options = {
      method: 'POST',
      body: JSON.stringify({
        name,
        email,
        password,
        bio,
        avatar,
        banner,
        credits: 1000,
      }),
    };

    // Use doFetch with API_AUTH_REGISTER and pass `false` for no auth headers
    const response = await doFetch(API_AUTH_REGISTER, options, false);

    return response; // Resolve the response as JSON
  } catch (error) {
    console.error('Error during registration:', error);
    throw error; // Propagate the error for the caller to handle
  }
}
