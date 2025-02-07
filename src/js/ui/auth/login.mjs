import { login } from '../../api/auth/login';
import { showAlert } from '../../utilities/alert.mjs';

/**
 * This function should pass data to the login function in api/auth and handle the response
 */
/**
 * Handles the login form submission.
 * @param {event} event - The form submit event.
 * @returns {Promise<void>} Resolves when the function completes.
 */
export async function onLogin(event) {
  event.preventDefault(); // Prevent default form submission behavior

  // Collect form data
  const formData = new FormData(event.target);
  const data = {
    email: formData.get('email'),
    password: formData.get('password'),
  };

  try {
    // Call the API and get the response
    const response = await login(data);

    // Save the access token and user data to local storage
    const token = response.data.accessToken;
    const user = {
      name: response.data.name,
      email: response.data.email,
      avatar: response.data.avatar,
      bio: response.data.bio,
    };

    if (token) {
      localStorage.setItem('token', token); // Save the token
    } else {
      console.error('Token is missing from the API response');
    }

    if (user) {
      localStorage.setItem('user', JSON.stringify(user)); // Save the user details
    } else {
      console.error('User data is missing from the API response');
    }

    // Extract the user's name for the alert
    const userName = user.name || 'User';

    // Log success and show an alert
    showAlert('success', `Login successful! Welcome ${userName}!`);

    // Redirect to the home page
    setTimeout(() => {
      window.location.href = '/';
    }, 1500);
  } catch (error) {
    console.error('Login failed:', error);

    // Show an error alert
    showAlert(
      'error',
      'Login failed. Please check your email and password and try again.'
    );
  }
}

// Attach the function to the form submission event
const form = document.forms.login;
form.addEventListener('submit', onLogin);
