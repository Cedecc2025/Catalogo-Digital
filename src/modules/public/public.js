import { state, setAdminMode, setUser } from '../../scripts/state.js';
import * as catalogModule from '../catalog/catalog.js';

let callbacks = { onLoginRequest: null };
const publicContext = { slug: null, userId: null };

export async function initPublicView({ onLoginRequest, supabase }) {
    callbacks.onLoginRequest = onLoginRequest;
    callbacks.supabase = supabase;

    resolvePublicContext();

    setAdminMode(false);
    setUser(null);

    state.appData.cart = [];

    const loginBtn = document.getElementById('adminLoginBtn');
    loginBtn?.addEventListener('click', () => callbacks.onLoginRequest?.());

    const cartBtn = document.getElementById('publicCartBtn');
    cartBtn?.addEventListener('click', () => catalogModule.openCart());

    catalogModule.init({
        onCreateProduct: requireAdminAccess,
        onUpdateProduct: requireAdminAccess,
        onDeleteProduct: requireAdminAccess,
        onAddToCart: handleAddToCart,
        onCheckout: handleCheckout,
        onSaveImage: requireAdminAccess,
        onCartChange: () => {},
        onNotify: showToast
    });

    const hasSpecificCatalog = Boolean(publicContext.slug || publicContext.userId);
    const settingsLoaded = await loadPublicSettings();
    if (!settingsLoaded && hasSpecificCatalog) {
        showToast('El catálogo solicitado no está disponible. Verifica el enlace compartido.', 'error');
    }

    await loadPublicProducts();

    catalogModule.render(state);
    catalogModule.renderCart(state);
    catalogModule.updateCartBadge(state);
}

function resolvePublicContext() {
    publicContext.slug = null;
    publicContext.userId = null;

    try {
        const url = new URL(window.location.href);
        const slugParam = url.searchParams.get('store');
        const userParam = url.searchParams.get('user');

        if (slugParam) {
            const normalized = normalizeSlug(slugParam);
            if (normalized) {
                publicContext.slug = normalized;
            }
        }

        if (userParam) {
            const trimmed = userParam.trim();
            if (trimmed) {
                publicContext.userId = trimmed;
            }
        }
    } catch (error) {
        console.error('No fue posible interpretar la URL pública del catálogo', error);
    }
}

async function loadPublicProducts() {
    if (!callbacks.supabase) return;

    try {
        let query = callbacks.supabase
            .from('products')
            .select('*')
            .eq('is_public', true)
            .order('created_at', { ascending: false });

        if (publicContext.userId) {
            query = query.eq('user_id', publicContext.userId);
        } else if (publicContext.slug) {
            state.appData.products = [];
            return;
        }

        const { data, error } = await query;

        if (error) throw error;

        state.appData.products = (data ?? []).map(mapProductRow);
    } catch (error) {
        console.error('No fue posible cargar los productos públicos', error);
        showToast('No fue posible cargar los productos del catálogo.', 'error');
        state.appData.products = [];
    }
}

async function loadPublicSettings() {
    if (!callbacks.supabase) {
        applyPublicBranding();
        return true;
    }

    try {
        let query = callbacks.supabase.from('business_settings').select('*');

        if (publicContext.slug) {
            query = query.eq('public_slug', publicContext.slug);
        } else if (publicContext.userId) {
            query = query.eq('user_id', publicContext.userId);
        } else {
            query = query.eq('is_public', true).order('updated_at', { ascending: false }).limit(1);
        }

        const { data, error } = await query.maybeSingle();

        if (error) throw error;

        if (!data) {
            if (publicContext.slug || publicContext.userId) {
                state.appData.settings = {
                    ...state.appData.settings,
                    businessName: 'Catálogo no disponible',
                    logo: '',
                    whatsapp: '',
                    email: '',
                    publicSlug: ''
                };
            }
            applyPublicBranding();
            return false;
        }

        publicContext.userId = data.user_id ?? publicContext.userId;
        state.appData.settings = {
            ...state.appData.settings,
            ...mapSettingsRow(data)
        };
    } catch (error) {
        console.error('No fue posible cargar la configuración pública', error);
        showToast('No se pudo cargar la configuración del catálogo.', 'error');
        applyPublicBranding();
        return false;
    }

    applyPublicBranding();
    return true;
}

function handleAddToCart(productId) {
    const product = state.appData.products.find((item) => item.id === productId);
    if (!product || product.stock <= 0) return;

    const existing = state.appData.cart.find((item) => item.id === productId);
    if (existing) {
        existing.quantity = Math.min(existing.quantity + 1, product.stock);
    } else {
        state.appData.cart.push({ id: productId, quantity: 1 });
    }

    catalogModule.renderCart(state);
    catalogModule.updateCartBadge(state);
}

async function handleCheckout(order) {
    state.appData.cart = [];
    catalogModule.renderCart(state);
    catalogModule.updateCartBadge(state);
}

function requireAdminAccess() {
    showToast('Inicia sesión como administrador para gestionar el catálogo.', 'warning');
}

function mapProductRow(row) {
    return {
        id: row.id,
        name: row.name,
        description: row.description ?? '',
        category: row.category ?? 'General',
        price: Number(row.price ?? 0),
        stock: Number(row.stock ?? 0),
        image: row.image_url ?? '',
        createdAt: row.created_at
    };
}

function mapSettingsRow(row) {
    return {
        businessName: row.business_name ?? 'Mi Negocio',
        logo: row.logo_url ?? '',
        whatsapp: row.whatsapp ?? '',
        email: row.email ?? '',
        colors: {
            primary: row.primary_color ?? state.appData.settings.colors.primary,
            bgColor1: row.gradient_start ?? state.appData.settings.colors.bgColor1,
            bgColor2: row.gradient_end ?? state.appData.settings.colors.bgColor2
        },
        isPublic: row.is_public ?? true,
        publicSlug: row.public_slug ?? ''
    };
}

function applyPublicBranding() {
    const { settings } = state.appData;
    document.getElementById('publicBusinessName').textContent = settings.businessName || 'Mi Negocio';
    document.body.style.background = `linear-gradient(135deg, ${settings.colors.bgColor1} 0%, ${settings.colors.bgColor2} 100%)`;
    document.documentElement.style.setProperty('--primary', settings.colors.primary || '#2563eb');

    const tagline = document.getElementById('publicBusinessTagline');
    if (tagline) {
        if (settings.whatsapp) {
            tagline.textContent = `Haz tu pedido al ${settings.whatsapp}`;
        } else if (settings.email) {
            tagline.textContent = `Contáctanos en ${settings.email}`;
        } else if (settings.businessName === 'Catálogo no disponible') {
            tagline.textContent = 'El catálogo solicitado no está disponible en este momento.';
        } else {
            tagline.textContent = 'Explora nuestro catálogo y encuentra tu próximo favorito.';
        }
    }

    const logoImage = document.getElementById('publicLogoImage');
    const logoIcon = document.getElementById('publicLogoIcon');
    if (settings.logo) {
        logoImage.src = settings.logo;
        logoImage.style.display = 'block';
        logoIcon.style.display = 'none';
    } else {
        logoImage.style.display = 'none';
        logoIcon.style.display = 'inline-block';
    }

    const title = settings.businessName ? `${settings.businessName} · Catálogo` : 'Catálogo en línea';
    document.title = title;
}

function showToast(message, type = 'info') {
    const container = document.getElementById('notificationContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `notification ${type}`;
    toast.innerHTML = `
        <div class="notification-icon">
            ${type === 'success' ? '✅' : type === 'warning' ? '⚠️' : type === 'error' ? '❌' : 'ℹ️'}
        </div>
        <div class="notification-content">
            <h4>${message}</h4>
        </div>
        <button class="notification-close">×</button>`;

    container.appendChild(toast);

    const close = () => {
        toast.classList.add('hide');
        setTimeout(() => toast.remove(), 200);
    };

    toast.querySelector('.notification-close')?.addEventListener('click', close);
    setTimeout(close, 4000);
}

function normalizeSlug(value = '') {
    return value
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9-]/g, '')
        .replace(/-{2,}/g, '-')
        .replace(/^-+|-+$/g, '');
}
