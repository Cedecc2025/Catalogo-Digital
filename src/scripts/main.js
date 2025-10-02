import { initAuth, checkInitialSession, signOut } from '../modules/auth/auth.js';
import { loadModuleHtml, loadModuleCss } from './moduleLoader.js';
import { supabase } from './supabaseClient.js';

const root = document.getElementById('appRoot');
let appModule = null;
let currentUser = null;

async function mountAuth() {
    await loadModuleCss('auth');
    const authHtml = await loadModuleHtml('auth');
    root.innerHTML = authHtml;

    initAuth({
        container: root,
        onAuthenticated: async (user, options) => {
            currentUser = user;
            if (options?.freshlyRegistered) {
                alert('Registro exitoso. Revisa tu correo para confirmar la cuenta.');
            }
            await mountApp();
        },
        onError: (message) => {
            alert(message);
        }
    });

    await checkInitialSession({
        onAuthenticated: async (user) => {
            currentUser = user;
            await mountApp();
        }
    });
}

async function mountApp() {
    await loadModuleCss('app');
    const appHtml = await loadModuleHtml('app');
    root.innerHTML = appHtml;

    const sections = ['catalog', 'dashboard', 'sales', 'clients', 'inventory', 'chatbot', 'settings'];
    for (const name of sections) {
        await loadModuleCss(name);
        const html = await loadModuleHtml(name);
        const container = document.getElementById(name);
        if (container) {
            container.innerHTML = html;
        }
    }

    const module = await import('../modules/app/app.js');
    appModule = module;
    await module.initApp({
        user: currentUser,
        supabase,
        onLogout: async () => {
            await signOut();
            currentUser = null;
            await mountAuth();
        }
    });
}

mountAuth();
