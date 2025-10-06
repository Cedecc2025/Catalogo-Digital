import { supabase } from '../../scripts/supabaseClient.js';
import { setUser, setSupabaseClient } from '../../scripts/state.js';

export function initAuth({ container, onAuthenticated, onError, onBack }) {
    setSupabaseClient(supabase);
    const tabs = Array.from(container.querySelectorAll('.auth-tab'));
    const forms = {
        loginForm: container.querySelector('#loginForm'),
        registerForm: container.querySelector('#registerForm')
    };

    container.querySelector('#backToCatalog')?.addEventListener('click', () => {
        onBack?.();
    });

    tabs.forEach((tab) => {
        tab.addEventListener('click', (event) => {
            event.preventDefault();
            tabs.forEach((t) => t.classList.remove('active'));
            tab.classList.add('active');

            Object.entries(forms).forEach(([id, form]) => {
                form.classList.toggle('hidden', id !== tab.dataset.target);
            });
        });
    });

    forms.loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const email = container.querySelector('#loginEmail').value.trim();
        const password = container.querySelector('#loginPassword').value;

        try {
            const { data, error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) throw error;
            setUser(data.user ?? null);
            onAuthenticated?.(data.user);
        } catch (error) {
            onError?.(error.message || 'No fue posible iniciar sesión');
        }
    });

    forms.registerForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const email = container.querySelector('#registerEmail').value.trim();
        const password = container.querySelector('#registerPassword').value;
        const confirm = container.querySelector('#registerConfirmPassword').value;

        if (password !== confirm) {
            onError?.('Las contraseñas no coinciden');
            return;
        }

        try {
            const { data, error } = await supabase.auth.signUp({ email, password });
            if (error) throw error;
            setUser(data.user ?? null);
            onAuthenticated?.(data.user, { freshlyRegistered: true });
        } catch (error) {
            onError?.(error.message || 'No fue posible registrar la cuenta');
        }
    });
}

export async function checkInitialSession({ onAuthenticated }) {
    const { data } = await supabase.auth.getSession();
    if (data?.session?.user) {
        setUser(data.session.user);
        onAuthenticated?.(data.session.user);
    }
}

export async function signOut() {
    await supabase.auth.signOut();
    setUser(null);
}
