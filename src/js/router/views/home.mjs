import { loadSharedHeader } from '../../ui/global/sharedHeader.mjs';
import { readListings } from '../../api/listing/read.mjs';
import { generateSkeleton } from '../../utilities/skeletonLoader.mjs';
import { filterValidImageListings } from '../../utilities/validateImage.mjs';

loadSharedHeader();

// Elements
const listingsContainer = document.getElementById('listings-container');
const categoryButtons = document.querySelectorAll('.category-btn');
const prevButton = document.getElementById('prev-page');
const nextButton = document.getElementById('next-page');
const currentPageDisplay = document.getElementById('current-page');
const filterAllButton = document.getElementById('filter-all');
const filterActiveButton = document.getElementById('filter-active');

// Pagination & Filters
let currentPage = 1;
let selectedCategory = null;
let showActiveOnly = false;

/**
 * Fetch and display listings from the API with optional category and active filters.
 * @async
 * @param {number} [page=1] - The page number to fetch.
 * @param {string|null} [category=null] - The category filter.
 */
async function fetchAndDisplayListings(page = 1, category = null) {
  try {
    listingsContainer.innerHTML = generateSkeleton('listings');

    // Fetch listings with tag and active filters
    const response = await readListings(24, page, category, showActiveOnly);
    let listings = response.data;

    if (!listings || listings.length === 0) {
      listingsContainer.innerHTML = `<p class="text-center">No listings found.</p>`;
      return;
    }

    // Filter out invalid image URLs
    listings = await filterValidImageListings(listings);

    // Sort by newest first
    listings.sort(
      (a, b) =>
        new Date(b.created || b.updated || b.endsAt) -
        new Date(a.created || a.updated || a.endsAt)
    );

    // Render Listings
    listingsContainer.innerHTML = listings
      .map((listing) => {
        const sellerAvatar =
          listing.seller?.avatar?.url || '/images/default-avatar.png';
        const sellerName = listing.seller?.name || 'Unknown Seller';
        const mediaUrl =
          listing.media && listing.media.length > 0 && listing.media[0].url
            ? listing.media[0].url
            : '/images/placeholder.jpg';

        const title = listing.title || 'Untitled Listing';
        const description = listing.description
          ? listing.description.substring(0, 100) + '...'
          : 'No description provided.';
        const bidCount = listing._count?.bids || 0;
        const endsAt = new Date(listing.endsAt).toLocaleDateString();

        return `
                    <div class="listing bg-white shadow rounded-sm overflow-hidden p-4 flex flex-col justify-between">
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
                           <button 
                            class="w-full py-2 mt-3 text-black font-semibold rounded-sm bg-[#C5A880] hover:bg-[#A88B6D] transition"
                            data-listing-id="${listing.id}">
                            Place Bid
                        </button>
                    </div>
                `;
      })
      .join('');

    currentPageDisplay.textContent = `Page ${page}`;
  } catch (error) {
    console.error('Error fetching listings:', error);
    listingsContainer.innerHTML =
      '<p class="text-center text-red-500">Error loading listings. Please try again.</p>';
  }
}

// Category Buttons
categoryButtons.forEach((button) => {
  button.addEventListener('click', (event) => {
    selectedCategory = event.target.innerText.trim();
    currentPage = 1;
    fetchAndDisplayListings(currentPage, selectedCategory);
  });
});

// Show All / Show Active Buttons
filterAllButton.addEventListener('click', () => {
  showActiveOnly = false;
  currentPage = 1;
  fetchAndDisplayListings(currentPage, selectedCategory);
});

filterActiveButton.addEventListener('click', () => {
  showActiveOnly = true;
  currentPage = 1;
  fetchAndDisplayListings(currentPage, selectedCategory);
});

// Pagination Controls
prevButton.addEventListener('click', () => {
  if (currentPage > 1) {
    currentPage--;
    fetchAndDisplayListings(currentPage, selectedCategory);
  }
});

nextButton.addEventListener('click', () => {
  currentPage++;
  fetchAndDisplayListings(currentPage, selectedCategory);
});

// Initial Fetch
fetchAndDisplayListings(currentPage);
