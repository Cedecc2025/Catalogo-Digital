const DASHBOARD_SELECTORS = {
    section: '[data-section="dashboard"]',
    authSection: '[data-section="auth"]',
    page: '.page',
    userEmail: '[data-user-email]',
    totalSales: '#statTotalSales',
    totalClients: '#statTotalClients',
    totalProducts: '#statTotalProducts',
    todayOrders: '#statTodayOrders',
    salesTable: '#recentSalesTable',
    logoutButton: '#logoutButton',
    dashboardTabs: '[data-dashboard-tab]',
    dashboardPanels: '[data-dashboard-panel]',
    catalogTable: '#catalogProductsTable',
    catalogCounter: '#catalogProductsTotal',
    addProductButton: '#addProductButton',
    addProductForm: '#addProductForm',
    addProductCancel: '#cancelAddProduct',
    addProductFeedback: '[data-feedback="add-product"]'
};

const sampleDashboardData = {
    sales: [
        {
            id: 101,
            date: '2024-08-18T14:05:00Z',
            total: 185000,
            status: 'Completado',
            statusClass: 'success',
            client: { name: 'Distribuidora El Roble' }
        },
        {
            id: 102,
            date: '2024-08-18T10:32:00Z',
            total: 98250,
            status: 'Pendiente',
            statusClass: 'pending',
            client: { name: 'Tienda La Esquina' }
        },
        {
            id: 103,
            date: '2024-08-17T17:41:00Z',
            total: 214500,
            status: 'Completado',
            statusClass: 'success',
            client: { name: 'Mercado Central' }
        },
        {
            id: 104,
            date: '2024-08-16T12:15:00Z',
            total: 56200,
            status: 'Cancelado',
            statusClass: 'canceled',
            client: { name: 'Mini Súper Lomas' }
        },
        {
            id: 105,
            date: '2024-08-15T09:22:00Z',
            total: 125000,
            status: 'Completado',
            statusClass: 'success',
            client: { name: 'Boutique Azul' }
        }
    ],
    clients: [
        { id: 1, name: 'Distribuidora El Roble' },
        { id: 2, name: 'Tienda La Esquina' },
        { id: 3, name: 'Mercado Central' },
        { id: 4, name: 'Mini Súper Lomas' },
        { id: 5, name: 'Boutique Azul' },
        { id: 6, name: 'Tecnologías Rivera' }
    ],
    products: [
        {
            id: 11,
            name: 'Paquete Gourmet Café',
            category: 'Bebidas',
            price: 8500,
            stock: 24,
            status: 'Disponible',
            statusClass: 'success'
        },
        {
            id: 12,
            name: 'Caja de Tés Artesanales',
            category: 'Bebidas',
            price: 7200,
            stock: 15,
            status: 'Disponible',
            statusClass: 'success'
        },
        {
            id: 13,
            name: 'Kit de Salsas Premium',
            category: 'Gourmet',
            price: 11900,
            stock: 8,
            status: 'Bajo stock',
            statusClass: 'warning'
        },
        {
            id: 14,
            name: 'Cesta de Snacks Saludables',
            category: 'Snacks',
            price: 9800,
            stock: 30,
            status: 'Disponible',
            statusClass: 'success'
        },
        {
            id: 15,
            name: 'Selección de Quesos Locales',
            category: 'Lácteos',
            price: 15900,
            stock: 5,
            status: 'Requiere reposición',
            statusClass: 'alert'
        },
        {
            id: 16,
            name: 'Vinos de la Casa',
            category: 'Bebidas',
            price: 23500,
            stock: 12,
            status: 'Disponible',
            statusClass: 'success'
        },
        {
            id: 17,
            name: 'Licores Artesanales',
            category: 'Bebidas',
            price: 18900,
            stock: 0,
            status: 'Agotado',
            statusClass: 'danger'
        }
    ]
};

function cloneData(data) {
    return JSON.parse(JSON.stringify(data));
}

let currentData = cloneData(sampleDashboardData);
let supabaseClient = null;
let activePanel = 'overview';
let isAddProductFormVisible = false;

function getElement(selector) {
    return document.querySelector(selector);
}

function setText(selector, value) {
    const element = getElement(selector);
    if (element) {
        element.textContent = value;
    }
}

function setFeedback(selector, message = '', type = '') {
    const element = getElement(selector);
    if (!element) return;

    element.textContent = message;
    element.dataset.state = type;
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('es-CR', {
        style: 'currency',
        currency: 'CRC',
        maximumFractionDigits: 0
    }).format(amount);
}

function formatDate(dateString) {
    return new Intl.DateTimeFormat('es-CR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    }).format(new Date(dateString));
}

function calculateTodayOrders(sales) {
    const today = new Date();
    return sales.filter((sale) => {
        const saleDate = new Date(sale.date);
        return saleDate.toDateString() === today.toDateString();
    }).length;
}

function renderStats(data) {
    const totalSales = data.sales.reduce((sum, sale) => sum + (sale.total || 0), 0);
    const totalClients = data.clients.length;
    const totalProducts = data.products.length;
    const todayOrders = calculateTodayOrders(data.sales);

    setText(DASHBOARD_SELECTORS.totalSales, formatCurrency(totalSales));
    setText(DASHBOARD_SELECTORS.totalClients, String(totalClients));
    setText(DASHBOARD_SELECTORS.totalProducts, String(totalProducts));
    setText(DASHBOARD_SELECTORS.todayOrders, String(todayOrders));
}

function renderRecentSalesTable(sales) {
    const tableBody = getElement(DASHBOARD_SELECTORS.salesTable);
    if (!tableBody) return;

    if (!sales.length) {
        tableBody.innerHTML = '<tr><td colspan="4" style="text-align: center;">No hay ventas</td></tr>';
        return;
    }

    const recent = [...sales].slice(-5).reverse();
    tableBody.innerHTML = recent
        .map(
            (sale) => `
                <tr>
                    <td>${formatDate(sale.date)}</td>
                    <td>${sale.client?.name ?? 'Cliente'}</td>
                    <td>${formatCurrency(sale.total)}</td>
                    <td><span class="badge ${sale.statusClass ?? ''}">${sale.status}</span></td>
                </tr>`
        )
        .join('');
}

function renderProductCatalog(products) {
    const tableBody = getElement(DASHBOARD_SELECTORS.catalogTable);
    const counter = getElement(DASHBOARD_SELECTORS.catalogCounter);

    if (counter) {
        const total = products.length;
        counter.textContent = total === 1 ? '1 producto' : `${total} productos`;
    }

    if (!tableBody) return;

    if (!products.length) {
        tableBody.innerHTML = '<tr><td colspan="5" style="text-align: center;">No hay productos en el catálogo</td></tr>';
        return;
    }

    tableBody.innerHTML = products
        .map(
            (product) => `
                <tr>
                    <td>${product.name ?? 'Producto'}</td>
                    <td>${product.category ?? 'Sin categoría'}</td>
                    <td>${formatCurrency(product.price ?? 0)}</td>
                    <td>${typeof product.stock === 'number' ? `${product.stock} unidades` : '—'}</td>
                    <td><span class="badge ${product.statusClass ?? ''}">${product.status ?? 'Sin estado'}</span></td>
                </tr>`
        )
        .join('');
}

function toggleAddProductForm(show) {
    const form = getElement(DASHBOARD_SELECTORS.addProductForm);
    const button = getElement(DASHBOARD_SELECTORS.addProductButton);

    isAddProductFormVisible = Boolean(show);

    if (form) {
        form.classList.toggle('hidden', !isAddProductFormVisible);
    }

    if (button) {
        button.setAttribute('aria-expanded', String(isAddProductFormVisible));
        button.textContent = isAddProductFormVisible ? 'Cerrar formulario' : 'Agregar producto';
    }

    if (!isAddProductFormVisible) {
        form?.reset();
        setFeedback(DASHBOARD_SELECTORS.addProductFeedback);
    }
}

function getStatusClass(status) {
    const normalized = (status || '').toLowerCase();
    switch (normalized) {
        case 'disponible':
            return 'success';
        case 'bajo stock':
            return 'warning';
        case 'requiere reposición':
            return 'alert';
        case 'agotado':
            return 'danger';
        default:
            return '';
    }
}

function handleAddProductSubmit(event) {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);

    const name = String(formData.get('name') || '').trim();
    const category = String(formData.get('category') || '').trim();
    const price = Number(formData.get('price'));
    const stock = Number(formData.get('stock'));
    const status = String(formData.get('status') || '').trim() || 'Disponible';

    if (!name || !category || Number.isNaN(price) || Number.isNaN(stock)) {
        setFeedback(DASHBOARD_SELECTORS.addProductFeedback, 'Completa todos los campos antes de guardar.', 'error');
        return;
    }

    const newProduct = {
        id: Date.now(),
        name,
        category,
        price: Math.max(0, price),
        stock: Math.max(0, Math.trunc(stock)),
        status,
        statusClass: getStatusClass(status)
    };

    currentData.products = [newProduct, ...currentData.products];
    renderDashboard(currentData);

    setFeedback(DASHBOARD_SELECTORS.addProductFeedback, 'Producto agregado correctamente.', 'success');
    setTimeout(() => {
        toggleAddProductForm(false);
    }, 800);
}

function setActivePanel(panel) {
    const target = panel || 'overview';
    const tabs = document.querySelectorAll(DASHBOARD_SELECTORS.dashboardTabs);
    const panels = document.querySelectorAll(DASHBOARD_SELECTORS.dashboardPanels);

    activePanel = target;

    tabs.forEach((tab) => {
        const isActive = tab.dataset.dashboardTab === target;
        tab.classList.toggle('active', isActive);
        tab.setAttribute('aria-pressed', String(isActive));
    });

    panels.forEach((panelElement) => {
        const shouldShow = panelElement.dataset.dashboardPanel === target;
        panelElement.classList.toggle('hidden', !shouldShow);
    });
}

function toggleSections(showDashboard) {
    const dashboard = getElement(DASHBOARD_SELECTORS.section);
    const authSection = getElement(DASHBOARD_SELECTORS.authSection);
    const page = getElement(DASHBOARD_SELECTORS.page);

    if (showDashboard) {
        document.body.classList.add('dashboard-visible');
        dashboard?.classList.remove('hidden');
        authSection?.classList.add('hidden');
    } else {
        document.body.classList.remove('dashboard-visible');
        dashboard?.classList.add('hidden');
        authSection?.classList.remove('hidden');
    }
    if (page) {
        page.scrollTop = 0;
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function resetLogoutButton() {
    const logoutButton = getElement(DASHBOARD_SELECTORS.logoutButton);
    if (logoutButton) {
        logoutButton.disabled = false;
        logoutButton.textContent = logoutButton.dataset.defaultLabel || 'Cerrar sesión';
    }
}

export function initDashboard({ supabase }) {
    supabaseClient = supabase;

    const logoutButton = getElement(DASHBOARD_SELECTORS.logoutButton);
    if (logoutButton && !logoutButton.dataset.defaultLabel) {
        logoutButton.dataset.defaultLabel = logoutButton.textContent;
    }

    const tabs = document.querySelectorAll(DASHBOARD_SELECTORS.dashboardTabs);
    tabs.forEach((tab) => {
        tab.addEventListener('click', () => {
            setActivePanel(tab.dataset.dashboardTab);
        });
    });

    const addProductButton = getElement(DASHBOARD_SELECTORS.addProductButton);
    const addProductForm = getElement(DASHBOARD_SELECTORS.addProductForm);
    const addProductCancel = getElement(DASHBOARD_SELECTORS.addProductCancel);

    addProductButton?.addEventListener('click', () => {
        toggleAddProductForm(!isAddProductFormVisible);
    });

    addProductCancel?.addEventListener('click', () => {
        toggleAddProductForm(false);
    });

    addProductForm?.addEventListener('submit', handleAddProductSubmit);

    logoutButton?.addEventListener('click', async () => {
        if (!supabaseClient) return;
        const button = logoutButton;
        button.disabled = true;
        button.textContent = 'Cerrando sesión…';

        const { error } = await supabaseClient.auth.signOut();
        if (error) {
            console.error('No se pudo cerrar la sesión:', error.message);
            resetLogoutButton();
        } else {
            hideDashboard();
        }
    });

    renderDashboard();
    setActivePanel(activePanel);
    hideDashboard();
}

export function renderDashboard(data = currentData) {
    currentData = cloneData(data);
    renderStats(currentData);
    renderRecentSalesTable(currentData.sales);
    renderProductCatalog(currentData.products);
}

export function showDashboard(session) {
    toggleSections(true);
    resetLogoutButton();

    const userEmail = session?.user?.email ?? 'Invitado';
    setText(DASHBOARD_SELECTORS.userEmail, userEmail);

    renderDashboard(currentData);
    setActivePanel(activePanel);
}

export function hideDashboard() {
    toggleSections(false);
    toggleAddProductForm(false);

    setText(DASHBOARD_SELECTORS.userEmail, 'Invitado');
    resetLogoutButton();
    activePanel = 'overview';
    setActivePanel(activePanel);
}

export function setDashboardData(data) {
    if (!data) return;
    currentData = cloneData({
        sales: Array.isArray(data.sales) ? data.sales : [],
        clients: Array.isArray(data.clients) ? data.clients : [],
        products: Array.isArray(data.products) ? data.products : []
    });
    renderDashboard(currentData);
}

