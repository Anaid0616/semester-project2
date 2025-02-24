import { API_AUCTION_PROFILES } from '../constants.mjs';
import { doFetch } from '../../api/doFetch.mjs';

/**
 * Places a bid on a listing.
 *
 * @param {string} listingId - The ID of the listing.
 * @param {number} bidAmount - The amount of the bid.
 * @returns {Promise<object>} - The updated listing data.
 */
export async function placeBid(listingId, bidAmount) {
  const url = `${API_AUCTION_PROFILES}/${listingId}/bids`;
  const options = {
    method: 'POST',
    body: JSON.stringify({ amount: bidAmount }),
  };

  return await doFetch(url, options);
}
