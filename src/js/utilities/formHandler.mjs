import { doFetch } from '../api/doFetch.mjs';

/**
 * Initializes form handlers for forms with specific `name` attributes.
 * @function initializeFormHandler
 */
export function initializeFormHandler() {
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('form').forEach((form) => {
      form.addEventListener('submit', async (event) => {
        event.preventDefault();

        const formData = new FormData(event.target);
        const formName = form.getAttribute('name'); // Form name attribute
        const feedbackContainer = form.querySelector('.feedback-container'); // Feedback element in form
        const fieldset = form.querySelector('fieldset'); // The fieldset to disable during submission

        // Clear feedback
        feedbackContainer.textContent = '';
        feedbackContainer.classList.add('hidden');

        try {
          // Disable the fieldset during API submission
          fieldset.disabled = true;

          if (formName === 'register') {
            await doFetch(
              '/api/auth/register',
              { method: 'POST', body: formData },
              false
            );
          } else if (formName === 'login') {
            await doFetch(
              '/api/auth/login',
              { method: 'POST', body: formData },
              false
            );
          } else if (formName === 'updateProfileForm') {
            const user = JSON.parse(localStorage.getItem('user'));
            const username = user.name;
            await doFetch(`/api/profile/updateAvatar/${username}`, {
              method: 'PUT',
              body: formData,
            });
          } else if (formName === 'createPost') {
            await doFetch('/api/listing/create', {
              method: 'POST',
              body: formData,
            });
          } else if (formName === 'editPost') {
            const postId = formData.get('id');
            await doFetch(`/api/listing/update/${postId}`, {
              method: 'PUT',
              body: formData,
            });
          }

          // Show success feedback
          feedbackContainer.textContent = 'Success!';
          feedbackContainer.classList.remove('hidden');
          feedbackContainer.classList.add('text-green-600');
        } catch (error) {
          // Show error feedback
          feedbackContainer.textContent = `Error: ${error.message}`;
          feedbackContainer.classList.remove('hidden');
          feedbackContainer.classList.add('text-red-600');
        } finally {
          // Re-enable the fieldset after API call finishes
          fieldset.disabled = false;
        }
      });
    });
  });
}
