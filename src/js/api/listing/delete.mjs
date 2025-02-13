import { API_AUCTION_LISTINGS } from '../constants.mjs';
import { doFetch } from '../../api/doFetch.mjs';

/**
 * Deletes a listings by its ID.
 *
 * @param {string|number} id - The ID of the listing to delete.
 * @returns {Promise<void>} Resolves if the deletion was successful.
 * @throws {Error} If the API request fails.
 */
export async function deleteListing(id) {
  try {
    const options = {
      method: 'DELETE',
    };

    const response = await doFetch(`${API_AUCTION_LISTINGS}/${id}`, options);

    // Check if the response status is 204 (No Content) or a successful status
    if (response && response.status === 204) {
      console.log('Listing deleted successfully');
      return true; // Indicate success
    }

    // Handle unexpected responses
    const result = await response.json(); // Attempt to parse any other response
    console.log('Delete response:', result);
    return result; // Return the result if it exists
  } catch (error) {
    console.error('Error deleting listing:', error);
    throw error; // Re-throw the error for higher-level handling
  }
}
