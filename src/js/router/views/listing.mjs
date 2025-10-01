import { loadSharedHeader } from '../../ui/global/sharedHeader.mjs';
import { showAlert } from '../../utilities/alert.mjs';
import { readListing } from '../../api/listing/read';
import { generateSkeleton } from '../../utilities/skeletonLoader.mjs';
import { loadSharedFooter } from '../../ui/global/sharedFooter.mjs';
import { showModal } from '../../utilities/modal.mjs';
import { deleteListing } from '../../api/listing/delete';
import {
  renderImageCarousel,
  setupImageCarouselListeners,
} from '../../utilities/imageCarousel.mjs';
import {
  renderBidSection,
  setupBidEventListeners,
} from '../../utilities/bidHandler.mjs';
import { initNotifier, watchListing } from '../../utilities/notifier.mjs';

loadSharedHeader();
loadSharedFooter();

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const listingId = urlParams.get('id');

const listingContainer = document.getElementById('listing-container');

/**
 * Replace the listing container with a skeleton loader while data is fetched.
 * @returns {void}
 */
function showSkeletonLoader() {
  listingContainer.innerHTML = generateSkeleton('listing');
}

/**
 * Fetch the listing by id and render the detail view.
 *
 * Side effects:
 * - Manipulates the DOM inside `#listing-container`.
 * - Reads from localStorage key `user`.
 * - Binds click handlers for carousel, bidding, and delete actions.
 * - On successful delete, navigates to `/profile/` after a short delay.
 *
 * Error handling:
 * - Shows an error alert if the listing fails to load.
 * - Throws if the API does not return a listing.
 *
 * @async
 * @returns {Promise<void>}
 * @throws {Error} If the listing is not found.
 */
async function fetchAndRenderListing() {
  try {
    showSkeletonLoader();

    const response = await readListing(listingId);
    const { data: listing } = response;

    if (!listing) throw new Error('Listing not found');

    const { media, title, description, seller, created } = listing;

    const user = JSON.parse(localStorage.getItem('user'));
    initNotifier(user?.name ?? null); // Initialize notifier with current user

    // snapshot för watch:
    const bids = listing.bids ?? [];
    const highest = bids.length ? Math.max(...bids.map((b) => b.amount)) : 0;
    const highestBid = bids.find((b) => b.amount === highest);
    const highestBidder = highestBid?.bidderName ?? highestBid?.bidder?.name;

    watchListing(listingId, {
      highest,
      highestBidder,
      endsAt: listing.endsAt,
    });

    const images =
      media.length > 0
        ? media.map((image) => image.url)
        : ['/images/placeholder.jpg'];
    const alts = media.map((image) => image.alt) || ['No alt text provided'];

    const imageCarouselHtml = renderImageCarousel(images, alts);
    /** Seller avatar with placeholder fallback. */
    const sellerAvatar = seller?.avatar?.url || '../images/placeholder.jpg';

    const bidSectionHtml = renderBidSection(
      listing,
      /** @type {string} */ listingId,
      fetchAndRenderListing,
      user
    );

    listingContainer.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
            <div class="relative">
                ${imageCarouselHtml}
            </div>
    
            <div class="space-y-5">
                <div class="flex items-center gap-4">
                    <img src="${sellerAvatar}" alt="Seller Avatar" class="w-12 h-12 rounded-full border border-gray-300 shadow-md"/>
                    <a href="/profile/?user=${
                      seller?.name
                    }" class="font-semibold text-lg text-gray-700 hover:underline" aria-label="Go to Seller">
                        ${seller?.name || 'Anonymous'}
                    </a>
                </div>
    
                <h1 class="text-2xl font-semibold text-gray-900 border-t border-gray-300 pt-4 space-y-2">
                    ${title || 'No Title'}
                </h1>

               <div> ${bidSectionHtml}</div>
                
            </div>
          </div>
    
        <div class="max-w-4xl mt-0">
            <h2 class="text-2xl font-semibold border-b mt-6 pb-3">Description</h2>
            <p class="text-gray-800 mt-4">${
              description || 'No Description Available'
            }</p>
          
            <p class="text-sm text-gray-600 my-6 border-t pt-2">Created: ${new Date(
              created
            ).toLocaleDateString()}</p>
        </div>
      
        `;

    setupImageCarouselListeners(images);
    setupBidEventListeners(listingId, fetchAndRenderListing);

    // Delete button (if present) — guarded optional chaining to avoid errors.
    document
      .getElementById('delete-listing-button')
      ?.addEventListener('click', async () => {
        if (await showModal('Delete this listing?', 'Delete', 'Cancel')) {
          await deleteListing(listingId);
          showAlert('success', 'Listing deleted successfully!');
          setTimeout(() => {
            window.location.href = '/profile/';
          }, 1500);
        }
      });
  } catch (error) {
    console.error('Error fetching listing:', error);
    showAlert('error', 'Failed to load the listing.');
  }
}

// Kick off initial render
fetchAndRenderListing();
