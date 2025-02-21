import { logout } from '../auth/logout.mjs';
import { handleSearchInput } from '../../router/views/search.mjs';
import { getUserName } from '../../utilities/getUserName.mjs';

export async function loadSharedHeader() {
  try {
    // Fetch the shared header HTML file
    const response = await fetch('/shared/sharedHeader.html');
    const headerHTML = await response.text();

    // Inject the header into the <header> tag
    const headerElement = document.querySelector('header');
    if (headerElement) {
      headerElement.innerHTML = headerHTML;
    }

    // Now handle the profile link and icon
    const profileLink = document.getElementById('profile-link');
    const profileName = document.getElementById('profile-name');
    const profileIcon = document.getElementById('profile-icon');

    if (profileLink && profileName && profileIcon) {
      const userData = localStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        const userName = user?.name || 'My Profile';
        const avatarUrl = user?.avatar?.url || '/images/default-avatar.png';

        profileName.textContent = userName;
        profileIcon.src = avatarUrl;
      }
    } else {
      console.error('Could not find the profile elements in the DOM.');
    }
    // Call the setup function after the header is loaded
    setupNavigation();

    // Initialize sticky search bar behavior after header is loaded
    setupStickySearchBar();

    // Element References
    const headerSearchBarInput = document.querySelector(
      '#header-search-bar input'
    );
    const headerSearchButton = document.querySelector(
      '#header-search-bar button'
    );
    handleSearchInput(headerSearchBarInput, headerSearchButton);

    // Add an event listener for the search input in the header
    headerSearchBarInput?.addEventListener('keypress', (event) => {
      if (event.key === 'Enter') {
        const query = headerSearchBarInput.value.trim();
        if (query) {
          window.location.href = `/search/?q=${encodeURIComponent(query)}`;
        }
      }
    });
  } catch (error) {
    console.error('Error loading shared header:', error);
  }
}

// Navigation logic (previously in navigation.mjs)
function setupNavigation() {
  const loggedInNav = document.getElementById('logged-in');
  const loggedOutNav = document.getElementById('logged-out');
  const isLoggedIn = localStorage.getItem('user');

  // Show or hide sections based on login state
  if (isLoggedIn) {
    loggedInNav.classList.remove('hidden');
    loggedOutNav.classList.add('hidden');
  } else {
    loggedInNav.classList.add('hidden');
    loggedOutNav.classList.remove('hidden');
  }

  // Logout button functionality
  const logoutButton = document.getElementById('logout-button');
  if (logoutButton) {
    logoutButton.addEventListener('click', logout); // Call the proper logout function
  }
}

// Sticky Search Bar Logic
function setupStickySearchBar() {
  // Element References
  const headerSearchBar = document.getElementById('header-search-bar');

  // Check if the current page is the index page
  const isIndexPage =
    window.location.pathname === '/' ||
    window.location.pathname.includes('index.html');

  if (!isIndexPage) {
    // If not on the index page, always show the search bar
    headerSearchBar.classList.add('visible');
  } else {
    // Handle scroll-based visibility on the index page
    window.addEventListener('scroll', () => {
      const welcomeSection = document.getElementById('welcome-section');
      const welcomeSectionBottom =
        welcomeSection?.getBoundingClientRect().bottom;

      if (welcomeSectionBottom < 0) {
        console.log('Showing header search bar');
        headerSearchBar.classList.add('visible');
      } else {
        console.log('Hiding header search bar');
        headerSearchBar.classList.remove('visible');
      }
    });
  }
}
