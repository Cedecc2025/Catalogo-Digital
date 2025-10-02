import { state } from './state.js';

const STORAGE_KEY = 'pymeSystemData';
const INIT_KEY = 'pymeSystemInitialized';

export function initializeStorage() {
    if (!localStorage.getItem(INIT_KEY)) {
        localStorage.setItem(INIT_KEY, 'true');
        saveData();
        return true;
    }
    return false;
}

export function loadData() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            state.appData = {
                ...state.appData,
                ...parsed,
                settings: { ...state.appData.settings, ...parsed.settings },
                chatbot: { ...state.appData.chatbot, ...parsed.chatbot }
            };
        } catch (error) {
            console.error('Error al cargar datos almacenados', error);
        }
    }
}

export function saveData() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.appData));
}

export function exportData() {
    const dataStr = JSON.stringify(state.appData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'catalogo-pyme-backup.json';
    link.click();
    URL.revokeObjectURL(url);
}

export function importData() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,application/json';
    input.onchange = (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const imported = JSON.parse(e.target?.result);
                state.appData = { ...state.appData, ...imported };
                saveData();
                window.location.reload();
            } catch (error) {
                alert('Archivo inválido: ' + error.message);
            }
        };
        reader.readAsText(file);
    };
    input.click();
}

export function factoryReset() {
    if (confirm('¿Seguro que quieres reiniciar todo el sistema? Esta acción es irreversible.')) {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(INIT_KEY);
        window.location.reload();
    }
}
