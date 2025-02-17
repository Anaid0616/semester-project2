import { API_AUCTION_PROFILES } from '../../api/constants.mjs';
import { doFetch } from '../../api/doFetch.mjs';
import { fetchUserCredits } from '../../ui/profile/credits.mjs';

export async function fetchAndDisplayProfile() {
  try {
    // Get username from URL for seller profiles or from localStorage for logged-in user
    const urlParams = new URLSearchParams(window.location.search);
    const profileUser = urlParams.get('user'); // fetch seller's profile
    const loggedInUser = JSON.parse(localStorage.getItem('user'));

    let username;

    if (profileUser) {
      username = profileUser;
      console.log('Fetching profile for seller:', username);
    } else {
      if (!loggedInUser) {
        alert('You have to be logged in to view this page.');
        window.location.href = '/login/';
        return;
      }
      username = loggedInUser.name;
      console.log('Fetching profile for logged-in user:', username);
    }

    // Fetch profile data from API
    const response = await doFetch(`${API_AUCTION_PROFILES}/${username}`, {
      method: 'GET',
    });

    if (!response || !response.data) {
      throw new Error('Failed to fetch profile information.');
    }

    console.log('Profile Data Fetched:', response);

    // Extract user profile data
    const profileData = response.data;

    // Update the UI with the fetched profile data
    document.getElementById('user-avatar').src =
      profileData.avatar?.url || '/images/placeholder.jpg';
    document.getElementById('user-avatar').alt =
      profileData.name || 'User Avatar';
    document.getElementById('user-name').textContent =
      profileData.name || 'Unknown User';
    document.getElementById('user-bio').textContent =
      profileData.bio || 'No bio available.';
    document.getElementById('user-credit').textContent = await fetchUserCredits(
      username
    );

    // If the logged-in user is viewing their own profile, store data in localStorage
    if (!profileUser && loggedInUser) {
      localStorage.setItem('user', JSON.stringify(profileData));
    }
  } catch (error) {
    console.error('Error fetching user profile:', error);
  }
}

// Call the function to fetch and display profile data
fetchAndDisplayProfile();
