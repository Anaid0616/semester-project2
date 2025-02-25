import { API_AUCTION_LISTINGS } from '../constants.mjs';
import { doFetch } from '../../api/doFetch.mjs';
import { initializeFormHandler } from '../../utilities/formHandler.mjs';

// Call the function to attach the form submission logic
initializeFormHandler();

/**
 * Updates an existing listing by sending updated data to the API.
 *
 * @param {string|number} id - The ID of the listing to update.
 * @param {Object} params - The updated listing parameters.
 * @param {string} [params.title] - The updated title of the listing. (optional)
 * @param {string} [params.body] - The updated description of the listing. (optional)
 * @param {string[]} [params.tags] - Array of updated tags associated with the listing. (optional)
 * @param {Object} [params.media] - Updated media object containing URL and alt text. (optional)
 * @param {string} [params.media.url] - The updated URL of the media.
 * @param {string} [params.media.alt] - Updated alt text for the media.
 * @returns {Promise<Object>} The updated listing data from the API.
 * @throws {Error} If the API request fails.
 */

export async function updateListing(
  id,
  { title, description, tags, media, endsAt }
) {
  const payload = { title, description, tags, media, endsAt }; // Data to be sent to the API

  try {
    const options = {
      method: 'PUT',
      body: JSON.stringify(payload), // Attach payload
    };

    // Use `doFetch` to update the post
    return await doFetch(`${API_AUCTION_LISTINGS}/${id}`, options);
  } catch (error) {
    console.error('Error updating listing:', error);
    throw error; // Re-throw error for further handling
  }
}
