import { supabase, SUPABASE_PROJECT_URL } from './supabaseClient.js';

const storageUrlCache = new Map();

function getSupabaseBaseUrl() {
    const configuredUrl = typeof SUPABASE_PROJECT_URL === 'string' ? SUPABASE_PROJECT_URL.trim() : '';
    if (configuredUrl) {
        return configuredUrl.replace(/\/+$/, '');
    }

    if (supabase && typeof supabase.supabaseUrl === 'string') {
        return supabase.supabaseUrl.replace(/\/+$/, '');
    }

    return '';
}

function resolveFromStorage(value) {
    const normalized = String(value ?? '').trim().replace(/^\/+/, '');
    if (!normalized) {
        return '';
    }

    const baseUrl = getSupabaseBaseUrl();

    if (/^storage\/v1\/object\/public\//i.test(normalized)) {
        return baseUrl ? `${baseUrl}/${normalized}` : `/${normalized}`;
    }

    if (/^v1\/object\/public\//i.test(normalized)) {
        return baseUrl ? `${baseUrl}/storage/${normalized}` : `/storage/${normalized}`;
    }

    const parts = normalized.split('/');
    if (parts.length < 2) {
        return '';
    }

    const bucket = parts[0];
    const path = parts.slice(1).join('/');
    const cacheKey = `${bucket}/${path}`;

    if (storageUrlCache.has(cacheKey)) {
        return storageUrlCache.get(cacheKey);
    }

    try {
        const { data } = supabase.storage.from(bucket).getPublicUrl(path);
        if (data?.publicUrl) {
            storageUrlCache.set(cacheKey, data.publicUrl);
            return data.publicUrl;
        }
    } catch (error) {
        console.warn('No se pudo obtener la URL pública desde Supabase Storage:', error);
    }

    if (baseUrl) {
        const fallback = `${baseUrl}/storage/v1/object/public/${cacheKey}`;
        storageUrlCache.set(cacheKey, fallback);
        return fallback;
    }

    return '';
}

export function resolveMediaUrl(rawValue) {
    const value = String(rawValue ?? '').trim();
    if (!value) {
        return '';
    }

    if (/^(?:https?:|data:|blob:)/i.test(value)) {
        return value;
    }

    const hasWindow = typeof window !== 'undefined';

    if (value.startsWith('//')) {
        return `${hasWindow ? window.location.protocol : 'https:'}${value}`;
    }

    const storageUrl = resolveFromStorage(value);
    if (storageUrl) {
        return storageUrl;
    }

    if (hasWindow) {
        try {
            return new URL(value, window.location.href).href;
        } catch (error) {
            return value;
        }
    }

    return value;
}

