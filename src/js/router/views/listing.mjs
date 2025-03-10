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

    const { media, title, description, seller, created } = listing;

    const user = JSON.parse(localStorage.getItem('user'));

    const images =
      media.length > 0
        ? media.map((image) => image.url)
        : ['/images/placeholder.jpg'];
    const alts = media.map((image) => image.alt) || ['No alt text provided'];

    const imageCarouselHtml = renderImageCarousel(images, alts);

    const sellerAvatar = seller?.avatar?.url || '../images/placeholder.jpg';

    const bidSectionHtml = renderBidSection(
      listing,
      listingId,
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
