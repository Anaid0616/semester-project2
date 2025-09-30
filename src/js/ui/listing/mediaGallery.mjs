/**
 * Initialize a media gallery: adds/removes URL inputs and keeps a live preview
 * of all valid image URLs.
 *
 * Behavior:
 * - Binds an "Add image" button to append URL inputs.
 * - Each input has a remove button and updates the preview on type.
 * - Preview only renders URLs matching a basic http(s) pattern.
 *
 * Side effects:
 * - Mutates the DOM of the containers identified by `imageInputsId` and `imagePreviewId`.
 * - Registers click/input event listeners.
 * - Logs to console if expected elements are missing.
 *
 * @param {string} imageInputsId - ID of the container where URL inputs are appended.
 * @param {string} imagePreviewId - ID of the container that shows image thumbnails.
 * @param {string} addImageButtonClass - CSS class of the button that adds inputs.
 * @returns {void}
 */

export function setupMediaGallery(
  imageInputsId,
  imagePreviewId,
  addImageButtonClass
) {
  const imageInputs = document.getElementById(imageInputsId);
  const imagePreview = document.getElementById(imagePreviewId);
  const addImageButton = document.querySelector(`.${addImageButtonClass}`);

  if (!imageInputs || !imagePreview || !addImageButton) {
    console.error('Media gallery elements not found!');
    return;
  }

  /**
   * Append a new image URL input row with a remove button and wire listeners.
   *
   * @returns {void}
   */
  function addImageInput() {
    const div = document.createElement('div');
    div.classList.add('flex', 'gap-2', 'mb-2');
    div.innerHTML = `
      <input type="url" class="image-url w-full p-2 border rounded" placeholder="Enter image URL (must start with http:// or https://)" />
      <button type="button" class="removeImage px-3 py-1 bg-red-500 text-white rounded">-</button>
    `;

    imageInputs.appendChild(div);

    // Attach event listener for the remove button
    div.querySelector('.removeImage').addEventListener('click', function () {
      div.remove();
      updateImagePreview();
    });

    // Attach event listener for updating preview
    div
      .querySelector('.image-url')
      .addEventListener('input', updateImagePreview);
  }

  /**
   * Rebuild the preview grid from all current `.image-url` inputs.
   * Accepts http(s) URLs via a lightweight regex; logs a warning for invalid ones.
   *
   * @returns {void}
   */
  function updateImagePreview() {
    imagePreview.innerHTML = '';
    const imageUrls = document.querySelectorAll('.image-url');
    imageUrls.forEach((input) => {
      const url = input.value.trim();
      // Updated regex to accept valid URLs without requiring file extensions
      const urlPattern = /^https?:\/\/[^\s$.?#].[^\s]*$/;

      if (url !== '' && urlPattern.test(url)) {
        const img = document.createElement('img');
        img.src = url;
        img.alt = 'Preview';
        img.classList.add('w-24', 'h-24', 'object-cover', 'rounded');
        imagePreview.appendChild(img);
      } else if (url !== '') {
        console.warn('Invalid image URL:', url);
      }
    });
  }

  // Attach event listener to the add button
  addImageButton.addEventListener('click', addImageInput);

  // Attach event listener to the first input field if present
  const firstInput = document.querySelector('.image-url');
  if (firstInput) {
    firstInput.addEventListener('input', updateImagePreview);
  }
}
