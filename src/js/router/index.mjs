// This function controls which JavaScript file is loaded on which page
// In order to add additional pages, you will need to implement them below
export default async function router(pathname = window.location.pathname) {
  switch (pathname) {
    case '/':
      await import('./views/home.mjs');
      break;
    case '/auth/login/':
      await import('./views/login.mjs');
      break;
    case '/auth/register/':
      await import('./views/register.mjs');
      break;
    case '/post/':
      await import('./views/listing.mjs');
      break;
    case '/post/edit/':
      await import('./views/listingEdit.mjs');
      break;
    case '/post/create/':
      await import('./views/listingCreate.mjs');
      break;
    case '/profile/':
      await import('./views/profile.mjs');
      break;
    default:
      await import('./views/notFound.mjs');
  }
}
