import { API_AUCTION_LISTINGS } from '../constants.mjs';
import { doFetch } from '../../api/doFetch.mjs';

/**
 * Reads a single listing by its ID.
 *
 * @param {string|number} id - The ID of the listing to read.
 * @returns {Promise<object>} The response data.
 * @throws {Error} If the API request fails.
 */
export async function readListing(id) {
  const url = `${API_AUCTION_LISTINGS}/${id}?_seller=true`;
  try {
    // Use doFetch with `GET` method and auth headers
    return await doFetch(url, { method: 'GET' }, true);
  } catch (error) {
    console.error('Error in readPost:', error);
    throw error;
  }
}

/**
 * Reads multiple listings with optional pagination.
 *
 * @param {number} [limit=12] - The maximum number of listings to return.
 * @param {number} [page=1] - The page number for pagination.
 * @returns {Promise<Object>} An object containing an array of listings in the `data` field, and information in a `meta` field.
 * @throws {Error} If the API request fails.
 */
export async function readListings(limit = 12, page = 1) {
  const url = `${API_AUCTION_LISTINGS}?limit=${limit}&page=${page}&_seller=true`;
  try {
    // Use doFetch with `GET` method and auth headers
    return await doFetch(url, { method: 'GET' }, true);
  } catch (error) {
    console.error('Error reading posts:', error);
    throw error;
  }
}

/**
 * Reads multiple listings by a specific user with optional pagination.
 *
 * @param {string} username - The username of the user whose listings to read.
 * @param {number} [limit=12] - The maximum number of listings to return.
 * @param {number} [page=1] - The page number for pagination.
 * @returns {Promise<object>} Object with data and meta fields.
 * @throws {Error} If the API request fails.
 */
export async function readListingsByUser(username, limit = 12, page = 1) {
  const url = `${API_AUCTION_LISTINGS}?_seller=true&seller=${username}&limit=${limit}&page=${page}`;
  try {
    // Use doFetch with `GET` method and auth headers
    return await doFetch(url, { method: 'GET' }, true);
  } catch (error) {
    console.error('Error reading user posts:', error);
    throw error;
  }
}
