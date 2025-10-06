export function init() {
    // No event listeners required for now
}

export function render(appState) {
    const table = document.getElementById('clientsTable');
    if (!table) return;
    if (appState.appData.clients.length === 0) {
        table.innerHTML = '<tr><td colspan="5" style="text-align: center;">No hay clientes</td></tr>';
        return;
    }

    table.innerHTML = appState.appData.clients
        .map((client) => `
            <tr>
                <td>${client.name}</td>
                <td>${client.phone}</td>
                <td>${client.address || '-'}</td>
                <td>${client.purchases}</td>
                <td>₡${client.totalSpent.toLocaleString()}</td>
            </tr>`)
        .join('');
}
