// Define categories in an array
export const categories = [
  { name: 'Fashion', icon: 'fa-bag-shopping' },
  { name: 'Vintage', icon: 'fa-camera-retro' },
  { name: 'Interior', icon: 'fa-couch' },
  { name: 'Jewelry', icon: 'fa-gem' },
  { name: 'Art', icon: 'fa-palette' },
  { name: 'Decor', icon: 'fa-home' },
  { name: 'Watches', icon: 'fa-stopwatch' },
  { name: 'Toys', icon: 'fa-puzzle-piece' },
  { name: 'Books', icon: 'fa-book-open' },
  { name: 'Sports', icon: 'fa-football' },
  { name: 'Games', icon: 'fa-dice' },
  { name: 'Collectibles', icon: 'fa-star' },
  { name: 'Cars', icon: 'fa-car' },
  { name: 'Other', icon: 'fa-box' },
];

/**
 * Create and render category buttons inside `#category-carousel`.
 *
 * Behavior:
 * - Clears the carousel container and appends a button per category.
 * - Each button gets an icon, label, ARIA attributes, and click handler.
 * - Clicks delegate to {@link handleCategoryClick}.
 *
 * Side effects:
 * - Mutates the DOM under `#category-carousel`.
 * - Registers click handlers on each rendered button.
 *
 * @param {Category[]} categories - List of categories to render.
 * @returns {void}
 */
export function createCategoryCarousel(categories) {
  const carouselContainer = document.getElementById('category-carousel');

  if (!carouselContainer) {
    console.error('Carousel container not found!');
    return;
  }

  carouselContainer.innerHTML = '';

  categories.forEach((category) => {
    const categoryElement = document.createElement('button'); // Changed to <button> for accessibility
    categoryElement.className =
      'flex flex-col items-center cursor-pointer group transition-all hover:scale-105 min-w-[100px] flex-shrink-0';
    categoryElement.dataset.category = category.name.toLowerCase();

    categoryElement.setAttribute('aria-label', `${category.name} Category`);
    categoryElement.setAttribute('type', 'button');

    categoryElement.innerHTML = `
        <i class="fa-solid ${category.icon} text-3xl group-hover:text-[#A88B6D] transition-colors" 
           aria-hidden="true"></i>
        <span class="group-hover:text-[#A88B6D] transition-colors">${category.name}</span>
    `;

    // Properly bind the click event to handleCategoryClick
    categoryElement.addEventListener('click', () =>
      handleCategoryClick(categoryElement)
    );

    carouselContainer.appendChild(categoryElement);
  });
}

/**
 * Wire previous/next buttons to scroll the category carousel horizontally.
 *
 * Side effects:
 * - Adds click listeners to `#prev-category` and `#next-category` to scroll `#category-carousel`.
 *
 * @returns {void}
 */
export function setupCarouselNavigation() {
  const prevButton = document.getElementById('prev-category');
  const nextButton = document.getElementById('next-category');
  const scrollAmount = 200;
  const carousel = document.getElementById('category-carousel');

  if (!prevButton || !nextButton || !carousel) {
    console.error('Navigation buttons or carousel not found!');
    return;
  }

  prevButton.addEventListener('click', () => {
    carousel.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
  });

  nextButton.addEventListener('click', () => {
    carousel.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  });
}

/**
 * Handle a category selection: update visuals and request filtered listings.
 *
 * Behavior:
 * - Reads the selected category from the element's `data-category`.
 * - Highlights the clicked button (bold + underline), removes highlight from others.
 * - Stores the selection on `window.selectedCategory`.
 * - If present, calls `window.fetchAndDisplayListings(1, selectedCategory)` to refresh results.
 * - Scrolls the selected element into view.
 *
 * @param {HTMLElement} categoryElement - The clicked category button.
 * @returns {void}
 */
export function handleCategoryClick(categoryElement) {
  const selectedCategory = categoryElement.dataset.category;

  // Highlight the selected category
  document.querySelectorAll('#category-carousel div').forEach((el) => {
    el.classList.remove('font-bold');
    el.querySelector('span')?.classList.remove('underline');
  });
  categoryElement.classList.add('font-bold');
  // Text: Bold with underline
  const textElement = categoryElement.querySelector('span');
  if (textElement) {
    textElement.classList.add('underline');
  }

  // Update global selected category
  window.selectedCategory = selectedCategory;

  // Fetch listings with the selected category and active filter if applied
  if (typeof window.fetchAndDisplayListings === 'function') {
    window.fetchAndDisplayListings(1, selectedCategory);
  } else {
    console.error('fetchAndDisplayListings function not found!');
  }

  // Optional: Scroll the selected category into view
  categoryElement.scrollIntoView({ behavior: 'smooth', inline: 'center' });
}
