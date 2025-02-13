import { API_AUCTION_PROFILES } from '../../api/constants.mjs';
import { doFetch } from '../../api/doFetch.mjs';

/**
 * Fetch user credits.
 * @param {string} username - The username of the logged-in user.
 * @returns {Promise<number>} The user's credits.
 */
export async function fetchUserCredits(username) {
  try {
    const profileData = await doFetch(`${API_AUCTION_PROFILES}/${username}`, {
      method: 'GET',
    });
    return profileData.credits || 0; // Default to 0 if not available
  } catch (error) {
    console.error('Error fetching credits:', error);
    return 0;
  }
}
