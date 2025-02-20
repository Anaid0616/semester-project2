/**
 * Checks if an image URL is valid and loads successfully.
 * @param {string} url - The image URL to validate.
 * @returns {Promise<boolean>} - Resolves to true if the image is valid, false otherwise.
 */
export async function isValidImage(url) {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = url;
    img.onload = () => resolve(true); // Image loads successfully
    img.onerror = () => resolve(false); // Image failed to load
  });
}

/**
 * Filters out listings with broken or non-loading images.
 * @param {Array} listings - The array of listing objects.
 * @returns {Promise<Array>} - The filtered array of valid listings.
 */
export async function filterValidImageListings(listings) {
  const validatedListings = await Promise.all(
    listings.map(async (listing) => {
      const mediaUrl = listing.media?.[0]?.url;
      if (mediaUrl && mediaUrl.startsWith('http')) {
        const isValid = await isValidImage(mediaUrl);
        return isValid ? listing : null;
      }
      return null;
    })
  );
  return validatedListings.filter((listing) => listing !== null);
}
