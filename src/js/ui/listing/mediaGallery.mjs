export function setupMediaGallery(
  imageInputsId,
  imagePreviewId,
  addImageButtonClass
) {
  const imageInputs = document.getElementById(imageInputsId);
  const imagePreview = document.getElementById(imagePreviewId);
  const addImageButton = document.querySelector(`.${addImageButtonClass}`);

  // Log the initial state of elements
  console.log('Image Inputs Element:', imageInputs);
  console.log('Image Preview Element:', imagePreview);
  console.log('Add Image Button Element:', addImageButton);

  if (!imageInputs || !imagePreview || !addImageButton) {
    console.error('Media gallery elements not found!');
    return;
  }

  // Function to add a new image input field
  function addImageInput() {
    console.log('Add Image Button Clicked');
    const div = document.createElement('div');
    div.classList.add('flex', 'gap-2', 'mb-2');
    div.innerHTML = `
      <input type="url" class="image-url w-full p-2 border rounded" placeholder="Enter image URL (must start with http:// or https://)" />
    
      <button type="button" class="removeImage px-3 py-1 bg-red-500 text-white rounded">-</button>
    `;

    imageInputs.appendChild(div);
    console.log('New Image Input Added:', div);

    // Attach event listener for the remove button
    div.querySelector('.removeImage').addEventListener('click', function () {
      console.log('Remove Button Clicked');
      div.remove();
      updateImagePreview();
    });

    // Attach event listener for updating preview
    div
      .querySelector('.image-url')
      .addEventListener('input', updateImagePreview);
  }

  // Function to update the image preview
  function updateImagePreview() {
    imagePreview.innerHTML = '';
    const imageUrls = document.querySelectorAll('.image-url');
    imageUrls.forEach((input) => {
      const url = input.value.trim();
      // Updated regex to accept valid URLs without requiring file extensions
      const urlPattern = /^https?:\/\/[^\s$.?#].[^\s]*$/;

      if (url !== '' && urlPattern.test(url)) {
        console.log('Valid image URL:', url);
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

  console.log('Media Gallery Setup Completed');
}
