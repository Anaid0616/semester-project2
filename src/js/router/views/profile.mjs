import { loadSharedHeader } from '../../ui/global/sharedHeader.mjs';
import { API_AUCTION_PROFILES } from '../../api/constants.mjs';
import { doFetch } from '../../api/doFetch.mjs';
import { fetchAndDisplayProfile } from './profileUser.mjs';
import '../../ui/profile/updateAvatar.mjs';
import { showAlert } from '../../utilities/alert.mjs';
import { generateSkeleton } from '../../utilities/skeletonLoader.mjs';

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
    const userListingsContainer = document.getElementById(
      'user-listings-container'
    );

    const urlParams = new URLSearchParams(window.location.search);
    let username = urlParams.get('user'); // Get seller's name from URL

    if (!username) {
      // If no seller is in the URL, use the logged-in user's name
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user) {
        console.error('No user found in localStorage');
        return;
      }

      //  Show skeleton before fetching listings
      userListingsContainer.innerHTML = generateSkeleton('listings');

      username = user.name;
    }

    console.log('Fetching listings for:', username); // Debugging log

    if (!username) {
      throw new Error('Username is undefined.');
    }

    const profileListingsUrl = `${API_AUCTION_PROFILES}/${username}/listings`;

    console.log('API Request URL:', profileListingsUrl); // Debugging log

    const profileData = await doFetch(profileListingsUrl, { method: 'GET' });

    if (!profileData || !profileData.data) {
      throw new Error('No profile data received.');
    }

    const listings = profileData.data;

    if (listings.length === 0) {
      userListingsContainer.innerHTML = `<p>No listings available.</p>`;
      return;
    }

    // Render listings
    userListingsContainer.innerHTML = listings
      .map((listing) => {
        const mediaUrl = listing.media?.[0] || '/images/placeholder.jpg';
        const title = listing.title || 'Untitled Listing';
        const description = listing.description
          ? listing.description.substring(0, 100) + '...'
          : 'No description provided.';
        const bidCount = listing._count?.bids || 0;
        const endsAt = new Date(listing.endsAt).toLocaleDateString();

        return `
          <div class="listing bg-white shadow rounded-sm overflow-hidden p-4 flex flex-col justify-between">
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
  } catch (error) {
    console.error('Error fetching user listings:', error);
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
