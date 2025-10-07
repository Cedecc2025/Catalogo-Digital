let callbacks = {};
let parsedOrder = null;

export function init(options) {
    callbacks = options;
    document.getElementById('parseWhatsappBtn')?.addEventListener('click', handleParseMessage);
    document.getElementById('clearWhatsappBtn')?.addEventListener('click', clearParsedData);
}

export function render(appState) {
    const table = document.getElementById('salesTable');
    if (!table) return;

    if (appState.appData.sales.length === 0) {
        table.innerHTML = '<tr><td colspan="6" style="text-align: center;">No hay ventas</td></tr>';
        return;
    }

    table.innerHTML = appState.appData.sales
        .slice()
        .reverse()
        .map((sale) => {
            const statusClass = sale.status === 'Completado' ? 'completed' : 'pending';
            const action = sale.status === 'Completado'
                ? ''
                : `<button class="btn-primary btn-success" data-action="complete" data-id="${sale.id}">Completar</button>`;
            return `
                <tr>
                    <td>#${sale.id.slice(-6)}</td>
                    <td>${new Date(sale.date).toLocaleDateString('es-CR')}</td>
                    <td>${sale.client.name}</td>
                    <td>₡${sale.total.toLocaleString()}</td>
                    <td><span class="sale-status-pill ${statusClass}">${sale.status}</span></td>
                    <td>${action}</td>
                </tr>`;
        })
        .join('');

    table.querySelectorAll('[data-action="complete"]').forEach((button) => {
        button.addEventListener('click', async () => {
            await callbacks.onUpdateStatus?.(button.dataset.id, 'Completado');
        });
    });
}

export function openWhatsappProcessor() {
    document.querySelector('[data-section="sales"]')?.click();
    document.getElementById('whatsappMessageInput')?.focus();
}

function handleParseMessage() {
    const text = document.getElementById('whatsappMessageInput').value.trim();
    if (!text) {
        alert('Pega un mensaje de WhatsApp para procesarlo');
        return;
    }

    const order = parseWhatsAppMessage(text);
    if (!order) {
        alert('No fue posible interpretar el mensaje. Verifica el formato.');
        return;
    }

    parsedOrder = order;
    showParsedOrder(order);
}

function clearParsedData() {
    parsedOrder = null;
    document.getElementById('whatsappMessageInput').value = '';
    document.getElementById('parsedData').classList.remove('show');
    document.getElementById('parsedData').innerHTML = '';
}

function showParsedOrder(order) {
    const container = document.getElementById('parsedData');
    if (!container) return;
    container.classList.add('show');
    container.innerHTML = `
        <div>
            <strong>Cliente:</strong> ${order.client.name}<br>
            <strong>Teléfono:</strong> ${order.client.phone}<br>
            ${order.client.address ? `<strong>Dirección:</strong> ${order.client.address}<br>` : ''}
        </div>
        <div>
            <strong>Productos:</strong>
            <ul>
                ${order.items.map((item) => `<li>${item.name} x${item.quantity} - ₡${item.price.toLocaleString()}</li>`).join('')}
            </ul>
        </div>
        <div>
            <strong>Subtotal:</strong> ₡${order.subtotal.toLocaleString()}<br>
            <strong>IVA:</strong> ₡${order.tax.toLocaleString()}<br>
            <strong>Total:</strong> ₡${order.total.toLocaleString()}
        </div>
        <button class="btn-primary" id="registerSaleBtn">Registrar venta</button>
    `;

    document.getElementById('registerSaleBtn')?.addEventListener('click', async () => {
        if (!parsedOrder) return;
        await callbacks.onRegisterSale?.({ ...parsedOrder, source: 'WhatsApp' });
        clearParsedData();
    });
}

function parseWhatsAppMessage(text) {
    const lines = text.split('\n').map((line) => line.trim()).filter(Boolean);
    if (lines.length === 0) return null;

    const order = {
        client: { name: '', phone: '', address: '', notes: '' },
        items: [],
        subtotal: 0,
        tax: 0,
        total: 0
    };

    for (const line of lines) {
        const lower = line.toLowerCase();
        if (lower.startsWith('cliente:')) {
            order.client.name = line.split(':')[1]?.trim() || '';
        } else if (lower.startsWith('tel') || lower.startsWith('teléfono:') || lower.startsWith('telefono:')) {
            order.client.phone = line.split(':')[1]?.replace(/\D/g, '') || '';
        } else if (lower.startsWith('dirección:') || lower.startsWith('direccion:')) {
            order.client.address = line.split(':')[1]?.trim() || '';
        } else if (lower.startsWith('notas:')) {
            order.client.notes = line.split(':')[1]?.trim() || '';
        } else if (line.startsWith('•') || line.startsWith('-')) {
            const match = line.match(/•?\s*(.+?)\s*x(\d+)\s*=\s*₡?(\d+)/i);
            if (match) {
                order.items.push({
                    name: match[1].trim(),
                    quantity: parseInt(match[2], 10) || 1,
                    price: parseInt(match[3], 10) || 0
                });
            }
        } else if (lower.startsWith('subtotal')) {
            order.subtotal = parseInt(line.replace(/\D/g, ''), 10) || order.subtotal;
        } else if (lower.startsWith('iva')) {
            order.tax = parseInt(line.replace(/\D/g, ''), 10) || order.tax;
        } else if (lower.startsWith('total')) {
            order.total = parseInt(line.replace(/\D/g, ''), 10) || order.total;
        }
    }

    if (order.items.length === 0) return null;
    if (!order.subtotal) {
        order.subtotal = order.items.reduce((sum, item) => sum + item.price, 0);
    }
    if (!order.tax) {
        order.tax = Math.round(order.subtotal * 0.13);
    }
    if (!order.total) {
        order.total = order.subtotal + order.tax;
    }
    return order;
}
