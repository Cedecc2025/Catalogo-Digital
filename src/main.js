import { supabase } from './supabaseClient.js';
import { initAuth } from './auth.js';

window.addEventListener('DOMContentLoaded', async () => {
    initAuth({ supabase });

    try {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
            console.error('Error al comprobar la sesión activa:', error.message);
            return;
        }

        if (data?.session) {
            const message = document.querySelector('[data-feedback-for="login"]');
            if (message) {
                message.textContent = 'Sesión activa detectada.';
                message.classList.add('success');
            }
        }
    } catch (error) {
        console.error('Error inesperado al inicializar la sesión:', error);
    }
});
