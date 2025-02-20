import { loadSharedHeader } from '../../ui/global/sharedHeader.mjs';
import { readListings } from '../../api/listing/read.mjs';
import { generateSkeleton } from '../../utilities/skeletonLoader.mjs';
import { filterValidImageListings } from '../../utilities/validateImage.mjs';
import {
  createCategoryCarousel,
  setupCarouselNavigation,
  handleCategoryClick,
  categories,
} from '../../utilities/categoryCarousel.mjs';

loadSharedHeader();

// Check if the category-carousel element exists
// Immediately initialize the category carousel
const carouselContainer = document.getElementById('category-carousel');
if (!carouselContainer) {
  console.error('Element #category-carousel not found!');
} else {
  console.log('Creating category carousel...');
  createCategoryCarousel(categories);
  setupCarouselNavigation();
}

// Make handleCategoryClick globally accessible if needed
window.handleCategoryClick = handleCategoryClick;

// Elements
const listingsContainer = document.getElementById('listings-container');
const prevButton = document.getElementById('prev-page');
const nextButton = document.getElementById('next-page');
const currentPageDisplay = document.getElementById('current-page');
const filterAllButton = document.getElementById('filter-all');
const filterActiveButton = document.getElementById('filter-active');

// Pagination & Filters
let currentPage = 1;
let selectedCategory = null;
let showActiveOnly = false;

// Fetch and display listings
// Fetch and display listings
async function fetchAndDisplayListings(
  page = 1,
  category = null,
  activeOnly = false
) {
  try {
    listingsContainer.innerHTML = generateSkeleton('listings');

    // Fetch listings with pagination and filters
    const response = await readListings(24, page, category, activeOnly);
    let listings = response.data;

    console.log(
      `Page ${page} fetched with ${listings.length} listings from API`
    );
    console.log(`Active filter applied: ${activeOnly}`);

    if (!listings || listings.length === 0) {
      listingsContainer.innerHTML = `<p class="text-center">No listings found.</p>`;
      return;
    }

    // Filter out listings with invalid images
    listings = await filterValidImageListings(listings);
    console.log(`Listings after image validation: ${listings.length}`);

    // If filtered listings are fewer than the limit, fetch more to maintain the page size
    while (listings.length < 24) {
      page++;
      const additionalResponse = await readListings(
        24,
        page,
        category,
        activeOnly
      );
      let additionalListings = additionalResponse.data;

      if (!additionalListings || additionalListings.length === 0) {
        console.log('No more listings available to fill the page.');
        break;
      }

      additionalListings = await filterValidImageListings(additionalListings);
      listings = listings.concat(additionalListings).slice(0, 24);
      console.log(
        `Filled listings to maintain 24 per page: ${listings.length}`
      );
    }

    listings.sort(
      (a, b) =>
        new Date(b.created || b.endsAt) - new Date(a.created || a.endsAt)
    );

    listingsContainer.innerHTML = listings
      .map((listing) => {
        const sellerAvatar =
          listing.seller?.avatar?.url || '/images/default-avatar.png';
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

// Make function accessible to categoryCarousel.mjs without breaking initial load
window.fetchAndDisplayListings = (page = 1, category = null) => {
  fetchAndDisplayListings(page, category, showActiveOnly);
};

// Setup Category Carousel and Navigation
createCategoryCarousel(categories);
setupCarouselNavigation();

// Pagination Controls
prevButton?.addEventListener('click', () => {
  if (currentPage > 1) {
    currentPage--;
    fetchAndDisplayListings(currentPage, selectedCategory, showActiveOnly);
  }
});

nextButton?.addEventListener('click', () => {
  currentPage++;
  fetchAndDisplayListings(currentPage, selectedCategory, showActiveOnly);
});

// Show All / Show Active Buttons
filterAllButton.addEventListener('click', () => {
  showActiveOnly = false;
  currentPage = 1;
  fetchAndDisplayListings(currentPage, selectedCategory, showActiveOnly);
  setActiveButtonStyle(filterAllButton);
});

filterActiveButton.addEventListener('click', () => {
  showActiveOnly = true;
  currentPage = 1;
  fetchAndDisplayListings(currentPage, selectedCategory, showActiveOnly);
  setActiveButtonStyle(filterActiveButton);
});

// Function to set active styles on the selected button
function setActiveButtonStyle(activeButton) {
  // Reset styles for both buttons
  [filterAllButton, filterActiveButton].forEach((button) => {
    button.classList.remove('bg-[#A88B6D]', 'font-bold', 'text-black');
    button.classList.add('bg-[#C5A880]');
  });

  // Apply active styles to the clicked button
  activeButton.classList.add('bg-[#A88B6D]', 'font-bold', 'text-black');
}

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
