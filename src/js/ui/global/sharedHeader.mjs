export async function loadSharedHeader() {
  try {
    // Fetch the shared header HTML file
    const response = await fetch('/shared/sharedHeader.html');
    const headerHTML = await response.text();
    console.log('Shared header fetched successfully!'); // Debugging step

    // Inject the header into the <header> tag
    const headerElement = document.querySelector('header');
    if (headerElement) {
      headerElement.innerHTML = headerHTML;
      console.log('Shared header injected into HTML!');
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
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      localStorage.removeItem('user'); // Clear login state
      window.location.reload(); // Refresh the page
    });
  }
}
