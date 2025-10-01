// src/js/api/profile/readBids.mjs
import { API_AUCTION_PROFILES } from '../constants.mjs';
import { doFetch } from '../doFetch.mjs';

/**
 * Get all bids for a profile.
 * When includeListings=true, also include the associated listing AND its bids
 * so the UI can show an accurate bid count.
 *
 * @param {string} name
 * @param {boolean} [includeListings=true]
 */
export async function readProfileBids(name, includeListings = true) {
  let qs = '';
  if (includeListings) {
    // Include listing details and each listing's
    // bid count
    qs = '?_listings=true&_bids=true';
  }
  const url = `${API_AUCTION_PROFILES}/${encodeURIComponent(name)}/bids${qs}`;
  return doFetch(url, { method: 'GET' }, true);
}
