import { loadSharedHeader } from '../../ui/global/sharedHeader.mjs';
import { onRegister } from '../../ui/auth/register.mjs';

loadSharedHeader(); // Load the shared header dynamically

const form = document.forms.register;

form.addEventListener('submit', onRegister);
