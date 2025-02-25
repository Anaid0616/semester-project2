import { loadSharedHeader } from '../../ui/global/sharedHeader.mjs';
import { loadSharedFooter } from '../../ui/global/sharedFooter.mjs';
import { readListing } from '../../api/listing/read.mjs';
import { updateListing } from '../../api/listing/update.mjs';
import { showAlert } from '../../utilities/alert.mjs';
import { setupMediaGallery } from '../../ui/listing/mediaGallery.mjs';

loadSharedHeader(); // Load the shared header dynamically
loadSharedFooter(); // Load shared footer

console.log('Initializing Edit Listing Page');

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

// Function to load listing data into the form
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
          <input type="url" class="image-url w-full p-2 border rounded" placeholder="Enter image URL" value="${mediaItem.url}" />
         
          <button type="button" class="removeImage px-3 py-1 bg-red-500 text-white rounded">-</button>
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

// Save the updated listing data
form.addEventListener('submit', async (event) => {
  event.preventDefault();

  const mediaInputs = document.querySelectorAll('.image-url');
  const altText = document.getElementById('media-alt').value.trim();

  // Create an array of media objects with both URL and alt text
  const media = Array.from(mediaInputs)
    .map((input, index) => ({
      url: input.value.trim(),
      alt: altText || 'No alt text provided',
    }))
    .filter((item) => item.url !== ''); // Filter out empty URLs

  console.log('Media Data Before Saving:', media);

  const updatedListing = {
    media,
    title: titleInput.value,
    description: descriptionInput.value,
    tags: tagsInput.value.split(',').map((tag) => tag.trim()),
    endsAt: deadlineInput.value,
  };

  console.log('Updated Listing Data to Submit:', updatedListing);

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
