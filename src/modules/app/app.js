import { state, setAdminMode, setLastSaleData } from '../../scripts/state.js';
import { exportData, importData, factoryReset } from '../../scripts/storage.js';
import * as catalogModule from '../catalog/catalog.js';
import * as dashboardModule from '../dashboard/dashboard.js';
import * as salesModule from '../sales/sales.js';
import * as clientsModule from '../clients/clients.js';
import * as inventoryModule from '../inventory/inventory.js';
import * as chatbotModule from '../chatbot/chatbot.js';
import * as settingsModule from '../settings/settings.js';

let appCallbacks = { onLogout: null };
const MAX_NOTIFICATIONS = 50;

export async function initApp({ user, onLogout }) {
    appCallbacks.onLogout = onLogout;
    state.user = user;
    setAdminMode(true);

    await loadUserData();

    setupHeader();
    setupNavigation();
    setupNotificationCenter();

    catalogModule.init({
        onCreateProduct: handleCreateProduct,
        onUpdateProduct: handleUpdateProduct,
        onDeleteProduct: handleDeleteProduct,
        onAddToCart: handleAddToCart,
        onCheckout: handleCheckout,
        onSaveImage: () => {},
        onCartChange: () => {},
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
}

async function loadUserData() {
    if (!state.supabase || !state.user) return;
    const userId = state.user.id;

    try {
        const [productsRes, clientsRes, salesRes, notificationsRes, settingsRes, chatbotRes] = await Promise.all([
            state.supabase
                .from('products')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false }),
            state.supabase
                .from('clients')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false }),
            state.supabase
                .from('sales')
                .select('*, client:clients(id, name, phone, address), sale_items(product_id, name, quantity, price)')
                .eq('user_id', userId)
                .order('created_at', { ascending: false }),
            state.supabase
                .from('notifications')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false }),
            state.supabase
                .from('business_settings')
                .select('*')
                .eq('user_id', userId)
                .maybeSingle(),
            state.supabase
                .from('chatbot_settings')
                .select('*')
                .eq('user_id', userId)
                .maybeSingle()
        ]);

        if (productsRes.error) throw productsRes.error;
        if (clientsRes.error) throw clientsRes.error;
        if (salesRes.error) throw salesRes.error;
        if (notificationsRes.error) throw notificationsRes.error;
        if (settingsRes.error) throw settingsRes.error;
        if (chatbotRes.error) throw chatbotRes.error;

        state.appData.products = (productsRes.data ?? []).map(mapProduct);
        state.appData.clients = (clientsRes.data ?? []).map(mapClient);
        state.appData.sales = (salesRes.data ?? []).map(mapSale);
        state.appData.notifications = (notificationsRes.data ?? []).map(mapNotification).slice(0, MAX_NOTIFICATIONS);
        state.appData.settings = {
            ...state.appData.settings,
            ...mapBusinessSettings(settingsRes.data)
        };
        state.appData.chatbot = {
            ...state.appData.chatbot,
            ...mapChatbotSettings(chatbotRes.data)
        };
    } catch (error) {
        console.error('No fue posible cargar datos del usuario', error);
        showToast('No fue posible cargar la información de Supabase', 'error');
    }
}

function mapProduct(row) {
    return {
        id: row.id,
        name: row.name,
        description: row.description ?? '',
        category: row.category ?? 'General',
        price: Number(row.price ?? 0),
        stock: Number(row.stock ?? 0),
        image: row.image_url ?? '',
        createdAt: row.created_at
    };
}

function mapClient(row) {
    return {
        id: row.id,
        name: row.name,
        phone: row.phone,
        address: row.address ?? '',
        totalSpent: Number(row.total_spent ?? 0),
        purchases: Number(row.purchases ?? 0),
        createdAt: row.created_at
    };
}

function mapSale(row) {
    const items = (row.sale_items ?? []).map((item) => ({
        id: item.product_id,
        name: item.name,
        quantity: Number(item.quantity ?? 0),
        price: Number(item.price ?? 0)
    }));
    const client = row.client
        ? {
              id: row.client.id,
              name: row.client.name ?? 'Cliente',
              phone: row.client.phone ?? '',
              address: row.client.address ?? ''
          }
        : {
              id: null,
              name: 'Cliente',
              phone: '',
              address: ''
          };
    return {
        id: row.id,
        date: row.created_at,
        client,
        items,
        subtotal: Number(row.subtotal ?? 0),
        tax: Number(row.tax ?? 0),
        total: Number(row.total ?? 0),
        status: row.status ?? 'Pendiente',
        source: row.source ?? 'Catálogo'
    };
}

function mapNotification(row) {
    return {
        id: row.id,
        title: row.title,
        description: row.body ?? '',
        type: row.type ?? 'info',
        read: Boolean(row.read),
        createdAt: row.created_at
    };
}

function mapBusinessSettings(row) {
    if (!row) return {};
    return {
        businessName: row.business_name ?? '',
        logo: row.logo_url ?? '',
        whatsapp: row.whatsapp ?? '',
        email: row.email ?? '',
        isPublic: row.is_public ?? state.appData.settings.isPublic,
        colors: {
            primary: row.primary_color ?? state.appData.settings.colors.primary,
            bgColor1: row.gradient_start ?? state.appData.settings.colors.bgColor1,
            bgColor2: row.gradient_end ?? state.appData.settings.colors.bgColor2
        }
    };
}

function mapChatbotSettings(row) {
    if (!row) return {};
    return {
        enabled: row.enabled ?? true,
        name: row.assistant_name ?? 'Asistente Virtual',
        welcome: row.welcome_message ?? state.appData.chatbot.welcome,
        quickResponses: {
            ...state.appData.chatbot.quickResponses,
            horario: row.quick_hours ?? state.appData.chatbot.quickResponses.horario,
            entrega: row.quick_delivery ?? state.appData.chatbot.quickResponses.entrega,
            pago: row.quick_payment ?? state.appData.chatbot.quickResponses.pago,
            contacto: row.quick_contact ?? state.appData.chatbot.quickResponses.contacto
        }
    };
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

async function handleCreateProduct(product) {
    if (!state.supabase || !state.user) {
        showToast('No hay conexión con Supabase', 'error');
        return;
    }

    try {
        const { data, error } = await state.supabase
            .from('products')
            .insert({
                user_id: state.user.id,
                name: product.name,
                description: product.description,
                category: product.category,
                price: product.price,
                stock: product.stock,
                image_url: product.image || null
            })
            .select('*')
            .single();

        if (error) throw error;

        const mapped = mapProduct(data);
        state.appData.products.unshift(mapped);
        await addNotification({
            title: 'Nuevo producto',
            description: `${product.name} agregado al catálogo`,
            type: 'success'
        });
        renderApp();
    } catch (error) {
        console.error('No fue posible crear el producto', error);
        showToast('No se pudo guardar el producto', 'error');
    }
}

async function handleUpdateProduct(productId, changes) {
    if (!state.supabase || !state.user) {
        showToast('No hay conexión con Supabase', 'error');
        return;
    }

    try {
        const { data, error } = await state.supabase
            .from('products')
            .update({
                name: changes.name,
                description: changes.description,
                category: changes.category,
                price: changes.price,
                stock: changes.stock,
                image_url: changes.image || null
            })
            .eq('id', productId)
            .eq('user_id', state.user.id)
            .select('*')
            .single();

        if (error) throw error;

        const updated = mapProduct(data);
        const index = state.appData.products.findIndex((item) => item.id === productId);
        if (index >= 0) {
            state.appData.products[index] = updated;
        }

        await addNotification({
            title: 'Producto actualizado',
            description: `${updated.name} se actualizó correctamente`,
            type: 'info'
        });
        renderApp();
    } catch (error) {
        console.error('No fue posible actualizar el producto', error);
        showToast('No se pudo actualizar el producto', 'error');
    }
}

async function handleDeleteProduct(productId) {
    if (!state.supabase || !state.user) {
        showToast('No hay conexión con Supabase', 'error');
        return;
    }

    const product = state.appData.products.find((item) => item.id === productId);

    try {
        const { error } = await state.supabase
            .from('products')
            .delete()
            .eq('id', productId)
            .eq('user_id', state.user.id);

        if (error) throw error;

        state.appData.products = state.appData.products.filter((item) => item.id !== productId);
        state.appData.cart = state.appData.cart.filter((item) => item.id !== productId);

        await addNotification({
            title: 'Producto eliminado',
            description: `${product?.name ?? 'Producto'} fue eliminado del catálogo`,
            type: 'warning'
        });
        renderApp();
    } catch (error) {
        console.error('No fue posible eliminar el producto', error);
        showToast('No se pudo eliminar el producto', 'error');
    }
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
    catalogModule.renderCart(state);
    catalogModule.updateCartBadge(state);
}

async function recordSale(order, notification) {
    if (!state.supabase || !state.user) {
        showToast('No hay conexión con Supabase', 'error');
        throw new Error('Supabase no inicializado');
    }

    const clientRecord = await upsertClient(order.client);

    const { data: saleData, error: saleError } = await state.supabase
        .from('sales')
        .insert({
            user_id: state.user.id,
            client_id: clientRecord?.id ?? null,
            subtotal: order.subtotal,
            tax: order.tax,
            total: order.total,
            status: 'Pendiente',
            source: order.source || 'Catálogo'
        })
        .select('*, client:clients(id, name, phone, address)')
        .single();

    if (saleError) {
        console.error('No fue posible guardar la venta', saleError);
        showToast('No se pudo registrar la venta', 'error');
        throw saleError;
    }

    const saleItemsPayload = order.items.map((item) => ({
        sale_id: saleData.id,
        product_id: item.id || null,
        name: item.name,
        quantity: item.quantity,
        price: item.price
    }));

    if (saleItemsPayload.length > 0) {
        const { error: itemsError } = await state.supabase.from('sale_items').insert(saleItemsPayload);
        if (itemsError) {
            console.error('No fue posible guardar los productos de la venta', itemsError);
            showToast('No se pudieron guardar los productos de la venta', 'error');
            throw itemsError;
        }
    }

    await Promise.all(
        order.items.map(async (item) => {
            if (!item.id) return;
            const product = state.appData.products.find((p) => p.id === item.id);
            if (!product) return;
            const newStock = Math.max(product.stock - item.quantity, 0);
            const { data, error } = await state.supabase
                .from('products')
                .update({ stock: newStock })
                .eq('id', product.id)
                .eq('user_id', state.user.id)
                .select('*')
                .single();
            if (error) {
                console.error('No fue posible actualizar el stock', error);
                return;
            }
            const updated = mapProduct(data);
            const index = state.appData.products.findIndex((p) => p.id === updated.id);
            if (index >= 0) {
                state.appData.products[index] = updated;
            }
        })
    );

    const saleRecord = mapSale({ ...saleData, sale_items: saleItemsPayload });
    state.appData.sales.push(saleRecord);

    await addNotification(notification);

    return saleRecord;
}

async function handleCheckout(order) {
    try {
        const saleRecord = await recordSale(order, {
            title: 'Pedido recibido',
            description: `Nuevo pedido de ${order.client.name}`,
            type: 'success'
        });
        state.appData.cart = [];
        setLastSaleData(saleRecord);
        showPurchasePopup(order);
        renderApp();
    } catch (error) {
        console.error('Error durante el checkout', error);
    }
}

async function handleUpdateSaleStatus(saleId, status) {
    if (!state.supabase || !state.user) {
        showToast('No hay conexión con Supabase', 'error');
        return;
    }

    try {
        const { data, error } = await state.supabase
            .from('sales')
            .update({ status })
            .eq('id', saleId)
            .eq('user_id', state.user.id)
            .select('*')
            .single();

        if (error) throw error;

        const sale = state.appData.sales.find((item) => item.id === saleId);
        if (sale) {
            sale.status = data.status ?? status;
        }
        renderApp();
    } catch (error) {
        console.error('No fue posible actualizar el estado de la venta', error);
        showToast('No se pudo actualizar el estado de la venta', 'error');
    }
}

async function handleRegisterSale(order) {
    try {
        await recordSale(order, {
            title: 'Venta registrada',
            description: `Se registró la venta de ${order.client.name}`,
            type: 'info'
        });
        renderApp();
    } catch (error) {
        console.error('Error al registrar la venta', error);
    }
}

async function upsertClient(client) {
    if (!state.supabase || !state.user) return null;

    const existing = state.appData.clients.find((c) => c.phone === client.phone);

    try {
        if (existing) {
            const { data, error } = await state.supabase
                .from('clients')
                .update({
                    name: client.name,
                    phone: client.phone,
                    address: client.address
                })
                .eq('id', existing.id)
                .eq('user_id', state.user.id)
                .select('*')
                .single();

            if (error) throw error;

            const updated = mapClient(data);
            const index = state.appData.clients.findIndex((c) => c.id === updated.id);
            if (index >= 0) {
                state.appData.clients[index] = updated;
            }
            return updated;
        }

        const { data, error } = await state.supabase
            .from('clients')
            .insert({
                user_id: state.user.id,
                name: client.name,
                phone: client.phone,
                address: client.address
            })
            .select('*')
            .single();

        if (error) throw error;

        const created = mapClient(data);
        state.appData.clients.push(created);
        return created;
    } catch (error) {
        console.error('No fue posible sincronizar el cliente', error);
        showToast('No se pudo guardar el cliente', 'error');
        return existing ?? null;
    }
}

async function handleSaveChatbot(settings) {
    if (!state.supabase || !state.user) {
        showToast('No hay conexión con Supabase', 'error');
        return;
    }

    const payload = {
        user_id: state.user.id,
        enabled: settings.enabled,
        assistant_name: settings.name,
        welcome_message: settings.welcome,
        quick_hours: settings.quickResponses.horario,
        quick_delivery: settings.quickResponses.entrega,
        quick_payment: settings.quickResponses.pago,
        quick_contact: settings.quickResponses.contacto
    };

    try {
        const { data, error } = await state.supabase
            .from('chatbot_settings')
            .upsert(payload, { onConflict: 'user_id' })
            .select('*')
            .single();

        if (error) throw error;

        state.appData.chatbot = {
            ...state.appData.chatbot,
            ...mapChatbotSettings(data)
        };
        renderApp();
        showToast('Configuración del chatbot guardada', 'success');
    } catch (error) {
        console.error('No fue posible guardar el chatbot', error);
        showToast('No se pudo guardar la configuración del chatbot', 'error');
    }
}

function toBusinessSettingsPayload(settings) {
    return {
        user_id: state.user?.id,
        business_name: settings.businessName || null,
        logo_url: settings.logo || null,
        whatsapp: settings.whatsapp || null,
        email: settings.email || null,
        is_public: settings.isPublic ?? true,
        primary_color: settings.colors.primary || null,
        gradient_start: settings.colors.bgColor1 || null,
        gradient_end: settings.colors.bgColor2 || null
    };
}

async function handleSaveSettings(settings) {
    if (!state.supabase || !state.user) {
        showToast('No hay conexión con Supabase', 'error');
        return;
    }

    state.appData.settings = { ...state.appData.settings, ...settings };

    try {
        const { data, error } = await state.supabase
            .from('business_settings')
            .upsert(toBusinessSettingsPayload(state.appData.settings), { onConflict: 'user_id' })
            .select('*')
            .single();

        if (error) throw error;

        state.appData.settings = {
            ...state.appData.settings,
            ...mapBusinessSettings(data)
        };
        applySettingsToUI();
        renderApp();
        showToast('Configuración guardada correctamente', 'success');
    } catch (error) {
        console.error('No fue posible guardar la configuración', error);
        showToast('No se pudo guardar la configuración', 'error');
    }
}

async function handleColorChange(colors) {
    state.appData.settings.colors = colors;
    applySettingsToUI();

    if (!state.supabase || !state.user) return;

    try {
        const { data, error } = await state.supabase
            .from('business_settings')
            .upsert(toBusinessSettingsPayload(state.appData.settings), { onConflict: 'user_id' })
            .select('*')
            .single();
        if (error) throw error;
        state.appData.settings = {
            ...state.appData.settings,
            ...mapBusinessSettings(data)
        };
    } catch (error) {
        console.error('No fue posible actualizar los colores', error);
    }
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

async function addNotification(notification) {
    const localNotification = {
        id: crypto.randomUUID(),
        title: notification.title,
        description: notification.description,
        type: notification.type,
        read: false,
        createdAt: new Date().toISOString()
    };

    if (!state.supabase || !state.user) {
        state.appData.notifications.unshift(localNotification);
        if (state.appData.notifications.length > MAX_NOTIFICATIONS) {
            state.appData.notifications.length = MAX_NOTIFICATIONS;
        }
        renderNotifications();
        showToast(notification.description, notification.type);
        return;
    }

    try {
        const { data, error } = await state.supabase
            .from('notifications')
            .insert({
                user_id: state.user.id,
                title: notification.title,
                body: notification.description,
                type: notification.type
            })
            .select('*')
            .single();

        if (error) throw error;

        state.appData.notifications.unshift(mapNotification(data));
    } catch (error) {
        console.error('No fue posible registrar la notificación', error);
        state.appData.notifications.unshift(localNotification);
    } finally {
        if (state.appData.notifications.length > MAX_NOTIFICATIONS) {
            state.appData.notifications.length = MAX_NOTIFICATIONS;
        }
        renderNotifications();
        showToast(notification.description, notification.type);
    }
}

async function clearAllNotifications() {
    state.appData.notifications = state.appData.notifications.map((n) => ({ ...n, read: true }));
    renderNotifications();

    if (!state.supabase || !state.user) return;

    try {
        await state.supabase
            .from('notifications')
            .update({ read: true })
            .eq('user_id', state.user.id);
    } catch (error) {
        console.error('No fue posible marcar las notificaciones como leídas', error);
    }
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
            markNotificationRead(id);
        });
    });
}

async function markNotificationRead(notificationId) {
    const target = state.appData.notifications.find((n) => n.id === notificationId);
    if (!target) return;
    target.read = true;
    renderNotifications();

    if (!state.supabase || !state.user) return;

    try {
        await state.supabase
            .from('notifications')
            .update({ read: true })
            .eq('id', notificationId)
            .eq('user_id', state.user.id);
    } catch (error) {
        console.error('No fue posible marcar la notificación como leída', error);
    }
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
