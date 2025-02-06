export function setupNavigation() {
  const loggedInNav = document.getElementById('logged-in');
  const loggedOutNav = document.getElementById('logged-out');
  const isLoggedIn = localStorage.getItem('user');

  if (isLoggedIn) {
    loggedInNav.classList.remove('hidden');
    loggedOutNav.classList.add('hidden');
  } else {
    loggedInNav.classList.add('hidden');
    loggedOutNav.classList.remove('hidden');
  }

  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      localStorage.removeItem('user');
      window.location.reload();
    });
  }
}
