import { supabase } from './supabaseClient.js';
import { initAuth } from './auth.js';
import { initDashboard, showDashboard, hideDashboard } from './dashboard.js';

window.addEventListener('DOMContentLoaded', async () => {
    initDashboard({ supabase });

    initAuth({
        supabase,
        onLoginSuccess: (session) => {
            showDashboard(session);
        }
    });

    try {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
            console.error('Error al comprobar la sesión activa:', error.message);
            hideDashboard();
            return;
        }

        if (data?.session) {
            showDashboard(data.session);
        } else {
            hideDashboard();
        }
    } catch (error) {
        console.error('Error inesperado al inicializar la sesión:', error);
        hideDashboard();
    }

    supabase.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_OUT') {
            hideDashboard();
            const loginMessage = document.querySelector('[data-feedback-for="login"]');
            if (loginMessage) {
                loginMessage.textContent = '';
                loginMessage.classList.remove('success', 'error');
            }
            return;
        }

        if (session?.user && ['SIGNED_IN', 'TOKEN_REFRESHED', 'USER_UPDATED'].includes(event)) {
            showDashboard(session);
        }
    });
});
