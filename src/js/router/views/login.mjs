import { loadSharedHeader } from '../../ui/global/sharedHeader.mjs';
import { onLogin } from '../../ui/auth/login.mjs';

loadSharedHeader(); // Load the shared header dynamically

const form = document.forms.login;

form.addEventListener('submit', onLogin);
