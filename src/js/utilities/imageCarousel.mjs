// src/js/utilities/imageCarousel.mjs

/**
 * Render an image carousel markup string with a main image, prev/next buttons,
 * and a row of clickable thumbnails.
 *
 * Behavior:
 * - Uses the first image as the initial main image.
 * - Thumbnails get `data-index` to identify the image.
 * - ARIA labels are set on navigation buttons.
 *
 * @param {string[]} images - Array of image URLs (first item is initial image).
 * @param {string[]} [alts=[]] - Optional alt texts aligned by index.
 * @returns {string} HTML string for the carousel.
 */
export function renderImageCarousel(images, alts = []) {
  return `
      <div class="relative">
          <img id="main-image" src="${images[0]}" alt="${
    alts[0] || 'Listing Image'
  }"
               class="w-full h-96 object-cover rounded-lg shadow-md"/>
               
          <!-- Navigation Buttons -->
          <!-- Previous Button -->
<button id="prev-image" 
    class="absolute left-2 top-1/2 -translate-y-[90%] bg-white bg-opacity-70 p-2 rounded-sm shadow-md z-10"
      type="button"
                aria-label="Previous Category">
    <i class="fa-solid fa-chevron-left text-2xl"></i>
</button>

<!-- Next Button -->
<button id="next-image" 
    class="absolute right-2 top-1/2 -translate-y-[90%] bg-white bg-opacity-70 p-2 rounded-sm shadow-sm z-10" 
     type="button"
                aria-label="Next Category">
    <i class="fa-solid fa-chevron-right text-2xl"></i>
</button>

  
          <!-- Thumbnails -->
          <div class="flex gap-2 mt-4">
              ${images
                .map(
                  (img, index) => `
                  <img src="${img}" data-index="${index}" 
                   alt="${alts[index] || 'Thumbnail Image'}"
                       class="thumbnail w-24 h-24 object-cover rounded cursor-pointer border-2 border-transparent hover:border-gray-400">
              `
                )
                .join('')}
          </div>
      </div>
    `;
}

/**
 * Attach interaction handlers to a rendered carousel markup.
 *
 * Behavior:
 * - Maintains an internal `currentImageIndex`.
 * - Next/Prev buttons cycle through images circularly.
 * - Clicking a thumbnail activates that image and highlights its border.
 *
 * Side effects:
 * - Mutates `#main-image` src and toggles `border-gray-800` on `.thumbnail`s.
 * - Registers click handlers on nav buttons and thumbnails.
 *
 * Assumptions:
 * - The markup from {@link renderImageCarousel} has already been inserted
 * into the DOM and contains `#main-image`, `#prev-image`, `#next-image`, and `.thumbnail` elements.
 *
 * @param {string[]} images - Array of image URLs used by the carousel.
 * @returns {void}
 */
export function setupImageCarouselListeners(images) {
  let currentImageIndex = 0;

  function updateImage(index) {
    document.getElementById('main-image').src = images[index];
    document
      .querySelectorAll('.thumbnail')
      .forEach((thumb, i) =>
        thumb.classList.toggle('border-gray-800', i === index)
      );
  }

  document.getElementById('next-image').addEventListener('click', () => {
    currentImageIndex = (currentImageIndex + 1) % images.length;
    updateImage(currentImageIndex);
  });

  document.getElementById('prev-image').addEventListener('click', () => {
    currentImageIndex = (currentImageIndex - 1 + images.length) % images.length;
    updateImage(currentImageIndex);
  });

  document.querySelectorAll('.thumbnail').forEach((thumb) => {
    thumb.addEventListener('click', (event) => {
      currentImageIndex = Number(event.target.getAttribute('data-index'));
      updateImage(currentImageIndex);
    });
  });
}
