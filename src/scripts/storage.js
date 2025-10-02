import { state } from './state.js';

export function exportData() {
    const dataStr = JSON.stringify(state.appData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'catalogo-pyme-backup.json';
    link.click();
    URL.revokeObjectURL(url);
}

export function importData() {
    alert('La importación desde archivo no está disponible cuando se usa Supabase como fuente de datos.');
}

export async function factoryReset() {
    if (!confirm('¿Seguro que quieres reiniciar todo el sistema? Esta acción eliminará tus datos en Supabase.')) {
        return;
    }

    if (!state.supabase || !state.user) {
        alert('Debes iniciar sesión para poder reiniciar los datos.');
        return;
    }

    const userId = state.user.id;

    try {
        const salesIdsRes = await state.supabase.from('sales').select('id').eq('user_id', userId);
        if (salesIdsRes.error) throw salesIdsRes.error;
        const saleIds = salesIdsRes.data?.map((row) => row.id) ?? [];
        if (saleIds.length > 0) {
            await state.supabase.from('sale_items').delete().in('sale_id', saleIds);
        }

        await state.supabase.from('sales').delete().eq('user_id', userId);
        await state.supabase.from('products').delete().eq('user_id', userId);
        await state.supabase.from('clients').delete().eq('user_id', userId);
        await state.supabase.from('notifications').delete().eq('user_id', userId);
        await state.supabase.from('business_settings').delete().eq('user_id', userId);
        await state.supabase.from('chatbot_settings').delete().eq('user_id', userId);
        window.location.reload();
    } catch (error) {
        console.error('No fue posible reiniciar los datos', error);
        alert('No fue posible reiniciar los datos. Revisa la consola para más detalles.');
    }
}
