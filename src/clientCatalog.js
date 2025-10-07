import { supabase } from './supabaseClient.js';
let activePortal = null;
let portalProducts = [];
const selectedItems = new Map();

const elements = {};

function cacheElements() {
    elements.errorSection = document.querySelector('[data-portal-error]');
    elements.portalSections = document.querySelectorAll('[data-portal-section]');
    elements.productGrid = document.getElementById('portalProductGrid');
    elements.productCount = document.querySelector('[data-portal-product-count]');
    elements.portalDescription = document.querySelector('[data-portal-description]');
    elements.portalPill = document.querySelector('[data-portal-pill]');
    elements.portalTitle = document.querySelector('[data-portal-hero-title]');
    elements.portalSubtitle = document.querySelector('[data-portal-hero-subtitle]');
    elements.portalContactEmail = document.querySelector('[data-portal-contact-email]');
    elements.portalContactPhone = document.querySelector('[data-portal-contact-phone]');
    elements.portalHeroImage = document.querySelector('[data-portal-hero-image]');
    elements.portalHeroMedia = document.querySelector('[data-portal-hero-media]');
    elements.termsList = document.getElementById('clientPortalTerms');
    elements.summaryList = document.getElementById('clientRequestItems');
    elements.summaryEmpty = document.querySelector('[data-portal-summary-empty]');
    elements.summaryTotal = document.querySelector('[data-portal-total]');
    elements.requestForm = document.getElementById('clientRequestForm');
    elements.requestFeedback = document.querySelector('[data-feedback="client-request"]');
}

function normalizeStockValue(value) {
    if (value === null || value === undefined) {
        return null;
    }

    const numeric = Number(value);
    if (!Number.isFinite(numeric)) {
        return null;
    }

    return Math.max(0, Math.trunc(numeric));
}

function findPortalProduct(productId) {
    return portalProducts.find((item) => String(item.id) === String(productId));
}

function getAvailableStock(productOrId) {
    const product =
        typeof productOrId === 'object' && productOrId !== null
            ? productOrId
            : findPortalProduct(productOrId);

    if (!product) {
        return null;
    }

    const normalized = normalizeStockValue(product.stock);
    return typeof normalized === 'number' ? normalized : null;
}

function formatStockLabel(stock) {
    if (typeof stock !== 'number') {
        return '';
    }

    if (stock <= 0) {
        return 'Agotado';
    }

    const suffix = stock === 1 ? 'disponible' : 'disponibles';
    return `${stock} ${suffix}`;
}

function isProductOutOfStock(product) {
    const stock = getAvailableStock(product);
    return typeof stock === 'number' && stock <= 0;
}

function escapeSelector(value) {
    const stringValue = String(value ?? '');
    if (typeof CSS !== 'undefined' && typeof CSS.escape === 'function') {
        return CSS.escape(stringValue);
    }

    return stringValue.replace(/([\0-\x1f\x7f"'\\\[\]\{\}<>#%&~])/g, '\\$1');
}

const currencyFormatter = new Intl.NumberFormat('es-CR', {
    style: 'currency',
    currency: 'CRC',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
});

function formatCurrency(amount) {
    return currencyFormatter.format(Math.max(0, Number(amount) || 0));
}

function escapeHtml(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function setElementText(element, value) {
    if (!element) return;
    element.textContent = value;
}

function togglePortalVisibility(showPortal) {
    elements.portalSections?.forEach((section) => {
        section.classList.toggle('hidden', !showPortal);
    });
    elements.errorSection?.classList.toggle('hidden', showPortal);
}

function showPortalError(message) {
    togglePortalVisibility(false);
    const errorSection = elements.errorSection;
    if (!errorSection) return;
    const description = errorSection.querySelector('p');
    if (description && message) {
        description.textContent = message;
    }
}

function setAccentColor(color) {
    const accent = color || '#6366f1';
    document.documentElement.style.setProperty('--portal-public-accent', accent);
}

function updateHero(portal) {
    setElementText(elements.portalPill, portal.name || 'Catálogo digital');
    setElementText(elements.portalTitle, portal.heroTitle || portal.name || 'Explora nuestro catálogo');
    setElementText(elements.portalSubtitle, portal.heroSubtitle || portal.description || 'Selecciona tus productos y envíanos tu solicitud.');

    if (elements.portalDescription) {
        elements.portalDescription.textContent = portal.description || 'Productos disponibles para tu empresa.';
    }

    if (elements.portalContactEmail) {
        elements.portalContactEmail.textContent = portal.contactEmail || 'ventas@catalogodigital.cr';
        if (portal.contactEmail) {
            elements.portalContactEmail.href = `mailto:${portal.contactEmail}`;
        }
    }

    if (elements.portalContactPhone) {
        elements.portalContactPhone.textContent = portal.contactPhone || '';
        elements.portalContactPhone.classList.toggle('hidden', !portal.contactPhone);
    }

    if (elements.portalHeroImage) {
        if (portal.bannerImage) {
            elements.portalHeroImage.src = portal.bannerImage;
            elements.portalHeroImage.classList.remove('hidden');
        } else {
            elements.portalHeroImage.src = 'https://images.unsplash.com/photo-1456406644174-8ddd4cd52a06?auto=format&fit=crop&w=1200&q=80';
        }
    }

    document.title = portal.name ? `${portal.name} · Catálogo` : 'Catálogo público';
}

function renderTerms(terms = []) {
    if (!elements.termsList) return;
    if (!Array.isArray(terms) || !terms.length) {
        elements.termsList.innerHTML = '<li>No hay condiciones registradas para este portal.</li>';
        return;
    }

    elements.termsList.innerHTML = terms
        .map((term) => `<li>${escapeHtml(term)}</li>`)
        .join('');
}

function renderProductGrid(products = []) {
    if (!elements.productGrid) return;

    if (!products.length) {
        elements.productGrid.innerHTML = '<p class="client-portal-empty">Por el momento no hay productos publicados para este portal.</p>';
        setElementText(elements.productCount, '0 productos');
        return;
    }

    const markup = products
        .map((product) => {
            const stock = getAvailableStock(product);
            const selected = selectedItems.has(String(product.id));
            const outOfStock = typeof stock === 'number' && stock <= 0;
            const buttonLabel = !selected && outOfStock ? 'Agotado' : selected ? 'En solicitud' : 'Agregar a la solicitud';
            const buttonState = !selected && outOfStock ? 'out' : selected ? 'selected' : 'idle';
            const buttonAttributes = !selected && outOfStock ? 'disabled aria-disabled="true"' : 'aria-disabled="false"';
            const description = escapeHtml(product.shortDescription || product.description || '');
            const name = escapeHtml(product.name || 'Producto');
            const image = product.image ? escapeHtml(product.image) : '';
            const stockLabel = formatStockLabel(stock);
            const stockMarkup = stockLabel
                ? `<span class="client-product-stock${outOfStock ? ' depleted' : ''}">Stock: ${escapeHtml(stockLabel)}</span>`
                : '';
            const productId = escapeHtml(String(product.id));

            return `
                <article class="client-portal-product-card${selected ? ' selected' : ''}" data-product-id="${productId}" data-stock="${
                typeof stock === 'number' ? stock : ''
            }">
                    <div class="client-product-media">
                        ${image ? `<img src="${image}" alt="${name}" loading="lazy" />` : '<span aria-hidden="true" class="client-product-placeholder">🛒</span>'}
                    </div>
                    <div class="client-product-info">
                        <h3>${name}</h3>
                        <p>${description || 'Producto disponible para pedidos especiales.'}</p>
                    </div>
                    <div class="client-product-footer">
                        <div class="client-product-pricing">
                            <span class="client-product-price">${formatCurrency(product.price)}</span>
                            ${stockMarkup}
                        </div>
                        <button type="button" class="client-product-button" data-action="toggle-product" data-product-id="${productId}" data-state="${buttonState}" ${buttonAttributes}>${buttonLabel}</button>
                    </div>
                </article>
            `;
        })
        .join('');

    elements.productGrid.innerHTML = markup;
    const totalLabel = products.length === 1 ? '1 producto' : `${products.length} productos`;
    setElementText(elements.productCount, totalLabel);
}

function updateProductButtons() {
    const buttons = elements.productGrid?.querySelectorAll('[data-action="toggle-product"]');
    buttons?.forEach((button) => {
        const productId = button.dataset.productId;
        if (!productId) {
            return;
        }

        const selection = selectedItems.get(String(productId));
        const product = selection?.product || findPortalProduct(productId);
        const isSelected = Boolean(selection);
        const stock = getAvailableStock(product);
        const outOfStock = typeof stock === 'number' && stock <= 0;
        const atLimit = typeof stock === 'number' && isSelected && selection.quantity >= stock;

        let label = 'Agregar a la solicitud';
        let state = 'idle';
        let disableButton = false;

        if (isSelected) {
            label = atLimit ? 'Cantidad máxima' : 'En solicitud';
            state = 'selected';
        } else if (outOfStock) {
            label = 'Agotado';
            state = 'out';
            disableButton = true;
        }

        button.textContent = label;
        button.dataset.state = state;
        button.disabled = disableButton;
        button.setAttribute('aria-disabled', disableButton ? 'true' : 'false');
        button.closest('.client-portal-product-card')?.classList.toggle('selected', isSelected);
    });
}

function renderSelectionSummary() {
    if (!elements.summaryList || !elements.summaryEmpty) return;

    if (!selectedItems.size) {
        elements.summaryList.innerHTML = '';
        elements.summaryList.appendChild(elements.summaryEmpty);
        elements.summaryEmpty.classList.remove('hidden');
        setElementText(elements.summaryTotal, formatCurrency(0));
        return;
    }

    elements.summaryEmpty.classList.add('hidden');

    const itemsMarkup = Array.from(selectedItems.values())
        .map(({ product, quantity }) => {
            const name = escapeHtml(product.name || 'Producto');
            const category = escapeHtml(product.category || 'Producto');
            const stock = getAvailableStock(product);
            const stockLabel = formatStockLabel(stock);
            const availabilityMarkup = stockLabel
                ? `<small class="client-summary-availability${typeof stock === 'number' && stock <= 0 ? ' depleted' : ''}">Stock disponible: ${escapeHtml(
                      stockLabel
                  )}</small>`
                : '';
            const maxAttr = typeof stock === 'number' ? `max="${stock}"` : '';
            const atLimit = typeof stock === 'number' && quantity >= stock;
            const incrementAttrs = atLimit ? 'disabled aria-disabled="true"' : 'aria-disabled="false"';
            const productId = escapeHtml(String(product.id));

            return `
            <li class="client-summary-item" data-product-id="${productId}">
                <div class="client-summary-details">
                    <strong>${name}</strong>
                    <span>${formatCurrency(product.price)} · ${category}</span>
                    ${availabilityMarkup}
                </div>
                <div class="client-summary-actions">
                    <button type="button" class="client-summary-button" data-action="decrement" data-product-id="${productId}">−</button>
                    <input type="number" min="1" ${maxAttr} value="${quantity}" class="client-summary-quantity" data-action="quantity" data-product-id="${productId}" />
                    <button type="button" class="client-summary-button" data-action="increment" data-product-id="${productId}" ${incrementAttrs}>+</button>
                    <button type="button" class="client-summary-remove" data-action="remove" data-product-id="${productId}" aria-label="Quitar ${name}">×</button>
                </div>
            </li>
        `;
        })
        .join('');

    elements.summaryList.innerHTML = itemsMarkup;
    updateSummaryTotal();
}

function updateSummaryTotal() {
    const total = Array.from(selectedItems.values()).reduce((sum, { product, quantity }) => sum + Number(product.price || 0) * quantity, 0);
    setElementText(elements.summaryTotal, formatCurrency(total));
}

function setRequestFeedback(message = '', type = '') {
    if (!elements.requestFeedback) return;
    elements.requestFeedback.textContent = message;
    elements.requestFeedback.dataset.state = type;
}

function addItem(productId) {
    const product = findPortalProduct(productId);
    if (!product) return;

    if (isProductOutOfStock(product)) {
        setRequestFeedback('Este producto está agotado en este portal.', 'error');
        return;
    }

    const stock = getAvailableStock(product);
    const key = String(productId);
    const existing = selectedItems.get(key);
    const currentQuantity = existing?.quantity ?? 0;
    const nextQuantity = currentQuantity + 1;

    if (typeof stock === 'number' && nextQuantity > stock) {
        const quantityLabel = stock === 1 ? '1 unidad' : `${stock} unidades`;
        setRequestFeedback(`Solo quedan ${quantityLabel} disponibles de ${product.name}.`, 'error');
        return;
    }

    selectedItems.set(key, {
        product,
        quantity: nextQuantity
    });

    setRequestFeedback();
    renderSelectionSummary();
    updateProductButtons();
}

function removeItem(productId, { silent = false } = {}) {
    selectedItems.delete(String(productId));
    renderSelectionSummary();
    updateProductButtons();
    if (!silent) {
        setRequestFeedback();
    }
}

function setItemQuantity(productId, quantity, sourceElement) {
    const normalized = Math.trunc(Number(quantity));
    if (Number.isNaN(normalized) || normalized <= 0) {
        removeItem(productId);
        return;
    }

    const key = String(productId);
    const existing = selectedItems.get(key);
    if (!existing) return;

    const product = existing.product;
    const stock = getAvailableStock(product);

    if (typeof stock === 'number' && stock <= 0) {
        selectedItems.delete(key);
        renderSelectionSummary();
        updateProductButtons();
        setRequestFeedback(`El producto ${product.name} ya no tiene existencias.`, 'error');
        return;
    }

    let finalQuantity = normalized;
    let feedbackMessage = null;

    if (typeof stock === 'number' && normalized > stock) {
        finalQuantity = stock;
        feedbackMessage = `Solo quedan ${stock === 1 ? '1 unidad' : `${stock} unidades`} disponibles de ${product.name}.`;
    }

    selectedItems.set(key, {
        product,
        quantity: finalQuantity
    });

    updateSummaryTotal();
    updateProductButtons();

    const container =
        sourceElement?.closest('.client-summary-item') ||
        elements.summaryList?.querySelector(`[data-product-id="${escapeSelector(productId)}"]`);

    if (container) {
        const quantityInput = container.querySelector('.client-summary-quantity');
        if (quantityInput) {
            quantityInput.value = String(finalQuantity);
            if (typeof stock === 'number') {
                quantityInput.max = String(stock);
            } else {
                quantityInput.removeAttribute('max');
            }
        }

        const incrementButton = container.querySelector('button[data-action="increment"]');
        if (incrementButton) {
            const atLimit = typeof stock === 'number' && finalQuantity >= stock;
            incrementButton.disabled = atLimit;
            incrementButton.setAttribute('aria-disabled', atLimit ? 'true' : 'false');
        }
    }

    if (feedbackMessage) {
        setRequestFeedback(feedbackMessage, 'error');
    } else {
        setRequestFeedback();
    }
}

function handleProductGridClick(event) {
    const button = event.target.closest('[data-action="toggle-product"]');
    if (!button) return;

    const productId = button.dataset.productId;
    if (!productId) return;

    if (button.disabled) {
        return;
    }

    if (selectedItems.has(String(productId))) {
        removeItem(productId);
    } else {
        addItem(productId);
    }
}

function handleSummaryClick(event) {
    const target = event.target;
    const productId = target.dataset.productId;
    if (!productId) return;

    if (target.matches('button') && target.disabled) {
        return;
    }

    const action = target.dataset.action;
    switch (action) {
        case 'increment':
            addItem(productId);
            break;
        case 'decrement': {
            const current = selectedItems.get(String(productId));
            if (!current) return;
            if (current.quantity <= 1) {
                removeItem(productId);
            } else {
                setItemQuantity(productId, current.quantity - 1, target);
            }
            break;
        }
        case 'remove':
            removeItem(productId);
            break;
        case 'quantity':
            setItemQuantity(productId, target.value, target);
            break;
        default:
            break;
    }
}

async function handleRequestSubmit(event) {
    event.preventDefault();

    if (!selectedItems.size) {
        setRequestFeedback('Selecciona al menos un producto antes de enviar tu solicitud.', 'error');
        return;
    }

    const selections = Array.from(selectedItems.values());
    const invalidSelection = selections.find(({ product, quantity }) => {
        const stock = getAvailableStock(product);
        return typeof stock === 'number' && quantity > stock;
    });

    if (invalidSelection) {
        const stock = getAvailableStock(invalidSelection.product) ?? 0;
        const quantityLabel = stock === 1 ? '1 unidad' : `${stock} unidades`;
        setRequestFeedback(
            `Ajusta la cantidad de ${invalidSelection.product.name}; solo quedan ${quantityLabel} disponibles.`,
            'error'
        );
        renderSelectionSummary();
        updateProductButtons();
        return;
    }

    const formData = new FormData(elements.requestForm);
    const payload = {
        portal_slug: activePortal.slug,
        portal_id: activePortal.id,
        name: String(formData.get('name') || '').trim(),
        company: String(formData.get('company') || '').trim(),
        email: String(formData.get('email') || '').trim(),
        phone: String(formData.get('phone') || '').trim(),
        notes: String(formData.get('notes') || '').trim(),
        items: selections.map(({ product, quantity }) => ({
            product_id: product.id,
            name: product.name,
            quantity,
            unit_price: product.price
        })),
        total: selections.reduce((sum, { product, quantity }) => sum + Number(product.price || 0) * quantity, 0)
    };

    if (!payload.name || !payload.email) {
        setRequestFeedback('Completa al menos tu nombre y correo electrónico.', 'error');
        return;
    }

    setRequestFeedback('Enviando solicitud…', 'info');

    let saved = false;
    try {
        const { error } = await supabase
            .from('sale_requests')
            .insert({
                portal_slug: payload.portal_slug,
                portal_id: payload.portal_id,
                name: payload.name,
                company: payload.company,
                email: payload.email,
                phone: payload.phone,
                notes: payload.notes,
                items: payload.items,
                total: payload.total,
                submitted_at: new Date().toISOString()
            });
        if (!error) {
            saved = true;
        }
    } catch (error) {
        console.warn('No se pudo guardar la solicitud en Supabase:', error);
    }

    if (!saved) {
        console.info('Solicitud registrada localmente (modo demostración):', payload);
    }

    setRequestFeedback('¡Gracias! Hemos recibido tu solicitud y te contactaremos en breve.', 'success');
    elements.requestForm.reset();
    selectedItems.clear();
    renderSelectionSummary();
    updateProductButtons();
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

function normalizePortalRecord(record, slug) {
    if (!record) {
        return null;
    }

    const productIds = parseArrayField(record.product_ids ?? record.productIds);
    const terms = parseArrayField(record.terms ?? record.terms_conditions ?? record.conditions);

    return {
        id: record.id ?? slug,
        slug: record.slug ?? slug,
        name: record.name ?? record.title ?? 'Portal',
        description: record.description ?? record.summary ?? '',
        accentColor: record.accent_color ?? record.accentColor ?? '#6366f1',
        heroTitle: record.hero_title ?? record.heroTitle ?? record.name ?? 'Explora nuestro catálogo',
        heroSubtitle: record.hero_subtitle ?? record.heroSubtitle ?? record.description ?? '',
        contactEmail: record.contact_email ?? record.email ?? '',
        contactPhone: record.contact_phone ?? record.phone ?? '',
        bannerImage: record.banner_image ?? record.bannerImage ?? record.hero_image ?? '',
        terms,
        productIds,
        heroVideo: record.hero_video ?? record.heroVideo ?? '',
        heroMediaType: record.hero_media_type ?? record.heroMediaType ?? '',
        requestIntro: record.request_intro ?? record.requestIntro ?? ''
    };
}

async function fetchPortalFromSupabase(slug) {
    if (!slug) {
        return null;
    }

    try {
        let query = supabase.from('portals').select('*').eq('slug', slug).limit(1);
        const { data, error } = await query;
        if (error) {
            console.warn('No fue posible obtener el portal desde Supabase:', error.message);
            return null;
        }

        const record = Array.isArray(data) ? data[0] : data;
        if (!record) {
            return null;
        }

        return normalizePortalRecord(record, slug);
    } catch (error) {
        console.error('Error inesperado al consultar Supabase para el portal:', error);
        return null;
    }
}

async function fetchProductsFromSupabase(portal) {
    try {
        if (!portal) {
            return [];
        }

        let query = supabase.from('products').select('*');

        const productIds = parseArrayField(portal.productIds);

        if (portal.id) {
            query = query.eq('portal_id', portal.id);
        }

        if (productIds.length) {
            query = query.in('id', productIds);
        } else if (!portal.id && portal.slug) {
            query = query.eq('portal_slug', portal.slug);
        }

        const { data, error } = await query.order('name', { ascending: true });

        if (error) {
            console.warn('No fue posible obtener productos desde Supabase:', error.message);
            return [];
        }

        if (!Array.isArray(data) || !data.length) {
            return [];
        }

        return data.map((item) => {
            const stock = normalizeStockValue(item.stock);
            return {
                id: item.id,
                name: item.name || item.title || 'Producto',
                category: item.category || item.category_name || '',
                price: Number(item.price ?? item.unit_price ?? 0) || 0,
                image: item.image || item.image_url || item.thumbnail || '',
                shortDescription: item.short_description || item.description || '',
                description: item.description || '',
                stock: typeof stock === 'number' ? stock : null,
                status: item.status || '',
                statusClass: item.status_class || '',
                portalId: item.portal_id ?? portal.id ?? null
            };
        });
    } catch (error) {
        console.error('Error inesperado al consultar Supabase:', error);
        return [];
    }
}

async function loadPortalData() {
    const params = new URLSearchParams(window.location.search);
    const portalSlug = params.get('portal');

    if (!portalSlug) {
        showPortalError('El enlace compartido no contiene información de portal.');
        return;
    }

    showPortalError('Cargando portal…');

    const portal = await fetchPortalFromSupabase(portalSlug);
    if (!portal) {
        showPortalError('El portal solicitado no existe o fue deshabilitado.');
        return;
    }

    activePortal = portal;
    togglePortalVisibility(true);
    setAccentColor(portal.accentColor);
    updateHero(portal);
    renderTerms(portal.terms);

    const remoteProducts = await fetchProductsFromSupabase(portal);
    portalProducts = remoteProducts;

    selectedItems.clear();
    setRequestFeedback();

    renderProductGrid(portalProducts);
    renderSelectionSummary();
    updateProductButtons();
}

function initEventListeners() {
    elements.productGrid?.addEventListener('click', handleProductGridClick);
    elements.summaryList?.addEventListener('click', handleSummaryClick);
    elements.summaryList?.addEventListener('input', handleSummaryClick);
    elements.requestForm?.addEventListener('submit', handleRequestSubmit);
}

document.addEventListener('DOMContentLoaded', () => {
    cacheElements();
    loadPortalData();
    initEventListeners();
});
