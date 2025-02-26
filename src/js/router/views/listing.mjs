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

loadSharedHeader();
loadSharedFooter();

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const listingId = urlParams.get('id');

const listingContainer = document.getElementById('listing-container');

function showSkeletonLoader() {
  listingContainer.innerHTML = generateSkeleton('listing');
}
/**
 * Render listings
 */
async function fetchAndRenderListing() {
  try {
    showSkeletonLoader();

    const response = await readListing(listingId);
    const { data: listing } = response;

    if (!listing) throw new Error('Listing not found');

    const { media, title, description, seller, endsAt, created } = listing;

    const user = JSON.parse(localStorage.getItem('user'));

    const images =
      media.length > 0
        ? media.map((image) => image.url)
        : ['/images/placeholder.jpg'];

    const imageCarouselHtml = renderImageCarousel(images);

    const sellerAvatar =
      seller?.avatar?.url || '../public/images/default-avatar.png';

    const bidSectionHtml = renderBidSection(
      listing,
      listingId,
      fetchAndRenderListing,
      user
    );

    const editDeleteButtonsHtml =
      user?.name === seller?.name
        ? `
        <div id="listing-buttons" class="mt-4 flex gap-4">
          <a href="/listing/edit/?id=${listingId}">
            <button class="px-4 py-2 bg-[#C5A880] text-black hover:bg-[#9E7B63] rounded-sm font-semibold">Edit</button>
          </a>
          <button id="delete-listing-button" class="px-4 py-2 bg-[#C5A880] text-black hover:bg-[#9E7B63] rounded-sm font-semibold">Delete</button>
        </div>`
        : '';

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
                    }" class="font-semibold text-lg text-gray-700 hover:underline">
                        ${seller?.name || 'Anonymous'}
                    </a>
                </div>
    
                <h3 class="text-2xl font-semibold text-gray-900 border-t border-gray-300 pt-4 space-y-2">
                    ${title || 'No Title'}
                </h3>

                 <p class="text-gray-700">Ends At: ${new Date(
                   endsAt
                 ).toLocaleDateString()}</p>
                 ${editDeleteButtonsHtml}
                ${bidSectionHtml}
                
               
            </div>
        </div>
    
        <div class="max-w-4xl mt-10">
            <h2 class="text-2xl font-semibold border-b pb-3">Description</h2>
            <p class="text-gray-700 mt-4">${
              description || 'No Description Available'
            }</p>
            <p class="text-sm text-gray-500 mt-6 border-t pt-2">Created: ${new Date(
              created
            ).toLocaleDateString()}</p>
        </div>
        `;

    setupImageCarouselListeners(images);
    setupBidEventListeners(listingId, fetchAndRenderListing);

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

fetchAndRenderListing();
