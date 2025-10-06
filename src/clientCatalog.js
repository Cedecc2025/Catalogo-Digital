import { supabase } from './supabaseClient.js';
import { getInitialDashboardData } from './sampleData.js';

const initialData = getInitialDashboardData();
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
            const selected = selectedItems.has(String(product.id));
            const buttonLabel = selected ? 'En solicitud' : 'Agregar a la solicitud';
            const buttonState = selected ? 'selected' : 'idle';
            const description = escapeHtml(product.shortDescription || product.description || '');
            const name = escapeHtml(product.name || 'Producto');
            const image = product.image ? escapeHtml(product.image) : '';

            return `
                <article class="client-portal-product-card${selected ? ' selected' : ''}" data-product-id="${product.id}">
                    <div class="client-product-media">
                        ${image ? `<img src="${image}" alt="${name}" loading="lazy" />` : '<span aria-hidden="true" class="client-product-placeholder">🛒</span>'}
                    </div>
                    <div class="client-product-info">
                        <h3>${name}</h3>
                        <p>${description || 'Producto disponible para pedidos especiales.'}</p>
                    </div>
                    <div class="client-product-footer">
                        <span class="client-product-price">${formatCurrency(product.price)}</span>
                        <button type="button" class="client-product-button" data-action="toggle-product" data-product-id="${product.id}" data-state="${buttonState}">${buttonLabel}</button>
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
        const isSelected = selectedItems.has(String(productId));
        button.dataset.state = isSelected ? 'selected' : 'idle';
        button.textContent = isSelected ? 'En solicitud' : 'Agregar a la solicitud';
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
            return `
            <li class="client-summary-item" data-product-id="${product.id}">
                <div class="client-summary-details">
                    <strong>${name}</strong>
                    <span>${formatCurrency(product.price)} · ${category}</span>
                </div>
                <div class="client-summary-actions">
                    <button type="button" class="client-summary-button" data-action="decrement" data-product-id="${product.id}">−</button>
                    <input type="number" min="1" value="${quantity}" class="client-summary-quantity" data-action="quantity" data-product-id="${product.id}" />
                    <button type="button" class="client-summary-button" data-action="increment" data-product-id="${product.id}">+</button>
                    <button type="button" class="client-summary-remove" data-action="remove" data-product-id="${product.id}" aria-label="Quitar ${name}">×</button>
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
    const product = portalProducts.find((item) => String(item.id) === String(productId));
    if (!product) return;

    const existing = selectedItems.get(String(productId));
    if (existing) {
        selectedItems.set(String(productId), {
            product,
            quantity: existing.quantity + 1
        });
    } else {
        selectedItems.set(String(productId), {
            product,
            quantity: 1
        });
    }

    renderSelectionSummary();
    updateProductButtons();
}

function removeItem(productId) {
    selectedItems.delete(String(productId));
    renderSelectionSummary();
    updateProductButtons();
}

function setItemQuantity(productId, quantity) {
    const normalized = Number(quantity);
    if (Number.isNaN(normalized) || normalized <= 0) {
        removeItem(productId);
        return;
    }

    const existing = selectedItems.get(String(productId));
    if (!existing) return;

    selectedItems.set(String(productId), {
        product: existing.product,
        quantity: normalized
    });

    updateSummaryTotal();
    updateProductButtons();
}

function handleProductGridClick(event) {
    const button = event.target.closest('[data-action="toggle-product"]');
    if (!button) return;

    const productId = button.dataset.productId;
    if (!productId) return;

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
                setItemQuantity(productId, current.quantity - 1);
            }
            break;
        }
        case 'remove':
            removeItem(productId);
            break;
        case 'quantity':
            setItemQuantity(productId, target.value);
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

    const formData = new FormData(elements.requestForm);
    const payload = {
        portal_slug: activePortal.slug,
        portal_id: activePortal.id,
        name: String(formData.get('name') || '').trim(),
        company: String(formData.get('company') || '').trim(),
        email: String(formData.get('email') || '').trim(),
        phone: String(formData.get('phone') || '').trim(),
        notes: String(formData.get('notes') || '').trim(),
        items: Array.from(selectedItems.values()).map(({ product, quantity }) => ({
            product_id: product.id,
            name: product.name,
            quantity,
            unit_price: product.price
        })),
        total: Array.from(selectedItems.values()).reduce((sum, { product, quantity }) => sum + Number(product.price || 0) * quantity, 0)
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

async function fetchProductsFromSupabase(portal) {
    try {
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .eq('portal_id', portal.id);

        if (error) {
            console.warn('No fue posible obtener productos desde Supabase:', error.message);
            return [];
        }

        if (!Array.isArray(data) || !data.length) {
            return [];
        }

        return data.map((item) => ({
            id: item.id,
            name: item.name || 'Producto',
            category: item.category || '',
            price: Number(item.price) || 0,
            image: item.image || item.image_url || '',
            shortDescription: item.description || '',
            portalId: portal.id
        }));
    } catch (error) {
        console.error('Error inesperado al consultar Supabase:', error);
        return [];
    }
}

function getSampleProducts(portal) {
    const ids = Array.isArray(portal.productIds) ? portal.productIds.map(String) : [];
    const allProducts = Array.isArray(initialData.products) ? initialData.products : [];

    if (ids.length) {
        return allProducts.filter((product) => ids.includes(String(product.id)));
    }

    return allProducts.filter((product) => String(product.portalId) === String(portal.id));
}

async function loadPortalData() {
    const params = new URLSearchParams(window.location.search);
    const portalSlug = params.get('portal');

    if (!portalSlug) {
        showPortalError('El enlace compartido no contiene información de portal.');
        return;
    }

    const portal = initialData.portals.find((item) => item.slug === portalSlug);
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
    portalProducts = remoteProducts.length ? remoteProducts : getSampleProducts(portal);

    renderProductGrid(portalProducts);
    renderSelectionSummary();
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
