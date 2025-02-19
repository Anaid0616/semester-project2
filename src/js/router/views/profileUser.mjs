import { API_AUCTION_PROFILES } from '../../api/constants.mjs';
import { doFetch } from '../../api/doFetch.mjs';
import { generateSkeleton } from '../../utilities/skeletonLoader.mjs';

export async function fetchAndDisplayProfile() {
  try {
    // Get profile container
    const profileContainer = document.querySelector('#profile-container');

    // Inject skeleton loader before fetching the data
    profileContainer.innerHTML = generateSkeleton('profile');

    // Get username from URL or localStorage
    const urlParams = new URLSearchParams(window.location.search);
    const profileUser = urlParams.get('user');
    const loggedInUser = JSON.parse(localStorage.getItem('user'));

    let username;
    if (profileUser) {
      username = profileUser;
    } else {
      if (!loggedInUser) {
        alert('You have to be logged in to view this page.');
        window.location.href = '/login/';
        return;
      }
      username = loggedInUser.name;
    }

    // Fetch profile data from API
    const response = await doFetch(`${API_AUCTION_PROFILES}/${username}`, {
      method: 'GET',
    });

    if (!response || !response.data) {
      throw new Error('Failed to fetch profile information.');
    }

    // Extract user profile data
    const profileData = response.data;

    // Replace skeleton with actual profile content
    profileContainer.innerHTML = `
      <img id="user-avatar" src="${
        profileData.avatar?.url || '/images/placeholder.jpg'
      }" alt="${
      profileData.name || 'User Avatar'
    }" class="w-48 h-48 rounded-sm" />

      <div>
        <h1 id="user-name" class="text-2xl font-semibold">${
          profileData.name || 'Unknown User'
        }</h1>
        <p id="user-bio" class="text-gray-600">${
          profileData.bio || 'No bio available.'
        }</p>
        <p id="user-credit" class="text-lg font-bold mt-2">
          Credits: <span class="text-[#D4AF37]">${
            profileData.credits !== undefined ? profileData.credits : '0'
          }</span>
        </p>
        <div class="mt-4 flex gap-4">
          <button id="update-profile-button" class="px-4 py-2 bg-[#C5A880] text-black rounded-sm">
            Update Profile
          </button>
          <button class="px-4 py-2 bg-[#C5A880] text-black rounded-sm">Follow</button>
        </div>
      </div>
    `;

    // Store data in localStorage if it's the logged-in user
    if (!profileUser && loggedInUser) {
      localStorage.setItem('user', JSON.stringify(profileData));
    }
  } catch (error) {
    console.error('Error fetching user profile:', error);
    document.querySelector('#profile-container').innerHTML =
      '<p class="text-red-500">Error loading profile. Please try again.</p>';
  }
}

// Call function to fetch and display profile data
fetchAndDisplayProfile();
