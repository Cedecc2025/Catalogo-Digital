let callbacks = {};

export function init(options) {
    callbacks = options;
}

export function render(appState) {
    const table = document.getElementById('inventoryTable');
    if (!table) return;
    if (appState.appData.products.length === 0) {
        table.innerHTML = '<tr><td colspan="5" style="text-align: center;">No hay productos</td></tr>';
        return;
    }

    table.innerHTML = appState.appData.products
        .map((product) => `
            <tr>
                <td>${product.name}</td>
                <td>${product.category}</td>
                <td>${product.stock}</td>
                <td>₡${product.price.toLocaleString()}</td>
                <td>
                    <button class="btn-primary btn-success" data-action="edit" data-id="${product.id}">Editar</button>
                    <button class="btn-primary btn-danger" data-action="delete" data-id="${product.id}">Eliminar</button>
                </td>
            </tr>`)
        .join('');

    table.querySelectorAll('[data-action="edit"]').forEach((button) => {
        button.addEventListener('click', () => callbacks.onEditProduct?.(button.dataset.id));
    });

    table.querySelectorAll('[data-action="delete"]').forEach((button) => {
        button.addEventListener('click', () => {
            if (confirm('¿Eliminar este producto?')) {
                callbacks.onDeleteProduct?.(button.dataset.id);
            }
        });
    });
}
