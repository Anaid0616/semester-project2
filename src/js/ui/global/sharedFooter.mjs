/**
 * Dynamically loads the shared footer into the <footer> tag of the page.
 */
export async function loadSharedFooter() {
  try {
    const response = await fetch('/shared/sharedFooter.html');
    const footerHTML = await response.text();

    const footerElement = document.querySelector('footer');
    if (footerElement) {
      footerElement.innerHTML = footerHTML;
    } else {
      console.error('Footer element not found in the DOM.');
    }
  } catch (error) {
    console.error('Error loading shared footer:', error);
  }
}
