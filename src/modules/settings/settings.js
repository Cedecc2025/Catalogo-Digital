let callbacks = {};

export function init(options) {
    callbacks = options;
    document.getElementById('saveSettingsBtn')?.addEventListener('click', saveSettings);
    document.getElementById('exportDataBtn')?.addEventListener('click', () => callbacks.onExport?.());
    document.getElementById('importDataBtn')?.addEventListener('click', () => callbacks.onImport?.());
    document.getElementById('factoryResetBtn')?.addEventListener('click', () => callbacks.onFactoryReset?.());

    document.getElementById('primaryColor')?.addEventListener('change', emitColorChange);
    document.getElementById('bgColor1')?.addEventListener('change', emitColorChange);
    document.getElementById('bgColor2')?.addEventListener('change', emitColorChange);
}

export function render(appState) {
    document.getElementById('settingsBusinessName').value = appState.appData.settings.businessName || '';
    document.getElementById('settingsLogoUrl').value = appState.appData.settings.logo || '';
    document.getElementById('settingsWhatsApp').value = appState.appData.settings.whatsapp || '';
    document.getElementById('settingsEmail').value = appState.appData.settings.email || '';
    document.getElementById('primaryColor').value = appState.appData.settings.colors.primary || '#2563eb';
    document.getElementById('bgColor1').value = appState.appData.settings.colors.bgColor1 || '#667eea';
    document.getElementById('bgColor2').value = appState.appData.settings.colors.bgColor2 || '#764ba2';
}

function saveSettings() {
    callbacks.onSave?.({
        businessName: document.getElementById('settingsBusinessName').value.trim(),
        logo: document.getElementById('settingsLogoUrl').value.trim(),
        whatsapp: document.getElementById('settingsWhatsApp').value.trim(),
        email: document.getElementById('settingsEmail').value.trim()
    });
}

function emitColorChange() {
    callbacks.onColorChange?.({
        primary: document.getElementById('primaryColor').value,
        bgColor1: document.getElementById('bgColor1').value,
        bgColor2: document.getElementById('bgColor2').value
    });
}
