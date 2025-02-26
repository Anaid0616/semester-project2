// imageCarousel

// Function to render the image carousel HTML
export function renderImageCarousel(images) {
  return `
      <div class="relative">
          <img id="main-image" src="${images[0]}" alt="Listing Image" 
               class="w-full h-96 object-cover rounded-lg shadow-md"/>
               
          <!-- Navigation Buttons -->
          <!-- Previous Button -->
<button id="prev-image" 
    class="absolute left-2 top-1/2 -translate-y-[90%] bg-white bg-opacity-70 p-2 rounded-sm shadow-md z-10">
    <i class="fa-solid fa-chevron-left text-2xl"></i>
</button>

<!-- Next Button -->
<button id="next-image" 
    class="absolute right-2 top-1/2 -translate-y-[90%] bg-white bg-opacity-70 p-2 rounded-sm shadow-sm z-10">
    <i class="fa-solid fa-chevron-right text-2xl"></i>
</button>

  
          <!-- Thumbnails -->
          <div class="flex gap-2 mt-4">
              ${images
                .map(
                  (img, index) => `
                  <img src="${img}" data-index="${index}" 
                       class="thumbnail w-16 h-16 object-cover rounded cursor-pointer border-2 border-transparent hover:border-gray-400">
              `
                )
                .join('')}
          </div>
      </div>
    `;
}

// Function to set up event listeners for the image carousel
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
