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
    addProductFeedback: '[data-feedback="add-product"]',
    salesTotalCount: '#salesTotalCount',
    salesTotalAmount: '#salesTotalAmount',
    addSaleButton: '#addSaleButton',
    addSaleForm: '#addSaleForm',
    addSaleCancel: '#cancelAddSale',
    addSaleFeedback: '[data-feedback="add-sale"]',
    saleProductSelect: '#saleProductSelect',
    saleQuantityInput: '#saleQuantity',
    saleUnitPriceInput: '#saleUnitPrice',
    saleTotalPreview: '#saleTotalPreview',
    salesHistoryTable: '#salesHistoryTable'
};

const sampleDashboardData = {
    sales: [
        {
            id: 101,
            date: '2024-08-18T14:05:00Z',
            total: 102000,
            status: 'Completado',
            statusClass: 'success',
            paymentMethod: 'Transferencia',
            client: { name: 'Distribuidora El Roble' },
            items: [
                {
                    productId: 11,
                    productName: 'Paquete Gourmet Café',
                    quantity: 12,
                    unitPrice: 8500
                }
            ],
            notes: 'Entrega programada para mañana a primera hora.'
        },
        {
            id: 102,
            date: '2024-08-18T10:32:00Z',
            total: 47600,
            status: 'Pendiente',
            statusClass: 'pending',
            paymentMethod: 'Tarjeta',
            client: { name: 'Tienda La Esquina' },
            items: [
                {
                    productId: 13,
                    productName: 'Kit de Salsas Premium',
                    quantity: 4,
                    unitPrice: 11900
                }
            ],
            notes: 'Esperando confirmación de pago.'
        },
        {
            id: 103,
            date: '2024-08-17T17:41:00Z',
            total: 117600,
            status: 'Completado',
            statusClass: 'success',
            paymentMethod: 'Transferencia',
            client: { name: 'Mercado Central' },
            items: [
                {
                    productId: 14,
                    productName: 'Cesta de Snacks Saludables',
                    quantity: 12,
                    unitPrice: 9800
                }
            ]
        },
        {
            id: 104,
            date: '2024-08-16T12:15:00Z',
            total: 56700,
            status: 'Cancelado',
            statusClass: 'canceled',
            paymentMethod: 'Efectivo',
            client: { name: 'Mini Súper Lomas' },
            items: [
                {
                    productId: 17,
                    productName: 'Licores Artesanales',
                    quantity: 3,
                    unitPrice: 18900
                }
            ],
            notes: 'Pedido cancelado por el cliente.'
        },
        {
            id: 105,
            date: '2024-08-15T09:22:00Z',
            total: 94000,
            status: 'Completado',
            statusClass: 'success',
            paymentMethod: 'Sinpe',
            client: { name: 'Boutique Azul' },
            items: [
                {
                    productId: 16,
                    productName: 'Vinos de la Casa',
                    quantity: 4,
                    unitPrice: 23500
                }
            ]
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
            statusClass: 'success',
            image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=200&q=80'
        },
        {
            id: 12,
            name: 'Caja de Tés Artesanales',
            category: 'Bebidas',
            price: 7200,
            stock: 15,
            status: 'Disponible',
            statusClass: 'success',
            image: 'https://images.unsplash.com/photo-1485808191679-5f86510681a2?auto=format&fit=crop&w=200&q=80'
        },
        {
            id: 13,
            name: 'Kit de Salsas Premium',
            category: 'Gourmet',
            price: 11900,
            stock: 8,
            status: 'Bajo stock',
            statusClass: 'warning',
            image: 'https://images.unsplash.com/photo-1516684732162-798a0062be99?auto=format&fit=crop&w=200&q=80'
        },
        {
            id: 14,
            name: 'Cesta de Snacks Saludables',
            category: 'Snacks',
            price: 9800,
            stock: 30,
            status: 'Disponible',
            statusClass: 'success',
            image: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=200&q=80'
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
            statusClass: 'success',
            image: 'https://images.unsplash.com/photo-1510626176961-4b37d0d4ec9c?auto=format&fit=crop&w=200&q=80'
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
let isAddSaleFormVisible = false;

function escapeHtml(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

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
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
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
        tableBody.innerHTML = '<tr><td colspan="6" style="text-align: center;">No hay productos en el catálogo</td></tr>';
        return;
    }

    tableBody.innerHTML = products
        .map((product) => {
            const rawName = product.name ?? 'Producto';
            const rawCategory = product.category ?? 'Sin categoría';
            const rawStatus = product.status ?? 'Sin estado';
            const nameContent = escapeHtml(rawName);
            const categoryContent = escapeHtml(rawCategory);
            const statusContent = escapeHtml(rawStatus);
            const imageMarkup = product.image
                ? `<img src="${escapeHtml(product.image)}" alt="Imagen de ${escapeHtml(rawName)}" class="catalog-product-image" loading="lazy" />`
                : '<span class="catalog-product-placeholder" role="img" aria-label="Sin imagen disponible">🛒</span>';

            return `
                <tr>
                    <td>
                        <div class="catalog-product-thumb">
                            ${imageMarkup}
                        </div>
                    </td>
                    <td>${nameContent}</td>
                    <td>${categoryContent}</td>
                    <td>${formatCurrency(product.price ?? 0)}</td>
                    <td>${typeof product.stock === 'number' ? `${product.stock} unidades` : '—'}</td>
                    <td><span class="badge ${product.statusClass ?? ''}">${statusContent}</span></td>
                </tr>`;
        })
        .join('');
}

function renderSalesIndicators(sales) {
    const totalSales = sales.reduce((sum, sale) => sum + (Number(sale.total) || 0), 0);
    setText(DASHBOARD_SELECTORS.salesTotalCount, String(sales.length));
    setText(DASHBOARD_SELECTORS.salesTotalAmount, formatCurrency(totalSales));
}

function summarizeSaleProducts(items = []) {
    if (!items.length) {
        return {
            label: '—',
            quantity: '—'
        };
    }

    const totalQuantity = items.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
    const primary = items[0];
    const additionalCount = Math.max(0, items.length - 1);
    const productLabel = `${escapeHtml(primary.productName ?? 'Producto')}${additionalCount ? ` +${additionalCount} más` : ''}`;
    const quantityLabel = totalQuantity
        ? `${totalQuantity} ${totalQuantity === 1 ? 'unidad' : 'unidades'}`
        : '—';

    return {
        label: productLabel,
        quantity: quantityLabel
    };
}

function renderSalesHistoryTable(sales) {
    const tableBody = getElement(DASHBOARD_SELECTORS.salesHistoryTable);
    if (!tableBody) return;

    if (!sales.length) {
        tableBody.innerHTML = '<tr><td colspan="7" style="text-align: center;">No hay ventas registradas</td></tr>';
        return;
    }

    tableBody.innerHTML = sales
        .map((sale) => {
            const clientName = escapeHtml(sale.client?.name ?? 'Cliente');
            const productsSummary = summarizeSaleProducts(Array.isArray(sale.items) ? sale.items : []);
            const paymentMethod = escapeHtml(sale.paymentMethod ?? '—');
            const statusLabel = escapeHtml(sale.status ?? '—');

            return `
                <tr>
                    <td>${formatDate(sale.date)}</td>
                    <td>${clientName}</td>
                    <td>${productsSummary.label}</td>
                    <td>${productsSummary.quantity}</td>
                    <td>${formatCurrency(sale.total ?? 0)}</td>
                    <td>${paymentMethod}</td>
                    <td><span class="badge ${sale.statusClass ?? ''}">${statusLabel}</span></td>
                </tr>`;
        })
        .join('');
}

function populateSaleProductOptions(products) {
    const select = getElement(DASHBOARD_SELECTORS.saleProductSelect);
    if (!select) return;

    const previousValue = select.value;
    const hasPrevious = products.some((product) => String(product.id) === previousValue);
    const placeholderSelected = !previousValue || !hasPrevious;

    const optionsMarkup = products
        .map(
            (product) => `
                <option value="${escapeHtml(String(product.id))}">${escapeHtml(product.name ?? 'Producto')}</option>`
        )
        .join('');

    select.innerHTML = `
        <option value="" disabled${placeholderSelected ? ' selected' : ''}>Selecciona un producto</option>
        ${optionsMarkup}`;

    if (!placeholderSelected) {
        select.value = previousValue;
    }
}

function updateSaleTotalPreview() {
    const preview = getElement(DASHBOARD_SELECTORS.saleTotalPreview);
    if (!preview) return;

    const quantityInput = getElement(DASHBOARD_SELECTORS.saleQuantityInput);
    const priceInput = getElement(DASHBOARD_SELECTORS.saleUnitPriceInput);

    const quantity = Number(quantityInput?.value ?? 0);
    const unitPrice = Number(priceInput?.value ?? 0);

    if (Number.isNaN(quantity) || Number.isNaN(unitPrice)) {
        preview.textContent = formatCurrency(0);
        return;
    }

    const total = Number((Math.max(0, quantity) * Math.max(0, unitPrice)).toFixed(2));
    preview.textContent = formatCurrency(total);
}

function handleSaleProductChange() {
    const select = getElement(DASHBOARD_SELECTORS.saleProductSelect);
    const priceInput = getElement(DASHBOARD_SELECTORS.saleUnitPriceInput);
    if (!select || !priceInput) return;

    const product = currentData.products.find((item) => String(item.id) === select.value);
    if (product) {
        const basePrice = Number(product.price ?? 0);
        priceInput.value = Number.isFinite(basePrice) ? basePrice.toFixed(2) : '';
    }

    updateSaleTotalPreview();
}

function toggleAddSaleForm(show) {
    const form = getElement(DASHBOARD_SELECTORS.addSaleForm);
    const button = getElement(DASHBOARD_SELECTORS.addSaleButton);

    isAddSaleFormVisible = Boolean(show);

    if (form) {
        form.classList.toggle('hidden', !isAddSaleFormVisible);
    }

    if (button) {
        button.setAttribute('aria-expanded', String(isAddSaleFormVisible));
        button.textContent = isAddSaleFormVisible ? 'Cerrar formulario' : 'Registrar venta';
    }

    populateSaleProductOptions(currentData.products);

    if (isAddSaleFormVisible) {
        form?.reset();
        const quantityInput = getElement(DASHBOARD_SELECTORS.saleQuantityInput);
        if (quantityInput) {
            quantityInput.value = '1';
        }
        handleSaleProductChange();
        updateSaleTotalPreview();
        form?.querySelector('input[name="client"]')?.focus();
    } else {
        form?.reset();
        const priceInput = getElement(DASHBOARD_SELECTORS.saleUnitPriceInput);
        if (priceInput) {
            priceInput.value = '';
        }
        updateSaleTotalPreview();
        setFeedback(DASHBOARD_SELECTORS.addSaleFeedback);
    }
}

function getStatusFromStock(stock) {
    if (stock <= 0) {
        return { status: 'Agotado', statusClass: 'danger' };
    }
    if (stock <= 5) {
        return { status: 'Bajo stock', statusClass: 'warning' };
    }
    if (stock <= 10) {
        return { status: 'Requiere reposición', statusClass: 'alert' };
    }
    return { status: 'Disponible', statusClass: 'success' };
}

function ensureClientExists(name) {
    if (!name) return;
    const normalized = name.toLowerCase();
    const exists = currentData.clients.some((client) => client.name?.toLowerCase() === normalized);
    if (!exists) {
        currentData.clients = [
            { id: Date.now(), name },
            ...currentData.clients
        ];
    }
}

function handleAddSaleSubmit(event) {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);

    const clientName = String(formData.get('client') || '').trim();
    const productId = String(formData.get('productId') || '').trim();
    const quantityValue = Number(formData.get('quantity'));
    const unitPriceValue = Number(formData.get('unitPrice'));
    const paymentMethod = String(formData.get('paymentMethod') || '').trim() || 'Efectivo';
    const notes = String(formData.get('notes') || '').trim();

    if (!clientName || !productId || Number.isNaN(quantityValue) || Number.isNaN(unitPriceValue)) {
        setFeedback(DASHBOARD_SELECTORS.addSaleFeedback, 'Completa todos los campos antes de guardar.', 'error');
        return;
    }

    const product = currentData.products.find((item) => String(item.id) === productId);
    if (!product) {
        setFeedback(DASHBOARD_SELECTORS.addSaleFeedback, 'Selecciona un producto válido.', 'error');
        return;
    }

    const normalizedQuantity = Math.max(1, Math.trunc(quantityValue));
    const normalizedUnitPrice = Number(Math.max(0, unitPriceValue).toFixed(2));
    const saleTotal = Number((normalizedQuantity * normalizedUnitPrice).toFixed(2));

    const newSale = {
        id: Date.now(),
        date: new Date().toISOString(),
        total: saleTotal,
        status: 'Completado',
        statusClass: 'success',
        paymentMethod,
        client: { name: clientName },
        items: [
            {
                productId: product.id,
                productName: product.name,
                quantity: normalizedQuantity,
                unitPrice: normalizedUnitPrice
            }
        ],
        notes: notes || undefined
    };

    currentData.products = currentData.products.map((item) => {
        if (String(item.id) !== productId) return item;
        const currentStock = Number(item.stock ?? 0);
        const updatedStock = Math.max(0, currentStock - normalizedQuantity);
        const statusInfo = getStatusFromStock(updatedStock);
        return {
            ...item,
            stock: updatedStock,
            status: statusInfo.status,
            statusClass: statusInfo.statusClass
        };
    });

    ensureClientExists(clientName);

    currentData.sales = [newSale, ...currentData.sales];

    renderDashboard(currentData);

    form.reset();
    const quantityInput = getElement(DASHBOARD_SELECTORS.saleQuantityInput);
    if (quantityInput) {
        quantityInput.value = '1';
    }
    handleSaleProductChange();
    updateSaleTotalPreview();

    setFeedback(DASHBOARD_SELECTORS.addSaleFeedback, 'Venta registrada correctamente.', 'success');

    setTimeout(() => {
        toggleAddSaleForm(false);
    }, 900);
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
    const image = String(formData.get('image') || '').trim();

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
        statusClass: getStatusClass(status),
        image
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

    if (target !== 'catalog') {
        toggleAddProductForm(false);
    }

    if (target !== 'sales') {
        toggleAddSaleForm(false);
    }
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

    const addSaleButton = getElement(DASHBOARD_SELECTORS.addSaleButton);
    const addSaleForm = getElement(DASHBOARD_SELECTORS.addSaleForm);
    const addSaleCancel = getElement(DASHBOARD_SELECTORS.addSaleCancel);
    const saleProductSelect = getElement(DASHBOARD_SELECTORS.saleProductSelect);
    const saleQuantityInput = getElement(DASHBOARD_SELECTORS.saleQuantityInput);
    const saleUnitPriceInput = getElement(DASHBOARD_SELECTORS.saleUnitPriceInput);

    addSaleButton?.addEventListener('click', () => {
        toggleAddSaleForm(!isAddSaleFormVisible);
    });

    addSaleCancel?.addEventListener('click', () => {
        toggleAddSaleForm(false);
    });

    addSaleForm?.addEventListener('submit', handleAddSaleSubmit);
    saleProductSelect?.addEventListener('change', handleSaleProductChange);
    saleQuantityInput?.addEventListener('input', updateSaleTotalPreview);
    saleUnitPriceInput?.addEventListener('input', updateSaleTotalPreview);

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
    renderSalesIndicators(currentData.sales);
    renderSalesHistoryTable(currentData.sales);
    populateSaleProductOptions(currentData.products);
    handleSaleProductChange();
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
    toggleAddSaleForm(false);

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

