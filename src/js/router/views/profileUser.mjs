import { API_AUCTION_PROFILES } from '../../api/constants.mjs';
import { doFetch } from '../../api/doFetch.mjs';
import { generateSkeleton } from '../../utilities/skeletonLoader.mjs';
import { onUpdateProfile } from '../../ui/profile/updateAvatar.mjs';

export async function fetchAndDisplayProfile() {
  try {
    // Get profile container
    const profileContainer = document.querySelector('#profile-container');

    // Inject skeleton loader before fetching the data
    profileContainer.innerHTML = generateSkeleton('profile');

    // Get username from URL or localStorage
    const urlParams = new URLSearchParams(window.location.search);
    const profileUser = urlParams.get('user') || null;
    const loggedInUser = JSON.parse(localStorage.getItem('user'));

    const username = profileUser ? profileUser : loggedInUser?.name;

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
           <p id="user-credit" class="text-l font-semibold mt-2">
          Credits: <span class="text-[#D4AF37] font-bold">${
            profileData.credits !== undefined ? profileData.credits : '0'
          }</span>
        </p>
        <p id="user-bio" class="py-2 text-gray-600">${
          profileData.bio || 'No bio available.'
        }</p>
     
        <div class="mt-4 flex gap-4">
         ${
           !profileUser || profileData.name === loggedInUser?.name
             ? `<button id="update-profile-button" class="px-4 py-1 h-8 bg-[#C5A880] text-black hover:bg-[#A88B6D] transition rounded-sm ">Update Profile</button>`
             : ''
         }
      </div>
      </div>
    `;

    const updateProfileButton = document.getElementById(
      'update-profile-button'
    );
    const updateProfileFormContainer =
      document.getElementById('update-profile');

    if (updateProfileFormContainer) {
      updateProfileFormContainer.style.display = 'none';
    }

    if (updateProfileButton) {
      updateProfileButton.onclick = () => {
        if (updateProfileFormContainer) {
          const isHidden = updateProfileFormContainer.style.display === 'none';
          updateProfileFormContainer.style.display = isHidden
            ? 'block'
            : 'none';
          updateProfileButton.textContent = isHidden
            ? 'Cancel Update'
            : 'Update Profile';
        }

        // Manually trigger the form event listener setup from updateAvatar.mjs
        const updateProfileForm = document.querySelector(
          "form[name='updateProfileForm']"
        );
        if (updateProfileForm) {
          updateProfileForm.removeEventListener('submit', onUpdateProfile);
          updateProfileForm.addEventListener('submit', onUpdateProfile);
        }
      };
    }
  } catch (error) {
    console.error('Error fetching user profile:', error);
    document.querySelector('#profile-container').innerHTML =
      '<p class="text-black">You need to be logged in to view user profiles. Please log in or create an account.</p>';
  }
}

// Call function to fetch and display profile data
fetchAndDisplayProfile();
