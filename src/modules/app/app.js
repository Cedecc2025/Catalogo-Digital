import { state, setAdminMode, setLastSaleData } from '../../scripts/state.js';
import { initializeStorage, loadData, saveData, exportData, importData, factoryReset } from '../../scripts/storage.js';
import * as catalogModule from '../catalog/catalog.js';
import * as dashboardModule from '../dashboard/dashboard.js';
import * as salesModule from '../sales/sales.js';
import * as clientsModule from '../clients/clients.js';
import * as inventoryModule from '../inventory/inventory.js';
import * as chatbotModule from '../chatbot/chatbot.js';
import * as settingsModule from '../settings/settings.js';

let appCallbacks = { onLogout: null };

export async function initApp({ user, onLogout }) {
    appCallbacks.onLogout = onLogout;
    state.user = user;
    setAdminMode(true);

    const firstRun = initializeStorage();
    if (!firstRun) {
        loadData();
    }

    if (state.appData.products.length === 0) {
        seedDefaultProducts();
        saveData();
    }

    setupHeader();
    setupNavigation();
    setupNotificationCenter();

    catalogModule.init({
        onCreateProduct: handleCreateProduct,
        onUpdateProduct: handleUpdateProduct,
        onDeleteProduct: handleDeleteProduct,
        onAddToCart: handleAddToCart,
        onCheckout: handleCheckout,
        onSaveImage: () => saveData(),
        onCartChange: () => saveData(),
        onNotify: showToast
    });

    dashboardModule.init();
    salesModule.init({
        onUpdateStatus: handleUpdateSaleStatus,
        onRegisterSale: handleRegisterSale
    });
    clientsModule.init();
    inventoryModule.init({
        onEditProduct: (productId) => catalogModule.openEditProduct(productId),
        onDeleteProduct: handleDeleteProduct
    });
    chatbotModule.init({ onSave: handleSaveChatbot });
    settingsModule.init({
        onSave: handleSaveSettings,
        onExport: exportData,
        onImport: importData,
        onFactoryReset: factoryReset,
        onColorChange: handleColorChange
    });

    renderApp();

    if (firstRun) {
        showToast('Sistema listo. Configura tu negocio en ⚙️ Config.', 'info');
    }
}

function seedDefaultProducts() {
    state.appData.products = [
        {
            id: crypto.randomUUID(),
            name: 'Café Gourmet 250g',
            description: 'Café costarricense de altura con notas de chocolate y frutos rojos.',
            category: 'Alimentos',
            price: 5800,
            stock: 12,
            image: '',
            createdAt: new Date().toISOString()
        },
        {
            id: crypto.randomUUID(),
            name: 'Termo Acero Inoxidable',
            description: 'Termo de 600ml con aislamiento de doble capa, mantiene la temperatura por 12h.',
            category: 'Tecnología',
            price: 12900,
            stock: 8,
            image: '',
            createdAt: new Date().toISOString()
        }
    ];
}

function setupHeader() {
    const addProductBtn = document.getElementById('addProductBtn');
    const cartBtn = document.getElementById('openCartBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const whatsappBtn = document.getElementById('whatsappProcessBtn');

    addProductBtn?.addEventListener('click', () => catalogModule.openCreateProduct());
    cartBtn?.addEventListener('click', () => catalogModule.openCart());
    whatsappBtn?.addEventListener('click', () => salesModule.openWhatsappProcessor());
    logoutBtn?.addEventListener('click', async () => {
        await appCallbacks.onLogout?.();
    });

    const adminLock = document.getElementById('adminLock');
    adminLock?.addEventListener('click', async () => {
        await appCallbacks.onLogout?.();
    });

    document.getElementById('notificationBtn')?.addEventListener('click', toggleNotificationCenter);
    document.getElementById('clearNotificationsBtn')?.addEventListener('click', clearAllNotifications);
    document.getElementById('closePurchasePopup')?.addEventListener('click', closePurchasePopup);
    document.getElementById('toggleChatbot')?.addEventListener('click', toggleChatbot);
    document.getElementById('closeChatbot')?.addEventListener('click', toggleChatbot);
    document.getElementById('sendChatMessage')?.addEventListener('click', () => chatbotModule.sendMessage());
    document.getElementById('chatInput')?.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            chatbotModule.sendMessage();
        }
    });
    document.querySelectorAll('.chat-option-btn').forEach((btn) => {
        btn.addEventListener('click', () => chatbotModule.sendQuickMessage(btn.dataset.option));
    });
}

function setupNavigation() {
    const navTabs = document.querySelectorAll('.nav-tab');
    navTabs.forEach((tab) => {
        tab.addEventListener('click', () => {
            const sectionName = tab.dataset.section;
            document.querySelectorAll('.nav-tab').forEach((t) => t.classList.remove('active'));
            tab.classList.add('active');
            document.querySelectorAll('.section').forEach((section) => section.classList.remove('active'));
            document.getElementById(sectionName)?.classList.add('active');
        });
    });
}

function handleCreateProduct(product) {
    state.appData.products.push({
        ...product,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString()
    });
    saveData();
    addNotification({
        title: 'Nuevo producto',
        description: `${product.name} agregado al catálogo`,
        type: 'success'
    });
    renderApp();
}

function handleUpdateProduct(productId, changes) {
    const product = state.appData.products.find((item) => item.id === productId);
    if (!product) return;
    Object.assign(product, changes);
    saveData();
    addNotification({
        title: 'Producto actualizado',
        description: `${product.name} se actualizó correctamente`,
        type: 'info'
    });
    renderApp();
}

function handleDeleteProduct(productId) {
    const product = state.appData.products.find((item) => item.id === productId);
    state.appData.products = state.appData.products.filter((item) => item.id !== productId);
    state.appData.cart = state.appData.cart.filter((item) => item.id !== productId);
    saveData();
    addNotification({
        title: 'Producto eliminado',
        description: `${product?.name ?? 'Producto'} fue eliminado del catálogo`,
        type: 'warning'
    });
    renderApp();
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
    saveData();
    catalogModule.renderCart(state);
    catalogModule.updateCartBadge(state);
}

function handleCheckout(order) {
    const saleId = crypto.randomUUID();
    const saleRecord = {
        id: saleId,
        date: new Date().toISOString(),
        client: order.client,
        items: order.items,
        subtotal: order.subtotal,
        tax: order.tax,
        total: order.total,
        status: 'Pendiente',
        source: order.source || 'Catálogo'
    };

    state.appData.sales.push(saleRecord);
    upsertClient(order.client, order.total);

    order.items.forEach((item) => {
        const product = state.appData.products.find((p) => p.id === item.id);
        if (product) {
            product.stock = Math.max(product.stock - item.quantity, 0);
        }
    });

    state.appData.cart = [];
    saveData();
    setLastSaleData(saleRecord);
    addNotification({
        title: 'Pedido recibido',
        description: `Nuevo pedido de ${order.client.name}`,
        type: 'success'
    });
    showPurchasePopup(order);
    renderApp();
}

function handleUpdateSaleStatus(saleId, status) {
    const sale = state.appData.sales.find((item) => item.id === saleId);
    if (!sale) return;
    sale.status = status;
    saveData();
    renderApp();
}

function handleRegisterSale(order) {
    const saleId = crypto.randomUUID();
    const saleRecord = {
        id: saleId,
        date: new Date().toISOString(),
        client: order.client,
        items: order.items,
        subtotal: order.subtotal,
        tax: order.tax,
        total: order.total,
        status: 'Pendiente',
        source: order.source || 'WhatsApp'
    };
    state.appData.sales.push(saleRecord);
    upsertClient(order.client, order.total);
    saveData();
    addNotification({
        title: 'Venta registrada',
        description: `Se registró la venta de ${order.client.name}`,
        type: 'info'
    });
    renderApp();
}

function upsertClient(client, saleTotal) {
    const existing = state.appData.clients.find((c) => c.phone === client.phone);
    if (existing) {
        existing.purchases += 1;
        existing.totalSpent += saleTotal;
        existing.name = client.name;
        existing.address = client.address;
    } else {
        state.appData.clients.push({
            ...client,
            purchases: 1,
            totalSpent: saleTotal
        });
    }
}

function handleSaveChatbot(settings) {
    state.appData.chatbot = { ...state.appData.chatbot, ...settings };
    saveData();
    renderApp();
    showToast('Configuración del chatbot guardada', 'success');
}

function handleSaveSettings(settings) {
    state.appData.settings = { ...state.appData.settings, ...settings };
    saveData();
    applySettingsToUI();
    renderApp();
    showToast('Configuración guardada correctamente', 'success');
}

function handleColorChange(colors) {
    state.appData.settings.colors = colors;
    applySettingsToUI();
    saveData();
}

function setupNotificationCenter() {
    document.addEventListener('click', (event) => {
        const dropdown = document.getElementById('notificationDropdown');
        const button = document.getElementById('notificationBtn');
        if (!dropdown || !button) return;
        if (dropdown.contains(event.target) || button.contains(event.target)) {
            return;
        }
        dropdown.classList.remove('show');
    });

    renderNotifications();
}

function toggleNotificationCenter() {
    const dropdown = document.getElementById('notificationDropdown');
    dropdown?.classList.toggle('show');
}

function addNotification(notification) {
    state.appData.notifications.unshift({
        id: crypto.randomUUID(),
        read: false,
        createdAt: new Date().toISOString(),
        ...notification
    });
    if (state.appData.notifications.length > 50) {
        state.appData.notifications.length = 50;
    }
    saveData();
    renderNotifications();
    showToast(notification.description, notification.type);
}

function clearAllNotifications() {
    state.appData.notifications.forEach((n) => (n.read = true));
    saveData();
    renderNotifications();
}

function renderNotifications() {
    const count = state.appData.notifications.filter((n) => !n.read).length;
    const countBadge = document.getElementById('notificationCount');
    if (countBadge) {
        countBadge.textContent = String(count);
        countBadge.style.display = count > 0 ? 'flex' : 'none';
    }

    const list = document.getElementById('notificationList');
    if (!list) return;
    if (state.appData.notifications.length === 0) {
        list.innerHTML = `
            <div class="notification-empty">
                <div style="font-size: 48px; margin-bottom: 10px;">📭</div>
                <p>No hay notificaciones nuevas</p>
            </div>`;
        return;
    }

    list.innerHTML = state.appData.notifications
        .map((notification) => {
            const date = new Date(notification.createdAt).toLocaleString('es-CR');
            return `
                <div class="notification-item ${notification.read ? '' : 'unread'}" data-id="${notification.id}">
                    <div class="notification-item-header">
                        <span class="notification-item-title">${notification.title}</span>
                        <span class="notification-item-time">${date}</span>
                    </div>
                    <div class="notification-item-content">${notification.description}</div>
                </div>`;
        })
        .join('');

    list.querySelectorAll('.notification-item').forEach((item) => {
        item.addEventListener('click', () => {
            const id = item.dataset.id;
            const target = state.appData.notifications.find((n) => n.id === id);
            if (target) {
                target.read = true;
                saveData();
                renderNotifications();
            }
        });
    });
}

function renderApp() {
    applySettingsToUI();
    catalogModule.render(state);
    catalogModule.renderCart(state);
    catalogModule.updateCartBadge(state);
    dashboardModule.render(state);
    salesModule.render(state);
    clientsModule.render(state);
    inventoryModule.render(state);
    chatbotModule.render(state);
    settingsModule.render(state);
}

function applySettingsToUI() {
    const { settings } = state.appData;
    document.getElementById('businessName').textContent = settings.businessName || 'Mi Negocio';
    document.body.style.background = `linear-gradient(135deg, ${settings.colors.bgColor1} 0%, ${settings.colors.bgColor2} 100%)`;
    document.documentElement.style.setProperty('--primary', settings.colors.primary || '#2563eb');
    document.documentElement.style.setProperty('--gradient-1', `linear-gradient(135deg, ${settings.colors.bgColor1} 0%, ${settings.colors.bgColor2} 100%)`);

    const logoImg = document.getElementById('businessLogo');
    const logoIcon = document.getElementById('logoIcon');
    if (settings.logo) {
        logoImg.src = settings.logo;
        logoImg.style.display = 'block';
        logoIcon.style.display = 'none';
    } else {
        logoImg.style.display = 'none';
        logoIcon.style.display = 'inline-block';
    }
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

function showPurchasePopup(order) {
    const popup = document.getElementById('purchasePopup');
    const details = document.getElementById('purchaseDetails');
    if (!popup || !details) return;
    details.innerHTML = `
        <p><strong>Cliente:</strong> ${order.client.name}</p>
        <p><strong>Total:</strong> ₡${order.total.toLocaleString()}</p>
        <p><strong>Productos:</strong></p>
        <ul>
            ${order.items.map((item) => `<li>${item.name} x${item.quantity}</li>`).join('')}
        </ul>`;
    popup.classList.add('show');
    setTimeout(() => popup.classList.remove('show'), 5000);
}

function closePurchasePopup() {
    document.getElementById('purchasePopup')?.classList.remove('show');
}

function toggleChatbot() {
    const windowEl = document.getElementById('chatbotWindow');
    const widget = document.getElementById('chatbotWidget');
    if (!windowEl || !widget) return;
    windowEl.classList.toggle('show');
    widget.style.display = state.appData.chatbot.enabled ? 'block' : 'none';
}

export { toggleNotificationCenter, clearAllNotifications, closePurchasePopup, showToast };
