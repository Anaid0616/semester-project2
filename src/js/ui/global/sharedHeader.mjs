import { logout } from '../auth/logout.mjs';
import { getUserName } from '../../utilities/getUserName.mjs';
import { setupHamburgerMenu } from '../../utilities/hamburger.mjs';

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

    setupHamburgerMenu();

    // Handle the profile link and icon
    const profileLink = document.getElementById('profile-link');
    const profileName = document.getElementById('profile-name');
    const profileIcon = document.getElementById('profile-icon');

    // Mobile elements
    const mobileProfileLink = document.getElementById('mobile-profile-link');
    const mobileProfileIcon = document.getElementById('mobile-profile-icon');

    if (
      profileLink &&
      profileName &&
      profileIcon &&
      mobileProfileLink &&
      mobileProfileIcon
    ) {
      const userData = localStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        const userName = user?.name || 'My Profile';
        const avatarUrl = user?.avatar?.url || '/images/placeholder.jpg';

        // Set desktop profile elements
        profileName.textContent = userName;
        profileIcon.src = avatarUrl;

        // Set mobile profile elements
        mobileProfileIcon.src = avatarUrl;
      }
    } else {
      console.error('Could not find the profile elements in the DOM.');
    }

    setupNavigation();
    setupStickySearchBar();
    setupSearchDropdown(); // 👈 Add this to handle dropdown behavior

    // Desktop Search Elements
    const headerSearchBarInput = document.querySelector(
      '#header-search-bar input'
    );
    const headerSearchButton = document.querySelector(
      '#header-search-bar button'
    );

    // Mobile Search Elements
    const mobileSearchBarInput = document.querySelector(
      '#mobile-search-bar input'
    );
    const mobileSearchButton = document.querySelector(
      '#mobile-search-bar button'
    );

    // Common function to handle search redirect
    function handleSearch(query) {
      if (query) {
        window.location.href = `/search/?q=${encodeURIComponent(query)}`;
      }
    }

    // Search on Enter key press (Desktop)
    headerSearchBarInput?.addEventListener('keypress', (event) => {
      if (event.key === 'Enter') {
        const query = headerSearchBarInput.value.trim();
        handleSearch(query);
      }
    });

    // Search on Enter key press (Mobile)
    mobileSearchBarInput?.addEventListener('keypress', (event) => {
      if (event.key === 'Enter') {
        const query = mobileSearchBarInput.value.trim();
        handleSearch(query);
      }
    });

    // Search on Button Click (Desktop)
    headerSearchButton?.addEventListener('click', () => {
      const query = headerSearchBarInput.value.trim();
      handleSearch(query);
    });

    // Search on Button Click (Mobile)
    mobileSearchButton?.addEventListener('click', () => {
      const query = mobileSearchBarInput.value.trim();
      handleSearch(query);
    });
  } catch (error) {
    console.error('Error loading shared header:', error);
  }
}

// Navigation logic
function setupNavigation() {
  const loggedInNav = document.getElementById('logged-in');
  const loggedOutNav = document.getElementById('logged-out');
  const loggedInMobile = document.getElementById('logged-in-mobile');
  const isLoggedIn = localStorage.getItem('user');

  if (isLoggedIn) {
    loggedInNav.classList.remove('hidden');
    loggedOutNav.classList.add('hidden');
    loggedInMobile.classList.remove('hidden'); // Show mobile elements
  } else {
    loggedInNav.classList.add('hidden');
    loggedOutNav.classList.remove('hidden');
    loggedInMobile.classList.add('hidden'); // Hide mobile elements
  }

  const logoutButton = document.getElementById('logout-button');
  if (logoutButton) {
    logoutButton.addEventListener('click', logout);
  }
}

// Sticky Search Bar Logic
function setupStickySearchBar() {
  const headerSearchBar = document.getElementById('header-search-bar');
  const isIndexPage =
    window.location.pathname === '/' ||
    window.location.pathname.includes('index.html');

  if (!isIndexPage) {
    headerSearchBar.classList.add('visible');
  } else {
    window.addEventListener('scroll', () => {
      const welcomeSection = document.getElementById('welcome-section');
      const welcomeSectionBottom =
        welcomeSection?.getBoundingClientRect().bottom;

      if (welcomeSectionBottom < 0) {
        headerSearchBar.classList.add('visible');
      } else {
        headerSearchBar.classList.remove('visible');
      }
    });
  }
}
// Dropdown Search for Mobile
function setupSearchDropdown() {
  const searchButton = document.getElementById('mobile-search-toggle');
  const searchBar = document.getElementById('mobile-search-bar');
  const searchInput = searchBar?.querySelector('input');

  if (!searchButton || !searchBar) {
    console.error('Search bar or button not found.');
    return;
  }

  searchButton.addEventListener('click', () => {
    console.log('Mobile search button clicked!');
    if (window.innerWidth < 768) {
      searchBar.classList.toggle('hidden');
      searchBar.classList.toggle('block');
      searchInput?.focus();
    }
  });

  // Close the search bar when clicking outside
  document.addEventListener('click', (event) => {
    if (
      !searchBar.contains(event.target) &&
      !searchButton.contains(event.target) &&
      window.innerWidth < 768
    ) {
      console.log('Clicked outside search bar. Hiding search input.');
      searchBar.classList.add('hidden');
      searchBar.classList.remove('block');
    }
  });
}
