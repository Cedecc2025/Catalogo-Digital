import { supabase } from './supabaseClient.js';
import { initAuth, getStoredLocalSession, clearStoredLocalSession } from './auth.js';
import { initDashboard, showDashboard, hideDashboard } from './dashboard.js';

window.addEventListener('DOMContentLoaded', async () => {
    initDashboard({ supabase });

    initAuth({
        supabase,
        onLoginSuccess: async (session) => {
            await showDashboard(session);
        }
    });

    try {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
            console.error('Error al comprobar la sesión activa:', error.message);
        } else if (data?.session) {
            await showDashboard(data.session);
            return;
        }
    } catch (error) {
        console.error('Error inesperado al inicializar la sesión:', error);
    }

    const localSession = getStoredLocalSession();
    if (localSession) {
        await showDashboard(localSession);
    } else {
        hideDashboard();
    }

    supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_OUT') {
            clearStoredLocalSession();
            hideDashboard();
            const loginMessage = document.querySelector('[data-feedback-for="login"]');
            if (loginMessage) {
                loginMessage.textContent = '';
                loginMessage.classList.remove('success', 'error');
            }
            return;
        }

        if (session?.user && ['SIGNED_IN', 'TOKEN_REFRESHED', 'USER_UPDATED'].includes(event)) {
            await showDashboard(session);
        }
    });
});
