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
    salesHistoryTable: '#salesHistoryTable',
    clientsCounter: '#clientsCounter',
    clientsTableBody: '#clientsTableBody',
    addClientButton: '#addClientButton',
    clientForm: '#clientForm',
    clientFormTitle: '#clientFormTitle',
    clientFormSubmit: '#clientFormSubmit',
    clientFormCancel: '#cancelClientForm',
    clientFeedback: '[data-feedback="client-form"]',
    inventoryToggleButton: '#toggleInventoryForm',
    inventoryForm: '#inventoryAdjustForm',
    inventoryFormCancel: '#cancelInventoryForm',
    inventoryFeedback: '[data-feedback="inventory-adjust"]',
    inventoryProductSelect: '#inventoryProductSelect',
    inventoryTypeSelect: '#inventoryType',
    inventoryQuantityInput: '#inventoryQuantity',
    inventoryTableBody: '#inventoryTableBody',
    inventoryHistoryTable: '#inventoryHistoryTable',
    settingsForm: '#settingsForm',
    settingsFeedback: '[data-feedback="settings"]',
    settingsPreviewName: '[data-settings-preview="name"]',
    settingsPreviewTagline: '[data-settings-preview="tagline"]',
    settingsPreviewContact: '[data-settings-preview="contact"]',
    settingsPreviewLogo: '[data-settings-preview="logo"]',
    dashboardTitle: '.dashboard-title',
    dashboardSubtitle: '.dashboard-subtitle'
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
        {
            id: 1,
            name: 'Distribuidora El Roble',
            email: 'compras@elroble.cr',
            phone: '+506 2250-1122',
            company: 'Distribuidora El Roble',
            status: 'Activo',
            statusClass: 'success',
            notes: 'Cliente mayorista con entregas semanales.'
        },
        {
            id: 2,
            name: 'Tienda La Esquina',
            email: 'contacto@laesquina.cr',
            phone: '+506 2288-7744',
            company: 'Tienda La Esquina',
            status: 'Activo',
            statusClass: 'success',
            notes: 'Prefiere entregas lunes y jueves.'
        },
        {
            id: 3,
            name: 'Mercado Central',
            email: 'compras@mercadocentral.cr',
            phone: '+506 2290-5599',
            company: 'Mercado Central',
            status: 'Prospecto',
            statusClass: 'info',
            notes: 'Pendiente de enviar catálogo actualizado.'
        },
        {
            id: 4,
            name: 'Mini Súper Lomas',
            email: 'ventas@minilomas.cr',
            phone: '+506 2244-7810',
            company: 'Mini Súper Lomas',
            status: 'Inactivo',
            statusClass: 'neutral',
            notes: 'Sin pedidos desde junio, contactar para seguimiento.'
        },
        {
            id: 5,
            name: 'Boutique Azul',
            email: 'compras@boutiqueazul.cr',
            phone: '+506 2277-3335',
            company: 'Boutique Azul',
            status: 'Activo',
            statusClass: 'success',
            notes: 'Solicitó surtido especial para temporada navideña.'
        },
        {
            id: 6,
            name: 'Tecnologías Rivera',
            email: 'administracion@tecrivera.cr',
            phone: '+506 4001-9050',
            company: 'Tecnologías Rivera',
            status: 'Prospecto',
            statusClass: 'info',
            notes: 'Interesados en paquetes corporativos.'
        }
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
    ],
    inventoryAdjustments: [
        {
            id: 301,
            productId: 11,
            productName: 'Paquete Gourmet Café',
            type: 'Entrada',
            quantity: 24,
            direction: 1,
            reason: 'Reposición semanal de proveedor',
            date: '2024-08-17T09:10:00Z'
        },
        {
            id: 302,
            productId: 15,
            productName: 'Selección de Quesos Locales',
            type: 'Salida',
            quantity: 3,
            direction: -1,
            reason: 'Pedido urgente para Boutique Azul',
            date: '2024-08-16T17:45:00Z'
        },
        {
            id: 303,
            productId: 17,
            productName: 'Licores Artesanales',
            type: 'Ajuste manual',
            quantity: 1,
            direction: -1,
            reason: 'Producto dañado durante transporte',
            date: '2024-08-15T11:30:00Z'
        }
    ],
    settings: {
        companyName: 'Catálogo Digital CR',
        companyEmail: 'ventas@catalogodigital.cr',
        companyPhone: '+506 4000-2020',
        companyAddress: 'San José, Costa Rica',
        tagline: 'Administra tu negocio en un solo lugar',
        themeColor: '#6366f1',
        logoUrl: ''
    }
};

function cloneData(data) {
    return JSON.parse(JSON.stringify(data));
}

let currentData = cloneData(sampleDashboardData);
let supabaseClient = null;
let activePanel = 'overview';
let isAddProductFormVisible = false;
let isAddSaleFormVisible = false;
let isClientFormVisible = false;
let editingClientId = null;
let isInventoryFormVisible = false;

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

function getClientStatusClass(status) {
    const normalized = (status || '').toLowerCase();
    switch (normalized) {
        case 'activo':
            return 'success';
        case 'inactivo':
            return 'neutral';
        case 'prospecto':
            return 'info';
        default:
            return 'pending';
    }
}

function renderClientsTable(clients) {
    const counter = getElement(DASHBOARD_SELECTORS.clientsCounter);
    const tableBody = getElement(DASHBOARD_SELECTORS.clientsTableBody);

    if (counter) {
        const total = clients.length;
        counter.textContent = total === 1 ? '1 cliente' : `${total} clientes`;
    }

    if (!tableBody) return;

    if (!clients.length) {
        tableBody.innerHTML = '<tr><td colspan="5" style="text-align: center;">No hay clientes registrados</td></tr>';
        return;
    }

    tableBody.innerHTML = clients
        .map((client) => {
            const name = escapeHtml(client.name ?? 'Cliente');
            const email = escapeHtml(client.email ?? '');
            const phone = escapeHtml(client.phone ?? '');
            const company = escapeHtml(client.company ?? '—');
            const status = escapeHtml(client.status ?? 'Sin estado');
            const statusClass = client.statusClass || getClientStatusClass(client.status);

            const contactParts = [email, phone].filter(Boolean).join(' · ');

            return `
                <tr>
                    <td>${name}</td>
                    <td>${contactParts || '—'}</td>
                    <td>${company}</td>
                    <td><span class="badge ${statusClass}">${status}</span></td>
                    <td class="clients-table-actions">
                        <button type="button" class="client-action edit" data-client-action="edit" data-client-id="${escapeHtml(
                            String(client.id)
                        )}">Editar</button>
                        <button type="button" class="client-action delete" data-client-action="delete" data-client-id="${escapeHtml(
                            String(client.id)
                        )}">Eliminar</button>
                    </td>
                </tr>`;
        })
        .join('');
}

function toggleClientForm(show, clientId = null) {
    const form = getElement(DASHBOARD_SELECTORS.clientForm);
    const title = getElement(DASHBOARD_SELECTORS.clientFormTitle);
    const submitButton = getElement(DASHBOARD_SELECTORS.clientFormSubmit);
    const triggerButton = getElement(DASHBOARD_SELECTORS.addClientButton);

    isClientFormVisible = Boolean(show);
    editingClientId = show ? clientId : null;

    if (form) {
        form.classList.toggle('hidden', !isClientFormVisible);
    }

    if (triggerButton) {
        triggerButton.setAttribute('aria-expanded', String(isClientFormVisible));
        triggerButton.textContent = isClientFormVisible ? 'Cerrar formulario' : 'Agregar cliente';
    }

    if (!form) return;

    if (isClientFormVisible && editingClientId) {
        const target = currentData.clients.find((client) => String(client.id) === String(editingClientId));
        if (!target) {
            editingClientId = null;
            toggleClientForm(false);
            return;
        }

        if (title) {
            title.textContent = 'Editar cliente';
        }

        if (submitButton) {
            submitButton.textContent = 'Actualizar cliente';
        }

        form.elements.name.value = target.name ?? '';
        form.elements.email.value = target.email ?? '';
        form.elements.phone.value = target.phone ?? '';
        form.elements.company.value = target.company ?? '';
        form.elements.status.value = target.status ?? 'Activo';
        if (form.elements.notes) {
            form.elements.notes.value = target.notes ?? '';
        }

        setFeedback(DASHBOARD_SELECTORS.clientFeedback);
        form.elements.name.focus();
    } else if (isClientFormVisible) {
        if (title) {
            title.textContent = 'Nuevo cliente';
        }

        if (submitButton) {
            submitButton.textContent = 'Guardar cliente';
        }

        form.reset();
        setFeedback(DASHBOARD_SELECTORS.clientFeedback);
        form.elements.name.focus();
    } else {
        form.reset();
        setFeedback(DASHBOARD_SELECTORS.clientFeedback);
    }
}

function createClientRecord({ id, name, email, phone, company, status, notes }) {
    const normalizedStatus = status || 'Activo';
    return {
        id,
        name,
        email: email || '',
        phone: phone || '',
        company: company || name,
        status: normalizedStatus,
        statusClass: getClientStatusClass(normalizedStatus),
        notes: notes || ''
    };
}

function handleClientFormSubmit(event) {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);

    const name = String(formData.get('name') || '').trim();
    const email = String(formData.get('email') || '').trim();
    const phone = String(formData.get('phone') || '').trim();
    const company = String(formData.get('company') || '').trim();
    const status = String(formData.get('status') || '').trim() || 'Activo';
    const notes = String(formData.get('notes') || '').trim();

    if (!name) {
        setFeedback(DASHBOARD_SELECTORS.clientFeedback, 'El nombre es obligatorio para guardar el cliente.', 'error');
        return;
    }

    const record = createClientRecord({
        id: editingClientId ? Number(editingClientId) : Date.now(),
        name,
        email,
        phone,
        company,
        status,
        notes
    });

    if (editingClientId) {
        currentData.clients = currentData.clients.map((client) =>
            String(client.id) === String(editingClientId) ? { ...client, ...record } : client
        );
        setFeedback(DASHBOARD_SELECTORS.clientFeedback, 'Cliente actualizado correctamente.', 'success');
    } else {
        currentData.clients = [record, ...currentData.clients];
        setFeedback(DASHBOARD_SELECTORS.clientFeedback, 'Cliente agregado correctamente.', 'success');
    }

    renderDashboard(currentData);

    setTimeout(() => {
        toggleClientForm(false);
    }, 800);
}

function handleClientDelete(clientId) {
    const target = currentData.clients.find((client) => String(client.id) === String(clientId));
    if (!target) return;

    const shouldDelete = window.confirm(`¿Eliminar el cliente "${target.name}"? Esta acción no se puede deshacer.`);
    if (!shouldDelete) {
        return;
    }

    currentData.clients = currentData.clients.filter((client) => String(client.id) !== String(clientId));
    renderDashboard(currentData);
}

function handleClientEdit(clientId) {
    toggleClientForm(true, clientId);
}

function handleClientsTableClick(event) {
    const actionButton = event.target.closest('[data-client-action]');
    if (!actionButton) return;

    const action = actionButton.dataset.clientAction;
    const clientId = actionButton.dataset.clientId;
    if (!clientId) return;

    if (action === 'edit') {
        handleClientEdit(clientId);
    } else if (action === 'delete') {
        handleClientDelete(clientId);
    }
}

function populateInventoryProductSelect(products) {
    const select = getElement(DASHBOARD_SELECTORS.inventoryProductSelect);
    if (!select) return;

    const previousValue = select.value;
    const hasPrevious = products.some((product) => String(product.id) === previousValue);
    const placeholderSelected = !previousValue || !hasPrevious;

    select.innerHTML = `
        <option value="" disabled${placeholderSelected ? ' selected' : ''}>Selecciona un producto</option>
        ${products
            .map(
                (product) => `
                <option value="${escapeHtml(String(product.id))}">${escapeHtml(product.name ?? 'Producto')}</option>`
            )
            .join('')}`;

    if (!placeholderSelected) {
        select.value = previousValue;
    }
}

function renderInventoryTable(products) {
    const tableBody = getElement(DASHBOARD_SELECTORS.inventoryTableBody);
    if (!tableBody) return;

    if (!products.length) {
        tableBody.innerHTML = '<tr><td colspan="5" style="text-align: center;">No hay productos registrados</td></tr>';
        return;
    }

    tableBody.innerHTML = products
        .map((product) => {
            const name = escapeHtml(product.name ?? 'Producto');
            const category = escapeHtml(product.category ?? 'Sin categoría');
            const status = escapeHtml(product.status ?? 'Sin estado');
            const statusClass = product.statusClass || getStatusClass(product.status);
            const stock = Number.isFinite(product.stock) ? Number(product.stock) : 0;

            return `
                <tr>
                    <td>${name}</td>
                    <td>${category}</td>
                    <td>${stock} unidades</td>
                    <td><span class="badge ${statusClass}">${status}</span></td>
                    <td class="inventory-actions-cell">
                        <button type="button" class="inventory-action decrease" data-inventory-action="decrease" data-product-id="${escapeHtml(
                            String(product.id)
                        )}">-1</button>
                        <button type="button" class="inventory-action increase" data-inventory-action="increase" data-product-id="${escapeHtml(
                            String(product.id)
                        )}">+1</button>
                        <button type="button" class="inventory-action increase" data-inventory-action="increase-5" data-product-id="${escapeHtml(
                            String(product.id)
                        )}">+5</button>
                    </td>
                </tr>`;
        })
        .join('');
}

function renderInventoryHistory(adjustments) {
    const tableBody = getElement(DASHBOARD_SELECTORS.inventoryHistoryTable);
    if (!tableBody) return;

    if (!adjustments.length) {
        tableBody.innerHTML = '<tr><td colspan="5" style="text-align: center;">No hay movimientos registrados</td></tr>';
        return;
    }

    tableBody.innerHTML = adjustments
        .map((adjustment) => {
            const type = escapeHtml(adjustment.type ?? 'Ajuste');
            const reason = escapeHtml(adjustment.reason ?? '—');
            const direction = Number(adjustment.direction) || 1;
            const quantity = Number(adjustment.quantity) || 0;
            const badgeClass = direction >= 0 ? 'success' : 'danger';
            const sign = direction >= 0 ? '+' : '-';
            let dateLabel = '—';
            try {
                dateLabel = formatDate(adjustment.date || new Date().toISOString());
            } catch (error) {
                dateLabel = '—';
            }

            return `
                <tr>
                    <td>${dateLabel}</td>
                    <td>${escapeHtml(adjustment.productName ?? 'Producto')}</td>
                    <td><span class="badge ${badgeClass}">${type}</span></td>
                    <td>${sign}${quantity}</td>
                    <td>${reason}</td>
                </tr>`;
        })
        .join('');
}

function handleInventoryTypeChange() {
    const typeSelect = getElement(DASHBOARD_SELECTORS.inventoryTypeSelect);
    const quantityInput = getElement(DASHBOARD_SELECTORS.inventoryQuantityInput);
    if (!typeSelect || !quantityInput) return;

    const normalized = (typeSelect.value || '').toLowerCase();
    if (normalized === 'ajuste') {
        quantityInput.min = '';
        quantityInput.placeholder = 'Ej. +5 o -3';
    } else {
        quantityInput.min = '1';
        quantityInput.placeholder = '0';
        if (Number(quantityInput.value) <= 0) {
            quantityInput.value = '';
        }
    }
}

function toggleInventoryForm(show) {
    const form = getElement(DASHBOARD_SELECTORS.inventoryForm);
    const trigger = getElement(DASHBOARD_SELECTORS.inventoryToggleButton);

    isInventoryFormVisible = Boolean(show);

    if (form) {
        form.classList.toggle('hidden', !isInventoryFormVisible);
    }

    if (trigger) {
        trigger.setAttribute('aria-expanded', String(isInventoryFormVisible));
        trigger.textContent = isInventoryFormVisible ? 'Cerrar formulario' : 'Registrar ajuste';
    }

    if (!form) return;

    if (isInventoryFormVisible) {
        populateInventoryProductSelect(currentData.products);
        setFeedback(DASHBOARD_SELECTORS.inventoryFeedback);
        form.reset();
        handleInventoryTypeChange();
        const select = getElement(DASHBOARD_SELECTORS.inventoryProductSelect);
        select?.focus();
    } else {
        form.reset();
        setFeedback(DASHBOARD_SELECTORS.inventoryFeedback);
        handleInventoryTypeChange();
    }
}

function recordInventoryAdjustment(product, { type, quantity, direction, reason }) {
    const adjustment = {
        id: Date.now(),
        productId: product.id,
        productName: product.name,
        type,
        quantity,
        direction,
        reason: reason || '',
        date: new Date().toISOString()
    };

    currentData.inventoryAdjustments = [adjustment, ...(currentData.inventoryAdjustments || [])];
}

function handleInventoryFormSubmit(event) {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);

    const productId = String(formData.get('productId') || '').trim();
    const typeValue = String(formData.get('type') || '').trim().toLowerCase();
    const quantityRaw = Number(formData.get('quantity'));
    const reason = String(formData.get('reason') || '').trim();

    if (!productId || Number.isNaN(quantityRaw) || quantityRaw === 0) {
        setFeedback(DASHBOARD_SELECTORS.inventoryFeedback, 'Selecciona un producto y una cantidad válida.', 'error');
        return;
    }

    const product = currentData.products.find((item) => String(item.id) === productId);
    if (!product) {
        setFeedback(DASHBOARD_SELECTORS.inventoryFeedback, 'Selecciona un producto válido.', 'error');
        return;
    }

    let direction = 1;
    let typeLabel = 'Entrada';
    let quantity = Math.abs(Math.trunc(quantityRaw));

    if (typeValue === 'salida') {
        direction = -1;
        typeLabel = 'Salida';
    } else if (typeValue === 'ajuste') {
        direction = quantityRaw >= 0 ? 1 : -1;
        typeLabel = 'Ajuste manual';
    }

    if (quantity <= 0) {
        setFeedback(DASHBOARD_SELECTORS.inventoryFeedback, 'Ingresa una cantidad diferente de cero.', 'error');
        return;
    }

    const currentStock = Number(product.stock ?? 0);
    let effectiveDelta = direction * quantity;
    if (currentStock + effectiveDelta < 0) {
        effectiveDelta = -currentStock;
        quantity = Math.abs(effectiveDelta);
        direction = effectiveDelta >= 0 ? 1 : -1;
    }

    if (quantity === 0) {
        setFeedback(
            DASHBOARD_SELECTORS.inventoryFeedback,
            'No hay existencias suficientes para realizar este ajuste.',
            'error'
        );
        return;
    }

    const updatedStock = Math.max(0, currentStock + effectiveDelta);
    const statusInfo = getStatusFromStock(updatedStock);

    currentData.products = currentData.products.map((item) =>
        String(item.id) === productId
            ? {
                  ...item,
                  stock: updatedStock,
                  status: statusInfo.status,
                  statusClass: statusInfo.statusClass
              }
            : item
    );

    recordInventoryAdjustment(product, {
        type: typeLabel,
        quantity,
        direction,
        reason
    });

    renderDashboard(currentData);

    setFeedback(DASHBOARD_SELECTORS.inventoryFeedback, 'Ajuste registrado correctamente.', 'success');

    setTimeout(() => {
        toggleInventoryForm(false);
    }, 800);
}

function handleInventoryQuickAdjust(productId, delta) {
    const product = currentData.products.find((item) => String(item.id) === String(productId));
    if (!product || !delta) return;

    const currentStock = Number(product.stock ?? 0);
    let effectiveDelta = delta;
    if (currentStock + delta < 0) {
        effectiveDelta = -currentStock;
    }

    if (!effectiveDelta) {
        return;
    }

    const updatedStock = Math.max(0, currentStock + effectiveDelta);
    const statusInfo = getStatusFromStock(updatedStock);

    currentData.products = currentData.products.map((item) =>
        String(item.id) === String(productId)
            ? {
                  ...item,
                  stock: updatedStock,
                  status: statusInfo.status,
                  statusClass: statusInfo.statusClass
              }
            : item
    );

    recordInventoryAdjustment(product, {
        type: effectiveDelta > 0 ? 'Entrada' : 'Salida',
        quantity: Math.abs(effectiveDelta),
        direction: effectiveDelta > 0 ? 1 : -1,
        reason: effectiveDelta > 0 ? 'Ajuste rápido (+)' : 'Ajuste rápido (-)'
    });

    renderDashboard(currentData);
}

function handleInventoryTableClick(event) {
    const actionButton = event.target.closest('[data-inventory-action]');
    if (!actionButton) return;

    const productId = actionButton.dataset.productId;
    const action = actionButton.dataset.inventoryAction;
    if (!productId || !action) return;

    if (action === 'decrease') {
        handleInventoryQuickAdjust(productId, -1);
    } else if (action === 'increase') {
        handleInventoryQuickAdjust(productId, 1);
    } else if (action === 'increase-5') {
        handleInventoryQuickAdjust(productId, 5);
    }
}

function updateSettingsPreview(settings = {}) {
    const nameElement = getElement(DASHBOARD_SELECTORS.settingsPreviewName);
    const taglineElement = getElement(DASHBOARD_SELECTORS.settingsPreviewTagline);
    const contactElement = getElement(DASHBOARD_SELECTORS.settingsPreviewContact);
    const logoElement = getElement(DASHBOARD_SELECTORS.settingsPreviewLogo);

    const companyName = settings.companyName || 'Catálogo Digital';
    const tagline = settings.tagline || 'Administra tu negocio en un solo lugar';
    const contactParts = [settings.companyEmail || '', settings.companyPhone || ''].filter(Boolean);

    if (nameElement) {
        nameElement.textContent = companyName;
    }

    if (taglineElement) {
        taglineElement.textContent = tagline;
    }

    if (contactElement) {
        contactElement.textContent = contactParts.length ? contactParts.join(' · ') : 'Sin información de contacto';
    }

    if (logoElement) {
        const initials = companyName
            .split(' ')
            .filter(Boolean)
            .map((part) => part[0])
            .join('')
            .slice(0, 2)
            .toUpperCase();

        if (settings.logoUrl) {
            logoElement.style.backgroundImage = 'none';
            logoElement.textContent = '';
            logoElement.classList.add('has-image');

            logoElement.innerHTML = '';
            const image = document.createElement('img');
            image.src = settings.logoUrl;
            image.alt = `Logo de ${companyName}`;
            logoElement.appendChild(image);
        } else {
            logoElement.style.backgroundImage = 'none';
            logoElement.textContent = initials || 'CD';
            logoElement.classList.remove('has-image');
            logoElement.innerHTML = logoElement.textContent;
        }
    }
}

function renderSettingsForm(settings = {}) {
    const form = getElement(DASHBOARD_SELECTORS.settingsForm);
    if (!form) return;

    const fields = ['companyName', 'companyEmail', 'companyPhone', 'companyAddress', 'tagline', 'themeColor', 'logoUrl'];
    fields.forEach((field) => {
        if (form.elements[field]) {
            if (field === 'themeColor') {
                form.elements[field].value = settings[field] ?? '#6366f1';
            } else {
                form.elements[field].value = settings[field] ?? '';
            }
        }
    });
}

function applySettings(settings = {}) {
    const titleElement = getElement(DASHBOARD_SELECTORS.dashboardTitle);
    const subtitleElement = getElement(DASHBOARD_SELECTORS.dashboardSubtitle);

    if (titleElement) {
        titleElement.textContent = settings.companyName || 'Panel de Control';
    }

    if (subtitleElement) {
        subtitleElement.textContent = settings.tagline || 'Administra tu negocio y catálogo en un solo lugar';
    }

    const themeColor = settings.themeColor || '#6366f1';
    document.documentElement.style.setProperty('--dashboard-accent', themeColor);

    if (settings.companyName) {
        document.title = `${settings.companyName} · Catálogo Digital`;
    } else {
        document.title = 'Catálogo Digital';
    }

    updateSettingsPreview(settings);
}

function getSettingsFromForm() {
    const form = getElement(DASHBOARD_SELECTORS.settingsForm);
    if (!form) return {};

    return {
        companyName: form.elements.companyName?.value.trim() || '',
        companyEmail: form.elements.companyEmail?.value.trim() || '',
        companyPhone: form.elements.companyPhone?.value.trim() || '',
        companyAddress: form.elements.companyAddress?.value.trim() || '',
        tagline: form.elements.tagline?.value.trim() || '',
        themeColor: form.elements.themeColor?.value || '#6366f1',
        logoUrl: form.elements.logoUrl?.value.trim() || ''
    };
}

function handleSettingsSubmit(event) {
    event.preventDefault();

    const formSettings = getSettingsFromForm();
    if (!formSettings.companyName) {
        setFeedback(DASHBOARD_SELECTORS.settingsFeedback, 'El nombre de la empresa es obligatorio.', 'error');
        return;
    }

    currentData.settings = {
        ...currentData.settings,
        ...formSettings
    };

    renderDashboard(currentData);

    setFeedback(DASHBOARD_SELECTORS.settingsFeedback, 'Configuración guardada correctamente.', 'success');
}

function handleSettingsPreviewChange() {
    const formSettings = getSettingsFromForm();
    updateSettingsPreview({ ...currentData.settings, ...formSettings });

    if (formSettings.themeColor) {
        document.documentElement.style.setProperty('--dashboard-accent', formSettings.themeColor);
    }
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
        const newClient = createClientRecord({
            id: Date.now(),
            name,
            company: name,
            status: 'Prospecto',
            notes: 'Añadido automáticamente desde una venta.'
        });
        currentData.clients = [newClient, ...currentData.clients];
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

    if (target !== 'clients') {
        toggleClientForm(false);
    }

    if (target !== 'inventory') {
        toggleInventoryForm(false);
    }

    if (target !== 'settings') {
        applySettings(currentData.settings || sampleDashboardData.settings);
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

    const addClientButton = getElement(DASHBOARD_SELECTORS.addClientButton);
    const clientForm = getElement(DASHBOARD_SELECTORS.clientForm);
    const clientFormCancel = getElement(DASHBOARD_SELECTORS.clientFormCancel);
    const clientsTableBody = getElement(DASHBOARD_SELECTORS.clientsTableBody);

    addClientButton?.addEventListener('click', () => {
        toggleClientForm(!isClientFormVisible);
    });

    clientFormCancel?.addEventListener('click', () => {
        toggleClientForm(false);
    });

    clientForm?.addEventListener('submit', handleClientFormSubmit);
    clientsTableBody?.addEventListener('click', handleClientsTableClick);

    const inventoryToggleButton = getElement(DASHBOARD_SELECTORS.inventoryToggleButton);
    const inventoryForm = getElement(DASHBOARD_SELECTORS.inventoryForm);
    const inventoryFormCancel = getElement(DASHBOARD_SELECTORS.inventoryFormCancel);
    const inventoryTypeSelect = getElement(DASHBOARD_SELECTORS.inventoryTypeSelect);
    const inventoryTableBody = getElement(DASHBOARD_SELECTORS.inventoryTableBody);

    inventoryToggleButton?.addEventListener('click', () => {
        toggleInventoryForm(!isInventoryFormVisible);
    });

    inventoryFormCancel?.addEventListener('click', () => {
        toggleInventoryForm(false);
    });

    inventoryForm?.addEventListener('submit', handleInventoryFormSubmit);
    inventoryTypeSelect?.addEventListener('change', handleInventoryTypeChange);
    inventoryTableBody?.addEventListener('click', handleInventoryTableClick);

    const settingsForm = getElement(DASHBOARD_SELECTORS.settingsForm);
    settingsForm?.addEventListener('submit', handleSettingsSubmit);
    settingsForm?.addEventListener('input', handleSettingsPreviewChange);

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
    renderClientsTable(currentData.clients);
    populateInventoryProductSelect(currentData.products);
    renderInventoryTable(currentData.products);
    renderInventoryHistory(currentData.inventoryAdjustments || []);
    renderSettingsForm(currentData.settings || {});
    applySettings(currentData.settings || {});
    handleInventoryTypeChange();
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
        products: Array.isArray(data.products) ? data.products : [],
        inventoryAdjustments: Array.isArray(data.inventoryAdjustments) ? data.inventoryAdjustments : [],
        settings:
            data.settings && typeof data.settings === 'object'
                ? data.settings
                : cloneData(sampleDashboardData.settings)
    });
    renderDashboard(currentData);
}

