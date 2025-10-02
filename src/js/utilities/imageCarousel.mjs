// src/js/utilities/imageCarousel.mjs

/**
 * Render an image carousel markup string with a main image, prev/next buttons,
 * and a row of clickable thumbnails.
 *
 * Behavior:
 * - Uses the first image as the initial main image.
 * - Thumbnails get `data-index` to identify the image.
 * - Nav buttons are absolutely positioned against the main image only.
 *
 * @param {string[]} images - Array of image URLs (first item is initial image).
 * @param {string[]} [alts=[]] - Optional alt texts aligned by index.
 * @returns {string} HTML string for the carousel.
 */
export function renderImageCarousel(images, alts = []) {
  const firstAlt = alts[0] || 'Listing image';
  return `
    <div>
      <!-- Main image wrapper (relative so arrows center on THIS box only) -->
      <div id="main-image-wrap" class="relative overflow-hidden">
        <img
          id="main-image"
          src="${images[0]}"
          alt="${firstAlt}"
          class="w-full aspect-[4/3] object-cover rounded-lg shadow-md"
        />

        <!-- Prev -->
        <button
          id="prev-image"
          type="button"
          aria-label="Previous image"
          class="absolute left-2 top-1/2 -translate-y-1/2
                 w-8 h-11 grid place-items-center
                 bg-white/70 rounded-sm shadow-md z-10 hover:bg-white"
        >
          <i class="fa-solid fa-chevron-left text-xl"></i>
        </button>

        <!-- Next -->
        <button
          id="next-image"
          type="button"
          aria-label="Next image"
          class="absolute right-2 top-1/2 -translate-y-1/2
                 w-8 h-11 grid place-items-center
                 bg-white/70 rounded-sm shadow-md z-10 hover:bg-white"
        >
          <i class="fa-solid fa-chevron-right text-xl"></i>
        </button>
      </div>

      <!-- Thumbnails live OUTSIDE the main-image wrapper -->
      <div class="flex gap-2 mt-4">
        ${images
          .map(
            (img, index) => `
              <img
                src="${img}"
                data-index="${index}"
                alt="${alts[index] || 'Thumbnail image'}"
                class="thumbnail w-24 h-24 object-cover rounded cursor-pointer
                       border-2 border-transparent hover:border-gray-400"
              />
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
 * - The markup from {@link renderImageCarousel} is already in the DOM and
 *   contains `#main-image`, `#prev-image`, `#next-image`, and `.thumbnail` elements.
 *
 * @param {string[]} images - Array of image URLs used by the carousel.
 * @returns {void}
 */
export function setupImageCarouselListeners(images) {
  let currentImageIndex = 0;

  function updateImage(index) {
    const main = document.getElementById('main-image');
    if (main) main.src = images[index];

    document.querySelectorAll('.thumbnail').forEach((thumb, i) => {
      thumb.classList.toggle('border-gray-800', i === index);
    });
  }

  const nextBtn = document.getElementById('next-image');
  const prevBtn = document.getElementById('prev-image');

  nextBtn?.addEventListener('click', () => {
    currentImageIndex = (currentImageIndex + 1) % images.length;
    updateImage(currentImageIndex);
  });

  prevBtn?.addEventListener('click', () => {
    currentImageIndex = (currentImageIndex - 1 + images.length) % images.length;
    updateImage(currentImageIndex);
  });

  // Bind click för varje thumbnail
  document.querySelectorAll('.thumbnail').forEach((thumb) => {
    thumb.addEventListener('click', (event) => {
      /** @type {HTMLElement} */
      const target = event.currentTarget;
      const idx = Number(target.getAttribute('data-index'));
      if (!Number.isNaN(idx)) {
        currentImageIndex = idx;
        updateImage(currentImageIndex);
      }
    });
  });

  // Initialize first thumbnail highlight
  updateImage(0);
}
