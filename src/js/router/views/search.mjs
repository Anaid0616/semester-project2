import { readListings } from '../../api/listing/read.mjs';
import { generateSkeleton } from '../../utilities/skeletonLoader.mjs';
import { loadSharedHeader } from '../../ui/global/sharedHeader.mjs';
import { filterValidImageListings } from '../../utilities/validateImage.mjs';
import { loadSharedFooter } from '../../ui/global/sharedFooter.mjs';

loadSharedHeader(); // Load the shared header dynamically
loadSharedFooter(); // Load shared footer

// Elements
const listingsContainer = document.getElementById('listings-container');
const searchQueryDisplay = document.getElementById('search-query');

// Get search query from URL
const urlParams = new URLSearchParams(window.location.search);
const query = urlParams.get('q')?.trim() || '';

if (query) {
  searchQueryDisplay.textContent = `Search results for "${query}"`;
  fetchAndDisplaySearchResults(query);
}

async function fetchAndDisplaySearchResults(query) {
  try {
    listingsContainer.innerHTML = generateSkeleton('listings');

    const response = await readListings(24, 1, null, false, query);
    let listings = response.data;

    if (!listings || listings.length === 0) {
      listingsContainer.innerHTML = `<p class="text-center">No listings found for "${query}".</p>`;
      return;
    }

    listings = await filterValidImageListings(listings);

    listingsContainer.innerHTML = listings
      .map((listing) => {
        const sellerAvatar =
          listing.seller?.avatar?.url || '/images/placeholder.jpg';
        const sellerName = listing.seller?.name || 'Unknown Seller';

        const mediaUrl = listing.media?.[0]?.url || '/images/placeholder.jpg';
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
                            <a href="/profile/?user=${listing.seller?.name}" class="text-sm font-semibold text-gray-700 hover:underline" aria-label="Go to Seller">
                                ${sellerName}
                            </a>
                        </div>

                        <a href="/listing/?id=${listing.id}" class="block hover:opacity-90">
                            <img src="${mediaUrl}" alt="${title}" class="w-full h-52 object-cover rounded-md"/>
                            <div class="p-2">
                               <h3 class="text-lg font-bold mb-2 truncate overflow-hidden whitespace-nowrap">${title}</h3>
                              <p class="text-gray-600 truncate overflow-hidden whitespace-nowrap">${description}</p>
                                <p class="text-sm text-gray-500">Bids: ${bidCount}</p>
                                <p class="text-sm text-gray-500">Ends: ${endsAt}</p>
                            </div>
                        </a>
                             <a 
              href="/listing/?id=${listing.id}" >
                      <button 
                          class="w-full py-2 mt-3 text-black font-semibold rounded-sm bg-[#C5A880] hover:bg-[#A88B6D] transition"
                          data-listing-id="${listing.id}">
                          Place Bid
                      </button>
                      </a>
                    </div>
                `;
      })
      .join('');
  } catch (error) {
    console.error('Error fetching search results:', error);
    listingsContainer.innerHTML =
      '<p class="text-center text-red-500">Error loading search results. Please try again.</p>';
  }
}

// Add event listener for the search button
const searchInput = document.getElementById('search-input');
const searchButton = document.getElementById('search-button');

// Function to handle search input and redirect to search page
export function handleSearchInput(inputElement, buttonElement) {
  const handleSearch = () => {
    const query = inputElement.value.trim();

    if (query) {
      window.location.href = `/search/?q=${encodeURIComponent(query)}`;
    }
  };

  // Add event listener for 'Enter' key press
  inputElement?.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  });

  // Add event listener for search button click
  buttonElement?.addEventListener('click', handleSearch);
}
