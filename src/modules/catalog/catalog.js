import { state } from '../../scripts/state.js';

let callbacks = {};
let currentFilter = 'all';
let searchTerm = '';
let editingProductId = null;

export function init(options) {
    callbacks = options;
    const searchInput = document.getElementById('searchInput');
    searchInput?.addEventListener('input', (event) => {
        searchTerm = event.target.value.toLowerCase();
        render(state);
    });

    document.querySelectorAll('.filter-btn').forEach((button) => {
        button.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn').forEach((btn) => btn.classList.remove('active'));
            button.classList.add('active');
            currentFilter = button.dataset.category || 'all';
            render(state);
        });
    });

    const form = document.getElementById('productForm');
    form?.addEventListener('submit', async (event) => {
        event.preventDefault();
        const product = collectProductFromForm();
        if (!product) return;

        if (editingProductId) {
            await callbacks.onUpdateProduct?.(editingProductId, product);
        } else {
            await callbacks.onCreateProduct?.(product);
        }

        closeModal('productModal');
    });

    document.getElementById('selectImageBtn')?.addEventListener('click', () => {
        document.getElementById('productImageFile')?.click();
    });

    document.getElementById('productImageFile')?.addEventListener('change', (event) => {
        const file = event.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
            const preview = document.getElementById('imagePreview');
            if (preview) preview.src = reader.result;
            callbacks.onSaveImage?.();
        };
        reader.readAsDataURL(file);
    });

    document.getElementById('productImageUrl')?.addEventListener('change', (event) => {
        const url = event.target.value;
        const preview = document.getElementById('imagePreview');
        if (preview && url) {
            preview.src = url;
        }
    });

    document.querySelectorAll('[data-close]').forEach((button) => {
        button.addEventListener('click', () => closeModal(button.dataset.close));
    });

    document.getElementById('sendWhatsAppBtn')?.addEventListener('click', async () => {
        const order = buildOrderFromCart();
        if (!order) return;
        await callbacks.onCheckout?.({ ...order, source: 'WhatsApp' });
        callbacks.onNotify?.('Pedido enviado. Se ha abierto WhatsApp en otra pestaña.', 'success');
        const whatsappUrl = buildWhatsappUrl(order);
        window.open(whatsappUrl, '_blank');
        closeModal('cartModal');
    });
}

export function render(appState) {
    const productsGrid = document.getElementById('productsGrid');
    if (!productsGrid) return;

    const filtered = appState.appData.products.filter((product) => {
        const matchesFilter = currentFilter === 'all' || product.category === currentFilter;
        const matchesSearch = product.name.toLowerCase().includes(searchTerm) ||
            product.description.toLowerCase().includes(searchTerm);
        return matchesFilter && matchesSearch;
    });

    if (filtered.length === 0) {
        productsGrid.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">🗂️</div>
                <p>No hay productos en esta categoría</p>
            </div>`;
        return;
    }

    productsGrid.innerHTML = filtered.map(renderProductCard).join('');

    productsGrid.querySelectorAll('[data-action="add-to-cart"]').forEach((button) => {
        button.addEventListener('click', () => callbacks.onAddToCart?.(button.dataset.id));
    });

    productsGrid.querySelectorAll('[data-action="edit-product"]').forEach((button) => {
        button.addEventListener('click', () => openEditProduct(button.dataset.id));
    });

    productsGrid.querySelectorAll('[data-action="delete-product"]').forEach((button) => {
        button.addEventListener('click', async () => {
            if (confirm('¿Eliminar este producto del catálogo?')) {
                await callbacks.onDeleteProduct?.(button.dataset.id);
            }
        });
    });
}

export function renderCart(appState) {
    const cartContainer = document.getElementById('cartItems');
    const clientForm = document.getElementById('clientForm');
    const cartTotal = document.getElementById('cartTotal');
    if (!cartContainer || !clientForm || !cartTotal) return;

    if (appState.appData.cart.length === 0) {
        cartContainer.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">🛒</div>
                <p>Tu carrito está vacío</p>
            </div>`;
        clientForm.style.display = 'none';
        cartTotal.style.display = 'none';
        return;
    }

    clientForm.style.display = 'block';
    cartTotal.style.display = 'block';

    cartContainer.innerHTML = appState.appData.cart.map((item) => {
        const product = appState.appData.products.find((p) => p.id === item.id);
        if (!product) return '';
        return `
            <div class="cart-item" data-id="${item.id}">
                <div class="cart-item-info">
                    <div class="cart-item-title">${product.name}</div>
                    <div class="cart-item-meta">₡${product.price.toLocaleString()} c/u</div>
                </div>
                <div class="cart-item-actions">
                    <div class="quantity-control">
                        <button type="button" data-action="decrease">-</button>
                        <span class="quantity-value">${item.quantity}</span>
                        <button type="button" data-action="increase">+</button>
                    </div>
                    <button type="button" data-action="remove" class="btn-delete">×</button>
                </div>
            </div>`;
    }).join('');

    cartContainer.querySelectorAll('.cart-item').forEach((row) => {
        const productId = row.dataset.id;
        row.querySelector('[data-action="decrease"]').addEventListener('click', () => updateQuantity(productId, -1));
        row.querySelector('[data-action="increase"]').addEventListener('click', () => updateQuantity(productId, 1));
        row.querySelector('[data-action="remove"]').addEventListener('click', () => removeFromCart(productId));
    });

    const totals = calculateTotals(appState);
    document.getElementById('subtotal').textContent = `₡${totals.subtotal.toLocaleString()}`;
    document.getElementById('tax').textContent = `₡${totals.tax.toLocaleString()}`;
    document.getElementById('total').textContent = `₡${totals.total.toLocaleString()}`;
}

export function updateCartBadge(appState) {
    const badge = document.getElementById('cartBadge');
    if (!badge) return;
    const totalItems = appState.appData.cart.reduce((sum, item) => sum + item.quantity, 0);
    badge.textContent = String(totalItems);
}

export function openCreateProduct() {
    editingProductId = null;
    const form = document.getElementById('productForm');
    form?.reset();
    const preview = document.getElementById('imagePreview');
    if (preview) preview.src = '';
    openModal('productModal');
}

export function openEditProduct(productId) {
    const product = state.appData.products.find((item) => item.id === productId);
    if (!product) return;
    editingProductId = productId;
    const form = document.getElementById('productForm');
    if (!form) return;

    document.getElementById('productName').value = product.name;
    document.getElementById('productCategory').value = product.category;
    document.getElementById('productDescription').value = product.description || '';
    document.getElementById('productPrice').value = product.price;
    document.getElementById('productStock').value = product.stock;
    document.getElementById('productImageUrl').value = product.image || '';
    const preview = document.getElementById('imagePreview');
    if (preview) preview.src = product.image || '';
    openModal('productModal');
}

export function openCart() {
    openModal('cartModal');
    renderCart(state);
}

function calculateTotals(appState) {
    const subtotal = appState.appData.cart.reduce((sum, item) => {
        const product = appState.appData.products.find((p) => p.id === item.id);
        return product ? sum + product.price * item.quantity : sum;
    }, 0);
    const tax = Math.round(subtotal * 0.13);
    const total = subtotal + tax;
    return { subtotal, tax, total };
}

function buildOrderFromCart() {
    const name = document.getElementById('clientName').value.trim();
    const phone = document.getElementById('clientPhone').value.trim();
    const address = document.getElementById('clientAddress').value.trim();
    const notes = document.getElementById('clientNotes').value.trim();

    if (!name) {
        document.getElementById('nameError').classList.add('visible');
        return null;
    }
    document.getElementById('nameError').classList.remove('visible');

    if (!phone) {
        document.getElementById('phoneError').classList.add('visible');
        return null;
    }
    document.getElementById('phoneError').classList.remove('visible');

    const totals = calculateTotals(state);
    const items = state.appData.cart.map((item) => {
        const product = state.appData.products.find((p) => p.id === item.id);
        return {
            id: item.id,
            name: product?.name || 'Producto',
            quantity: item.quantity,
            price: product?.price || 0
        };
    });

    return {
        client: { name, phone, address, notes },
        items,
        subtotal: totals.subtotal,
        tax: totals.tax,
        total: totals.total
    };
}

function buildWhatsappUrl(order) {
    const businessPhone = state.appData.settings.whatsapp;
    if (!businessPhone) return 'https://wa.me/';
    let message = `🛍️ *NUEVO PEDIDO*\n\n`;
    message += `*Cliente:* ${order.client.name}\n`;
    message += `*Teléfono:* ${order.client.phone}\n`;
    if (order.client.address) message += `*Dirección:* ${order.client.address}\n`;
    message += `\n📦 *Productos:*\n`;
    order.items.forEach((item) => {
        message += `• ${item.name} x${item.quantity} = ₡${(item.price * item.quantity).toLocaleString()}\n`;
    });
    message += `\n*Subtotal:* ₡${order.subtotal.toLocaleString()}\n`;
    message += `*IVA (13%):* ₡${order.tax.toLocaleString()}\n`;
    message += `*TOTAL:* ₡${order.total.toLocaleString()}\n`;
    if (order.client.notes) message += `\n📝 *Notas:* ${order.client.notes}`;
    return `https://wa.me/${businessPhone}?text=${encodeURIComponent(message)}`;
}

function updateQuantity(productId, delta) {
    const cartItem = state.appData.cart.find((item) => item.id === productId);
    const product = state.appData.products.find((item) => item.id === productId);
    if (!cartItem || !product) return;
    cartItem.quantity = Math.min(Math.max(cartItem.quantity + delta, 1), product.stock);
    if (cartItem.quantity <= 0) {
        removeFromCart(productId);
        return;
    }
    callbacks.onCartChange?.();
    renderCart(state);
    updateCartBadge(state);
}

function removeFromCart(productId) {
    state.appData.cart = state.appData.cart.filter((item) => item.id !== productId);
    callbacks.onCartChange?.();
    renderCart(state);
    updateCartBadge(state);
}

function collectProductFromForm() {
    const name = document.getElementById('productName').value.trim();
    const category = document.getElementById('productCategory').value;
    const description = document.getElementById('productDescription').value.trim();
    const price = parseInt(document.getElementById('productPrice').value, 10) || 0;
    const stock = parseInt(document.getElementById('productStock').value, 10) || 0;
    const imageUrl = document.getElementById('productImageUrl').value.trim();
    const fileInput = document.getElementById('productImageFile');

    if (!name || !category) {
        callbacks.onNotify?.('Completa los campos obligatorios', 'warning');
        return null;
    }

    let image = imageUrl;
    const file = fileInput?.files?.[0];
    if (file) {
        image = document.getElementById('imagePreview')?.src || '';
    }

    return { name, category, description, price, stock, image };
}

function openModal(id) {
    document.getElementById(id)?.classList.add('active');
}

function closeModal(id) {
    const modal = document.getElementById(id);
    modal?.classList.remove('active');
}

function renderProductCard(product) {
    const stockClass = product.stock === 0 ? 'out' : product.stock < 5 ? 'low' : '';
    const imageStyle = product.image ? `style="background-image: url('${product.image}')" class="product-image has-image"` : 'class="product-image"';
    return `
        <div class="product-card">
            <div ${imageStyle}>${product.image ? '' : '🛍️'}</div>
            <div class="product-info">
                <span class="product-category">${product.category}</span>
                <h3 class="product-name">${product.name}</h3>
                <p class="product-description">${product.description || 'Sin descripción'}</p>
                <div class="product-price">₡${product.price.toLocaleString()}</div>
                <span class="product-stock ${stockClass}">Stock: ${product.stock}</span>
                <div class="product-actions">
                    <button class="btn-add-cart" data-action="add-to-cart" data-id="${product.id}" ${product.stock === 0 ? 'disabled' : ''}>Agregar</button>
                    <button class="btn-edit admin-only" data-action="edit-product" data-id="${product.id}">✏️</button>
                    <button class="btn-delete admin-only" data-action="delete-product" data-id="${product.id}">🗑️</button>
                </div>
            </div>
        </div>`;
}
