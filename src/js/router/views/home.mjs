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
import { createPagination } from '../../utilities/pagination.mjs';

loadSharedHeader();
loadSharedFooter();

/* ---------------- Welcome text ---------------- */
const welcomeText = document.getElementById('welcome-text');
if (welcomeText) {
  const userName = getUserName();
  welcomeText.textContent =
    userName && userName !== 'undefined' ? `Welcome, ${userName}!` : 'Welcome!';
} else {
  console.error('Could not find the #welcome-text element in the DOM.');
}

/* ---------------- Search on index ---------------- */
const mainSearchBarInput = document.querySelector('#welcome-section input');
const mainSearchButton = document.querySelector('#welcome-section button');
handleSearchInput(mainSearchBarInput, mainSearchButton);

mainSearchBarInput?.addEventListener('keypress', (event) => {
  if (event.key === 'Enter') {
    const query = mainSearchBarInput.value.trim();
    if (query) {
      window.location.href = `/search/?q=${encodeURIComponent(query)}`;
    }
  }
});

/* ---------------- Category carousel ---------------- */
const carouselContainer = document.getElementById('category-carousel');
if (!carouselContainer) {
  console.error('Element #category-carousel not found!');
} else {
  createCategoryCarousel(categories);
  setupCarouselNavigation();
}
// Expose handler if needed by the carousel
window.handleCategoryClick = handleCategoryClick;

/* ---------------- Elements ---------------- */
const listingsContainer = document.getElementById('listings-container');
const filterAllButton = document.getElementById('filter-all');
const filterActiveButton = document.getElementById('filter-active');

/* ---------------- Pagination & Filters state ---------------- */
let currentPage = 1;
let selectedCategory = null;
let showActiveOnly = false;

/* ---------------- Pagination controller ---------------- */
const homePager = createPagination({
  prevEl: '#prev-page',
  nextEl: '#next-page',
  currentEl: '#current-page',
  onChange(newPage) {
    currentPage = newPage;
    listingsContainer?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    fetchAndDisplayListings(currentPage, selectedCategory, showActiveOnly);
  },
});

/**
 * Fetch listings from API, apply filters, and render them to the DOM.
 *
 * Behavior:
 * - Fetches listings with pagination, category, and active-only filter.
 * - Ensures up to 24 valid listings by fetching extra pages if needed.
 * - Filters out invalid images.
 * - Sorts listings newest first.
 * - Renders seller info, image, title, description, bid count, and end date.
 *
 * @async
 * @param {number} [page=1] - Current page number.
 * @param {string|null} [category=null] - Selected category (tag).
 * @param {boolean} [activeOnly=false] - Whether to show only active listings.
 * @returns {Promise<void>}
 */
async function fetchAndDisplayListings(
  page = 1,
  category = null,
  activeOnly = false
) {
  try {
    listingsContainer.innerHTML = generateSkeleton('listings');

    // Fetch listings with pagination and filters
    const response = await readListings(24, page, category, activeOnly);
    let listings = response?.data ?? [];

    if (!listings.length) {
      listingsContainer.innerHTML = `<p class="text-center">No listings found.</p>`;
      // Update pagination to a single (hidden) page
      homePager.update({ page, totalPages: 1 });
      return;
    }

    // Filter out listings with invalid images
    listings = await filterValidImageListings(listings);

    // Try to fill up to 24 items by reading additional pages if needed
    let additionalPage = page;
    while (listings.length < 24) {
      additionalPage++;
      const additionalResponse = await readListings(
        24,
        additionalPage,
        category,
        activeOnly
      );
      const more = additionalResponse?.data ?? [];
      if (!more.length) break;

      const validMore = await filterValidImageListings(more);
      listings = listings.concat(validMore).slice(0, 24);
    }

    // Sort newest first by created date
    listings.sort((a, b) => new Date(b.created) - new Date(a.created));

    // Render cards
    listingsContainer.innerHTML = listings
      .map((listing) => {
        const sellerAvatar =
          listing.seller?.avatar?.url || '/images/placeholder.jpg';
        const sellerName = listing.seller?.name || 'Unknown Seller';
        const mediaUrl = listing.media?.[0]?.url || '/images/placeholder.jpg';
        const title = listing.title || 'Untitled Listing';
        const description = listing.description
          ? `${listing.description.slice(0, 100)}…`
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

            <a href="/listing/?id=${listing.id}" class="block hover:opacity-90" aria-label="Go Listing">
              <img src="${mediaUrl}" alt="${title}" class="aspect-square object-cover rounded-sm"/>
              <div class="p-2">
                <h3 class="text-xl font-semibold mb-2 truncate overflow-hidden whitespace-nowrap">${title}</h3>
                <p class="text-gray-600 truncate overflow-hidden whitespace-nowrap">${description}</p>
                <p class="text-sm text-gray-500">Bids: ${bidCount}</p>
                <p class="text-sm text-gray-500">Ends: ${endsAt}</p>
              </div>
            </a>

            <a href="/listing/?id=${listing.id}"
               class="w-full py-2 mt-3 text-center font-semibold rounded-sm bg-[#C5A880] text-black hover:bg-[#A88B6D] transition">
              Place Bid
            </a>
          </div>
        `;
      })
      .join('');

    // Update pagination ONCE after render
    const total = response?.meta?.total ?? page * 24 + 1; // fallback if meta missing
    const limit = response?.meta?.limit ?? 24;
    const totalPages = Math.max(1, Math.ceil(total / limit));
    homePager.update({ page, totalPages });
  } catch (error) {
    console.error('Error fetching listings:', error);
    listingsContainer.innerHTML =
      '<p class="text-center text-red-500">Error loading listings. Please try again.</p>';
    homePager.update({ page: 1, totalPages: 1 });
  }
}

// Expose for category carousel (it calls window.fetchAndDisplayListings(1, selectedCategory))
window.fetchAndDisplayListings = (page = 1, category = null) => {
  // Sync local state with category from carousel
  selectedCategory = category;
  currentPage = page;
  fetchAndDisplayListings(page, category, showActiveOnly);
};

/* ---------------- Filters ---------------- */
filterAllButton?.addEventListener('click', () => {
  showActiveOnly = false;
  currentPage = 1;
  fetchAndDisplayListings(currentPage, selectedCategory, showActiveOnly);
  setActiveButtonStyle(filterAllButton);
});

filterActiveButton?.addEventListener('click', () => {
  showActiveOnly = true;
  currentPage = 1;
  fetchAndDisplayListings(currentPage, selectedCategory, showActiveOnly);
  setActiveButtonStyle(filterActiveButton);
});

/**
 * Set visual style on the active filter button.
 * @param {HTMLElement} activeButton
 */
function setActiveButtonStyle(activeButton) {
  [filterAllButton, filterActiveButton].forEach((button) => {
    button?.classList.remove('bg-[#A88B6D]', 'font-semibold', 'text-black');
    button?.classList.add('bg-[#C5A880]');
  });
  activeButton?.classList.add('bg-[#A88B6D]', 'font-semibold', 'text-black');
}

/* ---------------- Initial fetch ---------------- */
fetchAndDisplayListings(currentPage);
