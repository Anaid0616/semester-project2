import { loadSharedHeader } from '../../ui/global/sharedHeader.mjs';
import { API_AUCTION_PROFILES } from '../../api/constants.mjs';
import { doFetch } from '../../api/doFetch.mjs';
import { fetchAndDisplayProfile } from './profileUser.mjs';
import '../../ui/profile/updateAvatar.mjs';
import { showAlert } from '../../utilities/alert.mjs';

loadSharedHeader(); // Load shared header dynamically

const userListingsContainer = document.getElementById(
  'user-listings-container'
);

/**
 * Fetch and display listings for the logged-in user.
 * - Retrieves listings from the API and renders them in the `userListingsContainer`.
 * - If no listings are found, displays a "No listings available" message.
 *
 * @async
 * @function fetchAndDisplayUserListings
 * @throws {Error} If the API request fails or the user is not logged in.
 */
async function fetchAndDisplayUserListings() {
  try {
    // Render skeleton loaders before fetching the posts
    userListingsContainer.innerHTML = `
      ${Array.from({ length: 6 })
        .map(
          () => `
        <div class="post border border-gray-200 shadow rounded-md p-4 max-w-sm w-full mx-auto">
          <div class="animate-pulse flex flex-col space-y-4">
            <div class="w-full h-[250px] bg-gray-200 rounded"></div>
            <div class="h-4 bg-gray-200 rounded"></div>
            <div class="h-2 bg-gray-200 rounded"></div>
          </div>
        </div>
        `
        )
        .join('')}
    `;

    const user = JSON.parse(localStorage.getItem('user')); // Get logged-in user
    if (!user) {
      showAlert('error', 'You must be logged in to view your listings.');
      setTimeout(() => {
        window.location.href = '/login/';
      }, 1500);
      return;
    }

    const username = user.name; // Get username

    // Use doFetch to fetch profile data with listings
    const profileData = await doFetch(
      `${API_AUCTION_PROFILES}/${username}/listings`,
      { method: 'GET' }
    );

    const listings = profileData.data || [];

    if (listings.length === 0) {
      userListingsContainer.innerHTML = `<p>No listings available.</p>`;
      return;
    }

    // Render listings
    userListingsContainer.innerHTML = listings
      .map((listing) => {
        const mediaUrl = listing.media?.[0] || '/images/placeholder.jpg'; // Updated for correct media fetching
        const title = listing.title || 'Untitled Listing';
        const endsAt = new Date(listing.endsAt).toLocaleDateString();

        return `
        <div class="post bg-white shadow rounded-sm overflow-hidden">
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
          
          </a>
        </div>
      `;
      })
      .join('');
  } catch (error) {
    console.error('Error fetching user listings:', error);
    userListingsContainer.innerHTML =
      '<p>Error loading listings. Please try again.</p>';
  }
}

// Add functionality for the "Update Profile" button
const updateProfileButton = document.getElementById('update-profile-button');
if (updateProfileButton) {
  updateProfileButton.addEventListener('click', () => {
    const updateProfileForm = document.getElementById('update-profile');
    if (updateProfileForm) {
      if (updateProfileForm.style.display === 'none') {
        updateProfileForm.style.display = 'block';
        updateProfileButton.textContent = 'Cancel Update';
      } else {
        updateProfileForm.style.display = 'none';
        updateProfileButton.textContent = 'Update Profile';
      }
    }
  });
}

// Call the function when the page loads
fetchAndDisplayProfile(); // Load user profile info
fetchAndDisplayUserListings(); // Fetch and display user's listings
