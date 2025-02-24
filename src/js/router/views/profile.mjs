import { loadSharedHeader } from '../../ui/global/sharedHeader.mjs';
import { API_AUCTION_PROFILES } from '../../api/constants.mjs';
import { doFetch } from '../../api/doFetch.mjs';
import { fetchAndDisplayProfile } from './profileUser.mjs';
import '../../ui/profile/updateAvatar.mjs';
import { generateSkeleton } from '../../utilities/skeletonLoader.mjs';

loadSharedHeader(); // Load shared header dynamically

const userListingsContainer = document.getElementById('listings-container');

/**
 * Fetch and display listings for the logged-in user or any other user.
 */
async function fetchAndDisplayUserListings() {
  try {
    const urlParams = new URLSearchParams(window.location.search);
    let username = urlParams.get('user'); // Get seller's name from URL

    // Always show skeletons first, regardless of which profile is being viewed
    if (userListingsContainer) {
      userListingsContainer.innerHTML = generateSkeleton('listings');
    }

    if (!username) {
      // If no seller is in the URL, use the logged-in user's name
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user) {
        console.error('No user found in localStorage');
        return;
      }
      username = user.name;
    }

    console.log('Fetching listings for:', username);

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
        const mediaUrl = listing.media?.[0]?.url || '/images/placeholder.jpg';
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
    if (userListingsContainer) {
      userListingsContainer.innerHTML =
        '<p>Error loading listings. Please try again.</p>';
    }
  }
}

async function fetchAndDisplayProfileWithButtonHandler() {
  await fetchAndDisplayProfile(); // Wait for the profile to render

  // Add functionality for the "Update Profile" button
  const updateProfileButton = document.getElementById('update-profile-button');
  const updateProfileForm = document.getElementById('update-profile');

  const urlParams = new URLSearchParams(window.location.search);
  const profileUser = urlParams.get('user'); // Get the profile user from the URL
  const loggedInUser = JSON.parse(localStorage.getItem('user'))?.name; // Get the logged-in user

  // Ensure the update form is hidden by default
  if (updateProfileForm) {
    updateProfileForm.style.display = 'none';
  }

  // Check if the profile belongs to the logged-in user
  if (updateProfileButton) {
    console.log('Profile User:', profileUser);
    console.log('Logged-In User:', loggedInUser);

    if (profileUser && profileUser !== loggedInUser) {
      console.log("Viewing another user's profile. Hiding update button.");
      // Viewing another user's profile, hide the update button and form
      updateProfileButton.style.display = 'none';
      if (updateProfileForm) updateProfileForm.style.display = 'none';
    } else if (!profileUser || profileUser === loggedInUser) {
      console.log('Viewing own profile. Showing update button.');
      // Viewing own profile, show the update button
      updateProfileButton.style.display = 'block';

      updateProfileButton.addEventListener('click', () => {
        console.log('Update Profile button clicked');
        if (updateProfileForm) {
          const isHidden = updateProfileForm.style.display === 'none';
          updateProfileForm.style.display = isHidden ? 'block' : 'none';
          updateProfileButton.textContent = isHidden
            ? 'Cancel Update'
            : 'Update Profile';
          console.log(`Profile form ${isHidden ? 'shown' : 'hidden'}`);
        } else {
          console.warn('Update profile form not found in DOM.');
        }
      });
    } else {
      console.warn('Unknown state for profile and logged-in user.');
    }
  } else {
    console.error('Update Profile button not found in the DOM.');
  }
}

// Call the function when the page loads
fetchAndDisplayProfileWithButtonHandler();

// Call the function when the page loads
fetchAndDisplayProfile(); // Load user profile info
fetchAndDisplayUserListings(); // Fetch and display user's listings
