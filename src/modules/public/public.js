import { state, setAdminMode, setUser } from '../../scripts/state.js';
import * as catalogModule from '../catalog/catalog.js';

let callbacks = { onLoginRequest: null };
const publicContext = {
    slug: null,
    userId: null,
    slugCandidates: [],
    settingsRow: null
};

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
    publicContext.slugCandidates = [];
    publicContext.settingsRow = null;

    try {
        const url = new URL(window.location.href);
        const slugParam = url.searchParams.get('store');
        const userParam = url.searchParams.get('user');

        if (slugParam) {
            registerSlugCandidates(slugParam);
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

async function fetchPublicBusinessSettings(columns = '*') {
    if (!callbacks.supabase) return null;

    const candidates = Array.from(new Set((publicContext.slugCandidates ?? []).filter((item) => Boolean(item))));

    if (candidates.length > 0) {
        for (const value of candidates) {
            const { data, error } = await callbacks.supabase
                .from('business_settings')
                .select(columns)
                .eq('is_public', true)
                .eq('public_slug', value)
                .maybeSingle();

            if (error) throw error;
            if (data) return data;
        }

        for (const value of candidates) {
            const { data, error } = await callbacks.supabase
                .from('business_settings')
                .select(columns)
                .eq('is_public', true)
                .ilike('public_slug', value)
                .maybeSingle();

            if (error) throw error;
            if (data) return data;
        }

        for (const value of candidates) {
            const pattern = toFuzzyPattern(value);
            if (!pattern) continue;

            const { data, error } = await callbacks.supabase
                .from('business_settings')
                .select(columns)
                .eq('is_public', true)
                .ilike('public_slug', pattern)
                .limit(1)
                .maybeSingle();

            if (error) throw error;
            if (data) return data;
        }

        return null;
    }

    if (publicContext.userId) {
        const { data, error } = await callbacks.supabase
            .from('business_settings')
            .select(columns)
            .eq('is_public', true)
            .eq('user_id', publicContext.userId)
            .maybeSingle();

        if (error) throw error;
        return data ?? null;
    }

    const { data, error } = await callbacks.supabase
        .from('business_settings')
        .select(columns)
        .eq('is_public', true)
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

    if (error) throw error;
    return data ?? null;
}

async function loadPublicProducts() {
    if (!callbacks.supabase) return;

    try {
        let query = callbacks.supabase
            .from('products')
            .select('*')
            .order('created_at', { ascending: false });

        if (publicContext.userId) {
            query = query.eq('user_id', publicContext.userId);
        } else if (publicContext.slug) {
            const ownerId = await resolveCatalogOwnerFromSlug();
            if (!ownerId) {
                state.appData.products = [];
                return;
            }
            publicContext.userId = ownerId;
            query = query.eq('user_id', ownerId);
        } else {
            query = query.eq('is_public', true);
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

async function resolveCatalogOwnerFromSlug() {
    if (!callbacks.supabase || (publicContext.slugCandidates?.length ?? 0) === 0) return null;

    if (publicContext.userId) {
        return publicContext.userId;
    }

    if (publicContext.settingsRow && slugMatchesCandidates(publicContext.settingsRow.public_slug)) {
        if (publicContext.settingsRow.user_id) {
            publicContext.userId = publicContext.settingsRow.user_id;
            return publicContext.userId;
        }
    }

    try {
        const data = await fetchPublicBusinessSettings('user_id, public_slug');
        if (!data?.user_id) {
            return null;
        }
        storeResolvedSettings(data);
        return data.user_id;
    } catch (error) {
        console.error('No fue posible resolver el propietario del catálogo público', error);
        showToast('El catálogo solicitado no está disponible en este momento. Verifica el enlace compartido.', 'warning');
        return null;
    }
}

async function loadPublicSettings() {
    if (!callbacks.supabase) {
        applyPublicBranding();
        return true;
    }

    try {
        const data = await fetchPublicBusinessSettings('*');

        if (!data) {
            if ((publicContext.slugCandidates?.length ?? 0) > 0 || publicContext.userId) {
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

        storeResolvedSettings(data);
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

function storeResolvedSettings(row) {
    publicContext.settingsRow = row ?? null;

    if (row?.user_id) {
        publicContext.userId = row.user_id;
    }

    if (row?.public_slug) {
        addSlugCandidate(row.public_slug);
        const normalized = normalizeSlug(row.public_slug);
        if (normalized) {
            addSlugCandidate(normalized);
            if (!publicContext.slug) {
                publicContext.slug = normalized;
            }
        }
    }
}

function slugMatchesCandidates(value) {
    if (!value) return false;
    const lower = value.toLowerCase();
    return (publicContext.slugCandidates ?? []).some((candidate) => (candidate ?? '').toLowerCase() === lower);
}

function registerSlugCandidates(rawValue) {
    if (typeof rawValue !== 'string') return;

    const trimmed = rawValue.trim();
    if (!trimmed) return;

    addSlugCandidate(trimmed);

    const normalized = normalizeSlug(trimmed);
    if (normalized) {
        publicContext.slug = normalized;
        addSlugCandidate(normalized);
    }

    const slugified = slugifyCandidate(trimmed);
    if (slugified && slugified !== normalized) {
        if (!publicContext.slug) {
            publicContext.slug = slugified;
        }
        addSlugCandidate(slugified);
    }

    if (!publicContext.slug) {
        publicContext.slug = trimmed;
    }
}

function addSlugCandidate(value) {
    if (!value) return;
    if (!Array.isArray(publicContext.slugCandidates)) {
        publicContext.slugCandidates = [];
    }
    if (!publicContext.slugCandidates.includes(value)) {
        publicContext.slugCandidates.push(value);
    }
}

function slugifyCandidate(value = '') {
    return value
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/-{2,}/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 60);
}

function toFuzzyPattern(value) {
    if (!value) return null;

    const condensed = value
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]/g, '');

    if (!condensed) return null;

    return `%${condensed.split('').join('%')}%`;
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
