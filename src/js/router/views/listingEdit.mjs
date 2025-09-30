import { loadSharedHeader } from '../../ui/global/sharedHeader.mjs';
import { loadSharedFooter } from '../../ui/global/sharedFooter.mjs';
import { readListing } from '../../api/listing/read.mjs';
import { updateListing } from '../../api/listing/update.mjs';
import { showAlert } from '../../utilities/alert.mjs';
import { setupMediaGallery } from '../../ui/listing/mediaGallery.mjs';

loadSharedHeader(); // Load the shared header dynamically
loadSharedFooter(); // Load shared footer

// Extract the listing ID from the URL query parameters
const listingId = new URLSearchParams(window.location.search).get('id');
if (!listingId) {
  showAlert('error', 'No listing ID found. Redirecting to home page.');
  setTimeout(() => {
    window.location.href = '/';
  }, 1500);
}

// Get form elements
const form = document.getElementById('edit-listing-form');
const mediaInputsContainer = document.getElementById('imageInputs');
const imagePreview = document.getElementById('imagePreview');
const titleInput = document.getElementById('title');
const descriptionInput = document.getElementById('description');
const tagsInput = document.getElementById('tags');
const deadlineInput = document.getElementById('deadline');
const altInput = document.getElementById('media-alt');

// Initialize media gallery for adding/removing image inputs
setupMediaGallery('imageInputs', 'imagePreview', 'addImage');

/**
 * Load existing listing data from the API and populate the form fields.
 *
 * Side effects:
 * - Reads listing from API using `readListing`.
 * - Fills inputs for alt, title, description, tags, deadline.
 * - Dynamically renders media input fields and preview images.
 * - Adds remove button listeners for each media item.
 * - On failure, shows an error alert and redirects to home.
 *
 * @async
 * @returns {Promise<void>}
 * @throws {Error} If listing data is not found.
 */
async function loadListingData() {
  try {
    const response = await readListing(listingId);

    if (!response || !response.data) {
      throw new Error('Listing data not found.');
    }

    const { data: listing } = response;
    console.log('Loaded Listing Data:', listing);

    // Populate form fields
    altInput.value = listing.media?.[0]?.alt || '';
    titleInput.value = listing.title || '';
    descriptionInput.value = listing.description || '';
    tagsInput.value = listing.tags?.join(', ') || '';
    deadlineInput.value = new Date(listing.endsAt).toISOString().slice(0, 16);

    // Populate media inputs
    mediaInputsContainer.innerHTML = ''; // Clear existing inputs
    imagePreview.innerHTML = ''; // Clear existing previews

    if (listing.media && listing.media.length > 0) {
      listing.media.forEach((mediaItem) => {
        const div = document.createElement('div');
        div.classList.add('flex', 'gap-2', 'mb-2');
        div.innerHTML = ` 
          <input id="imageUrls"
           type="url" class="image-url w-full p-2 border rounded" placeholder="Enter image URL" value="${mediaItem.url}" />
         
          <button type="button" class="removeImage px-3 py-1 bg-[#C5A880] text-black hover:bg-[#9F8766] rounded">-</button>
        `;
        mediaInputsContainer.appendChild(div);

        const img = document.createElement('img');
        img.src = mediaItem.url;
        img.alt = mediaItem.alt;
        img.classList.add('w-24', 'h-24', 'object-cover', 'rounded');
        imagePreview.appendChild(img);

        div.querySelector('.removeImage').addEventListener('click', () => {
          div.remove();
          img.remove();
        });
      });
    }
  } catch (error) {
    console.error('Error loading listing data:', error);
    showAlert('error', 'Failed to load listing data.');
    setTimeout(() => {
      window.location.href = '/';
    }, 1500);
  }
}

/**
 * Handle form submission to save updated listing data.
 *
 * Side effects:
 * - Prevents default form submission.
 * - Reads values from form inputs and builds updated listing object.
 * - Sends update to API via `updateListing`.
 * - On success, shows alert and redirects to the listing detail page.
 * - On failure, shows error alert.
 *
 * @listens form#submit
 */
form.addEventListener('submit', async (event) => {
  event.preventDefault();

  const mediaInputs = document.querySelectorAll('.image-url');
  const unifiedAltText = altInput.value.trim() || 'Image of the listed item';

  // Create an array of media objects with the same alt text
  const media = Array.from(mediaInputs)
    .map((input) => ({
      url: input.value.trim(),
      alt: unifiedAltText,
    }))
    .filter((item) => item.url !== ''); // Filter out empty URLs

  const updatedListing = {
    media,
    title: titleInput.value,
    description: descriptionInput.value,
    tags: tagsInput.value.split(',').map((tag) => tag.trim()),
    endsAt: deadlineInput.value,
  };

  try {
    await updateListing(listingId, updatedListing);
    showAlert('success', 'Listing updated successfully!');
    setTimeout(() => {
      window.location.href = `/listing/?id=${listingId}`;
    }, 1500);
  } catch (error) {
    console.error('Error updating listing:', error);
    showAlert('error', 'Failed to update listing. Please try again.');
  }
});

// Load listing data into the form when the page loads
loadListingData();
