export function setupMediaGallery(
  imageInputsId,
  imagePreviewId,
  addImageButtonClass
) {
  const imageInputs = document.getElementById(imageInputsId);
  const imagePreview = document.getElementById(imagePreviewId);

  if (!imageInputs || !imagePreview) {
    console.error('Media gallery elements not found!');
    return;
  }

  // Function to add a new image input field
  function addImageInput() {
    const div = document.createElement('div');
    div.classList.add('flex', 'gap-2', 'mb-2');
    div.innerHTML = `
        <input type="url" class="image-url w-full p-2 border rounded" placeholder="Enter image URL" />
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

  // Function to update the image preview
  function updateImagePreview() {
    imagePreview.innerHTML = '';
    const imageUrls = document.querySelectorAll('.image-url');
    imageUrls.forEach((input) => {
      if (input.value.trim() !== '') {
        const img = document.createElement('img');
        img.src = input.value;
        img.alt = 'Preview';
        img.classList.add('w-24', 'h-24', 'object-cover', 'rounded');
        imagePreview.appendChild(img);
      }
    });
  }

  // Attach event listener to the add button
  document
    .querySelector(`.${addImageButtonClass}`)
    .addEventListener('click', addImageInput);

  // Attach event listener to the first input field
  document
    .querySelector('.image-url')
    .addEventListener('input', updateImagePreview);
}
