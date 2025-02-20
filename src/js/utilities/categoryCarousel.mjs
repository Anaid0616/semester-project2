// Define categories in an array
export const categories = [
  { name: 'Fashion', icon: 'fa-bag-shopping' },
  { name: 'Vintage', icon: 'fa-camera-retro' },
  { name: 'Interiors', icon: 'fa-couch' },
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

// Function to create the category carousel
export function createCategoryCarousel(categories) {
  const carouselContainer = document.getElementById('category-carousel');

  if (!carouselContainer) {
    console.error('Carousel container not found!');
    return;
  }

  carouselContainer.innerHTML = '';

  categories.forEach((category) => {
    const categoryElement = document.createElement('div');
    categoryElement.className =
      'flex flex-col items-center cursor-pointer group transition-all hover:scale-105 min-w-[100px] flex-shrink-0';
    categoryElement.dataset.category = category.name.toLowerCase();

    categoryElement.innerHTML = `
            <i class="fa-solid ${category.icon} text-3xl group-hover:text-[#A88B6D] transition-colors"></i>
            <span class="group-hover:text-[#A88B6D] transition-colors">${category.name}</span>
        `;

    // Properly bind the click event to handleCategoryClick
    categoryElement.addEventListener('click', () =>
      handleCategoryClick(categoryElement)
    );
    carouselContainer.appendChild(categoryElement);
  });
}

// Carousel navigation setup
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

// Handle category click
// Handle category click
export function handleCategoryClick(categoryElement) {
  const selectedCategory = categoryElement.dataset.category;
  console.log('Category clicked:', selectedCategory);

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
