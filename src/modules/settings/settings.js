let callbacks = {};
let publicBaseUrl = '';

export function init(options) {
    callbacks = options;
    publicBaseUrl = sanitizeBaseUrl(options?.publicBaseUrl ?? window.location.href);

    document.getElementById('saveSettingsBtn')?.addEventListener('click', saveSettings);
    document.getElementById('exportDataBtn')?.addEventListener('click', () => callbacks.onExport?.());
    document.getElementById('importDataBtn')?.addEventListener('click', () => callbacks.onImport?.());
    document.getElementById('factoryResetBtn')?.addEventListener('click', () => callbacks.onFactoryReset?.());

    document.getElementById('primaryColor')?.addEventListener('change', emitColorChange);
    document.getElementById('bgColor1')?.addEventListener('change', emitColorChange);
    document.getElementById('bgColor2')?.addEventListener('change', emitColorChange);

    const slugInput = document.getElementById('settingsPublicSlug');
    slugInput?.addEventListener('input', handleSlugInput);
    slugInput?.addEventListener('blur', handleSlugInput);

    document.getElementById('copyPublicLinkBtn')?.addEventListener('click', copyPublicLink);
}

export function render(appState) {
    document.getElementById('settingsBusinessName').value = appState.appData.settings.businessName || '';
    document.getElementById('settingsLogoUrl').value = appState.appData.settings.logo || '';
    document.getElementById('settingsWhatsApp').value = appState.appData.settings.whatsapp || '';
    document.getElementById('settingsEmail').value = appState.appData.settings.email || '';
    document.getElementById('primaryColor').value = appState.appData.settings.colors.primary || '#2563eb';
    document.getElementById('bgColor1').value = appState.appData.settings.colors.bgColor1 || '#667eea';
    document.getElementById('bgColor2').value = appState.appData.settings.colors.bgColor2 || '#764ba2';

    const slug = appState.appData.settings.publicSlug || '';
    const slugInput = document.getElementById('settingsPublicSlug');
    if (slugInput) {
        slugInput.value = slug;
    }
    updateShareLink(slug);
}

async function saveSettings() {
    const slugInput = document.getElementById('settingsPublicSlug');
    const normalizedSlug = slugify(slugInput?.value ?? '');
    if (slugInput) {
        slugInput.value = normalizedSlug;
    }
    updateShareLink(normalizedSlug);

    await callbacks.onSave?.({
        businessName: document.getElementById('settingsBusinessName').value.trim(),
        logo: document.getElementById('settingsLogoUrl').value.trim(),
        whatsapp: document.getElementById('settingsWhatsApp').value.trim(),
        email: document.getElementById('settingsEmail').value.trim(),
        publicSlug: normalizedSlug
    });
}

function emitColorChange() {
    callbacks.onColorChange?.({
        primary: document.getElementById('primaryColor').value,
        bgColor1: document.getElementById('bgColor1').value,
        bgColor2: document.getElementById('bgColor2').value
    });
}

function handleSlugInput(event) {
    const input = event?.target;
    if (!input) return;
    const normalized = slugify(input.value ?? '');
    if (input.value !== normalized) {
        input.value = normalized;
    }
    updateShareLink(normalized);
}

function updateShareLink(slug) {
    const shareInput = document.getElementById('settingsPublicUrl');
    if (!shareInput) return;

    const shareUrl = buildShareUrl(slug);
    shareInput.value = shareUrl;

    const helper = document.getElementById('settingsPublicLinkHelper');
    if (helper) {
        helper.textContent = slug
            ? 'Comparte este enlace con tus clientes para que vean tu catálogo.'
            : 'Agrega un identificador para generar un enlace único de tu catálogo.';
    }
}

function buildShareUrl(slug) {
    if (!slug) {
        return publicBaseUrl;
    }
    const separator = publicBaseUrl.includes('?') ? '&' : '?';
    return `${publicBaseUrl}${separator}store=${encodeURIComponent(slug)}`;
}

async function copyPublicLink() {
    const slugInput = document.getElementById('settingsPublicSlug');
    const shareInput = document.getElementById('settingsPublicUrl');
    if (!shareInput || !slugInput || !slugInput.value) {
        notify('Configura un identificador público antes de copiar el enlace.', 'warning');
        return;
    }

    shareInput.select();
    shareInput.setSelectionRange(0, shareInput.value.length);

    try {
        if (navigator.clipboard?.writeText) {
            await navigator.clipboard.writeText(shareInput.value);
        } else {
            document.execCommand('copy');
        }
        notify('Enlace del catálogo copiado al portapapeles.', 'success');
    } catch (error) {
        console.error('No fue posible copiar el enlace público', error);
        notify('No se pudo copiar el enlace. Intenta manualmente.', 'error');
    } finally {
        shareInput.setSelectionRange(shareInput.value.length, shareInput.value.length);
        shareInput.blur();
    }
}

function notify(message, type = 'info') {
    if (typeof callbacks.onNotify === 'function') {
        callbacks.onNotify(message, type);
    } else {
        alert(message);
    }
}

function slugify(value = '') {
    return value
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/-{2,}/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 60);
}

function sanitizeBaseUrl(url) {
    if (!url) return window.location.origin;
    const base = url.split('#')[0].split('?')[0];
    return base;
}
