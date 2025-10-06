export const state = {
    appData: {
        settings: {
            businessName: 'Mi Negocio',
            whatsapp: '',
            email: '',
            password: '',
            logo: '',
            publicSlug: '',
            isPublic: true,
            colors: {
                primary: '#2563eb',
                bgColor1: '#667eea',
                bgColor2: '#764ba2'
            },
            notifications: {
                sound: true,
                browser: false
            }
        },
        chatbot: {
            enabled: true,
            name: 'Asistente Virtual',
            welcome: '¡Hola! 👋 Soy tu asistente virtual. ¿En qué puedo ayudarte hoy?',
            faqs: [],
            quickResponses: {
                horario: 'Nuestro horario de atención es de Lunes a Viernes.',
                entrega: 'Los tiempos de entrega son de 24-48 horas.',
                pago: 'Aceptamos: Efectivo, SINPE Móvil, Transferencia.',
                contacto: ''
            }
        },
        products: [],
        clients: [],
        sales: [],
        cart: [],
        notifications: []
    },
    isAdmin: false,
    currentFilter: 'all',
    editingProductId: null,
    lastSaleData: null,
    parsedWhatsAppData: null,
    user: null,
    supabase: null
};

export function setAdminMode(value) {
    state.isAdmin = value;
    document.body.classList.toggle('admin-mode', value);
}

export function setUser(user) {
    state.user = user;
}

export function setSupabaseClient(client) {
    state.supabase = client;
}

export function setCurrentFilter(filter) {
    state.currentFilter = filter;
}

export function setEditingProductId(id) {
    state.editingProductId = id;
}

export function setLastSaleData(data) {
    state.lastSaleData = data;
}

export function setParsedWhatsAppData(data) {
    state.parsedWhatsAppData = data;
}
