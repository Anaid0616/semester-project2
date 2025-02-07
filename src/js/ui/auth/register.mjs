import { register } from '../../api/auth/register';
import { showAlert } from '../../utilities/alert.mjs';
/**
 * Handles user registration by collecting form data, calling the API to register the user,
 * and storing the authentication details in `localStorage` upon success.

 *
 * @async
 * @function onRegister
 * @param {Event} event - The form submission event.
 * @returns {Promise<void>} - Resolves when the registration process is complete.
 * @throws {Error} If registration fails, displays an error alert and logs the error in the console.
 */

export async function onRegister(event) {
  event.preventDefault(); // Stop the default form submission

  // Collect form data
  const formData = new FormData(event.target);

  const data = {
    name: formData.get('name'),
    email: formData.get('email'),
    password: formData.get('password'),
  };

  try {
    const response = await register(data);

    // Save the token and user data to localStorage
    localStorage.setItem('token', response.token);
    localStorage.setItem('user', JSON.stringify(response.user));

    // If registration is successful
    showAlert(
      'success',
      'Registration successful! Redirecting to login page...'
    );
    setTimeout(() => {
      window.location.href = '/login/'; // Redirects to the login page
    }, 1500); // Delay for user to see the alert
  } catch (error) {
    console.error('Registration failed:', error); // Logs the error

    // Handle specific error messages
    if (
      error.errors?.[0]?.message === 'Profile already exists' ||
      error.message.includes('Profile already exists')
    ) {
      showAlert('error', 'This email is already registered. Please log in.');
    } else if (error.errors?.[0]?.message.includes('name')) {
      showAlert('error', 'Invalid name. Please choose a different name.');
    } else {
      showAlert(
        'error',
        `Registration failed: ${error.message || 'Unknown error'}`
      );
    }
  }
}
