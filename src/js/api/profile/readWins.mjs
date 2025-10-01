import { API_AUCTION_PROFILES } from '../constants.mjs';
import { doFetch } from '../doFetch.mjs';

/** Get all listings won by a profile. */
export async function readProfileWins(name) {
  const url = `${API_AUCTION_PROFILES}/${encodeURIComponent(name)}/wins`;
  return await doFetch(url, { method: 'GET' }, true);
}
