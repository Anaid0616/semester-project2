import { loadSharedHeader } from '../../ui/global/sharedHeader.mjs';
import { API_AUCTION_PROFILES } from '../../api/constants.mjs';
import { doFetch } from '../../api/doFetch.mjs';
import { fetchAndDisplayProfile } from './profileUser.mjs';
import '../../ui/profile/updateAvatar.mjs';
import { generateSkeleton } from '../../utilities/skeletonLoader.mjs';
import { loadSharedFooter } from '../../ui/global/sharedFooter.mjs';
import {
  renderMyBidsSection,
  renderMyWinsSection,
} from '../../ui/profile/profileActivity.mjs';
import { createPagination } from '../../utilities/pagination.mjs';

loadSharedHeader();
loadSharedFooter();

const userListingsContainer = document.getElementById('listings-container');
const listingsBlock = document.getElementById('profile-listings-block');

let profilePage = 1;

/**
 * Create a pager bound to the profile page controls.
 * The helper will disable Prev/Next at edges and hide the whole bar when
 * totalPages <= 1 (it uses the current element’s parent container).
 */
const profilePager = createPagination({
  prevEl: '#profile-prev-page',
  nextEl: '#profile-next-page',
  currentEl: '#profile-current-page',
  onChange(newPage) {
    profilePage = newPage;
    userListingsContainer?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
    fetchAndDisplayUserListings(profilePage);
  },
});

/**
 * Fetch and render the profile’s own listings and, underneath,
 * show the “My Bids” and “My Wins” sections.
 *
 * Behavior:
 * - Renders a skeleton into `#listings-container` while loading.
 * - Resolves the username from `?user=` or `localStorage.user.name`.
 * - GETs `${API_AUCTION_PROFILES}/${username}/listings?limit=24&page=${page}`.
 * - Renders listing cards and updates pagination (including hiding the bar if 1 page).
 * - Injects “My Bids” and “My Wins” sections **after** the pager (once).
 * - Renders the two sections only for the profile owner. Failures here never
 *   remove already-rendered listings.
 *
 * Side effects:
 * - Mutates DOM under `#listings-container` and appends sections to
 *   `#profile-listings-block`.
 * - Reads `localStorage.user`.
 *
 * Error handling:
 * - Shows a friendly message if listings cannot be fetched.
 * - Logs (warn) if bids/wins fail, but keeps listings intact.
 *
 * @async
 * @param {number} [page=1] - Page number to fetch.
 * @returns {Promise<void>}
 */
async function fetchAndDisplayUserListings(page = 1) {
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const loggedInUser = JSON.parse(localStorage.getItem('user'));
    const username = urlParams.get('user') || loggedInUser?.name;

    if (!username) throw new Error('Username is undefined.');

    if (userListingsContainer) {
      userListingsContainer.innerHTML = generateSkeleton('listings');
    }

    // --- Fetch listings for this profile (paged) ---
    const profileListingsUrl = `${API_AUCTION_PROFILES}/${encodeURIComponent(
      username
    )}/listings?limit=24&page=${page}`;

    const profileData = await doFetch(profileListingsUrl, { method: 'GET' });
    const listings = profileData?.data ?? [];

    // --- Render listings or empty state ---
    if (!listings.length) {
      userListingsContainer.innerHTML = `<p>No listings available.</p>`;
      profilePager.update({ page, totalPages: 1 });
    } else {
      userListingsContainer.innerHTML = listings
        .map((listing) => {
          const mediaUrl = listing.media?.[0]?.url || '/images/placeholder.jpg';
          const title = listing.title || 'Untitled Listing';
          const description = listing.description
            ? `${listing.description.substring(0, 100)}...`
            : 'No description provided.';
          const bidCount = listing._count?.bids || 0;
          const endsAt = new Date(listing.endsAt).toLocaleDateString();

          return `
            <div class="listing bg-white shadow rounded-sm overflow-hidden p-4 flex flex-col justify-between">
              <a href="/listing/?id=${listing.id}" class="block hover:opacity-90" aria-label="Go to Listing">
                <img src="${mediaUrl}" alt="${title}" class="w-full aspect-square object-cover rounded-sm"/>
                <div class="p-2">
                  <h3 class="text-lg font-bold mb-2 line-clamp-2 min-h-12">${title}</h3>
                  <p class="text-gray-600 line-clamp-3">${description}</p>
                  <div class="mt-4">
                    <p class="text-sm text-gray-700">Bids: ${bidCount}</p>
                    <p class="text-sm text-gray-700">Ends: ${endsAt}</p>
                  </div>
                </div>
              </a>
            </div>
          `;
        })
        .join('');

      // Update pagination based on API meta (fallbacks kept just in case)
      const total = profileData?.meta?.total ?? page * 24 + 1;
      const limit = profileData?.meta?.limit ?? 24;
      let totalPages;
      if (typeof profileData?.meta?.total === 'number') {
        // If the API provides a total, use it
        totalPages = Math.max(1, Math.ceil(profileData.meta.total / limit));
      } else {
        // Fallback: if this page has fewer than `limit` items and we're on page 1,
        // assume there's only one page; otherwise, just keep the current page count.
        totalPages = page === 1 && listings.length < limit ? 1 : page;
      }

      profilePager.update({ page, totalPages });
    }

    // --- Ensure Bids/Wins sections exist **below the pager** (once) ---
    if (!document.getElementById('section-my-bids')) {
      listingsBlock.insertAdjacentHTML(
        'beforeend',
        `
          <section class="mt-10" id="section-my-bids" hidden>
            <h2 class="text-xl font-semibold mb-3">My Bids</h2>
            <div id="profile-bids"></div>
          </section>

          <section class="mt-10 mb-4" id="section-my-wins" hidden>
            <h2 class="text-xl font-semibold mb-3">My Wins</h2>
            <div id="profile-wins"></div>
          </section>
        `
      );
    }

    // --- Render Bids/Wins for the owner only ---
    try {
      if (username === loggedInUser?.name) {
        await renderMyBidsSection(username);
        await renderMyWinsSection(username);
      }
    } catch (err) {
      console.warn('Failed to render bids/wins:', err);
    }
  } catch (error) {
    console.error('Error fetching user listings:', error);
    if (userListingsContainer) {
      userListingsContainer.innerHTML =
        '<p>Only registered users can view listings. Please log in to continue.</p>';
    }
    profilePager.update({ page: 1, totalPages: 1 });
  }
}

// Bootstrapping: header/profile info + listings/activity
fetchAndDisplayProfile();
fetchAndDisplayUserListings(profilePage);
