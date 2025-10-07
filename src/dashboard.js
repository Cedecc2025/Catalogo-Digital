import { getInitialDashboardData } from './sampleData.js';

const DASHBOARD_SELECTORS = {
    section: '[data-section="dashboard"]',
    authSection: '[data-section="auth"]',
    page: '.page',
    userEmail: '[data-user-email]',
    totalSales: '#statTotalSales',
    totalClients: '#statTotalClients',
    totalProducts: '#statTotalProducts',
    todayOrders: '#statTodayOrders',
    salesTable: '#recentSalesTable',
    logoutButton: '#logoutButton',
    dashboardTabs: '[data-dashboard-tab]',
    dashboardPanels: '[data-dashboard-panel]',
    catalogTable: '#catalogProductsTable',
    catalogCounter: '#catalogProductsTotal',
    addProductButton: '#addProductButton',
    addProductForm: '#addProductForm',
    addProductCancel: '#cancelAddProduct',
    addProductFeedback: '[data-feedback="add-product"]',
    salesTotalCount: '#salesTotalCount',
    salesTotalAmount: '#salesTotalAmount',
    addSaleButton: '#addSaleButton',
    addSaleForm: '#addSaleForm',
    addSaleCancel: '#cancelAddSale',
    addSaleFeedback: '[data-feedback="add-sale"]',
    saleProductSelect: '#saleProductSelect',
    saleQuantityInput: '#saleQuantity',
    saleUnitPriceInput: '#saleUnitPrice',
    saleTotalPreview: '#saleTotalPreview',
    salesHistoryTable: '#salesHistoryTable',
    clientsCounter: '#clientsCounter',
    clientsTableBody: '#clientsTableBody',
    addClientButton: '#addClientButton',
    clientForm: '#clientForm',
    clientFormTitle: '#clientFormTitle',
    clientFormSubmit: '#clientFormSubmit',
    clientFormCancel: '#cancelClientForm',
    clientFeedback: '[data-feedback="client-form"]',
    inventoryToggleButton: '#toggleInventoryForm',
    inventoryForm: '#inventoryAdjustForm',
    inventoryFormCancel: '#cancelInventoryForm',
    inventoryFeedback: '[data-feedback="inventory-adjust"]',
    inventoryProductSelect: '#inventoryProductSelect',
    inventoryTypeSelect: '#inventoryType',
    inventoryQuantityInput: '#inventoryQuantity',
    inventoryTableBody: '#inventoryTableBody',
    inventoryHistoryTable: '#inventoryHistoryTable',
    settingsForm: '#settingsForm',
    settingsFeedback: '[data-feedback="settings"]',
    settingsPreviewName: '[data-settings-preview="name"]',
    settingsPreviewTagline: '[data-settings-preview="tagline"]',
    settingsPreviewContact: '[data-settings-preview="contact"]',
    settingsPreviewLogo: '[data-settings-preview="logo"]',
    dashboardTitle: '.dashboard-title',
    dashboardSubtitle: '.dashboard-subtitle',
    portalShareInput: '#portalShareInput',
    portalCopyButton: '#copyPortalLink',
    portalList: '#clientPortalList',
    portalForm: '#clientPortalForm',
    portalFormToggle: '#togglePortalForm',
    portalFormCancel: '#cancelPortalForm',
    portalFormFeedback: '[data-feedback="portal-form"]',
    portalShareFeedback: '[data-feedback="portal-share"]',
    portalSummaryName: '[data-portal-summary="name"]',
    portalSummaryProducts: '[data-portal-summary="products"]',
    portalSummaryContact: '[data-portal-summary="contact"]',
    productPortalSelect: '#productPortalSelect'
};
const defaultDashboardState = getInitialDashboardData();

function cloneData(data) {
    return JSON.parse(JSON.stringify(data));
}

let currentData = cloneData(defaultDashboardState);
let supabaseClient = null;
let activePanel = 'overview';
let isAddProductFormVisible = false;
let editingProductId = null;
let isAddSaleFormVisible = false;
let isClientFormVisible = false;
let editingClientId = null;
let isInventoryFormVisible = false;
let isPortalFormVisible = false;
let selectedPortalSlug = defaultDashboardState.portals?.[0]?.slug ?? null;
let isFetchingDashboardData = false;
let hasLoadedDashboardData = false;
let lastLoadedUserId = null;

function getDefaultSettings() {
    return cloneData(defaultDashboardState.settings || {});
}

function mergeSettingsWithDefaults(settings = {}) {
    const defaults = getDefaultSettings();
    const merged = { ...defaults };

    if (settings && typeof settings === 'object') {
        Object.entries(settings).forEach(([key, value]) => {
            merged[key] = value;
        });
    }

    if (!merged.portalBaseUrl) {
        merged.portalBaseUrl = defaults.portalBaseUrl || '';
    }

    if (typeof merged.portalBaseUrl === 'string') {
        merged.portalBaseUrl = merged.portalBaseUrl.trim();
    }

    if (!merged.themeColor) {
        merged.themeColor = defaults.themeColor || '#6366f1';
    }

    return merged;
}

function escapeHtml(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function getElement(selector) {
    return document.querySelector(selector);
}

function setText(selector, value) {
    const element = getElement(selector);
    if (element) {
        element.textContent = value;
    }
}

function setFeedback(selector, message = '', type = '') {
    const element = getElement(selector);
    if (!element) return;

    element.textContent = message;
    element.dataset.state = type;
}

function toggleFormControls(form, disabled) {
    if (!form) return;
    const controls = form.querySelectorAll('input, button, select, textarea');
    controls.forEach((control) => {
        control.disabled = disabled;
    });
}

function parseArrayField(value) {
    if (Array.isArray(value)) {
        return value;
    }

    if (!value && value !== 0) {
        return [];
    }

    if (typeof value === 'string') {
        const trimmed = value.trim();
        if (!trimmed) {
            return [];
        }

        try {
            const parsed = JSON.parse(trimmed);
            if (Array.isArray(parsed)) {
                return parsed;
            }
        } catch (error) {
            // El valor no estaba en formato JSON, continuamos.
        }

        return trimmed
            .split(',')
            .map((item) => item.trim())
            .filter(Boolean);
    }

    if (typeof value === 'object') {
        return Object.values(value).filter(Boolean);
    }

    return [];
}

function parseJsonItems(items) {
    if (Array.isArray(items)) {
        return items;
    }

    if (typeof items === 'string') {
        try {
            const parsed = JSON.parse(items);
            if (Array.isArray(parsed)) {
                return parsed;
            }
        } catch (error) {
            // No se pudo interpretar como JSON, se ignora.
        }
    }

    return [];
}

function getSaleStatusClass(status) {
    const normalized = (status || '').toLowerCase();
    switch (normalized) {
        case 'completado':
        case 'pagado':
        case 'finalizado':
        case 'entregado':
            return 'success';
        case 'pendiente':
        case 'procesando':
        case 'en progreso':
            return 'pending';
        case 'cancelado':
        case 'fallido':
        case 'reembolsado':
            return 'danger';
        default:
            return 'info';
    }
}

function normalizeProductRecord(record) {
    const stockValue = record.stock ?? record.inventory ?? record.quantity ?? null;
    const stock = Number.isFinite(Number(stockValue)) ? Number(stockValue) : null;
    const statusLabel = record.status ?? (Number.isFinite(stock) ? getStatusFromStock(stock).status : 'Disponible');
    const statusClass = record.status_class ?? record.statusClass ?? getStatusClass(statusLabel);

    return {
        id: record.id,
        name: record.name ?? record.title ?? 'Producto',
        category: record.category ?? record.category_name ?? 'Sin categoría',
        price: Number(record.price ?? record.unit_price ?? 0) || 0,
        stock: stock,
        status: statusLabel,
        statusClass,
        image: record.image ?? record.image_url ?? record.thumbnail ?? '',
        description: record.description ?? record.details ?? '',
        portalId: record.portal_id ?? record.portalId ?? record.portal ?? null,
        portalIds: parseArrayField(record.portal_ids ?? record.portalIds),
        sku: record.sku ?? record.code ?? '',
        createdAt: record.created_at ?? record.createdAt ?? null
    };
}

function normalizeSaleRecord(record) {
    const items = parseJsonItems(record.items).map((item) => ({
        productId: item.product_id ?? item.productId ?? item.id ?? null,
        productName: item.productName ?? item.name ?? item.product ?? 'Producto',
        quantity: Number(item.quantity ?? item.qty ?? 0) || 0,
        unitPrice: Number(item.unitPrice ?? item.price ?? item.unit_price ?? 0) || 0
    }));

    const status = record.status ?? record.state ?? 'Pendiente';

    let client = record.client;
    if (!client) {
        const name = record.client_name ?? record.customer_name ?? record.customer ?? '';
        client = name ? { name } : { name: 'Cliente' };
    }

    return {
        id: record.id,
        date: record.date ?? record.created_at ?? record.sale_date ?? new Date().toISOString(),
        total: Number(record.total ?? record.amount ?? record.total_amount ?? 0) || 0,
        status,
        statusClass: record.status_class ?? record.statusClass ?? getSaleStatusClass(status),
        paymentMethod: record.payment_method ?? record.paymentMethod ?? record.method ?? '—',
        client,
        items,
        notes: record.notes ?? record.comments ?? ''
    };
}

function normalizeClientRecord(record) {
    const status = record.status ?? record.state ?? 'Activo';
    const email = record.email ?? record.contact_email ?? '';
    const phone = record.phone ?? record.contact_phone ?? '';

    const nameParts = [record.first_name ?? record.firstName ?? '', record.last_name ?? record.lastName ?? '']
        .map((part) => String(part || '').trim())
        .filter(Boolean);
    const fallbackName = nameParts.join(' ');

    const resolvedName = record.name ?? fallbackName;

    return {
        id: record.id,
        name: resolvedName || 'Cliente',
        email,
        phone,
        company: record.company ?? record.company_name ?? '',
        status,
        statusClass: record.status_class ?? record.statusClass ?? getClientStatusClass(status),
        notes: record.notes ?? record.comments ?? ''
    };
}

function normalizeInventoryAdjustmentRecord(record) {
    const quantityValue = Number(record.quantity ?? record.amount ?? 0) || 0;
    let direction = Number(record.direction);
    if (!Number.isFinite(direction)) {
        direction = quantityValue >= 0 ? 1 : -1;
    }

    return {
        id: record.id,
        productId: record.product_id ?? record.productId ?? null,
        productName: record.product_name ?? record.productName ?? 'Producto',
        type: record.type ?? record.reason ?? 'Ajuste',
        quantity: Math.abs(quantityValue),
        direction,
        reason: record.reason ?? record.notes ?? '',
        date: record.date ?? record.created_at ?? new Date().toISOString()
    };
}

function normalizePortalRecord(record) {
    const productIds = parseArrayField(record.product_ids ?? record.productIds);
    const terms = parseArrayField(record.terms ?? record.terms_conditions ?? record.conditions);

    return {
        id: record.id,
        slug: record.slug ?? record.identifier ?? (record.id ? String(record.id) : ''),
        name: record.name ?? record.title ?? 'Portal',
        description: record.description ?? record.summary ?? '',
        accentColor: record.accent_color ?? record.accentColor ?? '#4f46e5',
        contactEmail: record.contact_email ?? record.email ?? '',
        contactPhone: record.contact_phone ?? record.phone ?? '',
        heroTitle: record.hero_title ?? record.heroTitle ?? record.name ?? '',
        heroSubtitle: record.hero_subtitle ?? record.heroSubtitle ?? record.description ?? '',
        bannerImage: record.banner_image ?? record.bannerImage ?? record.hero_image ?? '',
        terms,
        productIds,
        createdAt: record.created_at ?? record.createdAt ?? null
    };
}

function normalizeSettingsRecords(data) {
    if (!data) {
        return mergeSettingsWithDefaults();
    }

    const defaults = getDefaultSettings();
    const result = { ...defaults };

    const applyRecord = (record) => {
        if (!record || typeof record !== 'object') {
            return;
        }

        if ('key' in record || 'setting_key' in record || 'name' in record) {
            const key = record.key ?? record.setting_key ?? record.name;
            const rawValue = record.value ?? record.setting_value ?? record.content ?? record.data ?? '';
            const value = typeof rawValue === 'string' ? rawValue.trim() : rawValue;
            switch ((key || '').toLowerCase()) {
                case 'companyname':
                case 'company_name':
                case 'name':
                    result.companyName = value || '';
                    break;
                case 'companyemail':
                case 'company_email':
                case 'email':
                    result.companyEmail = value || '';
                    break;
                case 'companyphone':
                case 'company_phone':
                case 'phone':
                    result.companyPhone = value || '';
                    break;
                case 'companyaddress':
                case 'company_address':
                case 'address':
                    result.companyAddress = value || '';
                    break;
                case 'tagline':
                case 'slogan':
                    result.tagline = value || '';
                    break;
                case 'themecolor':
                case 'theme_color':
                case 'accentcolor':
                case 'accent_color':
                    result.themeColor = value || '#6366f1';
                    break;
                case 'logourl':
                case 'logo_url':
                case 'logo':
                    result.logoUrl = value || '';
                    break;
                case 'portalbaseurl':
                case 'portal_base_url':
                    result.portalBaseUrl = value || '';
                    break;
                default:
                    break;
            }
            return;
        }

        const mapping = {
            companyName: ['company_name', 'companyName', 'name'],
            companyEmail: ['company_email', 'companyEmail', 'email'],
            companyPhone: ['company_phone', 'companyPhone', 'phone'],
            companyAddress: ['company_address', 'companyAddress', 'address'],
            tagline: ['tagline', 'slogan'],
            themeColor: ['theme_color', 'themeColor', 'accent_color', 'accentColor'],
            logoUrl: ['logo_url', 'logoUrl', 'logo'],
            portalBaseUrl: ['portal_base_url', 'portalBaseUrl']
        };

        Object.entries(mapping).forEach(([target, keys]) => {
            keys.some((key) => {
                if (key in record && record[key] !== undefined && record[key] !== null) {
                    result[target] = record[key];
                    return true;
                }
                return false;
            });
        });
    };

    if (Array.isArray(data)) {
        data.forEach(applyRecord);
    } else {
        applyRecord(data);
    }

    return mergeSettingsWithDefaults(result);
}

async function fetchTableData(table, { select = '*', order } = {}) {
    if (!supabaseClient) {
        return [];
    }

    try {
        let query = supabaseClient.from(table).select(select);
        if (order && order.column) {
            query = query.order(order.column, { ascending: order.ascending !== false });
        }

        const { data, error } = await query;
        if (error) {
            console.warn(`No se pudo cargar la tabla ${table} desde Supabase:`, error.message);
            return [];
        }

        return Array.isArray(data) ? data : data ? [data] : [];
    } catch (error) {
        console.error(`Error inesperado al consultar Supabase (${table}):`, error);
        return [];
    }
}

async function loadDashboardDataFromSupabase() {
    if (!supabaseClient || isFetchingDashboardData) {
        return;
    }

    isFetchingDashboardData = true;

    try {
        const [productsRaw, salesRaw, clientsRaw, inventoryRaw, portalsRaw, settingsRaw] = await Promise.all([
            fetchTableData('products'),
            fetchTableData('sales'),
            fetchTableData('clients'),
            fetchTableData('inventory_adjustments'),
            fetchTableData('portals'),
            fetchTableData('settings')
        ]);

        const normalized = {
            products: productsRaw.map(normalizeProductRecord),
            sales: salesRaw.map(normalizeSaleRecord),
            clients: clientsRaw.map(normalizeClientRecord),
            inventoryAdjustments: inventoryRaw.map(normalizeInventoryAdjustmentRecord),
            portals: portalsRaw.map(normalizePortalRecord).filter((portal) => portal.slug),
            settings: normalizeSettingsRecords(settingsRaw)
        };

        currentData = normalized;
        selectedPortalSlug = currentData.portals.some((portal) => portal.slug === selectedPortalSlug)
            ? selectedPortalSlug
            : currentData.portals[0]?.slug ?? null;

        renderDashboard(currentData);
        setActivePanel(activePanel);
        hasLoadedDashboardData = true;
    } catch (error) {
        console.error('Error inesperado al cargar datos del dashboard desde Supabase:', error);
        hasLoadedDashboardData = false;
    } finally {
        isFetchingDashboardData = false;
    }
}

function findPortalById(portalId) {
    return (currentData.portals || []).find((portal) => String(portal.id) === String(portalId));
}

function findPortalBySlug(slug) {
    return (currentData.portals || []).find((portal) => portal.slug === slug);
}

function getPortalLabel(portalId) {
    const portal = findPortalById(portalId);
    return portal?.name ?? 'Catálogo';
}

function getPortalProducts(portal) {
    if (!portal) return [];
    const ids = Array.isArray(portal.productIds) ? portal.productIds.map(String) : [];
    return (currentData.products || []).filter((product) => {
        if (ids.length) {
            return ids.includes(String(product.id));
        }
        return portal.id ? String(product.portalId) === String(portal.id) : true;
    });
}

function buildPortalLink(slug) {
    if (!slug) return '';

    const baseSetting = currentData?.settings?.portalBaseUrl?.trim();
    if (baseSetting) {
        const slugTokenDetector = /{{\s*slug\s*}}|{\s*slug\s*}/i;
        const encodedSlug = encodeURIComponent(slug);

        if (slugTokenDetector.test(baseSetting)) {
            const slugTokenReplacer = /{{\s*slug\s*}}|{\s*slug\s*}/gi;
            const templateFilled = baseSetting.replace(slugTokenReplacer, encodedSlug);

            try {
                return new URL(templateFilled).toString();
            } catch (error) {
                try {
                    return new URL(templateFilled, window.location.origin).toString();
                } catch (innerError) {
                    console.warn('No se pudo interpretar la URL completa configurada para portales.', innerError);
                    return templateFilled;
                }
            }
        }

        try {
            const url = new URL(baseSetting, window.location.origin);
            url.searchParams.set('portal', slug);
            return url.toString();
        } catch (error) {
            console.warn('No se pudo interpretar la URL base configurada para portales.', error);

            if (/^https?:\/\//i.test(baseSetting)) {
                const hasQuery = baseSetting.includes('?');
                const separator = hasQuery ? '&' : '?';
                return `${baseSetting}${separator}portal=${encodedSlug}`;
            }
        }
    }

    const { origin, pathname } = window.location;
    const sanitizedPath = pathname.replace(/index\.html?$/i, '');
    const basePath = sanitizedPath.endsWith('/') ? sanitizedPath : `${sanitizedPath}/`;
    return `${origin}${basePath}client-portal.html?portal=${encodeURIComponent(slug)}`;
}

function ensurePortalSelection() {
    const portals = currentData.portals || [];
    if (!portals.length) {
        selectedPortalSlug = null;
        return;
    }

    const exists = portals.some((portal) => portal.slug === selectedPortalSlug);
    if (!exists) {
        selectedPortalSlug = portals[0].slug;
    }
}

function updatePortalShareInterface() {
    ensurePortalSelection();
    const portal = findPortalBySlug(selectedPortalSlug);
    const shareInput = getElement(DASHBOARD_SELECTORS.portalShareInput);
    const summaryName = getElement(DASHBOARD_SELECTORS.portalSummaryName);
    const summaryProducts = getElement(DASHBOARD_SELECTORS.portalSummaryProducts);
    const summaryContact = getElement(DASHBOARD_SELECTORS.portalSummaryContact);

    const link = portal ? buildPortalLink(portal.slug) : '';

    setFeedback(DASHBOARD_SELECTORS.portalShareFeedback);

    if (shareInput) {
        shareInput.value = link;
        shareInput.dataset.portalSlug = portal?.slug ?? '';
    }

    if (summaryName) {
        summaryName.textContent = portal?.name ?? 'Sin portal seleccionado';
    }

    if (summaryProducts) {
        const productCount = portal ? getPortalProducts(portal).length : 0;
        summaryProducts.textContent = productCount === 1 ? '1 producto publicado' : `${productCount} productos publicados`;
    }

    if (summaryContact) {
        const phone = portal?.contactPhone ? ` · ${portal.contactPhone}` : '';
        summaryContact.textContent = portal?.contactEmail ? `${portal.contactEmail}${phone}` : 'Completa los datos de contacto en la configuración.';
    }
}

async function copyTextToClipboard(text) {
    if (!text) return false;

    try {
        if (navigator.clipboard?.writeText) {
            await navigator.clipboard.writeText(text);
            return true;
        }
    } catch (error) {
        console.warn('No se pudo copiar mediante la API del navegador, se intentará con un método alternativo.', error);
    }

    const input = document.createElement('input');
    input.value = text;
    input.setAttribute('type', 'text');
    input.setAttribute('readonly', '');
    input.style.position = 'fixed';
    input.style.opacity = '0';
    document.body.appendChild(input);
    input.select();

    let copied = false;
    try {
        copied = document.execCommand('copy');
    } catch (error) {
        console.error('No fue posible copiar el enlace:', error);
    }

    document.body.removeChild(input);
    return copied;
}

function renderClientPortalCards(portals = []) {
    const list = getElement(DASHBOARD_SELECTORS.portalList);
    if (!list) return;

    if (!portals.length) {
        list.innerHTML = `
            <p class="portal-empty">Aún no has creado portales públicos para compartir tu catálogo.</p>
        `;
        return;
    }

    const markup = portals
        .map((portal) => {
            const isActive = portal.slug === selectedPortalSlug;
            const link = buildPortalLink(portal.slug);
            const productCount = getPortalProducts(portal).length;
            const totalProductsLabel = productCount === 1 ? '1 producto' : `${productCount} productos`;
            const accentColor = portal.accentColor || '#4f46e5';

            return `
                <article class="portal-card ${isActive ? 'active' : ''}" data-portal-card data-portal-slug="${escapeHtml(
                portal.slug
            )}">
                    <header class="portal-card-header">
                        <span class="portal-card-color" style="--portal-color: ${escapeHtml(accentColor)}"></span>
                        <div>
                            <h4 class="portal-card-title">${escapeHtml(portal.name ?? 'Portal')}</h4>
                            <p class="portal-card-description">${escapeHtml(portal.description ?? '')}</p>
                        </div>
                    </header>
                    <dl class="portal-card-meta">
                        <div>
                            <dt>Productos publicados</dt>
                            <dd>${totalProductsLabel}</dd>
                        </div>
                        <div>
                            <dt>Contacto</dt>
                            <dd>${escapeHtml(portal.contactEmail ?? 'Sin correo')}</dd>
                        </div>
                    </dl>
                    <footer class="portal-card-actions">
                        <button type="button" class="portal-card-button" data-portal-action="select" data-portal-slug="${escapeHtml(
                portal.slug
            )}">Seleccionar</button>
                        <button type="button" class="portal-card-button" data-portal-action="copy" data-portal-slug="${escapeHtml(
                portal.slug
            )}" data-portal-link="${escapeHtml(link)}">Copiar enlace</button>
                        <a class="portal-card-link" data-portal-action="preview" data-portal-slug="${escapeHtml(
                portal.slug
            )}" href="${escapeHtml(link)}" target="_blank" rel="noopener">Ver vista previa</a>
                    </footer>
                </article>
            `;
        })
        .join('');

    list.innerHTML = markup;
}

function populateProductPortalSelect(portals = []) {
    const select = getElement(DASHBOARD_SELECTORS.productPortalSelect);
    if (!select) return;

    const previousValue = select.value;

    const optionsMarkup = portals
        .map(
            (portal) => `
                <option value="${escapeHtml(portal.id)}">${escapeHtml(portal.name ?? 'Portal')}</option>
            `
        )
        .join('');

    select.innerHTML = optionsMarkup;

    const preferredPortal = portals.find((portal) => portal.slug === selectedPortalSlug) || portals[0];

    if (previousValue && portals.some((portal) => String(portal.id) === String(previousValue))) {
        select.value = previousValue;
    } else if (preferredPortal) {
        select.value = preferredPortal.id;
    }
}

function togglePortalForm(show) {
    const form = getElement(DASHBOARD_SELECTORS.portalForm);
    const toggle = getElement(DASHBOARD_SELECTORS.portalFormToggle);

    isPortalFormVisible = Boolean(show);

    if (form) {
        form.classList.toggle('hidden', !isPortalFormVisible);
    }

    if (toggle) {
        toggle.setAttribute('aria-expanded', String(isPortalFormVisible));
        toggle.textContent = isPortalFormVisible ? 'Cerrar formulario' : 'Crear portal';
    }

    if (!isPortalFormVisible) {
        form?.reset();
        setFeedback(DASHBOARD_SELECTORS.portalFormFeedback);
    }
}

function createSlug(value) {
    return value
        .normalize('NFD')
        .replace(/[^\w\s-]/g, '')
        .replace(/[\u0300-\u036f]/g, '')
        .trim()
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
        || 'portal';
}

async function handlePortalFormSubmit(event) {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);

    const name = String(formData.get('name') || '').trim();
    const slugInput = String(formData.get('slug') || '').trim();
    const description = String(formData.get('description') || '').trim();
    const contactEmail = String(formData.get('contactEmail') || '').trim();
    const contactPhone = String(formData.get('contactPhone') || '').trim();
    const accentColor = String(formData.get('accentColor') || '').trim();
    const heroTitle = String(formData.get('heroTitle') || '').trim();
    const heroSubtitle = String(formData.get('heroSubtitle') || '').trim();
    const bannerImage = String(formData.get('bannerImage') || '').trim();
    const termsRaw = String(formData.get('terms') || '').trim();

    if (!supabaseClient) {
        setFeedback(
            DASHBOARD_SELECTORS.portalFormFeedback,
            'No se pudo conectar con la base de datos. Intenta de nuevo más tarde.',
            'error'
        );
        return;
    }

    if (!name || !contactEmail) {
        setFeedback(
            DASHBOARD_SELECTORS.portalFormFeedback,
            'Por favor completa al menos el nombre y el correo de contacto.',
            'error'
        );
        return;
    }

    const slug = createSlug(slugInput || name);
    const existingSlug = (currentData.portals || []).some((portal) => portal.slug === slug);

    const terms = termsRaw ? termsRaw.split('\n').map((term) => term.trim()).filter(Boolean) : [];

    if (existingSlug) {
        setFeedback(
            DASHBOARD_SELECTORS.portalFormFeedback,
            'Ya existe un portal con ese identificador. Ajusta el slug manualmente.',
            'error'
        );
        return;
    }

    const payload = {
        slug,
        name,
        description,
        contact_email: contactEmail,
        contact_phone: contactPhone,
        accent_color: accentColor || '#4f46e5',
        hero_title: heroTitle || name,
        hero_subtitle: heroSubtitle || description,
        banner_image: bannerImage || null,
        terms
    };

    setFeedback(DASHBOARD_SELECTORS.portalFormFeedback, 'Guardando portal…', 'info');
    toggleFormControls(form, true);

    try {
        const { data, error } = await supabaseClient.from('portals').insert(payload).select().single();

        if (error) {
            if (error.code === '23505') {
                setFeedback(
                    DASHBOARD_SELECTORS.portalFormFeedback,
                    'Ya existe un portal con ese identificador. Ajusta el slug manualmente.',
                    'error'
                );
            } else {
                setFeedback(
                    DASHBOARD_SELECTORS.portalFormFeedback,
                    'No se pudo guardar el portal. Intenta de nuevo.',
                    'error'
                );
            }
            return;
        }

        selectedPortalSlug = data?.slug ?? slug;
        await loadDashboardDataFromSupabase();

        setFeedback(DASHBOARD_SELECTORS.portalFormFeedback, 'Portal creado correctamente.', 'success');
        form.reset();

        setTimeout(() => {
            togglePortalForm(false);
        }, 600);
    } catch (error) {
        console.error('Error inesperado al crear el portal en Supabase:', error);
        setFeedback(
            DASHBOARD_SELECTORS.portalFormFeedback,
            'Ocurrió un error al crear el portal. Intenta nuevamente.',
            'error'
        );
    } finally {
        toggleFormControls(form, false);
    }
}

function handlePortalListClick(event) {
    const actionElement = event.target.closest('[data-portal-action]');
    if (!actionElement) return;

    const action = actionElement.dataset.portalAction;
    const portalSlug = actionElement.dataset.portalSlug;
    const portal = findPortalBySlug(portalSlug);

    if (!portal) {
        setFeedback(DASHBOARD_SELECTORS.portalShareFeedback, 'No se encontró el portal seleccionado.', 'error');
        return;
    }

    switch (action) {
        case 'select':
            selectedPortalSlug = portal.slug;
            renderClientPortalCards(currentData.portals);
            updatePortalShareInterface();
            break;
        case 'copy':
            copyTextToClipboard(buildPortalLink(portal.slug)).then((copied) => {
                const feedbackType = copied ? 'success' : 'error';
                const message = copied
                    ? 'Enlace copiado al portapapeles.'
                    : 'No fue posible copiar el enlace automáticamente.';
                setFeedback(DASHBOARD_SELECTORS.portalShareFeedback, message, feedbackType);
            });
            break;
        default:
            break;
    }
}

function handlePortalShareCopy() {
    const shareInput = getElement(DASHBOARD_SELECTORS.portalShareInput);
    if (!shareInput) return;

    const link = shareInput.value;
    copyTextToClipboard(link).then((copied) => {
        const feedbackType = copied ? 'success' : 'error';
        const message = copied
            ? 'Enlace copiado al portapapeles.'
            : 'No fue posible copiar el enlace automáticamente.';
        setFeedback(DASHBOARD_SELECTORS.portalShareFeedback, message, feedbackType);
    });
}

function handlePortalShareInputFocus(event) {
    event.currentTarget?.select?.();
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('es-CR', {
        style: 'currency',
        currency: 'CRC',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
    }).format(amount);
}

function formatDate(dateString) {
    return new Intl.DateTimeFormat('es-CR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    }).format(new Date(dateString));
}

function calculateTodayOrders(sales) {
    const today = new Date();
    return sales.filter((sale) => {
        const saleDate = new Date(sale.date);
        return saleDate.toDateString() === today.toDateString();
    }).length;
}

function renderStats(data) {
    const totalSales = data.sales.reduce((sum, sale) => sum + (sale.total || 0), 0);
    const totalClients = data.clients.length;
    const totalProducts = data.products.length;
    const todayOrders = calculateTodayOrders(data.sales);

    setText(DASHBOARD_SELECTORS.totalSales, formatCurrency(totalSales));
    setText(DASHBOARD_SELECTORS.totalClients, String(totalClients));
    setText(DASHBOARD_SELECTORS.totalProducts, String(totalProducts));
    setText(DASHBOARD_SELECTORS.todayOrders, String(todayOrders));
}

function renderRecentSalesTable(sales) {
    const tableBody = getElement(DASHBOARD_SELECTORS.salesTable);
    if (!tableBody) return;

    if (!sales.length) {
        tableBody.innerHTML = '<tr><td colspan="4" style="text-align: center;">No hay ventas</td></tr>';
        return;
    }

    const recent = [...sales].slice(-5).reverse();
    tableBody.innerHTML = recent
        .map(
            (sale) => `
                <tr>
                    <td>${formatDate(sale.date)}</td>
                    <td>${sale.client?.name ?? 'Cliente'}</td>
                    <td>${formatCurrency(sale.total)}</td>
                    <td><span class="badge ${sale.statusClass ?? ''}">${sale.status}</span></td>
                </tr>`
        )
        .join('');
}

function renderProductCatalog(products) {
    const tableBody = getElement(DASHBOARD_SELECTORS.catalogTable);
    const counter = getElement(DASHBOARD_SELECTORS.catalogCounter);

    if (counter) {
        const total = products.length;
        counter.textContent = total === 1 ? '1 producto' : `${total} productos`;
    }

    if (!tableBody) return;

    if (!products.length) {
        tableBody.innerHTML = '<tr><td colspan="8" style="text-align: center;">No hay productos en el catálogo</td></tr>';
        return;
    }

    tableBody.innerHTML = products
        .map((product) => {
            const rawName = product.name ?? 'Producto';
            const rawCategory = product.category ?? 'Sin categoría';
            const rawStatus = product.status ?? 'Sin estado';
            const portalName = getPortalLabel(product.portalId);
            const nameContent = escapeHtml(rawName);
            const categoryContent = escapeHtml(rawCategory);
            const statusContent = escapeHtml(rawStatus);
            const statusClass = typeof product.statusClass === 'string'
                ? product.statusClass.replace(/[^a-z0-9_\-\s]/gi, '').trim().replace(/\s+/g, ' ')
                : '';
            const productId = String(product.id ?? '');
            const imageMarkup = product.image
                ? `<img src="${escapeHtml(product.image)}" alt="Imagen de ${escapeHtml(rawName)}" class="catalog-product-image" loading="lazy" />`
                : '<span class="catalog-product-placeholder" role="img" aria-label="Sin imagen disponible">🛒</span>';

            return `
                <tr>
                    <td>
                        <div class="catalog-product-thumb">
                            ${imageMarkup}
                        </div>
                    </td>
                    <td>${nameContent}</td>
                    <td>${categoryContent}</td>
                    <td>${escapeHtml(portalName)}</td>
                    <td>${formatCurrency(product.price ?? 0)}</td>
                    <td>${typeof product.stock === 'number' ? `${product.stock} unidades` : '—'}</td>
                    <td><span class="badge ${statusClass}">${statusContent}</span></td>
                    <td class="catalog-actions-cell">
                        <button type="button" class="catalog-action edit" data-catalog-action="edit" data-product-id="${escapeHtml(
                            productId
                        )}">Editar</button>
                        <button type="button" class="catalog-action delete" data-catalog-action="delete" data-product-id="${escapeHtml(
                            productId
                        )}">Eliminar</button>
                    </td>
                </tr>`;
        })
        .join('');
}

function renderSalesIndicators(sales) {
    const totalSales = sales.reduce((sum, sale) => sum + (Number(sale.total) || 0), 0);
    setText(DASHBOARD_SELECTORS.salesTotalCount, String(sales.length));
    setText(DASHBOARD_SELECTORS.salesTotalAmount, formatCurrency(totalSales));
}

function summarizeSaleProducts(items = []) {
    if (!items.length) {
        return {
            label: '—',
            quantity: '—'
        };
    }

    const totalQuantity = items.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
    const primary = items[0];
    const additionalCount = Math.max(0, items.length - 1);
    const productLabel = `${escapeHtml(primary.productName ?? 'Producto')}${additionalCount ? ` +${additionalCount} más` : ''}`;
    const quantityLabel = totalQuantity
        ? `${totalQuantity} ${totalQuantity === 1 ? 'unidad' : 'unidades'}`
        : '—';

    return {
        label: productLabel,
        quantity: quantityLabel
    };
}

function renderSalesHistoryTable(sales) {
    const tableBody = getElement(DASHBOARD_SELECTORS.salesHistoryTable);
    if (!tableBody) return;

    if (!sales.length) {
        tableBody.innerHTML = '<tr><td colspan="7" style="text-align: center;">No hay ventas registradas</td></tr>';
        return;
    }

    tableBody.innerHTML = sales
        .map((sale) => {
            const clientName = escapeHtml(sale.client?.name ?? 'Cliente');
            const productsSummary = summarizeSaleProducts(Array.isArray(sale.items) ? sale.items : []);
            const paymentMethod = escapeHtml(sale.paymentMethod ?? '—');
            const statusLabel = escapeHtml(sale.status ?? '—');

            return `
                <tr>
                    <td>${formatDate(sale.date)}</td>
                    <td>${clientName}</td>
                    <td>${productsSummary.label}</td>
                    <td>${productsSummary.quantity}</td>
                    <td>${formatCurrency(sale.total ?? 0)}</td>
                    <td>${paymentMethod}</td>
                    <td><span class="badge ${sale.statusClass ?? ''}">${statusLabel}</span></td>
                </tr>`;
        })
        .join('');
}

function getClientStatusClass(status) {
    const normalized = (status || '').toLowerCase();
    switch (normalized) {
        case 'activo':
            return 'success';
        case 'inactivo':
            return 'neutral';
        case 'prospecto':
            return 'info';
        default:
            return 'pending';
    }
}

function renderClientsTable(clients) {
    const counter = getElement(DASHBOARD_SELECTORS.clientsCounter);
    const tableBody = getElement(DASHBOARD_SELECTORS.clientsTableBody);

    if (counter) {
        const total = clients.length;
        counter.textContent = total === 1 ? '1 cliente' : `${total} clientes`;
    }

    if (!tableBody) return;

    if (!clients.length) {
        tableBody.innerHTML = '<tr><td colspan="5" style="text-align: center;">No hay clientes registrados</td></tr>';
        return;
    }

    tableBody.innerHTML = clients
        .map((client) => {
            const name = escapeHtml(client.name ?? 'Cliente');
            const email = escapeHtml(client.email ?? '');
            const phone = escapeHtml(client.phone ?? '');
            const company = escapeHtml(client.company ?? '—');
            const status = escapeHtml(client.status ?? 'Sin estado');
            const statusClass = client.statusClass || getClientStatusClass(client.status);

            const contactParts = [email, phone].filter(Boolean).join(' · ');

            return `
                <tr>
                    <td>${name}</td>
                    <td>${contactParts || '—'}</td>
                    <td>${company}</td>
                    <td><span class="badge ${statusClass}">${status}</span></td>
                    <td class="clients-table-actions">
                        <button type="button" class="client-action edit" data-client-action="edit" data-client-id="${escapeHtml(
                            String(client.id)
                        )}">Editar</button>
                        <button type="button" class="client-action delete" data-client-action="delete" data-client-id="${escapeHtml(
                            String(client.id)
                        )}">Eliminar</button>
                    </td>
                </tr>`;
        })
        .join('');
}

function toggleClientForm(show, clientId = null) {
    const form = getElement(DASHBOARD_SELECTORS.clientForm);
    const title = getElement(DASHBOARD_SELECTORS.clientFormTitle);
    const submitButton = getElement(DASHBOARD_SELECTORS.clientFormSubmit);
    const triggerButton = getElement(DASHBOARD_SELECTORS.addClientButton);

    isClientFormVisible = Boolean(show);
    editingClientId = show ? clientId : null;

    if (form) {
        form.classList.toggle('hidden', !isClientFormVisible);
    }

    if (triggerButton) {
        triggerButton.setAttribute('aria-expanded', String(isClientFormVisible));
        triggerButton.textContent = isClientFormVisible ? 'Cerrar formulario' : 'Agregar cliente';
    }

    if (!form) return;

    if (isClientFormVisible && editingClientId) {
        const target = currentData.clients.find((client) => String(client.id) === String(editingClientId));
        if (!target) {
            editingClientId = null;
            toggleClientForm(false);
            return;
        }

        if (title) {
            title.textContent = 'Editar cliente';
        }

        if (submitButton) {
            submitButton.textContent = 'Actualizar cliente';
        }

        form.elements.name.value = target.name ?? '';
        form.elements.email.value = target.email ?? '';
        form.elements.phone.value = target.phone ?? '';
        form.elements.company.value = target.company ?? '';
        form.elements.status.value = target.status ?? 'Activo';
        if (form.elements.notes) {
            form.elements.notes.value = target.notes ?? '';
        }

        setFeedback(DASHBOARD_SELECTORS.clientFeedback);
        form.elements.name.focus();
    } else if (isClientFormVisible) {
        if (title) {
            title.textContent = 'Nuevo cliente';
        }

        if (submitButton) {
            submitButton.textContent = 'Guardar cliente';
        }

        form.reset();
        setFeedback(DASHBOARD_SELECTORS.clientFeedback);
        form.elements.name.focus();
    } else {
        form.reset();
        setFeedback(DASHBOARD_SELECTORS.clientFeedback);
    }
}

function createClientRecord({ id, name, email, phone, company, status, notes }) {
    const normalizedStatus = status || 'Activo';
    return {
        id,
        name,
        email: email || '',
        phone: phone || '',
        company: company || name,
        status: normalizedStatus,
        statusClass: getClientStatusClass(normalizedStatus),
        notes: notes || ''
    };
}

async function handleClientFormSubmit(event) {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);

    const name = String(formData.get('name') || '').trim();
    const email = String(formData.get('email') || '').trim();
    const phone = String(formData.get('phone') || '').trim();
    const company = String(formData.get('company') || '').trim();
    const status = String(formData.get('status') || '').trim() || 'Activo';
    const notes = String(formData.get('notes') || '').trim();

    if (!supabaseClient) {
        setFeedback(
            DASHBOARD_SELECTORS.clientFeedback,
            'No se pudo conectar con la base de datos. Intenta más tarde.',
            'error'
        );
        return;
    }

    if (!name) {
        setFeedback(DASHBOARD_SELECTORS.clientFeedback, 'El nombre es obligatorio para guardar el cliente.', 'error');
        return;
    }

    const isEditing = Boolean(editingClientId);
    const payload = {
        name,
        email,
        phone,
        company,
        status,
        status_class: getClientStatusClass(status),
        notes
    };

    setFeedback(
        DASHBOARD_SELECTORS.clientFeedback,
        isEditing ? 'Actualizando cliente…' : 'Guardando cliente…',
        'info'
    );
    toggleFormControls(form, true);

    try {
        if (isEditing) {
            const { error } = await supabaseClient
                .from('clients')
                .update(payload)
                .eq('id', editingClientId);

            if (error) {
                setFeedback(
                    DASHBOARD_SELECTORS.clientFeedback,
                    'No se pudo actualizar el cliente. Intenta nuevamente.',
                    'error'
                );
                return;
            }
        } else {
            const { error } = await supabaseClient.from('clients').insert(payload);
            if (error) {
                setFeedback(
                    DASHBOARD_SELECTORS.clientFeedback,
                    'No se pudo registrar el cliente. Intenta nuevamente.',
                    'error'
                );
                return;
            }
        }

        await loadDashboardDataFromSupabase();

        setFeedback(
            DASHBOARD_SELECTORS.clientFeedback,
            isEditing ? 'Cliente actualizado correctamente.' : 'Cliente agregado correctamente.',
            'success'
        );

        editingClientId = null;
        form.reset();

        setTimeout(() => {
            toggleClientForm(false);
        }, 800);
    } catch (error) {
        console.error('Error inesperado al guardar el cliente en Supabase:', error);
        setFeedback(
            DASHBOARD_SELECTORS.clientFeedback,
            'Ocurrió un error al guardar el cliente. Intenta de nuevo.',
            'error'
        );
    } finally {
        toggleFormControls(form, false);
    }
}

async function handleClientDelete(clientId) {
    const target = currentData.clients.find((client) => String(client.id) === String(clientId));
    if (!target) return;

    const shouldDelete = window.confirm(`¿Eliminar el cliente "${target.name}"? Esta acción no se puede deshacer.`);
    if (!shouldDelete) {
        return;
    }

    if (!supabaseClient) {
        setFeedback(
            DASHBOARD_SELECTORS.clientFeedback,
            'No se pudo conectar con la base de datos. Intenta nuevamente.',
            'error'
        );
        return;
    }

    setFeedback(DASHBOARD_SELECTORS.clientFeedback, 'Eliminando cliente…', 'info');

    try {
        const { error } = await supabaseClient.from('clients').delete().eq('id', clientId);
        if (error) {
            setFeedback(
                DASHBOARD_SELECTORS.clientFeedback,
                'No se pudo eliminar el cliente. Intenta de nuevo.',
                'error'
            );
            return;
        }

        if (editingClientId && String(editingClientId) === String(clientId)) {
            editingClientId = null;
            toggleClientForm(false);
        }

        await loadDashboardDataFromSupabase();
        setFeedback(DASHBOARD_SELECTORS.clientFeedback, 'Cliente eliminado correctamente.', 'success');
        setTimeout(() => {
            setFeedback(DASHBOARD_SELECTORS.clientFeedback);
        }, 2000);
    } catch (error) {
        console.error('Error inesperado al eliminar el cliente en Supabase:', error);
        setFeedback(
            DASHBOARD_SELECTORS.clientFeedback,
            'Ocurrió un error al eliminar el cliente. Intenta más tarde.',
            'error'
        );
    }
}

function handleClientEdit(clientId) {
    toggleClientForm(true, clientId);
}

async function handleClientsTableClick(event) {
    const actionButton = event.target.closest('[data-client-action]');
    if (!actionButton) return;

    const action = actionButton.dataset.clientAction;
    const clientId = actionButton.dataset.clientId;
    if (!clientId) return;

    if (action === 'edit') {
        handleClientEdit(clientId);
    } else if (action === 'delete') {
        await handleClientDelete(clientId);
    }
}

function populateInventoryProductSelect(products) {
    const select = getElement(DASHBOARD_SELECTORS.inventoryProductSelect);
    if (!select) return;

    const previousValue = select.value;
    const hasPrevious = products.some((product) => String(product.id) === previousValue);
    const placeholderSelected = !previousValue || !hasPrevious;

    select.innerHTML = `
        <option value="" disabled${placeholderSelected ? ' selected' : ''}>Selecciona un producto</option>
        ${products
            .map(
                (product) => `
                <option value="${escapeHtml(String(product.id))}">${escapeHtml(product.name ?? 'Producto')}</option>`
            )
            .join('')}`;

    if (!placeholderSelected) {
        select.value = previousValue;
    }
}

function renderInventoryTable(products) {
    const tableBody = getElement(DASHBOARD_SELECTORS.inventoryTableBody);
    if (!tableBody) return;

    if (!products.length) {
        tableBody.innerHTML = '<tr><td colspan="5" style="text-align: center;">No hay productos registrados</td></tr>';
        return;
    }

    tableBody.innerHTML = products
        .map((product) => {
            const name = escapeHtml(product.name ?? 'Producto');
            const category = escapeHtml(product.category ?? 'Sin categoría');
            const status = escapeHtml(product.status ?? 'Sin estado');
            const statusClass = product.statusClass || getStatusClass(product.status);
            const stock = Number.isFinite(product.stock) ? Number(product.stock) : 0;

            return `
                <tr>
                    <td>${name}</td>
                    <td>${category}</td>
                    <td>${stock} unidades</td>
                    <td><span class="badge ${statusClass}">${status}</span></td>
                    <td class="inventory-actions-cell">
                        <button type="button" class="inventory-action decrease" data-inventory-action="decrease" data-product-id="${escapeHtml(
                            String(product.id)
                        )}">-1</button>
                        <button type="button" class="inventory-action increase" data-inventory-action="increase" data-product-id="${escapeHtml(
                            String(product.id)
                        )}">+1</button>
                        <button type="button" class="inventory-action increase" data-inventory-action="increase-5" data-product-id="${escapeHtml(
                            String(product.id)
                        )}">+5</button>
                    </td>
                </tr>`;
        })
        .join('');
}

function renderInventoryHistory(adjustments) {
    const tableBody = getElement(DASHBOARD_SELECTORS.inventoryHistoryTable);
    if (!tableBody) return;

    if (!adjustments.length) {
        tableBody.innerHTML = '<tr><td colspan="5" style="text-align: center;">No hay movimientos registrados</td></tr>';
        return;
    }

    tableBody.innerHTML = adjustments
        .map((adjustment) => {
            const type = escapeHtml(adjustment.type ?? 'Ajuste');
            const reason = escapeHtml(adjustment.reason ?? '—');
            const direction = Number(adjustment.direction) || 1;
            const quantity = Number(adjustment.quantity) || 0;
            const badgeClass = direction >= 0 ? 'success' : 'danger';
            const sign = direction >= 0 ? '+' : '-';
            let dateLabel = '—';
            try {
                dateLabel = formatDate(adjustment.date || new Date().toISOString());
            } catch (error) {
                dateLabel = '—';
            }

            return `
                <tr>
                    <td>${dateLabel}</td>
                    <td>${escapeHtml(adjustment.productName ?? 'Producto')}</td>
                    <td><span class="badge ${badgeClass}">${type}</span></td>
                    <td>${sign}${quantity}</td>
                    <td>${reason}</td>
                </tr>`;
        })
        .join('');
}

function handleInventoryTypeChange() {
    const typeSelect = getElement(DASHBOARD_SELECTORS.inventoryTypeSelect);
    const quantityInput = getElement(DASHBOARD_SELECTORS.inventoryQuantityInput);
    if (!typeSelect || !quantityInput) return;

    const normalized = (typeSelect.value || '').toLowerCase();
    if (normalized === 'ajuste') {
        quantityInput.min = '';
        quantityInput.placeholder = 'Ej. +5 o -3';
    } else {
        quantityInput.min = '1';
        quantityInput.placeholder = '0';
        if (Number(quantityInput.value) <= 0) {
            quantityInput.value = '';
        }
    }
}

function toggleInventoryForm(show) {
    const form = getElement(DASHBOARD_SELECTORS.inventoryForm);
    const trigger = getElement(DASHBOARD_SELECTORS.inventoryToggleButton);

    isInventoryFormVisible = Boolean(show);

    if (form) {
        form.classList.toggle('hidden', !isInventoryFormVisible);
    }

    if (trigger) {
        trigger.setAttribute('aria-expanded', String(isInventoryFormVisible));
        trigger.textContent = isInventoryFormVisible ? 'Cerrar formulario' : 'Registrar ajuste';
    }

    if (!form) return;

    if (isInventoryFormVisible) {
        populateInventoryProductSelect(currentData.products);
        setFeedback(DASHBOARD_SELECTORS.inventoryFeedback);
        form.reset();
        handleInventoryTypeChange();
        const select = getElement(DASHBOARD_SELECTORS.inventoryProductSelect);
        select?.focus();
    } else {
        form.reset();
        setFeedback(DASHBOARD_SELECTORS.inventoryFeedback);
        handleInventoryTypeChange();
    }
}

async function persistInventoryChange(product, delta, { type, reason }) {
    if (!supabaseClient) {
        throw new Error('Supabase no está configurado.');
    }

    const currentStock = Number(product.stock ?? 0);
    const desiredStock = currentStock + delta;
    const updatedStock = Math.max(0, desiredStock);
    const effectiveDelta = updatedStock - currentStock;

    if (effectiveDelta === 0) {
        return { updatedStock: currentStock, statusInfo: getStatusFromStock(currentStock), effectiveDelta };
    }

    const statusInfo = getStatusFromStock(updatedStock);

    const { error: updateError } = await supabaseClient
        .from('products')
        .update({
            stock: updatedStock,
            status: statusInfo.status,
            status_class: statusInfo.statusClass
        })
        .eq('id', product.id);

    if (updateError) {
        throw updateError;
    }

    const quantity = Math.abs(effectiveDelta);
    const direction = effectiveDelta >= 0 ? 1 : -1;

    const { error: adjustmentError } = await supabaseClient.from('inventory_adjustments').insert({
        product_id: product.id,
        product_name: product.name,
        type,
        quantity,
        direction,
        reason: reason || ''
    });

    if (adjustmentError) {
        console.warn('No se pudo registrar el ajuste de inventario en Supabase:', adjustmentError);
    }

    return { updatedStock, statusInfo, effectiveDelta };
}

async function handleInventoryFormSubmit(event) {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);

    const productId = String(formData.get('productId') || '').trim();
    const typeValue = String(formData.get('type') || '').trim().toLowerCase();
    const quantityRaw = Number(formData.get('quantity'));
    const reason = String(formData.get('reason') || '').trim();

    if (!supabaseClient) {
        setFeedback(
            DASHBOARD_SELECTORS.inventoryFeedback,
            'No se pudo conectar con la base de datos. Intenta nuevamente.',
            'error'
        );
        return;
    }

    if (!productId || Number.isNaN(quantityRaw) || quantityRaw === 0) {
        setFeedback(DASHBOARD_SELECTORS.inventoryFeedback, 'Selecciona un producto y una cantidad válida.', 'error');
        return;
    }

    const product = currentData.products.find((item) => String(item.id) === productId);
    if (!product) {
        setFeedback(DASHBOARD_SELECTORS.inventoryFeedback, 'Selecciona un producto válido.', 'error');
        return;
    }

    let direction = 1;
    let typeLabel = 'Entrada';
    let quantity = Math.abs(Math.trunc(quantityRaw));

    if (typeValue === 'salida') {
        direction = -1;
        typeLabel = 'Salida';
    } else if (typeValue === 'ajuste') {
        direction = quantityRaw >= 0 ? 1 : -1;
        typeLabel = 'Ajuste manual';
    }

    if (quantity <= 0) {
        setFeedback(DASHBOARD_SELECTORS.inventoryFeedback, 'Ingresa una cantidad diferente de cero.', 'error');
        return;
    }

    const currentStock = Number(product.stock ?? 0);
    let effectiveDelta = direction * quantity;
    if (currentStock + effectiveDelta < 0) {
        effectiveDelta = -currentStock;
        quantity = Math.abs(effectiveDelta);
        direction = effectiveDelta >= 0 ? 1 : -1;
    }

    if (quantity === 0) {
        setFeedback(
            DASHBOARD_SELECTORS.inventoryFeedback,
            'No hay existencias suficientes para realizar este ajuste.',
            'error'
        );
        return;
    }

    setFeedback(DASHBOARD_SELECTORS.inventoryFeedback, 'Registrando ajuste…', 'info');
    toggleFormControls(form, true);

    try {
        await persistInventoryChange(product, effectiveDelta, { type: typeLabel, reason });
        await loadDashboardDataFromSupabase();

        setFeedback(DASHBOARD_SELECTORS.inventoryFeedback, 'Ajuste registrado correctamente.', 'success');

        setTimeout(() => {
            toggleInventoryForm(false);
        }, 800);
    } catch (error) {
        console.error('Error al registrar el ajuste de inventario en Supabase:', error);
        setFeedback(
            DASHBOARD_SELECTORS.inventoryFeedback,
            'No se pudo registrar el ajuste. Intenta nuevamente.',
            'error'
        );
    } finally {
        toggleFormControls(form, false);
    }
}

async function handleInventoryQuickAdjust(productId, delta) {
    const product = currentData.products.find((item) => String(item.id) === String(productId));
    if (!product || !delta) return;

    if (!supabaseClient) {
        setFeedback(
            DASHBOARD_SELECTORS.inventoryFeedback,
            'No se pudo conectar con la base de datos. Intenta nuevamente.',
            'error'
        );
        return;
    }

    const currentStock = Number(product.stock ?? 0);
    let effectiveDelta = delta;
    if (currentStock + delta < 0) {
        effectiveDelta = -currentStock;
    }

    if (!effectiveDelta) {
        return;
    }

    try {
        await persistInventoryChange(product, effectiveDelta, {
            type: effectiveDelta > 0 ? 'Entrada' : 'Salida',
            reason: effectiveDelta > 0 ? 'Ajuste rápido (+)' : 'Ajuste rápido (-)'
        });

        await loadDashboardDataFromSupabase();
        setFeedback(DASHBOARD_SELECTORS.inventoryFeedback, 'Ajuste actualizado.', 'success');
        setTimeout(() => {
            setFeedback(DASHBOARD_SELECTORS.inventoryFeedback);
        }, 2000);
    } catch (error) {
        console.error('No se pudo aplicar el ajuste rápido en Supabase:', error);
        setFeedback(
            DASHBOARD_SELECTORS.inventoryFeedback,
            'No se pudo completar el ajuste rápido. Intenta nuevamente.',
            'error'
        );
    }
}

async function handleInventoryTableClick(event) {
    const actionButton = event.target.closest('[data-inventory-action]');
    if (!actionButton) return;

    const productId = actionButton.dataset.productId;
    const action = actionButton.dataset.inventoryAction;
    if (!productId || !action) return;

    if (action === 'decrease') {
        await handleInventoryQuickAdjust(productId, -1);
    } else if (action === 'increase') {
        await handleInventoryQuickAdjust(productId, 1);
    } else if (action === 'increase-5') {
        await handleInventoryQuickAdjust(productId, 5);
    }
}

function updateSettingsPreview(settings = {}) {
    const nameElement = getElement(DASHBOARD_SELECTORS.settingsPreviewName);
    const taglineElement = getElement(DASHBOARD_SELECTORS.settingsPreviewTagline);
    const contactElement = getElement(DASHBOARD_SELECTORS.settingsPreviewContact);
    const logoElement = getElement(DASHBOARD_SELECTORS.settingsPreviewLogo);

    const companyName = settings.companyName || 'Catálogo Digital';
    const tagline = settings.tagline || 'Administra tu negocio en un solo lugar';
    const contactParts = [settings.companyEmail || '', settings.companyPhone || ''].filter(Boolean);

    if (nameElement) {
        nameElement.textContent = companyName;
    }

    if (taglineElement) {
        taglineElement.textContent = tagline;
    }

    if (contactElement) {
        contactElement.textContent = contactParts.length ? contactParts.join(' · ') : 'Sin información de contacto';
    }

    if (logoElement) {
        const initials = companyName
            .split(' ')
            .filter(Boolean)
            .map((part) => part[0])
            .join('')
            .slice(0, 2)
            .toUpperCase();

        if (settings.logoUrl) {
            logoElement.style.backgroundImage = 'none';
            logoElement.textContent = '';
            logoElement.classList.add('has-image');

            logoElement.innerHTML = '';
            const image = document.createElement('img');
            image.src = settings.logoUrl;
            image.alt = `Logo de ${companyName}`;
            logoElement.appendChild(image);
        } else {
            logoElement.style.backgroundImage = 'none';
            logoElement.textContent = initials || 'CD';
            logoElement.classList.remove('has-image');
            logoElement.innerHTML = logoElement.textContent;
        }
    }
}

function renderSettingsForm(settings = {}) {
    const form = getElement(DASHBOARD_SELECTORS.settingsForm);
    if (!form) return;

    const fields = [
        'companyName',
        'companyEmail',
        'companyPhone',
        'companyAddress',
        'tagline',
        'themeColor',
        'logoUrl',
        'portalBaseUrl'
    ];
    fields.forEach((field) => {
        if (form.elements[field]) {
            if (field === 'themeColor') {
                form.elements[field].value = settings[field] ?? '#6366f1';
            } else {
                form.elements[field].value = settings[field] ?? '';
            }
        }
    });
}

function applySettings(settings = {}) {
    const titleElement = getElement(DASHBOARD_SELECTORS.dashboardTitle);
    const subtitleElement = getElement(DASHBOARD_SELECTORS.dashboardSubtitle);

    if (titleElement) {
        titleElement.textContent = settings.companyName || 'Panel de Control';
    }

    if (subtitleElement) {
        subtitleElement.textContent = settings.tagline || 'Administra tu negocio y catálogo en un solo lugar';
    }

    const themeColor = settings.themeColor || '#6366f1';
    document.documentElement.style.setProperty('--dashboard-accent', themeColor);

    if (settings.companyName) {
        document.title = `${settings.companyName} · Catálogo Digital`;
    } else {
        document.title = 'Catálogo Digital';
    }

    updateSettingsPreview(settings);
}

function getSettingsFromForm() {
    const form = getElement(DASHBOARD_SELECTORS.settingsForm);
    if (!form) return {};

    return {
        companyName: form.elements.companyName?.value.trim() || '',
        companyEmail: form.elements.companyEmail?.value.trim() || '',
        companyPhone: form.elements.companyPhone?.value.trim() || '',
        companyAddress: form.elements.companyAddress?.value.trim() || '',
        tagline: form.elements.tagline?.value.trim() || '',
        themeColor: form.elements.themeColor?.value || '#6366f1',
        logoUrl: form.elements.logoUrl?.value.trim() || '',
        portalBaseUrl: form.elements.portalBaseUrl?.value.trim() || ''
    };
}

const SETTINGS_KEY_MAP = {
    companyName: 'company_name',
    companyEmail: 'company_email',
    companyPhone: 'company_phone',
    companyAddress: 'company_address',
    tagline: 'tagline',
    themeColor: 'theme_color',
    logoUrl: 'logo_url',
    portalBaseUrl: 'portal_base_url'
};

async function handleSettingsSubmit(event) {
    event.preventDefault();

    const formSettings = getSettingsFromForm();
    if (!formSettings.companyName) {
        setFeedback(DASHBOARD_SELECTORS.settingsFeedback, 'El nombre de la empresa es obligatorio.', 'error');
        return;
    }

    if (!supabaseClient) {
        setFeedback(
            DASHBOARD_SELECTORS.settingsFeedback,
            'No se pudo conectar con la base de datos. Intenta nuevamente.',
            'error'
        );
        return;
    }

    const form = event.currentTarget;
    const payload = Object.entries(formSettings).map(([key, value]) => ({
        key: SETTINGS_KEY_MAP[key] ?? key,
        value: typeof value === 'string' ? value : String(value ?? '')
    }));

    setFeedback(DASHBOARD_SELECTORS.settingsFeedback, 'Guardando configuración…', 'info');
    toggleFormControls(form, true);

    try {
        const { error } = await supabaseClient
            .from('settings')
            .upsert(payload, { onConflict: 'key' });

        if (error) {
            setFeedback(
                DASHBOARD_SELECTORS.settingsFeedback,
                'No se pudo guardar la configuración. Intenta nuevamente.',
                'error'
            );
            return;
        }

        await loadDashboardDataFromSupabase();
        setFeedback(DASHBOARD_SELECTORS.settingsFeedback, 'Configuración guardada correctamente.', 'success');
    } catch (error) {
        console.error('Error inesperado al guardar la configuración en Supabase:', error);
        setFeedback(
            DASHBOARD_SELECTORS.settingsFeedback,
            'Ocurrió un error al guardar la configuración. Intenta de nuevo.',
            'error'
        );
    } finally {
        toggleFormControls(form, false);
    }
}

function handleSettingsPreviewChange() {
    const formSettings = getSettingsFromForm();
    updateSettingsPreview({ ...currentData.settings, ...formSettings });

    if (formSettings.themeColor) {
        document.documentElement.style.setProperty('--dashboard-accent', formSettings.themeColor);
    }
}

function populateSaleProductOptions(products) {
    const select = getElement(DASHBOARD_SELECTORS.saleProductSelect);
    if (!select) return;

    const previousValue = select.value;
    const hasPrevious = products.some((product) => String(product.id) === previousValue);
    const placeholderSelected = !previousValue || !hasPrevious;

    const optionsMarkup = products
        .map(
            (product) => `
                <option value="${escapeHtml(String(product.id))}">${escapeHtml(product.name ?? 'Producto')}</option>`
        )
        .join('');

    select.innerHTML = `
        <option value="" disabled${placeholderSelected ? ' selected' : ''}>Selecciona un producto</option>
        ${optionsMarkup}`;

    if (!placeholderSelected) {
        select.value = previousValue;
    }
}

function updateSaleTotalPreview() {
    const preview = getElement(DASHBOARD_SELECTORS.saleTotalPreview);
    if (!preview) return;

    const quantityInput = getElement(DASHBOARD_SELECTORS.saleQuantityInput);
    const priceInput = getElement(DASHBOARD_SELECTORS.saleUnitPriceInput);

    const quantity = Number(quantityInput?.value ?? 0);
    const unitPrice = Number(priceInput?.value ?? 0);

    if (Number.isNaN(quantity) || Number.isNaN(unitPrice)) {
        preview.textContent = formatCurrency(0);
        return;
    }

    const total = Number((Math.max(0, quantity) * Math.max(0, unitPrice)).toFixed(2));
    preview.textContent = formatCurrency(total);
}

function handleSaleProductChange() {
    const select = getElement(DASHBOARD_SELECTORS.saleProductSelect);
    const priceInput = getElement(DASHBOARD_SELECTORS.saleUnitPriceInput);
    if (!select || !priceInput) return;

    const product = currentData.products.find((item) => String(item.id) === select.value);
    if (product) {
        const basePrice = Number(product.price ?? 0);
        priceInput.value = Number.isFinite(basePrice) ? basePrice.toFixed(2) : '';
    }

    updateSaleTotalPreview();
}

function toggleAddSaleForm(show) {
    const form = getElement(DASHBOARD_SELECTORS.addSaleForm);
    const button = getElement(DASHBOARD_SELECTORS.addSaleButton);

    isAddSaleFormVisible = Boolean(show);

    if (form) {
        form.classList.toggle('hidden', !isAddSaleFormVisible);
    }

    if (button) {
        button.setAttribute('aria-expanded', String(isAddSaleFormVisible));
        button.textContent = isAddSaleFormVisible ? 'Cerrar formulario' : 'Registrar venta';
    }

    populateSaleProductOptions(currentData.products);

    if (isAddSaleFormVisible) {
        form?.reset();
        const quantityInput = getElement(DASHBOARD_SELECTORS.saleQuantityInput);
        if (quantityInput) {
            quantityInput.value = '1';
        }
        handleSaleProductChange();
        updateSaleTotalPreview();
        form?.querySelector('input[name="client"]')?.focus();
    } else {
        form?.reset();
        const priceInput = getElement(DASHBOARD_SELECTORS.saleUnitPriceInput);
        if (priceInput) {
            priceInput.value = '';
        }
        updateSaleTotalPreview();
        setFeedback(DASHBOARD_SELECTORS.addSaleFeedback);
    }
}

function getStatusFromStock(stock) {
    if (stock <= 0) {
        return { status: 'Agotado', statusClass: 'danger' };
    }
    if (stock <= 5) {
        return { status: 'Bajo stock', statusClass: 'warning' };
    }
    if (stock <= 10) {
        return { status: 'Requiere reposición', statusClass: 'alert' };
    }
    return { status: 'Disponible', statusClass: 'success' };
}

async function ensureClientExists(name) {
    if (!name || !supabaseClient) {
        return null;
    }

    const normalized = name.trim().toLowerCase();
    const existingLocal = currentData.clients.find((client) => client.name?.toLowerCase() === normalized);
    if (existingLocal) {
        return existingLocal;
    }

    const sanitizedSearch = name.replace(/[\\%_]/g, '\\$&');

    try {
        const { data: remoteMatch, error: remoteError } = await supabaseClient
            .from('clients')
            .select('*')
            .ilike('name', sanitizedSearch)
            .limit(1)
            .maybeSingle();

        if (!remoteError && remoteMatch) {
            return normalizeClientRecord(remoteMatch);
        }
    } catch (error) {
        console.warn('No se pudo consultar el cliente en Supabase:', error);
    }

    try {
        const { data, error } = await supabaseClient
            .from('clients')
            .insert({
                name,
                company: name,
                status: 'Prospecto',
                status_class: getClientStatusClass('Prospecto'),
                notes: 'Añadido automáticamente desde una venta.'
            })
            .select()
            .single();

        if (error) {
            console.error('No se pudo crear el cliente automáticamente en Supabase:', error.message);
            return null;
        }

        return normalizeClientRecord(data);
    } catch (error) {
        console.error('Error inesperado al crear el cliente en Supabase:', error);
        return null;
    }
}

async function handleAddSaleSubmit(event) {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);

    const clientName = String(formData.get('client') || '').trim();
    const productId = String(formData.get('productId') || '').trim();
    const quantityValue = Number(formData.get('quantity'));
    const unitPriceValue = Number(formData.get('unitPrice'));
    const paymentMethod = String(formData.get('paymentMethod') || '').trim() || 'Efectivo';
    const notes = String(formData.get('notes') || '').trim();

    if (!supabaseClient) {
        setFeedback(
            DASHBOARD_SELECTORS.addSaleFeedback,
            'No se pudo conectar con la base de datos. Intenta nuevamente.',
            'error'
        );
        return;
    }

    if (!clientName || !productId || Number.isNaN(quantityValue) || Number.isNaN(unitPriceValue)) {
        setFeedback(DASHBOARD_SELECTORS.addSaleFeedback, 'Completa todos los campos antes de guardar.', 'error');
        return;
    }

    const product = currentData.products.find((item) => String(item.id) === productId);
    if (!product) {
        setFeedback(DASHBOARD_SELECTORS.addSaleFeedback, 'Selecciona un producto válido.', 'error');
        return;
    }

    const normalizedQuantity = Math.max(1, Math.trunc(quantityValue));
    const normalizedUnitPrice = Number(Math.max(0, unitPriceValue).toFixed(2));
    const saleTotal = Number((normalizedQuantity * normalizedUnitPrice).toFixed(2));

    const currentStock = Number(product.stock ?? 0);
    if (normalizedQuantity > currentStock) {
        setFeedback(
            DASHBOARD_SELECTORS.addSaleFeedback,
            'No hay inventario suficiente para registrar esta venta.',
            'error'
        );
        return;
    }

    setFeedback(DASHBOARD_SELECTORS.addSaleFeedback, 'Registrando venta…', 'info');
    toggleFormControls(form, true);

    try {
        const clientRecord = await ensureClientExists(clientName);

        const salePayload = {
            sale_date: new Date().toISOString(),
            total: saleTotal,
            status: 'Completado',
            status_class: 'success',
            payment_method: paymentMethod,
            notes: notes || null,
            client_id: clientRecord?.id ?? null,
            client_name: clientName,
            client_email: clientRecord?.email ?? null,
            client_phone: clientRecord?.phone ?? null,
            items: [
                {
                    product_id: product.id,
                    productName: product.name,
                    quantity: normalizedQuantity,
                    unitPrice: normalizedUnitPrice
                }
            ]
        };

        const { error: saleError } = await supabaseClient.from('sales').insert(salePayload);
        if (saleError) {
            setFeedback(
                DASHBOARD_SELECTORS.addSaleFeedback,
                'No se pudo registrar la venta. Intenta nuevamente.',
                'error'
            );
            return;
        }

        await persistInventoryChange(product, -normalizedQuantity, {
            type: 'Venta',
            reason: paymentMethod ? `Venta registrada (${paymentMethod})` : 'Venta registrada'
        });

        await loadDashboardDataFromSupabase();

        form.reset();
        const quantityInput = getElement(DASHBOARD_SELECTORS.saleQuantityInput);
        if (quantityInput) {
            quantityInput.value = '1';
        }
        handleSaleProductChange();
        updateSaleTotalPreview();

        setFeedback(DASHBOARD_SELECTORS.addSaleFeedback, 'Venta registrada correctamente.', 'success');

        setTimeout(() => {
            toggleAddSaleForm(false);
        }, 900);
    } catch (error) {
        console.error('Error inesperado al registrar la venta en Supabase:', error);
        setFeedback(
            DASHBOARD_SELECTORS.addSaleFeedback,
            'Ocurrió un error al registrar la venta. Intenta nuevamente.',
            'error'
        );
    } finally {
        toggleFormControls(form, false);
    }
}

function updateAddProductButtonState() {
    const button = getElement(DASHBOARD_SELECTORS.addProductButton);
    if (!button) return;

    let label = 'Agregar producto';
    if (isAddProductFormVisible) {
        label = editingProductId ? 'Cancelar edición' : 'Cerrar formulario';
    }

    button.textContent = label;
    button.setAttribute('aria-expanded', String(isAddProductFormVisible));
}

function setProductFormMode(mode) {
    const form = getElement(DASHBOARD_SELECTORS.addProductForm);
    if (!form) return;

    form.dataset.mode = mode;

    const submitButton = form.querySelector('.catalog-form-submit');
    const cancelButton = getElement(DASHBOARD_SELECTORS.addProductCancel);

    if (submitButton) {
        submitButton.textContent = mode === 'edit' ? 'Actualizar producto' : 'Guardar producto';
    }

    if (cancelButton) {
        cancelButton.textContent = mode === 'edit' ? 'Cancelar edición' : 'Cancelar';
    }
}

function resetProductForm() {
    const form = getElement(DASHBOARD_SELECTORS.addProductForm);
    if (!form) return;

    form.reset();
    populateProductPortalSelect(currentData.portals || []);
}

function toggleAddProductForm(show) {
    const form = getElement(DASHBOARD_SELECTORS.addProductForm);

    isAddProductFormVisible = Boolean(show);

    if (!isAddProductFormVisible) {
        editingProductId = null;
    }

    if (form) {
        form.classList.toggle('hidden', !isAddProductFormVisible);
        if (isAddProductFormVisible) {
            populateProductPortalSelect(currentData.portals || []);
            if (!editingProductId) {
                setProductFormMode('create');
            }
        }
    }

    updateAddProductButtonState();

    if (!isAddProductFormVisible) {
        setProductFormMode('create');
        resetProductForm();
        setFeedback(DASHBOARD_SELECTORS.addProductFeedback);
    }
}

function populateProductForm(product) {
    const form = getElement(DASHBOARD_SELECTORS.addProductForm);
    if (!form) return;

    const elements = form.elements;

    if (elements.name) {
        elements.name.value = String(product.name ?? '');
    }

    if (elements.category) {
        elements.category.value = String(product.category ?? '');
    }

    if (elements.price) {
        const priceValue = Number(product.price);
        elements.price.value = Number.isFinite(priceValue) ? String(priceValue) : '';
    }

    if (elements.stock) {
        const stockValue = Number(product.stock);
        elements.stock.value = Number.isFinite(stockValue) ? String(stockValue) : '';
    }

    if (elements.status) {
        const statusValue = String(product.status ?? 'Disponible');
        const hasStatusOption = Array.from(elements.status.options || []).some(
            (option) => option.value === statusValue
        );

        if (!hasStatusOption) {
            const option = document.createElement('option');
            option.value = statusValue;
            option.textContent = statusValue;
            elements.status.appendChild(option);
        }

        elements.status.value = statusValue;
    }

    if (elements.image) {
        elements.image.value = String(product.image ?? '');
    }

    const portalSelect = elements.portalId;
    if (portalSelect) {
        const portalValue = product.portalId ?? (Array.isArray(product.portalIds) ? product.portalIds[0] : '');
        const portalIdString = portalValue !== undefined && portalValue !== null ? String(portalValue) : '';

        if (portalIdString) {
            const hasOption = Array.from(portalSelect.options).some((option) => option.value === portalIdString);
            if (!hasOption) {
                const option = document.createElement('option');
                option.value = portalIdString;
                option.textContent = getPortalLabel(portalValue);
                portalSelect.appendChild(option);
            }
            portalSelect.value = portalIdString;
        } else if (portalSelect.options.length) {
            portalSelect.selectedIndex = 0;
        }
    }
}

function startEditingProduct(productId) {
    const products = Array.isArray(currentData.products) ? currentData.products : [];
    const product = products.find((item) => String(item.id) === String(productId));

    if (!product) {
        setFeedback(
            DASHBOARD_SELECTORS.addProductFeedback,
            'No se pudo cargar el producto seleccionado para editar.',
            'error'
        );
        return;
    }

    editingProductId = product.id;
    toggleAddProductForm(true);
    setProductFormMode('edit');
    resetProductForm();
    populateProductForm(product);
    setFeedback(DASHBOARD_SELECTORS.addProductFeedback);
    updateAddProductButtonState();

    const form = getElement(DASHBOARD_SELECTORS.addProductForm);
    const nameField = form?.querySelector('[name="name"]');
    if (nameField) {
        nameField.focus();
        if (typeof nameField.select === 'function') {
            nameField.select();
        }
    }
}

async function handleDeleteProduct(productId) {
    const products = Array.isArray(currentData.products) ? currentData.products : [];
    const product = products.find((item) => String(item.id) === String(productId));

    if (!product) {
        setFeedback(DASHBOARD_SELECTORS.addProductFeedback, 'El producto ya no está disponible.', 'error');
        return;
    }

    const productName = product.name ? `"${product.name}"` : 'este producto';
    const shouldDelete = window.confirm(`¿Seguro que deseas eliminar ${productName}?`);
    if (!shouldDelete) {
        return;
    }

    if (!supabaseClient) {
        setFeedback(
            DASHBOARD_SELECTORS.addProductFeedback,
            'No se pudo conectar con la base de datos. Intenta nuevamente.',
            'error'
        );
        return;
    }

    setFeedback(DASHBOARD_SELECTORS.addProductFeedback, 'Eliminando producto…', 'info');

    try {
        const { error } = await supabaseClient.from('products').delete().eq('id', productId);
        if (error) {
            setFeedback(
                DASHBOARD_SELECTORS.addProductFeedback,
                'No se pudo eliminar el producto. Intenta nuevamente.',
                'error'
            );
            return;
        }

        if (editingProductId && String(editingProductId) === String(productId)) {
            editingProductId = null;
            setProductFormMode('create');
            toggleAddProductForm(false);
        }

        await loadDashboardDataFromSupabase();
        setFeedback(DASHBOARD_SELECTORS.addProductFeedback, 'Producto eliminado correctamente.', 'success');
        setTimeout(() => {
            setFeedback(DASHBOARD_SELECTORS.addProductFeedback);
        }, 2000);
    } catch (error) {
        console.error('Error inesperado al eliminar el producto en Supabase:', error);
        setFeedback(
            DASHBOARD_SELECTORS.addProductFeedback,
            'Ocurrió un error al eliminar el producto. Intenta de nuevo.',
            'error'
        );
    }
}

async function handleCatalogTableClick(event) {
    const target = event.target;
    if (!target || typeof target.closest !== 'function') {
        return;
    }

    const actionButton = target.closest('[data-catalog-action]');
    if (!actionButton) {
        return;
    }

    const productId = actionButton.getAttribute('data-product-id') ?? '';
    if (!productId) {
        return;
    }

    const action = actionButton.getAttribute('data-catalog-action');

    if (action === 'edit') {
        startEditingProduct(productId);
    } else if (action === 'delete') {
        await handleDeleteProduct(productId);
    }
}

function getStatusClass(status) {
    const normalized = (status || '').toLowerCase();
    switch (normalized) {
        case 'disponible':
            return 'success';
        case 'bajo stock':
            return 'warning';
        case 'requiere reposición':
            return 'alert';
        case 'agotado':
            return 'danger';
        default:
            return '';
    }
}

async function handleAddProductSubmit(event) {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);

    const name = String(formData.get('name') || '').trim();
    const category = String(formData.get('category') || '').trim();
    const price = Number(formData.get('price'));
    const stock = Number(formData.get('stock'));
    const status = String(formData.get('status') || '').trim() || 'Disponible';
    const image = String(formData.get('image') || '').trim();
    const portalId = String(formData.get('portalId') || '').trim() || String(currentData.portals?.[0]?.id ?? '');

    if (!supabaseClient) {
        setFeedback(
            DASHBOARD_SELECTORS.addProductFeedback,
            'No se pudo conectar con la base de datos. Intenta más tarde.',
            'error'
        );
        return;
    }

    if (!name || !category || Number.isNaN(price) || Number.isNaN(stock)) {
        setFeedback(DASHBOARD_SELECTORS.addProductFeedback, 'Completa todos los campos antes de guardar.', 'error');
        return;
    }

    if (!portalId) {
        setFeedback(
            DASHBOARD_SELECTORS.addProductFeedback,
            'Selecciona la empresa a la que pertenece el producto.',
            'error'
        );
        return;
    }

    const normalizedPrice = Number(Math.max(0, price).toFixed(2));
    const normalizedStock = Math.max(0, Math.trunc(stock));
    const statusClass = getStatusClass(status);
    const portal = findPortalById(portalId);
    const isEditing = Boolean(editingProductId);

    const payload = {
        name,
        category,
        price: normalizedPrice,
        stock: normalizedStock,
        status,
        status_class: statusClass,
        image: image || null,
        portal_id: portalId || null,
        portal_slug: portal?.slug ?? null
    };

    setFeedback(
        DASHBOARD_SELECTORS.addProductFeedback,
        isEditing ? 'Actualizando producto…' : 'Guardando producto…',
        'info'
    );
    toggleFormControls(form, true);

    try {
        if (isEditing) {
            const { data, error } = await supabaseClient
                .from('products')
                .update(payload)
                .eq('id', editingProductId)
                .select()
                .single();

            if (error) {
                setFeedback(
                    DASHBOARD_SELECTORS.addProductFeedback,
                    'No se pudo actualizar el producto. Intenta nuevamente.',
                    'error'
                );
                return;
            }

            selectedPortalSlug = data?.portal_slug ?? portal?.slug ?? selectedPortalSlug;
        } else {
            const { data, error } = await supabaseClient
                .from('products')
                .insert(payload)
                .select()
                .single();

            if (error) {
                setFeedback(
                    DASHBOARD_SELECTORS.addProductFeedback,
                    'No se pudo guardar el producto. Intenta nuevamente.',
                    'error'
                );
                return;
            }

            selectedPortalSlug = data?.portal_slug ?? portal?.slug ?? selectedPortalSlug;
        }

        await loadDashboardDataFromSupabase();

        setFeedback(
            DASHBOARD_SELECTORS.addProductFeedback,
            isEditing ? 'Producto actualizado correctamente.' : 'Producto agregado correctamente.',
            'success'
        );

        editingProductId = null;
        setProductFormMode('create');
        form.reset();
        populateProductPortalSelect(currentData.portals || []);
        updateAddProductButtonState();

        setTimeout(() => {
            toggleAddProductForm(false);
        }, 800);
    } catch (error) {
        console.error('Error inesperado al guardar el producto en Supabase:', error);
        setFeedback(
            DASHBOARD_SELECTORS.addProductFeedback,
            'Ocurrió un error al guardar el producto. Intenta nuevamente.',
            'error'
        );
    } finally {
        toggleFormControls(form, false);
    }
}

function setActivePanel(panel) {
    const target = panel || 'overview';
    const tabs = document.querySelectorAll(DASHBOARD_SELECTORS.dashboardTabs);
    const panels = document.querySelectorAll(DASHBOARD_SELECTORS.dashboardPanels);

    activePanel = target;

    tabs.forEach((tab) => {
        const isActive = tab.dataset.dashboardTab === target;
        tab.classList.toggle('active', isActive);
        tab.setAttribute('aria-pressed', String(isActive));
    });

    panels.forEach((panelElement) => {
        const shouldShow = panelElement.dataset.dashboardPanel === target;
        panelElement.classList.toggle('hidden', !shouldShow);
    });

    if (target !== 'catalog') {
        toggleAddProductForm(false);
    }

    if (target !== 'sales') {
        toggleAddSaleForm(false);
    }

    if (target !== 'clients') {
        toggleClientForm(false);
    }

    if (target !== 'inventory') {
        toggleInventoryForm(false);
    }

    if (target !== 'settings') {
        applySettings(currentData.settings || getDefaultSettings());
    }

    if (target !== 'client-portals') {
        togglePortalForm(false);
    }
}

function toggleSections(showDashboard) {
    const dashboard = getElement(DASHBOARD_SELECTORS.section);
    const authSection = getElement(DASHBOARD_SELECTORS.authSection);
    const page = getElement(DASHBOARD_SELECTORS.page);

    if (showDashboard) {
        document.body.classList.add('dashboard-visible');
        dashboard?.classList.remove('hidden');
        authSection?.classList.add('hidden');
    } else {
        document.body.classList.remove('dashboard-visible');
        dashboard?.classList.add('hidden');
        authSection?.classList.remove('hidden');
    }
    if (page) {
        page.scrollTop = 0;
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function resetLogoutButton() {
    const logoutButton = getElement(DASHBOARD_SELECTORS.logoutButton);
    if (logoutButton) {
        logoutButton.disabled = false;
        logoutButton.textContent = logoutButton.dataset.defaultLabel || 'Cerrar sesión';
    }
}

export function initDashboard({ supabase }) {
    supabaseClient = supabase;

    const logoutButton = getElement(DASHBOARD_SELECTORS.logoutButton);
    if (logoutButton && !logoutButton.dataset.defaultLabel) {
        logoutButton.dataset.defaultLabel = logoutButton.textContent;
    }

    const tabs = document.querySelectorAll(DASHBOARD_SELECTORS.dashboardTabs);
    tabs.forEach((tab) => {
        tab.addEventListener('click', () => {
            setActivePanel(tab.dataset.dashboardTab);
        });
    });

    const addProductButton = getElement(DASHBOARD_SELECTORS.addProductButton);
    const addProductForm = getElement(DASHBOARD_SELECTORS.addProductForm);
    const addProductCancel = getElement(DASHBOARD_SELECTORS.addProductCancel);
    const catalogTableBody = getElement(DASHBOARD_SELECTORS.catalogTable);

    addProductButton?.addEventListener('click', () => {
        toggleAddProductForm(!isAddProductFormVisible);
    });

    addProductCancel?.addEventListener('click', () => {
        toggleAddProductForm(false);
    });

    addProductForm?.addEventListener('submit', handleAddProductSubmit);
    catalogTableBody?.addEventListener('click', handleCatalogTableClick);

    const addSaleButton = getElement(DASHBOARD_SELECTORS.addSaleButton);
    const addSaleForm = getElement(DASHBOARD_SELECTORS.addSaleForm);
    const addSaleCancel = getElement(DASHBOARD_SELECTORS.addSaleCancel);
    const saleProductSelect = getElement(DASHBOARD_SELECTORS.saleProductSelect);
    const saleQuantityInput = getElement(DASHBOARD_SELECTORS.saleQuantityInput);
    const saleUnitPriceInput = getElement(DASHBOARD_SELECTORS.saleUnitPriceInput);

    addSaleButton?.addEventListener('click', () => {
        toggleAddSaleForm(!isAddSaleFormVisible);
    });

    addSaleCancel?.addEventListener('click', () => {
        toggleAddSaleForm(false);
    });

    addSaleForm?.addEventListener('submit', handleAddSaleSubmit);
    saleProductSelect?.addEventListener('change', handleSaleProductChange);
    saleQuantityInput?.addEventListener('input', updateSaleTotalPreview);
    saleUnitPriceInput?.addEventListener('input', updateSaleTotalPreview);

    const addClientButton = getElement(DASHBOARD_SELECTORS.addClientButton);
    const clientForm = getElement(DASHBOARD_SELECTORS.clientForm);
    const clientFormCancel = getElement(DASHBOARD_SELECTORS.clientFormCancel);
    const clientsTableBody = getElement(DASHBOARD_SELECTORS.clientsTableBody);

    addClientButton?.addEventListener('click', () => {
        toggleClientForm(!isClientFormVisible);
    });

    clientFormCancel?.addEventListener('click', () => {
        toggleClientForm(false);
    });

    clientForm?.addEventListener('submit', handleClientFormSubmit);
    clientsTableBody?.addEventListener('click', handleClientsTableClick);

    const inventoryToggleButton = getElement(DASHBOARD_SELECTORS.inventoryToggleButton);
    const inventoryForm = getElement(DASHBOARD_SELECTORS.inventoryForm);
    const inventoryFormCancel = getElement(DASHBOARD_SELECTORS.inventoryFormCancel);
    const inventoryTypeSelect = getElement(DASHBOARD_SELECTORS.inventoryTypeSelect);
    const inventoryTableBody = getElement(DASHBOARD_SELECTORS.inventoryTableBody);

    inventoryToggleButton?.addEventListener('click', () => {
        toggleInventoryForm(!isInventoryFormVisible);
    });

    inventoryFormCancel?.addEventListener('click', () => {
        toggleInventoryForm(false);
    });

    inventoryForm?.addEventListener('submit', handleInventoryFormSubmit);
    inventoryTypeSelect?.addEventListener('change', handleInventoryTypeChange);
    inventoryTableBody?.addEventListener('click', handleInventoryTableClick);

    const settingsForm = getElement(DASHBOARD_SELECTORS.settingsForm);
    settingsForm?.addEventListener('submit', handleSettingsSubmit);
    settingsForm?.addEventListener('input', handleSettingsPreviewChange);

    const portalToggleButton = getElement(DASHBOARD_SELECTORS.portalFormToggle);
    const portalForm = getElement(DASHBOARD_SELECTORS.portalForm);
    const portalFormCancel = getElement(DASHBOARD_SELECTORS.portalFormCancel);
    const portalList = getElement(DASHBOARD_SELECTORS.portalList);
    const portalCopyButton = getElement(DASHBOARD_SELECTORS.portalCopyButton);
    const portalShareInput = getElement(DASHBOARD_SELECTORS.portalShareInput);

    portalToggleButton?.addEventListener('click', () => {
        togglePortalForm(!isPortalFormVisible);
    });

    portalFormCancel?.addEventListener('click', () => {
        togglePortalForm(false);
    });

    portalForm?.addEventListener('submit', handlePortalFormSubmit);
    portalList?.addEventListener('click', handlePortalListClick);
    portalCopyButton?.addEventListener('click', handlePortalShareCopy);
    portalShareInput?.addEventListener('focus', handlePortalShareInputFocus);
    portalShareInput?.addEventListener('click', handlePortalShareInputFocus);

    logoutButton?.addEventListener('click', async () => {
        if (!supabaseClient) return;
        const button = logoutButton;
        button.disabled = true;
        button.textContent = 'Cerrando sesión…';

        const { error } = await supabaseClient.auth.signOut();
        if (error) {
            console.error('No se pudo cerrar la sesión:', error.message);
            resetLogoutButton();
        } else {
            hideDashboard();
        }
    });

    renderDashboard();
    setActivePanel(activePanel);
    hideDashboard();
}

export function renderDashboard(data = currentData) {
    currentData = cloneData(data);
    currentData.sales = Array.isArray(currentData.sales) ? currentData.sales : [];
    currentData.clients = Array.isArray(currentData.clients) ? currentData.clients : [];
    currentData.products = Array.isArray(currentData.products) ? currentData.products : [];
    currentData.inventoryAdjustments = Array.isArray(currentData.inventoryAdjustments)
        ? currentData.inventoryAdjustments
        : [];
    currentData.portals = Array.isArray(currentData.portals) ? currentData.portals : [];
    currentData.settings = mergeSettingsWithDefaults(currentData.settings);

    ensurePortalSelection();
    renderClientPortalCards(currentData.portals);
    populateProductPortalSelect(currentData.portals);
    updatePortalShareInterface();
    renderStats(currentData);
    renderRecentSalesTable(currentData.sales);
    renderProductCatalog(currentData.products);
    renderSalesIndicators(currentData.sales);
    renderSalesHistoryTable(currentData.sales);
    populateSaleProductOptions(currentData.products);
    handleSaleProductChange();
    renderClientsTable(currentData.clients);
    populateInventoryProductSelect(currentData.products);
    renderInventoryTable(currentData.products);
    renderInventoryHistory(currentData.inventoryAdjustments);
    renderSettingsForm(currentData.settings);
    applySettings(currentData.settings);
    handleInventoryTypeChange();
}

export async function showDashboard(session) {
    toggleSections(true);
    resetLogoutButton();

    const userEmail = session?.user?.email ?? 'Invitado';
    setText(DASHBOARD_SELECTORS.userEmail, userEmail);

    renderDashboard(currentData);
    setActivePanel(activePanel);

    if (!supabaseClient) {
        return;
    }

    const userId = session?.user?.id ?? null;
    const shouldReload = !hasLoadedDashboardData || lastLoadedUserId !== userId;

    if (shouldReload) {
        lastLoadedUserId = userId;
        await loadDashboardDataFromSupabase();
    }
}

export function hideDashboard() {
    toggleSections(false);
    toggleAddProductForm(false);
    toggleAddSaleForm(false);

    setText(DASHBOARD_SELECTORS.userEmail, 'Invitado');
    resetLogoutButton();
    currentData = cloneData(defaultDashboardState);
    selectedPortalSlug = defaultDashboardState.portals?.[0]?.slug ?? null;
    hasLoadedDashboardData = false;
    lastLoadedUserId = null;
    activePanel = 'overview';
    setActivePanel(activePanel);
}

export function setDashboardData(data) {
    if (!data) return;
    currentData = {
        sales: Array.isArray(data.sales) ? cloneData(data.sales) : [],
        clients: Array.isArray(data.clients) ? cloneData(data.clients) : [],
        products: Array.isArray(data.products) ? cloneData(data.products) : [],
        inventoryAdjustments: Array.isArray(data.inventoryAdjustments)
            ? cloneData(data.inventoryAdjustments)
            : [],
        portals: Array.isArray(data.portals) ? cloneData(data.portals) : cloneData(defaultDashboardState.portals || []),
        settings: mergeSettingsWithDefaults(data.settings)
    };

    renderDashboard(currentData);
}

