import { loadSharedHeader } from '../../ui/global/sharedHeader.mjs';
import { onLogin } from '../../ui/auth/login.mjs';
import { loadSharedFooter } from '../../ui/global/sharedFooter.mjs';

loadSharedHeader(); // Load the shared header dynamically
loadSharedFooter(); // Load shared footer

const form = document.forms.login;

form.addEventListener('submit', onLogin);
