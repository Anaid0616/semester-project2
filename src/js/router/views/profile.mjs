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
    let username =
      urlParams.get('user') || JSON.parse(localStorage.getItem('user'))?.name;

    // Always show skeletons first, regardless of which profile is being viewed
    if (userListingsContainer) {
      userListingsContainer.innerHTML = generateSkeleton('listings');
    }

    console.log('Fetching listings for:', username);

    if (!username) {
      throw new Error('Username is undefined.');
    }

    const profileListingsUrl = `${API_AUCTION_PROFILES}/${username}/listings`;

    console.log('API Request URL:', profileListingsUrl);

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

/**
 * Fetch and display profile with correct update button handling.
 */
async function fetchAndDisplayProfileWithButtonHandler() {
  await fetchAndDisplayProfile();

  const updateProfileButton = document.getElementById('update-profile-button');
  const updateProfileForm = document.getElementById('update-profile');

  const urlParams = new URLSearchParams(window.location.search);
  const profileUser =
    urlParams.get('user') || JSON.parse(localStorage.getItem('user'))?.name;
  console.log('Profile User:', profileUser);
  const loggedInUser = JSON.parse(localStorage.getItem('user'))?.name;
  console.log('Logged-In User:', loggedInUser);

  if (updateProfileForm) {
    updateProfileForm.style.display = 'none';
  }

  if (updateProfileButton) {
    if (profileUser && profileUser !== loggedInUser) {
      console.log("Viewing another user's profile. Hiding update button.");
      updateProfileButton.style.display = 'none';
      if (updateProfileForm) updateProfileForm.style.display = 'none';
    } else {
      console.log('Viewing own profile. Showing update button.');
      updateProfileButton.style.display = 'block';

      updateProfileButton.onclick = () => {
        console.log('Update Profile button clicked');
        if (updateProfileForm) {
          console.log('Update profile form found in DOM.');
          const isHidden = updateProfileForm.style.display === 'none';
          updateProfileForm.style.display = isHidden ? 'block' : 'none';

          // Explicitly update the button text
          if (isHidden) {
            updateProfileButton.textContent = 'Cancel Update';
            console.log('Button text changed to: Cancel Update');
          } else {
            updateProfileButton.textContent = 'Update Profile';
            console.log('Button text changed to: Update Profile');
          }

          console.log(`Profile form ${isHidden ? 'shown' : 'hidden'}`);
        } else {
          console.warn('Update profile form not found in DOM.');
        }
      };
    }
  } else {
    console.error('Update Profile button not found in the DOM.');
  }
}
// Load profile and listings when the page loads
fetchAndDisplayProfileWithButtonHandler();
fetchAndDisplayUserListings();
