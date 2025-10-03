import { initAuth, checkInitialSession, signOut } from '../modules/auth/auth.js';
import { loadModuleHtml, loadModuleCss } from './moduleLoader.js';
import { supabase } from './supabaseClient.js';
import { setSupabaseClient } from './state.js';

const root = document.getElementById('appRoot');
let appModule = null;
let currentUser = null;

setSupabaseClient(supabase);

async function mountPublicCatalog() {
    await Promise.all([loadModuleCss('public'), loadModuleCss('catalog')]);

    const publicHtml = await loadModuleHtml('public');
    root.innerHTML = publicHtml;

    const catalogContainer = document.getElementById('publicCatalog');
    if (catalogContainer) {
        const catalogHtml = await loadModuleHtml('catalog');
        catalogContainer.innerHTML = catalogHtml;
    }

    const module = await import('../modules/public/public.js');
    await module.initPublicView({
        onLoginRequest: async () => {
            await mountAuth();
        },
        supabase
    });
}

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
        },
        onBack: async () => {
            await mountPublicCatalog();
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
            await mountPublicCatalog();
        }
    });
}

async function bootstrap() {
    const { data } = await supabase.auth.getSession();
    if (data?.session?.user) {
        currentUser = data.session.user;
        await mountApp();
    } else {
        await mountPublicCatalog();
    }
}

bootstrap();
