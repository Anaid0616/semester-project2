import { logout } from '../auth/logout.mjs';

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

    // Call the setup function after the header is loaded
    setupNavigation();
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
