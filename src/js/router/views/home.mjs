import { loadSharedHeader } from '../../ui/global/sharedHeader.mjs';
import { readListings } from '../../api/listing/read.mjs';
import { generateSkeleton } from '../../utilities/skeletonLoader.mjs';

loadSharedHeader(); // Load the shared header dynamically

// Elements
const listingsContainer = document.getElementById('listings-container');
const prevButton = document.getElementById('prev-page');
const nextButton = document.getElementById('next-page');
const currentPageDisplay = document.getElementById('current-page');

// Pagination
let currentPage = 1;

/**
 * Helper function to validate image URLs.
 * @param {string} url - The URL to validate.
 * @returns {Promise<boolean>} - Resolves `true` if valid, `false` otherwise.
 */
function isValidImageUrl(url) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = url;
  });
}

/**
 * Fetch and display listings from the API.
 * @async
 * @param {number} [page=1] - The page number to fetch.
 */
async function fetchAndDisplayListings(page = 1) {
  try {
    // Show the home page listings skeleton before fetching data
    listingsContainer.innerHTML = generateSkeleton('listings');

    // Fetch listings from API
    const response = await readListings(12, page);
    console.log('API Listings Response:', response.data);
    const listings = response.data;

    // Fallback image URL
    const fallbackImageUrl = '/images/placeholder.jpg';

    // Filter out listings with missing or invalid image URLs
    const validListings = [];
    for (const listing of listings) {
      const mediaUrl = listing.media?.[0] || fallbackImageUrl; // Use first image if available
      const isValid = await isValidImageUrl(mediaUrl);

      if (isValid) {
        validListings.push({ ...listing, mediaUrl });
      }
      if (validListings.length >= 12) break; // Stop after collecting 12 valid listings
    }

    // Handle empty state
    if (validListings.length === 0) {
      listingsContainer.innerHTML = `<p class="text-center">No listings available.</p>`;
      return;
    }

    // Render Listings
    listingsContainer.innerHTML = listings
      .map((listing) => {
        const sellerAvatar =
          listing.seller?.avatar?.url || '/images/default-avatar.png';

        const sellerName =
          listing.seller && listing.seller.name
            ? listing.seller.name
            : 'Unknown Seller';

        const mediaUrl = listing.media?.[0] || '/images/placeholder.jpg'; // Use fallback
        const title = listing.title || 'Untitled Listing';
        const description = listing.description
          ? listing.description.substring(0, 100) + '...'
          : 'No description provided.';
        const bidCount = listing._count?.bids || 0;
        const endsAt = new Date(listing.endsAt).toLocaleDateString();

        return `
          <div class="listing bg-white shadow rounded-sm overflow-hidden p-4 flex flex-col justify-between">
            <!-- Seller Avatar and Name -->
            <div class="flex items-center space-x-3 mb-3">
              <img src="${sellerAvatar}" alt="${sellerName}" class="w-6 h-6 rounded-full border border-gray-300" />
              <a href="/profile/?user=${listing.seller?.name}" class="text-sm font-semibold text-gray-700 hover:underline">
        ${sellerName}
      </a>
            </div>

            <a href="/listing/?id=${listing.id}" class="block hover:opacity-90">
              <img src="${mediaUrl}" alt="${title}" class="w-full h-52 object-cover rounded-md"/>
              <div class="p-2">
                <h3 class="text-lg font-bold mb-2">${title}</h3>
                <p class="text-gray-600">${description}</p>
                <p class="text-sm text-gray-500">Bids: ${bidCount}</p>
                <p class="text-sm text-gray-500">Ends: ${endsAt}</p>
              </div>
            </a>

            <!-- Bid Button -->
            <button 
              class="w-full py-2 mt-3 text-black font-semibold rounded-sm bg-[#C5A880] hover:bg-[#A88B6D] transition"
              data-listing-id="${listing.id}">
              Place Bid
            </button>
          </div>
        `;
      })
      .join('');

    // Update pagination display
    currentPageDisplay.textContent = `Page ${page}`;
  } catch (error) {
    console.error('Error fetching listings:', error);
    listingsContainer.innerHTML =
      '<p class="text-center text-red-500">Error loading listings. Please try again.</p>';
  }
}

// Pagination controls
prevButton.addEventListener('click', () => {
  if (currentPage > 1) {
    currentPage--;
    fetchAndDisplayListings(currentPage);
  }
});

nextButton.addEventListener('click', () => {
  currentPage++;
  fetchAndDisplayListings(currentPage);
});

// Initial fetch
fetchAndDisplayListings(currentPage);
