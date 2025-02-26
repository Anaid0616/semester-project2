/**
 * Displays a confirmation modal.
 *
 * @param {string} message - The message to display in the modal.
 * @param {string} confirmText - The text for the confirm button.
 * @param {string} cancelText - The text for the cancel button.
 * @returns {Promise<boolean>} Resolves to true if confirmed, false if canceled.
 */
export async function showModal(
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel'
) {
  return new Promise((resolve) => {
    // Create modal container
    const modalContainer = document.createElement('div');
    modalContainer.className =
      'fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50';

    // Create modal content
    modalContainer.innerHTML = `
          <div class="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 p-6 rounded-lg shadow-lg w-96">
            <h2 class="text-lg font-bold mb-4">Confirm Action</h2>
            <p>${message}</p>
            <div class="mt-4 flex justify-end space-x-4">
              <button
                id="modal-cancel"
                class="px-4 py-2 bg-[#C5A880] text-black hover:bg-[#A88B6D] rounded-sm"
              >
                ${cancelText}
              </button>
              <button
                id="modal-confirm"
                class="px-4 py-2 bg-red-500 text-white rounded-sm hover:bg-red-600"
              >
                ${confirmText}
              </button>
            </div>
          </div>
        `;

    // Append modal to body
    document.body.appendChild(modalContainer);

    // Add event listeners
    const confirmButton = modalContainer.querySelector('#modal-confirm');
    const cancelButton = modalContainer.querySelector('#modal-cancel');

    confirmButton.addEventListener('click', () => {
      resolve(true); // User confirmed
      modalContainer.remove(); // Remove modal
    });

    cancelButton.addEventListener('click', () => {
      resolve(false); // User canceled
      modalContainer.remove(); // Remove modal
    });
  });
}
