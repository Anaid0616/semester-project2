// src/js/utilities/getUserName.js

/**
 * Retrieves the username from localStorage.
 * @returns {string} The username or 'Guest' if not logged in.
 */
export function getUserName() {
  const userData = localStorage.getItem('user');

  if (userData) {
    try {
      const user = JSON.parse(userData);
      console.log(' Parsed user object:', user);

      if (user && user.name) {
        return user.name;
      } else {
        console.warn('User object does not contain a "name" property.');
        return 'Guest';
      }
    } catch (error) {
      console.error('Error parsing user data:', error);
      return 'Guest';
    }
  } else {
    console.warn('No user data found in localStorage.');
    return 'Guest';
  }
}
