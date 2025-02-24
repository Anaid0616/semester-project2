import { API_AUCTION_PROFILES } from '../constants.mjs';
import { doFetch } from '../../api/doFetch.mjs';
// Import the form handler
import { initializeFormHandler } from '../../utilities/formHandler.mjs';

// Call the function to attach the form submission logic
initializeFormHandler();

/**
 * Updates the profile information for a given user.
 *
 * @param {string} username - The username of the profile being updated.
 * @param {object} data - Profile update data.
 * @param {object} [data.avatar] - The avatar object containing the URL.
 * @param {string} [data.avatar.url] - The URL of the user's avatar.
 * @param {string} [data.bio] - The user's bio (optional).
 * @returns {Promise<object>} - The updated profile response from the API.
 *
 * @example
 * // Example usage:
 * try {
 *   const updatedProfile = await updateProfile("dtyb16", { bio: "New bio" });
 *   console.log("Profile updated:", updatedProfile);
 * } catch (error) {
 *   console.error("Failed to update profile:", error);
 * }
 */
export async function updateProfile(username, data) {
  try {
    const options = {
      method: 'PUT', // Set HTTP method
      body: JSON.stringify(data), // Pass the updated data
    };

    // Use `doFetch` to send the request
    const response = await doFetch(
      `${API_AUCTION_PROFILES}/${username}`,
      options
    );

    console.log('API Response Status:', response.status);
    console.log('API Response JSON:', response);

    if (!response) {
      throw new Error('No response received from the API.');
    }

    if (response.errors) {
      console.error('API Error:', response.errors);
      throw new Error(response.errors[0]?.message || 'Unknown API error.');
    }

    return response;
  } catch (error) {
    console.error('Error updating profile:', error);
    throw error;
  }
}
