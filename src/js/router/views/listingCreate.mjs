import { loadSharedHeader } from '../../ui/global/sharedHeader.mjs';
import { loadSharedFooter } from '../../ui/global/sharedFooter.mjs';
import { onCreateListing } from '../../ui/listing/create.mjs';
import { setupMediaGallery } from '../../ui/listing/mediaGallery.mjs';

loadSharedHeader(); // Load the shared header dynamically
loadSharedFooter(); // Load shared footer

// Initialize the form and media gallery
const form = document.forms.createListing;

form.addEventListener('submit', onCreateListing);

// Initialize the media gallery
setupMediaGallery('imageInputs', 'imagePreview', 'addImage');
