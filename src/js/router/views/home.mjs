import { loadSharedHeader } from '../../ui/global/sharedHeader.mjs';
import { readListings } from '../../api/listing/read.mjs';
import { generateSkeleton } from '../../utilities/skeletonLoader.mjs';

loadSharedHeader();

// Elements
const listingsContainer = document.getElementById('listings-container');
const categoryButtons = document.querySelectorAll('.category-btn'); // Select all category buttons
const prevButton = document.getElementById('prev-page');
const nextButton = document.getElementById('next-page');
const currentPageDisplay = document.getElementById('current-page');

// Pagination & Filters
let currentPage = 1;
let selectedCategory = null; // Store selected category

/**
 * Fetch and display listings from the API with optional category filtering.
 * @async
 * @param {number} [page=1] - The page number to fetch.
 * @param {string|null} [category=null] - The category filter.
 */
async function fetchAndDisplayListings(page = 1, category = null) {
  try {
    listingsContainer.innerHTML = generateSkeleton('listings');

    // Fetch listings from API
    let validListings = [];
    let currentPage = page;

    // Fetch listings until we have at least 24 valid ones
    while (validListings.length < 24) {
      let response = await readListings(24, currentPage);
      let listings = response.data;

      if (!listings || listings.length === 0) break;

      // Filter out listings with broken or missing images
      listings = listings.filter((listing) => {
        const mediaUrl = listing.media?.[0]?.url;
        return mediaUrl && mediaUrl.startsWith('http');
      });

      // Assign "Other" category to listings without tags
      listings.forEach((listing) => {
        if (!listing.tags || listing.tags.length === 0) {
          listing.tags = ['Other'];
        }
      });

      validListings.push(...listings);

      // Fetch next page if not enough listings yet
      if (validListings.length < 24) {
        currentPage++;
      } else {
        break;
      }
    }

    console.log('Valid Listings:', validListings); // Debugging

    // Apply category filter if selected
    if (category) {
      validListings = validListings.filter((listing) =>
        listing.tags?.some(
          (tag) => tag.toLowerCase() === category.toLowerCase()
        )
      );
    }

    // Sort listings by newest first
    validListings.sort(
      (a, b) =>
        new Date(b.created || b.updated || b.endsAt) -
        new Date(a.created || a.updated || a.endsAt)
    );

    if (validListings.length === 0) {
      listingsContainer.innerHTML = `<p class="text-center">No listings found in this category.</p>`;
      return;
    }

    // Limit to exactly 24 listings
    validListings = validListings.slice(0, 24);

    // Render Listings
    listingsContainer.innerHTML = validListings
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

// Attach event listeners to category buttons
categoryButtons.forEach((button) => {
  button.addEventListener('click', (event) => {
    selectedCategory = event.target.innerText.trim(); // Get category name
    currentPage = 1; // Reset to first page
    fetchAndDisplayListings(currentPage, selectedCategory);
  });
});

// Pagination controls
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

// Initial fetch
fetchAndDisplayListings(currentPage);
