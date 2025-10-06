const MODULE_BASE_PATH = './src/modules';
const loadedCss = new Set();

export async function loadModuleHtml(name) {
    const response = await fetch(`${MODULE_BASE_PATH}/${name}/${name}.html`);
    if (!response.ok) {
        throw new Error(`No se pudo cargar el módulo ${name}`);
    }
    return response.text();
}

export async function loadModuleCss(name) {
    if (loadedCss.has(name)) return;
    const href = `${MODULE_BASE_PATH}/${name}/${name}.css`;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    document.head.appendChild(link);
    loadedCss.add(name);
}
