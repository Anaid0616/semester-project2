import { loadSharedHeader } from '../../ui/global/sharedHeader.mjs';
import { showModal } from '../../utilities/modal.mjs';
import { readListing } from '../../api/listing/read';
import { deleteListing } from '../../api/listing/delete';
import { showAlert } from '../../utilities/alert.mjs';
import { generateSkeleton } from '../../utilities/skeletonLoader.mjs';

loadSharedHeader(); // Load shared header dynamically

// Get listing ID from URL
const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const listingId = urlParams.get('id');

if (!listingId) {
  showAlert('error', 'No listing ID provided. Redirecting to home page.');
  setTimeout(() => {
    window.location.href = '/';
  }, 1500);
}

const listingContainer = document.getElementById('listing-container');

function showSkeletonLoader() {
  listingContainer.innerHTML = generateSkeleton('listing');
}

/**
 * Fetches and displays the listing.
 */
async function fetchAndRenderListing() {
  try {
    showSkeletonLoader(); // Show skeleton while fetching

    // Fetch listing data
    const response = await readListing(listingId);
    const { data: listing } = response;
    console.log('Listing Data:', listing);

    if (!listing) throw new Error('Listing not found');

    // Destructure listing data
    const {
      media,
      title,
      description,
      seller,
      endsAt,
      _count,
      price,
      created,
      bids,
    } = listing;

    // Bids data
    const bidCount = _count?.bids ?? 0;
    const finalPrice = bids?.length ? `$${bids[bids.length - 1].amount}` : '0';

    // Image carousel logic
    let currentImageIndex = 0;
    const images =
      media.length > 0 ? media : ['../public/images/placeholder.jpg'];

    function updateImage(index) {
      document.getElementById('main-image').src = images[index];
    }

    // Seller avatar fallback
    const sellerAvatar =
      seller?.avatar?.url || '../public/images/default-avatar.png';

    // Render listing details in the container
    // Replace the part inside listingContainer.innerHTML with this:
    listingContainer.innerHTML = `
<div class="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
    <!-- Image Section with Carousel -->
    <div class="relative">
        <img id="main-image" src="${
          images[0]
        }" alt="Listing Image" class="w-full h-96 object-cover rounded-lg shadow-md"/>
        <button id="prev-image" class="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full">◀</button>
        <button id="next-image" class="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full">▶</button>
    </div>

    <!-- Item Details -->
    <div class="space-y-5">
        <!-- Seller Info -->
        <div class="flex items-center gap-4">
            <img id="seller-avatar" src="${sellerAvatar}" alt="Seller Avatar" class="w-12 h-12 rounded-full border border-gray-300 shadow-md"/>
            <a href="/profile/?user=${
              seller?.name
            }" class="font-semibold text-lg text-gray-700 hover:underline">${
      seller?.name || 'Anonymous'
    }</a>
        </div>

        <!-- Title -->
        <h3 class="text-2xl font-semibold text-gray-900 border-t border-gray-300 pt-4 space-y-2">${
          title || 'No Title'
        }</h3>

        <!-- Bids & Pricing -->
        <div>
        <p class="text-gray-700">Ends At: ${new Date(
          endsAt
        ).toLocaleDateString()}</p> 
           <p class="text-gray-700">Asking Price: ${
             price ? `$${price}` : 'N/A'
           }</p>
            <p class="text-gray-700">Bids: ${bidCount}</p>
         
            <p class="text-lg font-bold text-gray-800">Total Price: ${finalPrice}</p>
        </div>

        <!-- Bid Button -->
        <button class="w-full py-3 bg-[#C5A880] text-black font-semibold rounded-sm hover:bg-[#af8a64] transition-all shadow-md">
            Place Bid
        </button>
    </div>
</div>

<!-- Description Section -->
<div class="mt-10">
    <h2 class="text-2xl font-semibold border-b pb-3">Description</h2>
    <p class="text-gray-700 mt-4">${
      description || 'No Description Available'
    }</p>
    <p class="text-sm text-gray-500 mt-6 border-t pt-2">Published: ${new Date(
      created
    ).toLocaleDateString()}</p>
</div>
`;

    // Set up event listeners for image carousel
    document.getElementById('prev-image').addEventListener('click', () => {
      currentImageIndex =
        (currentImageIndex - 1 + images.length) % images.length;
      updateImage(currentImageIndex);
    });

    document.getElementById('next-image').addEventListener('click', () => {
      currentImageIndex = (currentImageIndex + 1) % images.length;
      updateImage(currentImageIndex);
    });

    // Edit & Delete buttons (Only for the seller)
    const user = JSON.parse(localStorage.getItem('user'));
    if (user?.name === seller?.name) {
      listingContainer.innerHTML += `
        <div id="listing-buttons" class="mt-4 flex gap-4">
            <a href="/listing/edit/?id=${listingId}">
                <button class="px-4 py-2 bg-black text-white rounded-sm">Edit</button>
            </a>
            <button id="delete-listing-button" class="px-4 py-2 bg-red-600 text-white rounded-sm">Delete</button>
        </div>
      `;

      document
        .getElementById('delete-listing-button')
        .addEventListener('click', async () => {
          if (await showModal('Delete this listing?', 'Delete', 'Cancel')) {
            await deleteListing(listingId);
            showAlert('success', 'Listing deleted successfully!');
            setTimeout(() => {
              window.location.href = '/profile/';
            }, 1500);
          }
        });
    }
  } catch (error) {
    console.error('Error fetching listing:', error);
    showAlert('error', 'Failed to load the listing.');
  }
}

// Fetch and render listing
fetchAndRenderListing();
