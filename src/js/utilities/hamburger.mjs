export function setupHamburgerMenu() {
  const hamburgerIcon = document.getElementById('hamburger-icon');
  const navContainer = document.getElementById('nav-container');

  if (!hamburgerIcon || !navContainer) {
    console.error('Required elements for the hamburger menu not found.');
    return;
  }

  // Toggle the mobile menu
  hamburgerIcon.addEventListener('click', () => {
    navContainer.classList.toggle('hidden');
  });

  // Close the menu when clicking outside
  document.addEventListener('click', (event) => {
    if (
      !navContainer.contains(event.target) &&
      !hamburgerIcon.contains(event.target)
    ) {
      navContainer.classList.add('hidden');
    }
  });
}
