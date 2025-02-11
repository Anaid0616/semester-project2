import { setupMediaGallery } from '../listing/mediaGallery.mjs';

document.addEventListener('DOMContentLoaded', function () {
  setupMediaGallery('imageInputs', 'imagePreview', 'addImage');
});
