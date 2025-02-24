import { loadSharedHeader } from '../../ui/global/sharedHeader.mjs';
import { onRegister } from '../../ui/auth/register.mjs';
import { loadSharedFooter } from '../../ui/global/sharedFooter.mjs';

loadSharedHeader(); // Load the shared header dynamically
loadSharedFooter(); // Load shared footer

const form = document.forms.register;

form.addEventListener('submit', onRegister);
