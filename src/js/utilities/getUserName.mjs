/**
 * Retrieves the username from localStorage.
 * @returns {string} The username or 'Guest' if not logged in.
 */
export function getUserName() {
  const userData = localStorage.getItem('user');
  if (!userData) return 'Guest';

  try {
    const user = JSON.parse(userData);
    return user?.name ?? 'Guest';
  } catch (error) {
    console.error('Error parsing user data:', error);
    return 'Guest';
  }
}
