import { state } from '../../scripts/state.js';

let callbacks = {};

export function init(options) {
    callbacks = options;
    document.getElementById('saveChatbotBtn')?.addEventListener('click', saveChatbotSettings);
}

export function render(appState) {
    document.getElementById('botName').value = appState.appData.chatbot.name || '';
    document.getElementById('botWelcome').value = appState.appData.chatbot.welcome || '';
    document.getElementById('botEnabled').checked = appState.appData.chatbot.enabled;
    document.getElementById('botHours').value = appState.appData.chatbot.quickResponses.horario || '';
    document.getElementById('botDelivery').value = appState.appData.chatbot.quickResponses.entrega || '';
    document.getElementById('botPayment').value = appState.appData.chatbot.quickResponses.pago || '';

    const widget = document.getElementById('chatbotWidget');
    if (widget) {
        widget.style.display = appState.appData.chatbot.enabled ? 'block' : 'none';
    }
    const title = document.getElementById('chatbotTitle');
    if (title) title.textContent = appState.appData.chatbot.name || 'Asistente Virtual';
}

export function sendMessage() {
    const input = document.getElementById('chatInput');
    if (!input) return;
    const text = input.value.trim();
    if (!text) return;
    input.value = '';
    appendMessage('user', text);
    respondToMessage(text);
}

export function sendQuickMessage(option) {
    const responses = state.appData.chatbot.quickResponses;
    const map = {
        horario: responses.horario,
        entrega: responses.entrega,
        pago: responses.pago,
        contacto: state.appData.settings.whatsapp ? `Puedes escribirnos al WhatsApp ${state.appData.settings.whatsapp}` : 'Pronto te contactaremos.'
    };
    const message = map[option] || state.appData.chatbot.welcome;
    appendMessage('user', `Consulta: ${option}`);
    setTimeout(() => appendMessage('bot', message), 400);
}

async function saveChatbotSettings() {
    await callbacks.onSave?.({
        enabled: document.getElementById('botEnabled').checked,
        name: document.getElementById('botName').value.trim(),
        welcome: document.getElementById('botWelcome').value.trim(),
        quickResponses: {
            horario: document.getElementById('botHours').value.trim(),
            entrega: document.getElementById('botDelivery').value.trim(),
            pago: document.getElementById('botPayment').value.trim(),
            contacto: state.appData.chatbot.quickResponses.contacto
        }
    });
}

function appendMessage(type, text) {
    const container = document.getElementById('chatMessages');
    if (!container) return;
    const bubble = document.createElement('div');
    bubble.className = `chatbot-message ${type}`;
    bubble.textContent = text;
    container.appendChild(bubble);
    container.scrollTop = container.scrollHeight;
}

function respondToMessage(text) {
    const typing = document.getElementById('typingIndicator');
    typing?.classList.add('show');
    const responses = state.appData.chatbot.quickResponses;
    setTimeout(() => {
        typing?.classList.remove('show');
        const lower = text.toLowerCase();
        if (lower.includes('horario')) {
            appendMessage('bot', responses.horario);
        } else if (lower.includes('entrega')) {
            appendMessage('bot', responses.entrega);
        } else if (lower.includes('pago')) {
            appendMessage('bot', responses.pago);
        } else if (lower.includes('contacto')) {
            if (state.appData.settings.whatsapp) {
                appendMessage('bot', `Escríbenos al WhatsApp ${state.appData.settings.whatsapp}`);
            } else {
                appendMessage('bot', 'Puedes escribirnos por este mismo chat.');
            }
        } else {
            appendMessage('bot', state.appData.chatbot.welcome || 'Estoy aquí para ayudarte.');
        }
    }, 500);
}
