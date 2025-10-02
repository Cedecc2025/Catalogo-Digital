export function init() {
    // No event listeners required for now
}

export function render(appState) {
    const totalSales = appState.appData.sales.reduce((sum, sale) => sum + sale.total, 0);
    const totalClients = appState.appData.clients.length;
    const totalProducts = appState.appData.products.length;
    const today = new Date().toDateString();
    const todayOrders = appState.appData.sales.filter((sale) => new Date(sale.date).toDateString() === today).length;

    updateText('totalSales', `₡${totalSales.toLocaleString()}`);
    updateText('totalClients', String(totalClients));
    updateText('totalProducts', String(totalProducts));
    updateText('todayOrders', String(todayOrders));

    const table = document.getElementById('recentSalesTable');
    if (!table) return;
    if (appState.appData.sales.length === 0) {
        table.innerHTML = '<tr><td colspan="4" style="text-align: center;">No hay ventas</td></tr>';
        return;
    }

    const recent = [...appState.appData.sales].slice(-5).reverse();
    table.innerHTML = recent
        .map((sale) => {
            return `
                <tr>
                    <td>${new Date(sale.date).toLocaleDateString('es-CR')}</td>
                    <td>${sale.client.name}</td>
                    <td>₡${sale.total.toLocaleString()}</td>
                    <td>${sale.status}</td>
                </tr>`;
        })
        .join('');
}

function updateText(id, value) {
    const element = document.getElementById(id);
    if (element) {
        element.textContent = value;
    }
}
