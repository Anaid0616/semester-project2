import { API_AUCTION_LISTINGS } from '../constants.mjs';
import { doFetch } from '../../api/doFetch.mjs';

/**
 * Creates a new listing by sending the data to the API.
 *
 * @param {Object} data - The listing parameters.
 * @param {string} data.title - The title of the listing (required).
 * @param {string} [data.description] - The body of the listing (optional).
 * @param {string[]} [data.tags] - Array of tags associated with the listing (optional).
 * @param {Object} [data.media] - Media object containing URL and alt text (optional).
 * @param {string} [data.media.url] - The URL of the media (optional).
 * @param {string} [data.media.alt] - Alt text for the media (optional).
 * @returns {Promise<Object>} The created  data from the API.
 * @throws {Error} If the API request fails.
 *
 * @example
 * // Example usage:
 * const listingData = {
 *   title: "My New Listing",
 *   description: "This is the body of my listing.",
 *   tags: ["tag1", "tag2"],
 *   media: { url: "https://example.com/image.jpg", alt: "Example Image" },
 * };
 *
 * try {
 *   const newListing = await createListing(listingData);
 *   console.log("Listing created:", newListing);
 * } catch (error) {
 *   console.error("Failed to create listing:", error);
 * }
 */
export async function createListing({
  media = {},
  title,
  description = '',
  tags = [],
  endsAt,
}) {
  try {
    const options = {
      method: 'POST',
      body: JSON.stringify({ media, title, description, tags, endsAt }),
    };

    // Using doFetch with authentication headers (default is `true`)
    const response = await doFetch(API_AUCTION_LISTINGS, options);

    // Return the response if successful
    return response;
  } catch (error) {
    console.error('Error creating listing:', error);
    throw error;
  }
}
