import { setupMediaGallery } from '../listing/mediaGallery.mjs';
import { createListing } from '../../api/listing/create';
import { showAlert } from '../../utilities/alert.mjs';
import { initializeFormHandler } from '../../utilities/formHandler.mjs';

setupMediaGallery('imageInputs', 'imagePreview', 'addImage');

// Call the function to attach the form submission logic
initializeFormHandler();

/**
 * Handles the creation of a new post by collecting data from the form,
 * sending it to the API, and managing the response.
 *
 * @async
 * @function onCreateListing
 * @param {Event} event - The form submission event.
 * @returns {Promise<void>} - Resolves when the listing is successfully created or an error is handled.
 * @throws {Error} - Displays an error alert if listing creation fails.
 *
 * @example
 * // Usage:
 * document.getElementById("create-post-form").addEventListener("submit", onCreateListing);
 */
export async function onCreateListing(event) {
  event.preventDefault(); // Prevent the form from reloading the page

  const form = event.target;

  // Collect all media URLs and their alt texts
  const mediaInputs = document.querySelectorAll('.image-url');
  // Get the alt text from the single alt input field
  const unifiedAltText =
    document.getElementById('media-alt')?.value.trim() ||
    'Image of the listed item';

  // Create an array of media objects with both URL and alt text
  const media = Array.from(mediaInputs)
    .map((input, index) => ({
      url: input.value.trim(),
      alt: unifiedAltText,
    }))
    .filter(
      (item) =>
        item.url.startsWith('http://') || item.url.startsWith('https://')
    );

  const title = form.title.value;
  const description = form.description.value;
  const tags = form.tags.value.split(',').map((tag) => tag.trim());
  const endsAt = form.deadline.value;

  try {
    const listingData = {
      media, // Updated to include all media with alt texts
      title,
      description,
      tags,
      endsAt,
    };
    console.log('Creating listing with data:', listingData);

    const newListing = await createListing(listingData);

    if (newListing && newListing.data && newListing.data.id) {
      showAlert('success', 'Listing created successfully!');

      setTimeout(() => {
        window.location.href = `/listing/?id=${newListing.data.id}`;
      }, 1500);
    } else {
      throw new Error('API Response does not contain listing ID.');
    }
  } catch (error) {
    console.error('Error creating listing:', error);
    showAlert('error', 'Error creating listing. Please try again.');
  }
}
