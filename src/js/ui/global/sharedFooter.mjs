/**
 * Dynamically loads the shared footer into the <footer> tag of the page.
 */
export async function loadSharedFooter() {
  try {
    // Fetch the shared footer HTML
    const response = await fetch('/shared/sharedFooter.html');
    const footerHTML = await response.text();

    // Inject the footer HTML into the footer element
    const footerElement = document.querySelector('footer');
    if (footerElement) {
      footerElement.innerHTML = footerHTML;

      // Check if the user is logged in
      const user = JSON.parse(localStorage.getItem('user') || 'null');

      // Select the links to hide/show
      const newListingLink = footerElement.querySelector(
        'a[href="/listing/create/"]'
      );
      const myProfileLink = footerElement.querySelector('a[href="/profile/"]');

      if (user) {
        // User is logged in - show both links
        newListingLink.classList.remove('hidden');
        myProfileLink.classList.remove('hidden');
      } else {
        // User is not logged in - hide the links
        newListingLink.classList.add('hidden');
        myProfileLink.classList.add('hidden');
      }
    } else {
      console.error('Footer element not found in the DOM.');
    }
  } catch (error) {
    console.error('Error loading shared footer:', error);
  }
}
