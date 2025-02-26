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
import { handleSearchInput } from '../../router/views/search.mjs';
import { getUserName } from '../../utilities/getUserName.mjs';
import { loadSharedFooter } from '../../ui/global/sharedFooter.mjs';

loadSharedHeader(); // Load the shared header dynamically
loadSharedFooter(); // Load shared footer

// Set the welcome text directly without DOMContentLoaded
const welcomeText = document.getElementById('welcome-text');
if (welcomeText) {
  const userName = getUserName();
  welcomeText.textContent = `Welcome, ${userName}!`;
} else {
  console.error('Could not find the #welcome-text element in the DOM.');
}

// Index page search bar
const mainSearchBarInput = document.querySelector('#welcome-section input');
const mainSearchButton = document.querySelector('#welcome-section button');
handleSearchInput(mainSearchBarInput, mainSearchButton);

// Add an event listener for the search input on the index page
mainSearchBarInput?.addEventListener('keypress', (event) => {
  if (event.key === 'Enter') {
    const query = mainSearchBarInput.value.trim();
    if (query) {
      window.location.href = `/search/?q=${encodeURIComponent(query)}`;
    }
  }
});

// Category carousel
const carouselContainer = document.getElementById('category-carousel');
if (!carouselContainer) {
  console.error('Element #category-carousel not found!');
} else {
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

    if (!listings || listings.length === 0) {
      listingsContainer.innerHTML = `<p class="text-center">No listings found.</p>`;
      return;
    }

    // Filter out listings with invalid images
    listings = await filterValidImageListings(listings);

    // Initialize additionalPage before the while loop
    let additionalPage = page;

    // If filtered listings are fewer than the limit, fetch more to maintain the page size
    while (listings.length < 24) {
      additionalPage++; // Only increment additionalPage, not currentPage

      const additionalResponse = await readListings(
        24,
        additionalPage,
        category,
        activeOnly
      );

      if (!additionalResponse || !additionalResponse.data) {
        console.error('Failed to fetch additional listings.');
        break;
      }

      let additionalListings = additionalResponse.data;

      if (!additionalListings || additionalListings.length === 0) {
        break;
      }

      additionalListings = await filterValidImageListings(additionalListings);
      listings = listings.concat(additionalListings).slice(0, 24);
    }

    // Sort listings by created date in descending order (newest first)
    listings.sort((a, b) => new Date(b.created) - new Date(a.created));

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
                          <a href="/profile/?user=${listing.seller?.name}" class="text-sm font-semibold text-gray-700 hover:underline">
                              ${sellerName}
                          </a>
                      </div>

                      <a href="/listing/?id=${listing.id}" class="block hover:opacity-90">
                          <img src="${mediaUrl}" alt="${title}" class="w-full h-52 object-cover rounded-md"/>
                          <div class="p-2">
                              <h3 class="text-lg font-semibold mb-2 truncate overflow-hidden whitespace-nowrap">${title}</h3>
                              <p class="text-gray-600 truncate overflow-hidden whitespace-nowrap">${description}</p>

                              <p class="text-sm text-gray-500">Bids: ${bidCount}</p>
                              <p class="text-sm text-gray-500">Ends: ${endsAt}</p>
                          </div>
                      </a>
                      
                        <a 
              href="/listing/?id=${listing.id}" >
                      <button 
                          class="w-full py-2 mt-3 font-semibold rounded-sm bg-[#C5A880] text-black hover:bg-[#A88B6D] transition"
                          data-listing-id="${listing.id}">
                          Place Bid
                      </button>
                      </a>
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

// Make function accessible to categoryCarousel.mjs
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
    button.classList.remove('bg-[#A88B6D]', 'font-semibold', 'text-black');
    button.classList.add('bg-[#C5A880]');
  });

  // Apply active styles to the clicked button
  activeButton.classList.add('bg-[#A88B6D]', 'font-semibold', 'text-black');
}

// Initial Fetch
fetchAndDisplayListings(currentPage);
