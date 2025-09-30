// src/js/router/index.mjs

/**
 * Resolve the current pathname to a view and dynamically import its module.
 *
 * Behavior:
 * - Uses `import()` to lazy-load the view for the given pathname.
 * - Falls back to the Not Found view when no case matches.
 *
 * @async
 * @param {string} [pathname=window.location.pathname] - Current location pathname.
 * @returns {Promise<void>}
 * @example
 * // On navigation change
 * router('/profile/');
 */
export default async function router(pathname = window.location.pathname) {
  switch (pathname) {
    case '/':
      await import('./views/home.mjs');
      break;
    case '/login/':
      await import('./views/login.mjs');
      break;
    case '/register/':
      await import('./views/register.mjs');
      break;
    case '/listing/':
      await import('./views/listing.mjs');
      break;
    case '/listing/edit/':
      await import('./views/listingEdit.mjs');
      break;
    case '/listing/create/':
      await import('./views/listingCreate.mjs');
      break;
    case '/profile/':
      await import('./views/profile.mjs');
      break;
    case '/search/':
      await import('./views/search.mjs');
      break;
    default:
      await import('./views/notFound.mjs');
  }
}
