import { API_AUCTION_PROFILES } from '../../api/constants.mjs';
import { doFetch } from '../../api/doFetch.mjs';
import { fetchUserCredits } from '../../ui/profile/credits.mjs';

/**
 * Fetch and display user profile information (name, avatar, and bio).
 * - If user data exists in localStorage, it populates the profile directly.
 * - Otherwise, it fetches data from the API and updates both the DOM and localStorage.
 *
 * @async
 * @function fetchAndDisplayProfile
 * @throws {Error} If the API request fails or user is not logged in.
 */
export async function fetchAndDisplayProfile() {
  try {
    const user = JSON.parse(localStorage.getItem('user'));

    if (!user) {
      alert('You must be logged in to view this page.');
      window.location.href = '/login/';
      return;
    }

    const username = user.name;

    // Use localStorage data first if available
    if (user.avatar || user.bio) {
      // Populate UI from localStorage
      const userAvatar = document.getElementById('user-avatar');
      const userNameElement = document.getElementById('user-name');
      const userBioElement = document.getElementById('user-bio');
      const userCreditsElement = document.getElementById('user-credit');

      userAvatar.src = user.avatar?.url || '/images/placeholder.jpg';
      userAvatar.alt = user.name || 'User Avatar'; // Set alt text
      userNameElement.textContent = user.name || 'Unknown User'; // Set username
      userBioElement.textContent = user.bio || 'No bio available.';
      userCreditsElement.textContent = await fetchUserCredits(username);

      return; // Stop here if localStorage has data
    }

    // Fetch the profile information from the API using doFetch
    const profileData = await doFetch(`${API_AUCTION_PROFILES}/${username}`, {
      method: 'GET',
    });

    if (!profileData) {
      throw new Error('Failed to fetch profile information.');
    }

    // Update the HTML with profile info
    const userAvatar = document.getElementById('user-avatar');
    const userNameElement = document.getElementById('user-name');
    const userBioElement = document.getElementById('user-bio');
    const userCreditElement = document.getElementById('user-credit');

    // Populate UI with fetched data
    userAvatar.src = profileData.avatar?.url || '/images/placeholder.jpg';
    userAvatar.alt = profileData.name || 'User Avatar'; // Set alt text
    userNameElement.textContent = profileData.name || 'Unknown User'; // Set username
    userBioElement.textContent = profileData.bio || 'No bio available.';

    // Update localStorage with fetched data
    const updatedUserData = {
      ...user,
      name: updatedProfile.name || user.name,
      avatar: updatedProfile.avatar || user.avatar,
      bio: updatedProfile.bio || user.bio,
      credits: profileData.credits || 0,
    };

    localStorage.setItem('user', JSON.stringify(updatedUserData));
  } catch (error) {
    console.error('Error fetching user profile:', error);
  }
}

// Call the function to fetch and display profile data
fetchAndDisplayProfile();
