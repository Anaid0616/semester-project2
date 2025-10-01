import { API_AUCTION_PROFILES } from '../constants.mjs';
import { doFetch } from '../doFetch.mjs';

/**
 * Get all bids for a profile. Use `_listings=true` to include listing data.
 * @param {string} name
 * @param {boolean} [includeListings=true]
 */
export async function readProfileBids(name, includeListings = true) {
  const qs = includeListings ? '?_listings=true' : '';
  const url = `${API_AUCTION_PROFILES}/${encodeURIComponent(name)}/bids${qs}`;
  return await doFetch(url, { method: 'GET' }, true);
}
